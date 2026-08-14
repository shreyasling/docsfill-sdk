# DocFill SDK — Developer Guide

A practical, copy-paste guide for developers adding DocFill autofill to a form.
For internals/architecture see [README.md](README.md).

---

## 1. What it does (30 seconds)

1. You tag your form fields: `data-docfill="identity.full_name"`.
2. You add the SDK **widget** with one line — it renders an “Autofill with DocFill” button.
3. The user clicks it, scans the QR with the **DocFill app**, approves, and their data (text
   values + real files) fills your form live.

You only ever pass a `formId`. The backend URL + key are baked into the package. The button, QR,
modal, polling, and autofill all come from the SDK — no custom UI code.

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
```

Pin an exact version on the CDN (recommended in production, avoids stale cache):
```html
<script src="https://cdn.jsdelivr.net/npm/docfill-sdk@1.2.0/dist/index.global.js"></script>
```

---

## 3. Quick start — the widget (recommended)

The widget renders the **“⚡ Autofill with DocFill” button + QR modal** for you. Tag your inputs,
add one line, done.

### Plain HTML
```html
<input type="text" data-docfill="identity.full_name" />
<input type="text" data-docfill="identity.pan" />
<input type="file" data-docfill="education.12th_marksheet" />

<script src="https://cdn.jsdelivr.net/npm/docfill-sdk@1.2.0/dist/index.global.js"></script>
<script>
  DocFill.widget({ formId: 'college-admission-v1' });
</script>
```

### Zero-JS (script tag only)
Put the form id on the script tag and the widget auto-mounts a floating button:
```html
<script
  src="https://cdn.jsdelivr.net/npm/docfill-sdk@1.2.0/dist/index.global.js"
  data-docfill-form="college-admission-v1"></script>
```

### React
```jsx
import { useEffect } from 'react';
import { DocFill } from 'docfill-sdk';

export function OnboardingForm() {
  useEffect(() => {
    const widget = DocFill.widget({ formId: 'college-admission-v1', target: '#docfill-cta' });
    return () => widget.destroy(); // clean up on unmount
  }, []);

  return (
    <form>
      <div id="docfill-cta" />               {/* button renders here */}
      <input type="text" data-docfill="identity.full_name" />
      <input type="text" data-docfill="identity.pan" />
      <input type="file" data-docfill="education.12th_marksheet" />
    </form>
  );
}
```
> Use **uncontrolled** inputs (no `value`/`onChange`) so the SDK can write values directly; read
> them on submit via `FormData` or `el.value` / `el.dataset.docfillFile`.

**Widget options:** `formId` (required); `target` (selector/element for the button — omit for a
floating button); `buttonText`, `modalTitle`, `modalHint`, `autoClose`; plus any `DocFillOptions`
(`pwaUrl`, `qrSize`, `realtime`, `debug`, …). Returns `{ open, close, destroy }`.

---

## 3b. Advanced — manual mount (build your own UI)

If you want full control of the button/modal, use the core `mount()` and render the QR into your
own container:

```html
<div id="docfill-qr"></div>
<script src="https://cdn.jsdelivr.net/npm/docfill-sdk@1.2.0/dist/index.global.js"></script>
<script>
  const docfill = new DocFill({ formId: 'college-admission-v1' });
  docfill.mount('#docfill-qr');
</script>
```

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

### Widget (recommended)
```ts
const widget = DocFill.widget({ formId: 'my-form' /* + WidgetOptions */ });
// widget: { open(), close(), destroy() }
```
`DocFill.widget(options)` (alias: `mountWidget(options)`) renders the button + QR modal.

| Widget option | Default | Description |
| --- | --- | --- |
| `formId` | — | required; identifies your form |
| `target` | floating | selector/element to place the button; omit for a floating button |
| `buttonText` | `⚡ Autofill with DocFill` | trigger label |
| `modalTitle` / `modalHint` | — | modal text |
| `autoClose` | `true` | close the modal after a successful fill |
| …`DocFillOptions` | — | `pwaUrl`, `qrSize`, `realtime`, `debug`, `logger`, etc. |

### Core class
```ts
const docfill = new DocFill({
  formId: 'college-admission-v1', // required
  // optional: supabaseUrl, supabaseAnonKey, pwaUrl, scanRoot, qrSize,
  //           pollIntervalMs, maxPollErrors, realtime, fetchTimeoutMs, debug, logger
});
```

| Method / prop | What it does |
| --- | --- |
| `mount(target)` | Scans the DOM, creates a session, renders the QR into `target`, starts polling. Returns a `Promise`. |
| `on(event, handler)` | Subscribe. Events: `'session'`, `'filled'`, `'error'`. Returns an unsubscribe fn. |
| `getAttachedFile(tag)` | For a file tag, returns `{ fileName, driveFileId, driveUrl, fileUrl, injected }` or `null`. |
| `sessionId` | Current session id, or `null`. |
| `destroy()` | Stops polling and clears listeners. Call on unmount. |
| `DocFill.widget(opts)` | Static — renders the drop-in widget (see above). |

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
