/**
 * Shared types for the DocFill SDK.
 * The tag vocabulary and payload shapes here MUST stay in sync with docfill-pwa
 * and docfill-demo-form (see the shared build spec, §4 and §5).
 */

/** Canonical, dot-namespaced tag vocabulary — see the registry in `tags.ts`. */
export type { DocFillTag } from './tags';
import type { Logger } from './logger';

/** Text/value tags come back with a `value`. */
export interface TextFieldPayload {
  value: string | number;
}

/** File tags come back with a Drive reference (never raw bytes). */
export interface FileFieldPayload {
  fileName: string;
  driveFileId?: string;
  driveUrl?: string;
  /** Optional direct URL, present when the PWA proxies the file. */
  fileUrl?: string;
}

export type FieldPayload = TextFieldPayload | FileFieldPayload;

/** Keyed by tag. Mirrors the PWA's `filled_payload` column. */
export type FilledPayload = Record<string, FieldPayload>;

export type SessionStatus = 'pending' | 'filled' | 'expired';

/** A row from the shared `sessions` table (only the columns the SDK reads). */
export interface SessionRow {
  id: string;
  form_id: string;
  required_tags: string[];
  status: SessionStatus;
  filled_payload: FilledPayload | null;
  created_at: string;
  expires_at: string;
}

export interface DocFillOptions {
  /** Any string identifying this form, e.g. 'college-admission-form-v1'. */
  formId: string;
  /** Supabase project URL. Defaults to the shared DocFill backend. */
  supabaseUrl?: string;
  /** Supabase publishable/anon key. Defaults to the shared DocFill backend. */
  supabaseAnonKey?: string;
  /** Base URL of the DocFill PWA; used to build the QR target URL. Defaults to the platform PWA. */
  pwaUrl?: string;
  /**
   * Origin stamped on the session for the audit log ("which website").
   * Defaults to `window.location.origin`. Pass a value to override, or `''` to disable.
   */
  origin?: string;
  /**
   * Root element to scan for `data-docfill` fields. Defaults to `document`.
   * Useful when the form lives inside a specific container or shadow host.
   */
  scanRoot?: Document | HTMLElement;
  /** QR pixel size (width & height). Default 220. */
  qrSize?: number;
  /** Polling interval in ms. Default 1500. */
  pollIntervalMs?: number;
  /** Give up polling after this many consecutive errors. Default 5. */
  maxPollErrors?: number;
  /** Subscribe to the Realtime Broadcast accelerator alongside polling. Default true. */
  realtime?: boolean;
  /** Per-file fetch timeout in ms when injecting real files. Default 15000. */
  fetchTimeoutMs?: number;
  /** Enable built-in console logging. Default false. */
  debug?: boolean;
  /** Provide a custom logger (overrides `debug`). */
  logger?: Logger;
}

export type DocFillEvent = 'filled' | 'error' | 'session';

/** Payload passed to the `filled` event handler. */
export interface FilledEvent {
  sessionId: string;
  payload: FilledPayload;
}
