import { describe, it, expect } from 'vitest';
import { DocFillError, toDocFillError } from './errors';

describe('DocFillError', () => {
  it('carries a code and is an Error', () => {
    const e = new DocFillError('NO_FIELDS', 'nothing to fill');
    expect(e.code).toBe('NO_FIELDS');
    expect(e.message).toContain('NO_FIELDS');
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(DocFillError);
  });

  it('passes through an existing DocFillError', () => {
    const e = new DocFillError('DESTROYED', 'gone');
    expect(toDocFillError(e, 'NO_FIELDS', 'x')).toBe(e);
  });

  it('wraps unknown errors with the given code', () => {
    const e = toDocFillError(new Error('boom'), 'SESSION_READ_FAILED', 'fallback');
    expect(e.code).toBe('SESSION_READ_FAILED');
    expect(e.message).toContain('boom');
    expect(e.detail).toBeInstanceOf(Error);
  });
});
