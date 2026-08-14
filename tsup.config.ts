import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'DocFill',
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  // For the <script> build, make `window.DocFill` be the class itself while
  // still exposing named exports (DocFill, default) as properties on it.
  footer: (ctx) =>
    ctx.format === 'iife'
      ? { js: 'DocFill=Object.assign(DocFill.DocFill,DocFill);window.DocFill=DocFill;' }
      : {},
});
