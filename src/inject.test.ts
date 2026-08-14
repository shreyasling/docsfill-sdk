import { describe, it, expect, beforeEach } from 'vitest';
import { injectPayload } from './inject';
import { scanFields } from './scan';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('injectPayload — text tags', () => {
  it('sets the value and dispatches input + change', async () => {
    document.body.innerHTML = '<input data-docfill="identity.full_name">';
    const input = document.querySelector('input') as HTMLInputElement;
    const events: string[] = [];
    input.addEventListener('input', () => events.push('input'));
    input.addEventListener('change', () => events.push('change'));

    await injectPayload(scanFields(document), { 'identity.full_name': { value: 'Jane Doe' } });

    expect(input.value).toBe('Jane Doe');
    expect(events).toEqual(['input', 'change']);
  });

  it('coerces non-string values to string', async () => {
    document.body.innerHTML = '<input data-docfill="derived.age">';
    await injectPayload(scanFields(document), { 'derived.age': { value: 25 } });
    expect((document.querySelector('input') as HTMLInputElement).value).toBe('25');
  });
});

describe('injectPayload — file tags (reference fallback)', () => {
  it('stores a reference and renders an Attached chip when bytes are not injectable', async () => {
    document.body.innerHTML = '<input type="file" data-docfill="education.12th_marksheet">';
    const map = await injectPayload(scanFields(document), {
      'education.12th_marksheet': {
        fileName: 'm.pdf',
        driveUrl: 'https://drive.google.com/file/d/x/view',
      },
    });

    const ref = map.get('education.12th_marksheet');
    expect(ref?.fileName).toBe('m.pdf');
    expect(ref?.injected).toBe(false); // jsdom has no DataTransfer -> fallback

    const chip = document.querySelector('[data-docfill-chip]');
    expect(chip?.textContent).toContain('Attached');
    expect(chip?.getAttribute('aria-live')).toBe('polite');

    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.dataset.docfillFile).toContain('m.pdf');
  });

  it('does not attempt injection for disallowed (non-https) urls', async () => {
    document.body.innerHTML = '<input type="file" data-docfill="photo.passport_size">';
    const map = await injectPayload(scanFields(document), {
      'photo.passport_size': { fileName: 'p.jpg', fileUrl: 'file:///etc/passwd' },
    });
    expect(map.get('photo.passport_size')?.injected).toBe(false);
  });
});
