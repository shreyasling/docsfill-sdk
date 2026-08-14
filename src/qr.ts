/**
 * QR rendering into a target container using the `qrcode` package.
 */
// Browser-only entry: the default `qrcode` export requires Node's `fs`/`png.js`,
// which breaks in bundled browser builds.
import QRCode from 'qrcode/lib/browser.js';

export interface RenderQrOptions {
  size?: number;
}

/**
 * Build the URL the PWA opens when the QR is scanned.
 * Shape: `<pwaUrl>/fill?session=<id>&k=<token>` (trailing slashes normalized).
 * The `k` token is the per-session capability the PWA presents to read/fill it.
 */
export function buildFillUrl(pwaUrl: string, sessionId: string, token?: string): string {
  const base = pwaUrl.replace(/\/+$/, '');
  const k = token ? `&k=${encodeURIComponent(token)}` : '';
  return `${base}/fill?session=${encodeURIComponent(sessionId)}${k}`;
}

/**
 * Render a QR encoding `url` into `container` as a <canvas>.
 * Clears any previous content in the container first.
 */
export async function renderQr(
  container: HTMLElement,
  url: string,
  options: RenderQrOptions = {}
): Promise<HTMLCanvasElement> {
  const size = options.size ?? 220;
  const canvas = document.createElement('canvas');

  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
  });

  container.innerHTML = '';
  container.appendChild(canvas);
  return canvas;
}
