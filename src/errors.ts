/** Typed error surface for the DocFill SDK. */

export type DocFillErrorCode =
  | 'MISSING_OPTION'
  | 'MOUNT_TARGET_NOT_FOUND'
  | 'NO_FIELDS'
  | 'SESSION_CREATE_FAILED'
  | 'SESSION_READ_FAILED'
  | 'SESSION_EXPIRED'
  | 'POLL_ABANDONED'
  | 'DESTROYED';

export class DocFillError extends Error {
  readonly code: DocFillErrorCode;
  readonly detail?: unknown;

  constructor(code: DocFillErrorCode, message: string, detail?: unknown) {
    super(`DocFill[${code}]: ${message}`);
    this.name = 'DocFillError';
    this.code = code;
    this.detail = detail;
    // Restore prototype chain for transpiled/older targets.
    Object.setPrototypeOf(this, DocFillError.prototype);
  }
}

export function toDocFillError(err: unknown, code: DocFillErrorCode, fallbackMsg: string): DocFillError {
  if (err instanceof DocFillError) return err;
  const message = err instanceof Error ? err.message : String(err ?? fallbackMsg);
  return new DocFillError(code, message, err);
}
