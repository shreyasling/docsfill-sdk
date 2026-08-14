/**
 * Supabase session lifecycle via SECURITY DEFINER RPCs, with a resilient
 * hybrid watcher: HTTPS polling (reliable everywhere, incl. websocket-blocked
 * networks) plus an optional Realtime *Broadcast* accelerator that carries only
 * a "wake-up" signal — the payload is always fetched through get_session.
 *
 * RPC contract (shared backend):
 *   - create_session(p_form_id, p_required_tags) -> { id, access_token }
 *   - get_session(p_id, p_token)                 -> the row
 * Direct table access is revoked; the SDK only reads its own token-gated session.
 */
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import { DocFillError, toDocFillError } from './errors';
import type { Logger } from './logger';
import type { FilledPayload, SessionRow } from './types';

export interface CreatedSession {
  id: string;
  accessToken: string;
}

export interface WatchCallbacks {
  onFilled: (payload: FilledPayload, row: SessionRow) => void;
  onError?: (error: DocFillError) => void;
}

export interface SessionManagerOptions {
  pollIntervalMs?: number;
  /** Give up polling after this many consecutive failed polls. */
  maxPollErrors?: number;
  /** Subscribe to the Realtime Broadcast accelerator. Default true. */
  realtime?: boolean;
  logger: Logger;
}

export class SessionManager {
  private readonly client: SupabaseClient;
  private readonly pollIntervalMs: number;
  private readonly maxPollErrors: number;
  private readonly realtime: boolean;
  private readonly log: Logger;

  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private channel: RealtimeChannel | null = null;
  private settled = false;
  private inFlight = false;
  private consecutiveErrors = 0;

  constructor(supabaseUrl: string, supabaseAnonKey: string, opts: SessionManagerOptions) {
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.pollIntervalMs = Math.max(500, opts.pollIntervalMs ?? 1500);
    this.maxPollErrors = Math.max(1, opts.maxPollErrors ?? 5);
    this.realtime = opts.realtime ?? true;
    this.log = opts.logger;
  }

  /** Create a session via RPC; returns its id + capability token. */
  async createSession(
    formId: string,
    requiredTags: string[],
    origin?: string
  ): Promise<CreatedSession> {
    const base = { p_form_id: formId, p_required_tags: requiredTags };
    let { data, error } = await this.client.rpc(
      'create_session',
      origin ? { ...base, p_origin: origin } : base
    );

    // Backward-compat: if the deployed RPC predates the p_origin param, retry
    // without it. Only for "function not found" (PGRST202) — NOT for ambiguity
    // (PGRST203), which means duplicate overloads that a retry can't fix.
    if (error && origin && /could not find|does not exist|PGRST202/i.test(error.message)) {
      this.log.warn('create_session: backend has no p_origin param, retrying without origin');
      ({ data, error } = await this.client.rpc('create_session', base));
    }

    if (error) {
      throw new DocFillError('SESSION_CREATE_FAILED', error.message, error);
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.id || !row?.access_token) {
      throw new DocFillError('SESSION_CREATE_FAILED', 'create_session returned no id/access_token');
    }
    return { id: row.id, accessToken: row.access_token };
  }

  /** Watch a session until it is filled or expires. */
  watchSession(sessionId: string, token: string, callbacks: WatchCallbacks): void {
    this.subscribeBroadcast(sessionId, token, callbacks);
    this.scheduleNextPoll(sessionId, token, callbacks);
  }

  /** Optional instant accelerator: a broadcast "filled" signal triggers one poll. */
  private subscribeBroadcast(sessionId: string, token: string, callbacks: WatchCallbacks): void {
    if (!this.realtime) return;
    try {
      this.channel = this.client
        .channel(`docfill:${sessionId}`, { config: { broadcast: { self: false } } })
        .on('broadcast', { event: 'filled' }, () => {
          this.log.debug('broadcast filled signal received');
          void this.pollOnce(sessionId, token, callbacks);
        })
        .subscribe((status) => this.log.debug('broadcast channel status', status));
    } catch (err) {
      // Realtime is best-effort; polling remains the source of truth.
      this.log.warn('broadcast subscribe failed; relying on polling', err);
    }
  }

  private scheduleNextPoll(sessionId: string, token: string, callbacks: WatchCallbacks): void {
    if (this.settled) return;
    // Small jitter avoids a thundering herd when many forms poll together.
    const jitter = Math.floor(Math.random() * 250);
    this.pollTimer = setTimeout(() => {
      void this.pollOnce(sessionId, token, callbacks).finally(() => {
        this.scheduleNextPoll(sessionId, token, callbacks);
      });
    }, this.pollIntervalMs + jitter);
  }

  private async pollOnce(sessionId: string, token: string, callbacks: WatchCallbacks): Promise<void> {
    if (this.settled || this.inFlight) return;
    this.inFlight = true;
    try {
      const { data, error } = await this.client.rpc('get_session', {
        p_id: sessionId,
        p_token: token,
      });

      if (error) {
        this.onPollError(new DocFillError('SESSION_READ_FAILED', error.message, error), callbacks);
        return;
      }
      this.consecutiveErrors = 0;
      const row = (Array.isArray(data) ? data[0] : data) as SessionRow | undefined;
      if (row) this.handleRow(row, callbacks);
    } catch (err) {
      this.onPollError(toDocFillError(err, 'SESSION_READ_FAILED', 'get_session failed'), callbacks);
    } finally {
      this.inFlight = false;
    }
  }

  private onPollError(error: DocFillError, callbacks: WatchCallbacks): void {
    this.consecutiveErrors += 1;
    this.log.warn(`poll error ${this.consecutiveErrors}/${this.maxPollErrors}`, error.message);
    if (this.consecutiveErrors >= this.maxPollErrors) {
      this.settled = true;
      this.stop();
      callbacks.onError?.(
        new DocFillError('POLL_ABANDONED', `gave up after ${this.maxPollErrors} consecutive errors`, error)
      );
    }
  }

  private handleRow(row: SessionRow, callbacks: WatchCallbacks): void {
    if (this.settled) return;

    if (row.status === 'filled' && row.filled_payload) {
      this.settled = true;
      this.stop();
      callbacks.onFilled(row.filled_payload, row);
      return;
    }

    const expired =
      row.status === 'expired' ||
      (row.expires_at != null && new Date(row.expires_at).getTime() < Date.now());
    if (expired) {
      this.settled = true;
      this.stop();
      callbacks.onError?.(new DocFillError('SESSION_EXPIRED', 'session expired'));
    }
  }

  /** Stop polling and tear down the broadcast channel. */
  stop(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.channel) {
      void this.client.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
