# docfill-sdk

Framework-agnostic SDK that turns any tagged web form into a **QR-driven autofill target**.
Tag your form fields with `data-docfill="<tag>"`, drop in the SDK, and a user scans the QR with
the **DocFill PWA** to fill the form from documents stored in their own Google Drive — no
copy-paste, no re-uploading the same PAN card for the hundredth time.

This is **one of three repos**:

| Repo | Role |
| --- | --- |
| **`docfill-sdk`** (this) | The npm/`<script>` package form owners embed. |
| `docfill-pwa` | The user's document vault + the app that approves and sends filled data. |
| `docfill-demo-form` | A dummy form used to demo/test the SDK. |

All three share one **tag vocabulary** and one **Supabase `sessions` table** (see below). Don't
change those without updating all three.

---

## Install

```bash
npm install docfill-sdk
```

> Not published to npm yet? Install the local tarball produced by `npm pack`:
> ```bash
> npm install /path/to/docfill-sdk-0.1.0.tgz
> ```

Or via `<script>` (no build step — the important case for government/PHP/WordPress forms):

```html
<script src="https://cdn.jsdelivr.net/npm/docfill-sdk/dist/index.global.js"></script>
```

> No CDN/npm publish yet? Copy `dist/index.global.js` next to your HTML and use
> `<script src="index.global.js"></script>`.

### Which URL / key do I use?

**You don't need any — they're baked in.** DocFill ships with the shared backend's Project URL,
browser-safe publishable key, and PWA URL built into the package, so as a form developer you only
pass `formId`. (Self-hosting/testing? Any of `supabaseUrl`, `supabaseAnonKey`, `pwaUrl` can be
passed to override the defaults.)

> Never put a `sb_secret_...` / service-role key in form or PWA frontend code.

## Quick start — the widget (easiest)

Tag your inputs and add one line. The SDK renders the **"⚡ Autofill with DocFill" button + QR
modal** for you — no custom UI.

```html
<input type="text" data-docfill="identity.full_name" />
<input type="file" data-docfill="education.12th_marksheet" />

<script src="https://cdn.jsdelivr.net/npm/docfill-sdk/dist/index.global.js"></script>
<script>
  DocFill.widget({ formId: 'college-admission-form-v1' });
</script>
```

Zero-JS variant (auto-mounts a floating button):
```html
<script src="https://cdn.jsdelivr.net/npm/docfill-sdk/dist/index.global.js"
        data-docfill-form="college-admission-form-v1"></script>
```

React:
```jsx
import { useEffect } from 'react';
import { DocFill } from 'docfill-sdk';

useEffect(() => {
  const w = DocFill.widget({ formId: 'college-admission-form-v1', target: '#docfill-cta' });
  return () => w.destroy();
}, []);
```

Prefer to build your own button/modal? Use the manual `mount()` API below.

## Usage (bundler)

```js
import { DocFill } from 'docfill-sdk';

const docfill = new DocFill({ formId: 'college-admission-form-v1' });

docfill.mount('#docfill-qr-container');            // scan DOM, create session, render QR, listen
docfill.on('filled', ({ payload }) => console.log('filled!', payload));
docfill.getAttachedFile('education.12th_marksheet'); // -> { fileName, driveFileId, driveUrl } | null
docfill.destroy();                                  // stop listening, clean up
```

## Usage (`<script>` global)

```html
<script src="https://cdn.jsdelivr.net/npm/docfill-sdk/dist/index.global.js"></script>
<div id="docfill-qr-container"></div>

<label>Full name</label>
<input type="text" data-docfill="identity.full_name" />

<label>12th marksheet</label>
<input type="file" data-docfill="education.12th_marksheet" />

<script>
  const docfill = new DocFill({ formId: 'college-admission-form-v1' });
  docfill.mount('#docfill-qr-container');
</script>
```

## Usage (React)

The vanilla core works fine in React — create the instance in an effect, mount into a ref, and
clean up on unmount.

```jsx
import { useEffect, useRef } from 'react';
import { DocFill } from 'docfill-sdk';

export function DocFillQR() {
  const containerRef = useRef(null);

  useEffect(() => {
    const docfill = new DocFill({ formId: 'college-admission-form-v1' });

    docfill.on('filled', ({ payload }) => console.log('filled!', payload));
    docfill.mount(containerRef.current);

    return () => docfill.destroy(); // stop listeners/timers on unmount
  }, []);

  return (
    <form>
      <div ref={containerRef} />
      <input type="text" data-docfill="identity.full_name" />
      <input type="text" data-docfill="identity.pan" />
      <input type="file" data-docfill="education.12th_marksheet" />
    </form>
  );
}
```

> Note: for file tags, read the reference from `docfill.getAttachedFile(tag)` in your submit
> handler — React can't set a native file input's value (browser security).

## API

| Member | Description |
| --- | --- |
| `new DocFill(options)` | `options.formId` is the only required field. Optional overrides: `supabaseUrl`, `supabaseAnonKey`, `pwaUrl` (default to the shared backend), plus `scanRoot`, `qrSize`, `pollIntervalMs`. |
| `mount(target)` | Scans DOM, creates a session row, renders the QR into `target` (selector or element), starts listening. Returns a `Promise`. |
| `on(event, handler)` | Events: `'filled'`, `'session'`, `'error'`. Returns an unsubscribe function. |
| `getAttachedFile(tag)` | Returns `{ fileName, driveFileId, driveUrl }` for a filled file tag, or `null`. |
| `sessionId` | The current session id (or `null`). |
| `destroy()` | Stops polling and clears listeners. |

## Tag vocabulary (shared — do not invent new tags)

The full registry (**schema v2 — 72 tags across 11 groups**) is the single source of truth in
[`src/tags.ts`](src/tags.ts), also emitted as a portable [`tags.json`](tags.json) for the PWA to
copy. Import it in code:

```ts
import { DOCFILL_TAGS, TAG_MAP, TAG_GROUPS, isFileTag, TAG_SCHEMA_VERSION } from 'docfill-sdk';
```

Groups: `identity`, `contact`, `address`, `education`, `employment`, `financial`, `certificate`,
`medical`, `photo`, `signature`, `derived`.

Core tags (a subset):

```
identity.full_name / father_name / dob / pan / aadhaar
identity.pan_card / aadhaar_card / passport / driving_license   # file (ID docs)
contact.email / contact.phone
address.current / address.permanent / address.pincode / address.proof(file)
education.10th_marksheet / 12th_marksheet / degree_certificate  # file
employment.offer_letter / payslip / form16                      # file
financial.bank_statement / cancelled_cheque / ifsc
certificate.caste / income / domicile / ews                     # file
photo.passport_size / signature.specimen                        # file
derived.age / derived.full_address                              # computed, never stored
```

The SDK doesn't hardcode text-vs-file. It's carried in the payload shape: text tags return a
`value`, file tags return a `fileName`/`driveUrl`.

## Payload shape (`filled_payload`, keyed by tag)

```json
{
  "identity.full_name": { "value": "Jane Doe" },
  "identity.dob": { "value": "2001-04-12" },
  "derived.age": { "value": 25 },
  "education.12th_marksheet": {
    "fileName": "12th_marksheet.pdf",
    "driveFileId": "1AbC...",
    "driveUrl": "https://drive.google.com/..."
  }
}
```

## Supabase setup

Run [`supabase/schema.sql`](supabase/schema.sql) to create the `sessions` table, then
[`supabase/security-hardening.sql`](supabase/security-hardening.sql) to lock it down.

Access uses a **per-session capability token**. Direct table access is revoked; everything goes
through SECURITY DEFINER RPCs:

- `create_session(p_form_id, p_required_tags)` → `{ id, access_token }` (SDK)
- `get_session(p_id, p_token)` → the row, only with the matching token (SDK, polled)
- `fill_session(p_id, p_token, p_payload)` → marks it filled (PWA)

The SDK creates a session via `create_session`, puts the token in the QR URL
(`/fill?session=<id>&k=<token>`), and **polls** `get_session` (~1.5s) until `status === 'filled'`.
Realtime is disabled on this table. A stolen publishable key can't read any session without its
token, so the table can't be dumped.

## File tags: real upload when possible, reference as fallback

Browsers forbid setting `<input type="file">.value` to a path — but they **do** allow assigning
`input.files` from a `DataTransfer` built from a `File` object created in JS. So the SDK makes the
host form behave like a normal physical upload **with no backend change**:

- **If the payload gives a fetchable file URL** (`fileUrl`, or a CORS-accessible `driveUrl`), the
  SDK fetches the bytes, builds a real `File`, and injects it into the native file input. The form
  submits it as a standard multipart upload. Chip shows `✓ Uploaded: <fileName>`.
- **If the bytes can't be fetched** (no CORS, no access), the SDK falls back to a reference: it
  stores the Drive reference on `element.dataset.docfillFile`, exposes it via
  `docfill.getAttachedFile(tag)`, and shows `✓ Attached: <fileName>`. Your submit handler then
  fetches the file server-side from the reference.

> **PWA requirement for real upload:** the `filled_payload` file entry must include a
> **CORS-accessible** `fileUrl`. Google Drive's direct-download URLs don't send CORS headers to
> arbitrary origins, so the PWA/DocFill backend should serve the file through a short-lived,
> CORS-enabled signed URL (e.g. a Supabase Edge Function proxy) and put that in `fileUrl`.

For **text tags** the SDK sets `.value` and dispatches `input` + `change` events so React/Vue
controlled inputs register the change.

## Known simplifications (hackathon scope)

- No auth in the SDK itself — it authenticates per-session via the capability token, not a user
  login. Sessions are unlisted and token-gated.
- No OCR/AI extraction and no React wrapper — those are explicit non-goals here (they live in the
  PWA if at all).

## Develop

```bash
npm install
npm run build      # outputs dist/ (CJS, ESM, IIFE global) + .d.ts
npm run typecheck
```

Smoke test the `<script>` build: `npm run build`, then open
[`examples/smoke-test.html`](examples/smoke-test.html) after filling in your Supabase URL/key.

## License

MIT
