/**
 * Value/file injection into matched DOM elements.
 *
 * Text tags: set `.value` and fire input/change so controlled frameworks react.
 *
 * File tags: browsers forbid setting `<input type="file">.value` to a path, but
 * they DO allow assigning `input.files` from a `DataTransfer` built from a File
 * we construct in JS. So if we can fetch the file bytes (needs a CORS-accessible
 * `fileUrl`/`driveUrl`), we inject a real File into the native input — the host
 * form submits it like a normal upload, no backend change. If the bytes aren't
 * fetchable, we fall back to a reference chip + `getAttachedFile()`.
 */
import type { ScannedField } from './scan';
import type { FieldPayload, FileFieldPayload, FilledPayload, TextFieldPayload } from './types';

export interface AttachedFile {
  fileName: string;
  driveFileId?: string;
  driveUrl?: string;
  fileUrl?: string;
  /** True when real file bytes were injected into a native file input. */
  injected?: boolean;
}

function isFilePayload(p: FieldPayload): p is FileFieldPayload {
  return typeof (p as FileFieldPayload).fileName === 'string';
}

/** Set a value on inputs/textareas/selects and notify controlled frameworks. */
function setTextValue(element: HTMLElement, value: string): void {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    // Non-form elements (e.g. a <span> preview) — set visible text.
    element.textContent = value;
  }
}

function renderChip(element: HTMLElement, text: string, ok: boolean): void {
  // Avoid duplicate chips on re-fill.
  const existing = element.parentElement?.querySelector('[data-docfill-chip]');
  if (existing) existing.remove();

  const chip = document.createElement('span');
  chip.dataset.docfillChip = 'true';
  chip.setAttribute('role', 'status');
  chip.setAttribute('aria-live', 'polite');
  chip.textContent = text;
  chip.setAttribute(
    'style',
    [
      'display:inline-flex',
      'align-items:center',
      'gap:4px',
      'margin-left:8px',
      'padding:2px 8px',
      'font:12px/1.4 system-ui,sans-serif',
      ok ? 'color:#0a7a3f' : 'color:#8a6d00',
      ok ? 'background:#e7f7ee' : 'background:#fff5db',
      ok ? 'border:1px solid #b7e6cb' : 'border:1px solid #e6d9a0',
      'border-radius:12px',
    ].join(';')
  );

  if (element.nextSibling) {
    element.parentElement?.insertBefore(chip, element.nextSibling);
  } else {
    element.parentElement?.appendChild(chip);
  }
}

export interface InjectOptions {
  /** Aborts in-flight file fetches (e.g. on destroy()). */
  signal?: AbortSignal;
  /** Per-file fetch timeout in ms. Default 15000. */
  fetchTimeoutMs?: number;
}

/** Only fetch over https, or http on localhost (for local dev/testing). */
function isFetchableUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol === 'https:') return true;
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Fetch the file bytes and place a real File into the native file input via
 * DataTransfer. Returns true on success, false if bytes can't be fetched.
 */
async function injectRealFile(
  input: HTMLInputElement,
  ref: FileFieldPayload,
  opts: InjectOptions
): Promise<boolean> {
  const src = ref.fileUrl || ref.driveUrl;
  if (!src || !isFetchableUrl(src) || typeof DataTransfer === 'undefined') return false;

  const timeoutMs = opts.fetchTimeoutMs ?? 15000;
  const controller = new AbortController();
  const onAbort = (): void => controller.abort();
  opts.signal?.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(src, { mode: 'cors', credentials: 'omit', signal: controller.signal });
    if (!resp.ok) return false;
    const blob = await resp.blob();
    const file = new File([blob], ref.fileName || 'document', {
      type: blob.type || 'application/octet-stream',
    });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

/**
 * Inject a filled payload into the scanned fields. Async because file tags may
 * fetch bytes to populate native file inputs.
 * Returns a map of tag -> AttachedFile for every file tag encountered,
 * so the caller can expose them via `getAttachedFile`.
 */
export async function injectPayload(
  fields: ScannedField[],
  payload: FilledPayload,
  opts: InjectOptions = {}
): Promise<Map<string, AttachedFile>> {
  const attached = new Map<string, AttachedFile>();
  // Text tags fill instantly; file fetches run concurrently so a slow/failing
  // file never blocks other files or the text values.
  const fileJobs: Promise<void>[] = [];

  for (const { tag, element } of fields) {
    const field = payload[tag];
    if (!field) continue;

    if (isFilePayload(field)) {
      const ref: AttachedFile = {
        fileName: field.fileName,
        driveFileId: field.driveFileId,
        driveUrl: field.driveUrl,
        fileUrl: field.fileUrl,
      };
      element.dataset.docfillFile = JSON.stringify(ref);
      attached.set(tag, ref);

      const label = (injected: boolean): string =>
        injected ? `\u2713 Uploaded: ${field.fileName}` : `\u2713 Attached: ${field.fileName}`;

      if (element instanceof HTMLInputElement && element.type === 'file') {
        const input = element;
        fileJobs.push(
          injectRealFile(input, field, opts).then((injected) => {
            ref.injected = injected;
            renderChip(input, label(injected), injected);
          })
        );
      } else {
        ref.injected = false;
        renderChip(element, label(false), false);
      }
    } else {
      const value = (field as TextFieldPayload).value;
      setTextValue(element, value == null ? '' : String(value));
    }
  }

  await Promise.all(fileJobs);
  return attached;
}
