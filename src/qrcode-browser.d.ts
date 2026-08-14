declare module 'qrcode/lib/browser.js' {
  interface QRCodeRenderOptions {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: { dark?: string; light?: string };
  }
  const QRCode: {
    toCanvas(
      canvas: HTMLCanvasElement,
      text: string,
      options?: QRCodeRenderOptions
    ): Promise<HTMLCanvasElement>;
    toDataURL(text: string, options?: QRCodeRenderOptions): Promise<string>;
    toString(text: string, options?: QRCodeRenderOptions): Promise<string>;
  };
  export default QRCode;
}
