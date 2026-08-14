import { describe, it, expect, beforeEach } from 'vitest';
import { scanFields, collectRequiredTags } from './scan';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('scanFields', () => {
  it('finds tagged elements in document order', () => {
    document.body.innerHTML =
      '<input data-docfill="identity.pan"><input data-docfill="identity.full_name">';
    expect(scanFields(document).map((f) => f.tag)).toEqual([
      'identity.pan',
      'identity.full_name',
    ]);
  });

  it('ignores empty/whitespace tags', () => {
    document.body.innerHTML = '<input data-docfill="  "><input data-docfill="identity.pan">';
    expect(scanFields(document).map((f) => f.tag)).toEqual(['identity.pan']);
  });

  it('scopes to a given root', () => {
    document.body.innerHTML =
      '<div id="a"><input data-docfill="a.x"></div><input data-docfill="b.y">';
    const root = document.getElementById('a') as HTMLElement;
    expect(scanFields(root).map((f) => f.tag)).toEqual(['a.x']);
  });
});

describe('collectRequiredTags', () => {
  it('dedupes while preserving first-seen order', () => {
    document.body.innerHTML =
      '<input data-docfill="a"><input data-docfill="b"><input data-docfill="a">';
    expect(collectRequiredTags(scanFields(document))).toEqual(['a', 'b']);
  });
});
