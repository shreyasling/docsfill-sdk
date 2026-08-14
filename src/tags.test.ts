import { describe, it, expect } from 'vitest';
import { DOCFILL_TAGS, TAG_MAP, TAG_GROUPS, isFileTag, TAG_SCHEMA_VERSION } from './tags';

describe('tag registry', () => {
  it('exposes a schema version', () => {
    expect(TAG_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });

  it('has unique tag keys', () => {
    const tags = DOCFILL_TAGS.map((t) => t.tag);
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('marks every tag as text or file', () => {
    for (const t of DOCFILL_TAGS) expect(['text', 'file']).toContain(t.type);
  });

  it('uses lowercase dot-namespaced keys', () => {
    for (const t of DOCFILL_TAGS) expect(t.tag).toMatch(/^[a-z]+(\.[a-z0-9_]+)+$/);
  });

  it('compiles all validation regexes', () => {
    for (const t of DOCFILL_TAGS) {
      if (t.validation) expect(() => new RegExp(t.validation as string)).not.toThrow();
    }
  });

  it('resolves definitions via TAG_MAP', () => {
    expect(TAG_MAP['identity.pan']?.validation).toBeDefined();
    expect(TAG_MAP['identity.full_name']?.type).toBe('text');
  });

  it('classifies file vs text tags', () => {
    expect(isFileTag('education.12th_marksheet')).toBe(true);
    expect(isFileTag('identity.full_name')).toBe(false);
    expect(isFileTag('unknown.tag')).toBe(false);
  });

  it('derives groups including core namespaces', () => {
    expect(TAG_GROUPS).toContain('identity');
    expect(TAG_GROUPS).toContain('derived');
  });

  it('validates a PAN against its own regex', () => {
    const re = new RegExp(TAG_MAP['identity.pan'].validation as string);
    expect(re.test('ABCDE1234F')).toBe(true);
    expect(re.test('abcde1234f')).toBe(false);
  });
});
