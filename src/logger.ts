/** Minimal logger contract. Consumers can pass their own; default is silent. */
export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const noop = (): void => {};

export const silentLogger: Logger = { debug: noop, info: noop, warn: noop, error: noop };

/** Prefixes a console-backed logger; used when `debug: true` is set. */
export const consoleLogger: Logger = {
  debug: (...a) => console.debug('[docfill]', ...a),
  info: (...a) => console.info('[docfill]', ...a),
  warn: (...a) => console.warn('[docfill]', ...a),
  error: (...a) => console.error('[docfill]', ...a),
};
