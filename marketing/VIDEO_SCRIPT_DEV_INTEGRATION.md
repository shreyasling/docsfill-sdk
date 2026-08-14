# Video Script — Developer Integration Demo

**Length target:** 60–90 seconds. Tone: fast, confident, "that's really it?". Screen recording +
voiceover. Pairs with `examples/integration-showcase.html` (record that page for this video).

---

### SCENE 1 — The claim (0:00–0:08)
**Visual:** Blank code editor / terminal. Title card: **"Add DocFill to any form — in under a
minute."**

**VO:**
> "This is a normal HTML form. Let's add document autofill to it — and I'm not going to touch the
> backend."

---

### SCENE 2 — Tag the fields (0:08–0:20)
**Visual:** `examples/integration-showcase.html` — left panel, code typing in. Show existing plain
inputs, then add `data-docfill="..."` attributes one by one, highlighting each as it's typed.

```html
<input type="text" data-docfill="identity.full_name" />
<input type="text" data-docfill="identity.pan" />
<input type="file" data-docfill="education.12th_marksheet" />
```

**On-screen text:** *"Step 1 — tag your fields."*

**VO:**
> "Step one: tag the fields you already have with `data-docfill` and the tag name — full name,
> PAN, whatever this form needs. That's it. No new inputs, no redesign."

---

### SCENE 3 — One line of code (0:20–0:35)
**Visual:** Type the script tag live.
```html
<script src="https://cdn.jsdelivr.net/npm/docfill-sdk/dist/index.global.js"
        data-docfill-form="onboarding-demo"></script>
```
As soon as it's "run" (page refresh in the demo), a floating **"⚡ Autofill with DocFill"** button
pops onto the right panel — zero additional JavaScript written.

**On-screen text:** *"Step 2 — one script tag. Zero JavaScript."*

**VO:**
> "Step two: one script tag, with your form id. Refresh the page — and there's your button. I
> haven't written a single line of JavaScript."

---

### SCENE 4 — Framework flexibility (0:35–0:48)
**Visual:** Quick cut to a React snippet appearing beside the HTML one (split screen or fade
transition):
```jsx
useEffect(() => {
  const widget = DocFill.widget({ formId: 'onboarding-demo' });
  return () => widget.destroy();
}, []);
```

**On-screen text:** *"Works in React too."*

**VO:**
> "Same idea in React — one hook, one call. It's framework-agnostic: plain HTML, WordPress, PHP,
> government portals, React, whatever you're running."

---

### SCENE 5 — Live fill, real upload (0:48–1:10)
**Visual:** Click the button → QR modal appears (from the SDK, not custom code). Scan with a
phone (or click the same-device link for the recording). Approve on the phone/PWA. Cut back:
fields fill live, and the **file input actually shows the uploaded file** — "✓ Uploaded" chip.

**On-screen text:**
- *"Click. Scan. Approve."*
- *"Real file. Real upload. Zero backend change."*

**VO:**
> "Click it, scan it, approve it — and the form fills. Even the file upload gets a real file, not
> just a link. My existing submit handler doesn't change at all."

---

### SCENE 6 — Recap + close (1:10–1:20)
**Visual:** Split-screen recap: the 3 code snippets (tags, script tag, optional React) on the
left; the filled, working form on the right. End card with npm install command.

**On-screen text:**
```
npm install docfill-sdk
```
**"That's the whole integration."**

**VO:**
> "Tag your fields. Add one line. That's the whole integration — `npm install docfill-sdk`, and
> you're done."

---

## Recording checklist
1. Open `examples/integration-showcase.html` in a clean, wide browser window (hide bookmarks bar).
2. Use screen recording at 1080p+, 30fps minimum.
3. Let the typing animation play once through without interruption for the smoothest capture.
4. Have a phone ready with the DocFill PWA installed/open to `Scan` for the live QR moment, or use
   the "same-device" fallback link if recording solo.
5. Zoom in (browser zoom 125–150%) so text and the button are readable in a small video frame.
