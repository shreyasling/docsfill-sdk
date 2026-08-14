/**
 * Drop-in widget: renders an "Autofill with DocFill" button and, on click, a
 * modal containing the QR + live status — all from the SDK. A developer just
 * tags their inputs with `data-docfill` and calls `DocFill.widget({ formId })`
 * (or adds `data-docfill-form` to the script tag). No custom UI code needed.
 */
import { DocFill } from './index';
import type { DocFillOptions } from './types';

export interface WidgetOptions extends DocFillOptions {
  /** Where to place the trigger button (selector/element). Omit for a floating button. */
  target?: string | HTMLElement;
  /** Button label. Default "⚡ Autofill with DocFill". */
  buttonText?: string;
  /** Modal heading. Default "Scan with the DocFill app". */
  modalTitle?: string;
  /** Modal subtitle. */
  modalHint?: string;
  /** Auto-close the modal after a successful fill. Default true. */
  autoClose?: boolean;
}

export interface WidgetHandle {
  open(): void;
  close(): void;
  destroy(): void;
}

const STYLE_ID = 'docfill-widget-styles';
const CSS = `
.docfill-btn{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:10px;
  padding:11px 16px;font:600 15px/1 system-ui,sans-serif;color:#fff;background:#2563eb;cursor:pointer}
.docfill-btn:hover{background:#1d4ed8}
.docfill-btn--float{position:fixed;right:20px;bottom:20px;z-index:2147483000;box-shadow:0 6px 20px rgba(37,99,235,.4)}
.docfill-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;
  align-items:center;justify-content:center;padding:16px;z-index:2147483001}
.docfill-overlay.open{display:flex}
.docfill-panel{background:#fff;border-radius:16px;padding:24px;width:340px;max-width:100%;
  text-align:center;font:14px/1.5 system-ui,sans-serif;color:#111}
.docfill-panel h2{margin:0 0 4px;font-size:18px}
.docfill-panel .df-hint{color:#666;font-size:13px;margin:0 0 16px}
.docfill-qr{min-height:220px;display:flex;align-items:center;justify-content:center}
.docfill-status{margin:14px 0;font-size:13px;min-height:18px;color:#333}
.docfill-close{margin-top:8px;border:0;border-radius:9px;padding:10px 16px;
  font:600 14px system-ui,sans-serif;background:#f1f5f9;color:#111;cursor:pointer}
`;

function ensureStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function mountWidget(options: WidgetOptions): WidgetHandle {
  ensureStyles();

  const {
    target,
    buttonText = '\u26a1 Autofill with DocFill',
    modalTitle = 'Scan with the DocFill app',
    modalHint = 'Approve on your phone and this form fills instantly.',
    autoClose = true,
    ...docfillOptions
  } = options;

  // Trigger button (floating unless a target is given).
  const container =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target ?? null;
  const button = el('button', container ? 'docfill-btn' : 'docfill-btn docfill-btn--float');
  button.type = 'button';
  button.textContent = buttonText;
  (container ?? document.body).appendChild(button);

  // Modal.
  const overlay = el('div', 'docfill-overlay');
  const panel = el('div', 'docfill-panel');
  const heading = el('h2', undefined, modalTitle);
  const hint = el('p', 'df-hint', modalHint);
  const qr = el('div', 'docfill-qr');
  const status = el('div', 'docfill-status');
  const closeBtn = el('button', 'docfill-close', 'Close');
  closeBtn.type = 'button';
  panel.append(heading, hint, qr, status, closeBtn);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  let instance: DocFill | null = null;

  function open(): void {
    overlay.classList.add('open');
    status.textContent = 'Preparing…';
    instance = new DocFill(docfillOptions);
    instance.on('session', () => (status.textContent = 'Waiting for approval…'));
    instance.on('filled', () => {
      status.textContent = 'Filled \u2713';
      if (autoClose) setTimeout(close, 1200);
    });
    instance.on('error', (e: unknown) => {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : String(e);
      status.textContent = 'Error: ' + msg;
    });
    instance.mount(qr).catch((e: unknown) => {
      status.textContent = 'Could not start: ' + (e instanceof Error ? e.message : String(e));
    });
  }

  function close(): void {
    overlay.classList.remove('open');
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }

  function destroy(): void {
    close();
    button.remove();
    overlay.remove();
  }

  button.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { open, close, destroy };
}

/**
 * UMD convenience: if the SDK <script> tag carries `data-docfill-form`, create a
 * floating widget automatically — zero JS for the developer.
 *   <script src="…docfill.global.js" data-docfill-form="my-form"></script>
 */
export function autoInitFromScript(): void {
  if (typeof document === 'undefined') return;
  const script =
    (document.currentScript as HTMLScriptElement | null) ??
    document.querySelector<HTMLScriptElement>('script[data-docfill-form]');
  const formId = script?.dataset.docfillForm;
  if (!formId) return;

  const start = (): void =>
    void mountWidget({
      formId,
      pwaUrl: script?.dataset.docfillPwaUrl || undefined,
      buttonText: script?.dataset.docfillButtonText || undefined,
    });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
