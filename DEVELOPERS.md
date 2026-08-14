# DocFill SDK — Developer Guide

A practical, copy-paste guide for developers adding DocFill autofill to a form.
For internals/architecture see [README.md](README.md).

---

## 1. What it does (30 seconds)

1. You tag your form fields: `data-docfill="identity.full_name"`.
2. You drop in the SDK and call `mount()`.
3. The SDK renders a QR. A user scans it with the **DocFill PWA**, approves, and
   their data (text values + real files) is filled into your form live.

You only ever pass a `formId`. The backend URL + key are baked into the package.

---

## 2. Install

**Option A — `<script>` tag (no build step):**
```html
<script src="https://cdn.jsdelivr.net/npm/docfill-sdk/dist/index.global.js"></script>
```
Or, before publishing to a CDN, copy `dist/index.global.js` next to your HTML.

**Option B — npm / bundler:**
```bash
npm install docfill-sdk
# not published yet? install the local tarball:
npm install /path/to/docfill-sdk-0.1.3.tgz
```

---

## 3. Minimal usage

### Plain HTML
```html
<div id="docfill-qr"></div>

<input type="text" data-docfill="identity.full_name" />
<input type="text" data-docfill="identity.pan" />
<input type="file" data-docfill="education.12th_marksheet" />

<script src="index.global.js"></script>
<script>
  const docfill = new DocFill({ formId: 'college-admission-v1' });
  docfill.mount('#docfill-qr');
</script>
```

### React
```jsx
import { useEffect, useRef } from 'react';
import { DocFill } from 'docfill-sdk';

export function DocFillQR() {
  const ref = useRef(null);
  useEffect(() => {
    const docfill = new DocFill({ formId: 'college-admission-v1' });
    docfill.mount(ref.current);
    return () => docfill.destroy();
  }, []);
  return <div ref={ref} />;
}
```

---

## 4. Tagging fields

Put `data-docfill="<tag>"` on the input. Use the exact tags from the
[shared vocabulary](#6-tag-vocabulary). Text tags fill `.value`; file tags load a
real file into the `<input type="file">`.

```html
<input data-docfill="identity.dob" type="date" />
<input data-docfill="address.current" type="text" />
<input data-docfill="photo.passport_size" type="file" />
```

Same tag can appear on multiple fields — all get filled.

---

## 5. API reference

```ts
const docfill = new DocFill({
  formId: 'college-admission-v1', // required — identifies your form
  // optional overrides (default to the shared DocFill backend):
  // supabaseUrl, supabaseAnonKey, pwaUrl, scanRoot, qrSize, pollIntervalMs
});
```

| Method / prop | What it does |
| --- | --- |
| `mount(target)` | Scans the DOM, creates a session, renders the QR into `target` (selector or element), starts polling. Returns a `Promise`. |
| `on(event, handler)` | Subscribe. Events: `'session'`, `'filled'`, `'error'`. Returns an unsubscribe fn. |
| `getAttachedFile(tag)` | For a file tag, returns `{ fileName, driveFileId, driveUrl, fileUrl, injected }` or `null`. |
| `sessionId` | Current session id, or `null`. |
| `destroy()` | Stops polling and clears listeners. Call on unmount. |

### Events
```js
docfill.on('session', ({ sessionId, requiredTags, fillUrl }) => {});
docfill.on('filled',  ({ sessionId, payload }) => {});   // fires once
docfill.on('error',   (err) => {});
```

---

## 6. Tag vocabulary

The full registry is **schema v2 — 72 tags across 11 groups** — the single source of truth is
[`src/tags.ts`](src/tags.ts) (`DOCFILL_TAGS`), also emitted as [`tags.json`](tags.json). Import it:

```ts
import { DOCFILL_TAGS, TAG_MAP, TAG_GROUPS, isFileTag } from 'docfill-sdk';
TAG_MAP['identity.pan'];     // { tag, label, group, type:'text', validation }
isFileTag('education.12th_marksheet'); // true
```

Groups: `identity`, `contact`, `address`, `education`, `employment`, `financial`, `certificate`,
`medical`, `photo`, `signature`, `derived`. Don't invent new tags — add to `src/tags.ts` and the
PWA vault together, and bump `TAG_SCHEMA_VERSION`.

Commonly used tags:

| Tag | Type | Notes |
| --- | --- | --- |
| `identity.full_name` / `father_name` / `mother_name` | text | |
| `identity.dob` | text | ISO 8601 date |
| `identity.pan` | text | `^[A-Z]{5}[0-9]{4}[A-Z]$` |
| `identity.aadhaar` | text | 12 digits |
| `identity.pan_card` / `aadhaar_card` / `passport` / `driving_license` | file | ID documents |
| `contact.email` / `contact.phone` | text | validated |
| `address.current` / `permanent` / `pincode` | text | |
| `address.proof` | file | |
| `education.10th_marksheet` / `12th_marksheet` / `degree_certificate` | file | |
| `employment.offer_letter` / `payslip` / `form16` | file | |
| `financial.bank_statement` / `cancelled_cheque` | file | |
| `financial.ifsc` | text | `^[A-Z]{4}0[A-Z0-9]{6}$` |
| `certificate.caste` / `income` / `domicile` / `ews` | file | |
| `photo.passport_size` / `signature.specimen` | file | |
| `derived.age` / `derived.full_address` | text | computed at fill-time, never stored |

---

## 7. Files: what your backend receives

- **If DocFill can fetch the file bytes** (the payload includes a CORS-accessible URL), it injects
  a **real file** into your native `<input type="file">`. Your existing submit handler receives it
  as a normal multipart upload — **no backend change**. Chip shows `✓ Uploaded`.
- **If it can't fetch the bytes**, it falls back to a reference: read it via
  `docfill.getAttachedFile(tag)` and fetch the file server-side. Chip shows `✓ Attached`.

```js
docfill.on('filled', () => {
  const f = docfill.getAttachedFile('education.12th_marksheet');
  // { fileName, driveUrl, injected: true|false }
});
```

---

## 8. Security model (what to know)

- Each `mount()` creates a session with a **capability token**; the token travels in the QR URL
  (`/fill?session=<id>&k=<token>`) and stays in memory.
- The SDK can only read its own session (token-gated). The shared table can't be dumped with the
  public key. You don't handle any keys or auth yourself.

---

## 9. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| No QR renders | Open devtools; check the `error` event. Usually a bad `formId` or network. |
| `no [data-docfill] fields found` | No tagged inputs on the page (or wrong `scanRoot`). |
| File shows `✓ Attached` not `✓ Uploaded` | PWA didn't provide a CORS-fetchable `fileUrl` for that file. |
| Text fills but React state doesn't update | Ensure you read from the input on submit; the SDK dispatches `input`+`change`. |
| Nothing fills after approve | Session id mismatch (page reloaded after the QR was scanned). |
