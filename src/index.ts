/**
 * DocFill SDK — public entry point.
 *
 * Turns any form tagged with `data-docfill="<tag>"` into a QR-driven autofill
 * target. Scan the QR with the DocFill PWA, approve, and the returned data is
 * injected back into the page live.
 */
import { collectRequiredTags, scanFields, type ScannedField } from './scan';
import { buildFillUrl, renderQr } from './qr';
import { SessionManager } from './session';
import { injectPayload, type AttachedFile } from './inject';
import { DEFAULT_PWA_URL, DEFAULT_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_URL } from './config';
import { DocFillError, toDocFillError } from './errors';
import { consoleLogger, silentLogger, type Logger } from './logger';
import type {
  DocFillEvent,
  DocFillOptions,
  FilledEvent,
  FilledPayload,
} from './types';

export type {
  DocFillEvent,
  DocFillOptions,
  DocFillTag,
  FilledEvent,
  FilledPayload,
  FieldPayload,
  FileFieldPayload,
  TextFieldPayload,
  SessionRow,
  SessionStatus,
} from './types';
export type { AttachedFile } from './inject';
export type { Logger } from './logger';
export { DocFillError, type DocFillErrorCode } from './errors';
export {
  DOCFILL_TAGS,
  TAG_MAP,
  TAG_GROUPS,
  TAG_SCHEMA_VERSION,
  isFileTag,
  type TagDef,
} from './tags';

type Handler = (payload: unknown) => void;

export class DocFill {
  private readonly options: Required<
    Pick<DocFillOptions, 'supabaseUrl' | 'supabaseAnonKey' | 'pwaUrl' | 'qrSize' | 'pollIntervalMs'>
  > &
    DocFillOptions;
  private readonly listeners = new Map<DocFillEvent, Set<Handler>>();
  private readonly attachedFiles = new Map<string, AttachedFile>();
  private readonly log: Logger;
  private readonly abort = new AbortController();

  private sessions: SessionManager | null = null;
  private fields: ScannedField[] = [];
  private session: string | null = null;
  private token: string | null = null;
  private destroyed = false;

  constructor(options: DocFillOptions) {
    if (!options?.formId) {
      throw new DocFillError('MISSING_OPTION', 'missing required option: formId');
    }

    // Shared-backend values are baked in; developers only need `formId`.
    this.options = {
      supabaseUrl: DEFAULT_SUPABASE_URL,
      supabaseAnonKey: DEFAULT_SUPABASE_ANON_KEY,
      pwaUrl: DEFAULT_PWA_URL,
      qrSize: 220,
      pollIntervalMs: 1500,
      ...options,
    };
    this.log = options.logger ?? (options.debug ? consoleLogger : silentLogger);
  }

  /**
   * Scan the DOM for tagged fields, create a session, render the QR into
   * `target`, and start listening for the fill.
   * @param target CSS selector or element to render the QR into.
   */
  async mount(target: string | HTMLElement): Promise<void> {
    if (this.destroyed) throw new DocFillError('DESTROYED', 'instance has been destroyed');

    const container =
      typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!container) {
      throw new DocFillError('MOUNT_TARGET_NOT_FOUND', `mount target not found: ${String(target)}`);
    }

    this.fields = scanFields(this.options.scanRoot ?? document);
    const requiredTags = collectRequiredTags(this.fields);
    if (requiredTags.length === 0) {
      this.emit('error', new DocFillError('NO_FIELDS', 'no [data-docfill] fields found on the page'));
    }

    this.sessions = new SessionManager(this.options.supabaseUrl, this.options.supabaseAnonKey, {
      pollIntervalMs: this.options.pollIntervalMs,
      maxPollErrors: this.options.maxPollErrors,
      realtime: this.options.realtime,
      logger: this.log,
    });

    try {
      const origin =
        this.options.origin ??
        (typeof window !== 'undefined' ? window.location.origin : undefined);
      const created = await this.sessions.createSession(
        this.options.formId,
        requiredTags,
        origin || undefined
      );
      this.session = created.id;
      this.token = created.accessToken;
    } catch (err) {
      const e = toDocFillError(err, 'SESSION_CREATE_FAILED', 'failed to create session');
      this.emit('error', e);
      throw e;
    }

    const fillUrl = buildFillUrl(this.options.pwaUrl, this.session, this.token);
    await renderQr(container, fillUrl, { size: this.options.qrSize });
    this.emit('session', { sessionId: this.session, requiredTags, fillUrl });

    this.sessions.watchSession(this.session, this.token, {
      onFilled: (payload) => {
        void this.handleFilled(payload);
      },
      onError: (error) => this.emit('error', error),
    });
  }

  private async handleFilled(payload: FilledPayload): Promise<void> {
    if (this.destroyed) return;
    const attached = await injectPayload(this.fields, payload, {
      signal: this.abort.signal,
      fetchTimeoutMs: this.options.fetchTimeoutMs,
    });
    attached.forEach((ref, tag) => this.attachedFiles.set(tag, ref));

    const event: FilledEvent = { sessionId: this.session ?? '', payload };
    this.emit('filled', event);
  }

  /** Subscribe to an event. Returns an unsubscribe function. */
  on(event: DocFillEvent, handler: Handler): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  private emit(event: DocFillEvent, payload: unknown): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch {
        /* never let a consumer handler break the SDK */
      }
    });
  }

  /**
   * Return the Drive reference for an attached file tag, or null.
   * File inputs can't be set programmatically (browser security), so the
   * consuming site's submit handler decides what to do with this reference.
   */
  getAttachedFile(tag: string): AttachedFile | null {
    return this.attachedFiles.get(tag) ?? null;
  }

  /** The current session id, if mounted. */
  get sessionId(): string | null {
    return this.session ?? null;
  }

  /** Stop listening and clean up subscriptions/timers. */
  destroy(): void {
    this.destroyed = true;
    this.abort.abort();
    this.sessions?.stop();
    this.sessions = null;
    this.listeners.clear();
  }
}

export default DocFill;
