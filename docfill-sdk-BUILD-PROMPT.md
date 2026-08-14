# DocFill SDK — Build Prompt

> Give this file verbatim to your AI coding tool (Claude Code or similar) as the brief for
> **this repository only**. This SDK is one of three independently hosted repos in the DocFill
> project. The other two (`docfill-pwa` and `docfill-demo-form`) are built separately and only
> connect to this one through a shared Supabase backend and a shared tag vocabulary — both are
> defined below and must not be changed without updating all three repos.

## 1. What DocFill is (context only, not this repo's job to build)

DocFill lets a user store personal documents once (in their own Google Drive) and then
"autofill" any web form that has been tagged with DocFill attributes, by scanning a QR code
with the DocFill PWA. Three repos:

1. **`docfill-sdk`** (THIS REPO) — the npm package any form owner installs/embeds.
2. **`docfill-pwa`** — the user's document vault + the app that approves and sends filled data.
3. **`docfill-demo-form`** — a dummy form site used only to demo/test this SDK.

## 2. What THIS repo must deliver

A small, framework-agnostic, mostly-zero-dependency JavaScript package that:

1. Scans the DOM for elements carrying `data-docfill="<tag>"`.
2. Creates a "fill session" row in Supabase containing the list of required tags for that page.
3. Renders a QR code into a target container. The QR encodes a URL pointing at the PWA's fill
   route with the session id.
4. Listens for that session to be marked "filled" (Supabase Realtime, with polling fallback).
5. When filled, injects the returned data into the matching DOM elements — text values directly,
   and for file-type tags, exposes an "attached" indicator + a JS accessor (see §6, this is a
   hard browser constraint, not a design choice).

Must work two ways:
- As an npm package (`import { DocFill } from 'docfill-sdk'`) for bundler-based sites.
- As a plain `<script>` include (global `window.DocFill`) for sites with no build step —
  this is the more important case, since most real-world forms (government portals, PHP/JSP
  sites, WordPress) are not React/bundler projects.

## 3. Public API (build exactly this shape)

```js
import { DocFill } from 'docfill-sdk';

const docfill = new DocFill({
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
  formId: 'college-admission-form-v1',   // any string identifying this form
  pwaUrl: 'https://docfill-pwa.example.app', // used to build the QR's target URL
});

docfill.mount('#docfill-qr-container');   // scans DOM, creates session, renders QR, starts listening
docfill.on('filled', (payload) => { /* optional hook, fires once per successful fill */ });
docfill.getAttachedFile('education.12th_marksheet'); // returns { fileName, driveFileId, driveUrl } or null
docfill.destroy();                        // stop listening, clean up subscriptions/timers
```

UMD global equivalent for `<script>` usage:
```html
<script src="https://cdn.jsdelivr.net/gh/YOUR_GH_USER/docfill-sdk@main/dist/docfill.umd.js"></script>
<div id="docfill-qr-container"></div>
<script>
  const docfill = new DocFill({ supabaseUrl: '...', supabaseAnonKey: '...', formId: '...', pwaUrl: '...' });
  docfill.mount('#docfill-qr-container');
</script>
```

## 4. Shared tag vocabulary — DO NOT INVENT NEW TAGS

Use exactly this flat, dot-namespaced list. All three repos share it.

```
identity.full_name
identity.father_name
identity.dob              # date, ISO 8601
identity.pan              # text value, format ^[A-Z]{5}[0-9]{4}[A-Z]$
identity.aadhaar          # text value
derived.age               # NOT stored anywhere — always computed at fill-time from identity.dob
address.current
address.permanent
education.10th_marksheet  # file
education.12th_marksheet  # file
education.degree_certificate # file
photo.passport_size       # file
```

Tags ending in a document-like word (`marksheet`, `certificate`, `pan`... when used as an
upload rather than text, `photo.*`) are **file tags**. Everything else is a **text/value tag**.
The SDK doesn't need to hardcode which is which — that's carried in the `filled_payload` shape
returned by the PWA (see §5): file tags come back with a `fileUrl`/`fileName`, text tags come
back with a `value`.

## 5. Shared Supabase schema — DO NOT rename tables/columns

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  form_id text not null,
  required_tags jsonb not null,        -- e.g. ["identity.pan","identity.dob","education.12th_marksheet"]
  status text not null default 'pending', -- 'pending' | 'filled' | 'expired'
  filled_payload jsonb,                -- see shape below
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes')
);
```

`filled_payload` shape (keyed by tag):
```json
{
  "identity.full_name": { "value": "Jane Doe" },
  "identity.dob": { "value": "2001-04-12" },
  "derived.age": { "value": 25 },
  "education.12th_marksheet": { "fileName": "12th_marksheet.pdf", "driveFileId": "1AbC...", "driveUrl": "https://drive.google.com/..." }
}
```

This repo only ever **reads** `status` and `filled_payload`, and **writes** a new row (insert
only — never update `sessions` from the SDK side). RLS on `sessions` should allow anonymous
insert + select (the demo form is unauthenticated); this is acceptable for a hackathon-scale
project — flag it as a known simplification in the README, don't try to add real auth here.

## 6. Critical browser constraint — read this before writing the file-injection logic

Browsers do **not** allow JavaScript to programmatically set the value of
`<input type="file">` for security reasons. This means:

- For **text/value tags**: set `.value` on the matched element, then dispatch both
  `new Event('input', { bubbles: true })` and `new Event('change', { bubbles: true })` so that
  frameworks with controlled inputs (React, Vue) also register the change, not just plain HTML.
- For **file tags**: do NOT attempt to fill the native file input. Instead:
  - Render a small "✓ Attached: `<fileName>`" chip next to the matched element.
  - Store the file reference on the element via a data attribute
    (`el.dataset.docfillFile = JSON.stringify({...})`).
  - Expose it via `docfill.getAttachedFile(tag)` so the consuming site's own submit handler
    can decide what to do (e.g. fetch the file from the Drive URL server-side, or just submit
    the reference).

Document this constraint clearly in the README — it is a real platform limitation, not
something a future iteration should "fix."

## 7. Suggested structure

```
docfill-sdk/
├── src/
│   ├── index.ts          # DocFill class, public API
│   ├── scan.ts           # DOM scanning for data-docfill
│   ├── qr.ts             # QR rendering (use the `qrcode` npm package)
│   ├── session.ts        # Supabase session create + subscribe/poll
│   └── inject.ts         # value/file injection logic (see §6)
├── package.json
├── tsconfig.json
└── README.md
```

## 8. Tooling

- Bundle with **tsup** — one config outputs CJS, ESM, and an IIFE/UMD global build:
  ```json
  "scripts": { "build": "tsup src/index.ts --format cjs,esm,iife --global-name DocFill --dts" }
  ```
- Runtime dependencies: `@supabase/supabase-js`, `qrcode`. Keep the dependency list minimal —
  this package needs to be embeddable in old, dependency-averse sites.
- Package name: pick a real, available npm name (e.g. `docfill-sdk` or a scoped
  `@yourname/docfill-sdk`) — check availability before finalizing.

## 9. Build order

1. `scan.ts` — DOM scanning, unit-testable with a static HTML fixture.
2. `qr.ts` — QR generation into a container element.
3. `session.ts` — create session row, then implement Realtime subscription with a 2s-interval
   polling fallback if Realtime isn't available.
4. `inject.ts` — text injection + file-tag chip rendering, per §6.
5. Wire into `index.ts` as the `DocFill` class with `.mount()`, `.on()`, `.getAttachedFile()`,
   `.destroy()`.
6. Build with tsup, smoke-test the UMD build in a bare `.html` file with 3 sample
   `data-docfill` fields before considering this repo done.

## 10. Non-goals for the hackathon build (explicitly skip)

- No OCR/AI document extraction — that lives in the PWA if it happens at all.
- No React-specific wrapper/hook — ship the vanilla core only; add a wrapper later only if
  time remains and the core is stable.
- No authentication in the SDK itself — it only ever talks to the public `sessions` table.

## 11. Acceptance criteria

- A plain `.html` file with 3 `data-docfill`-tagged inputs, given only a `<script>` include,
  successfully: creates a `sessions` row, renders a scannable QR, and — when that row's
  `status`/`filled_payload` is edited manually in the Supabase dashboard — updates the DOM
  fields live without a page reload.
