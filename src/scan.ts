/**
 * DOM scanning for `data-docfill="<tag>"` elements.
 */

export interface ScannedField {
  tag: string;
  element: HTMLElement;
}

/**
 * Find every element carrying a `data-docfill` attribute under `root`.
 * Elements with an empty/whitespace tag are ignored.
 */
export function scanFields(root: Document | HTMLElement = document): ScannedField[] {
  const nodes = root.querySelectorAll<HTMLElement>('[data-docfill]');
  const fields: ScannedField[] = [];

  nodes.forEach((element) => {
    const tag = (element.dataset.docfill ?? '').trim();
    if (tag) {
      fields.push({ tag, element });
    }
  });

  return fields;
}

/** The unique, ordered list of tags required by the current page. */
export function collectRequiredTags(fields: ScannedField[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const { tag } of fields) {
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }
  return tags;
}
