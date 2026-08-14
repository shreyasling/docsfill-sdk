import { describe, it, expect } from 'vitest';
import { buildFillUrl } from './qr';

describe('buildFillUrl', () => {
  it('includes the session and token', () => {
    expect(buildFillUrl('https://pwa.app', 'abc', 'tok')).toBe(
      'https://pwa.app/fill?session=abc&k=tok'
    );
  });

  it('normalizes trailing slashes', () => {
    expect(buildFillUrl('https://pwa.app///', 'abc', 'tok')).toBe(
      'https://pwa.app/fill?session=abc&k=tok'
    );
  });

  it('omits the token when absent', () => {
    expect(buildFillUrl('https://pwa.app', 'abc')).toBe('https://pwa.app/fill?session=abc');
  });

  it('url-encodes id and token', () => {
    expect(buildFillUrl('https://pwa.app', 'a b', 't/k')).toBe(
      'https://pwa.app/fill?session=a%20b&k=t%2Fk'
    );
  });
});
