# DocFill — Pitch Deck Outline (for PPT)

> Copy each section into one slide. Keep text minimal on-slide; use this as speaker notes.

---

## Slide 1 — Title
**DocFill** — Scan once. Fill anywhere.
*Turn any government/college/office form into a one-tap autofill experience.*
Team name • Hackathon name • Date

---

## Slide 2 — The Problem
- Every form (college admission, govt scheme, bank KYC, cyber-center services) asks for the
  **same 10–15 things**: name, DOB, PAN, Aadhaar, address, marksheets, photo…
- People **carry physical documents**, queue at cyber cafés, get photocopies made, re-type the
  same details again and again — for every single form.
- Cyber center staff spend most of their time **re-uploading the same files** for different
  people, all day.
- Result: wasted hours, repeated errors, and no reuse of data that was already submitted before.

*(Use this slide to lead into the problem-solution video.)*

---

## Slide 3 — The Insight
People don't need a smarter form. **They need to stop retyping what they already have.**
- Documents already exist — in a Google Drive, in a folder, in their head.
- The missing piece: a **safe, one-tap bridge** between "what I already have" and "what this form
  is asking for."

---

## Slide 4 — The Solution: DocFill
Three pieces, one flow:
1. **`docfill-sdk`** — an npm/`<script>` package any form owner installs. Tags fields with
   `data-docfill="<tag>"`, adds **one line of code**, done.
2. **DocFill PWA** — the user's document vault. Sign in once, upload documents to matching
   categories (tags), and reuse them forever.
3. **Shared backend** (Supabase) — a token-secured session bridge between the two. No PII sits
   permanently in it.

---

## Slide 5 — How It Works (flow diagram)
```
Form loads → SDK renders "Autofill with DocFill" button
   → user clicks → QR/link appears
   → user scans with DocFill app → sees exactly which docs/values are requested
   → approves → form fills live (real files injected, no backend change)
```

---

## Slide 6 — For Developers (the "wow, that's it?" slide)
```html
<input data-docfill="identity.full_name" />
<input data-docfill="education.12th_marksheet" type="file" />

<script src="https://cdn.jsdelivr.net/npm/docfill-sdk/dist/index.global.js"
        data-docfill-form="my-form"></script>
```
- **Zero backend change** for the form owner — real files are injected into the native
  `<input type="file">`, so their existing submit handler just works.
- Works in React, plain HTML, WordPress, PHP, government portals — anything.
- `npm install docfill-sdk` — published, versioned, tested.

---

## Slide 7 — Privacy & Trust (the hard question, answered)
- Google Drive access uses the **`drive.file`** scope — the app can only see files the user
  explicitly picks. Not their whole Drive. This is enforced by Google, not by us.
- **Zero-copy**: DocFill never permanently stores the user's documents — only a reference.
- **Per-session capability tokens**: every fill session is single-use and token-gated; a leaked
  API key can't dump anyone's data.
- The user approves **exactly which tags** go to **this specific form**, every time.

---

## Slide 8 — Tag Vocabulary (standardization)
- 72 shared tags across 11 categories (identity, education, employment, financial, certificates,
  medical, address, contact, photo, signature, derived).
- One registry, versioned (`TAG_SCHEMA_VERSION`), shared by the SDK and the vault — so
  `education.12th_marksheet` means the exact same thing everywhere.

---

## Slide 9 — Demo
*(Cut to live demo / recorded video here.)*
1. Show the form with the DocFill button.
2. Scan QR with the PWA.
3. Approve.
4. Form fills instantly — text + real file upload.

---

## Slide 10 — What's Production-Ready Today
- Published npm package (`docfill-sdk`), CI, 24 automated tests, typed errors, resilient polling
  + Realtime accelerator, security-hardened backend (capability tokens, locked tables).
- Real limitation flagged, not hidden: browsers can't auto-fill `<input type="file">` directly —
  we solve it with `DataTransfer` injection, with a reference fallback when bytes aren't
  fetchable.

---

## Slide 11 — Roadmap
- OCR auto-tagging on upload (extract PAN/DOB/name automatically).
- LLM field-matcher for forms with unusual/untagged labels.
- Document expiry & completeness tracking.
- Per-tag sharing consent + audit log ("who requested what, when").

---

## Slide 12 — Ask / Close
- What we built: a real npm package, a real PWA, a real shared backend — not a mockup.
- What we're asking: [feedback / mentorship / prize consideration — customize per event].
- Thank you — questions?
