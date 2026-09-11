# For Silvia

A single-page birthday site. Static HTML/CSS/JS — no framework, no build step,
no npm install. Open `index.html` in a browser and it runs.

---

## The three files you'll actually edit

| To change | Edit | Where |
|---|---|---|
| **All words** — letter, captions, reasons, sign-off | `app.js` | the `CONTENT` object, lines 1–110 |
| **The photos** | `photos/` + `app.js` | drop files in `photos/`, list them in `CONTENT.photos` |
| **The song** | `app.js` | `CONTENT.music.spotifyTrackId` |
| **The look** (permanently) | `styles.css` | the `:root` block at the top |

You should not need to touch `index.html` at all.

### Photos

There are five real photos in `photos/`. Replace or add to them, then update
`CONTENT.photos`:

```js
{ src: "photos/01.jpg", w: 900, h: 1200, caption: "..." }
```

- `photos[0]` is the **hero** portrait at the top.
- `photos[1..]` fill the gallery, each with its caption underneath.
- All of them cycle through the background during the reasons.
- `w`/`h` are the real pixel dimensions. They're written to the `<img>` tags so
  the browser reserves space and the page doesn't jump as photos load. Only the
  **ratio** matters, so they don't have to be exact — but closer is better.
- Add or remove entries freely; the gallery adapts.
- Straight-from-the-phone photos are fine — they're cropped to a 3:4 box. But
  they're heavy (often 3–5 MB each). Resizing them to ~1200px on the long edge
  will make the page load a lot faster on mobile data.

### The song

No audio file is bundled, deliberately — the track is copyrighted. Playback is
an official Spotify embed.

**A track id is set, but it is UNVERIFIED.** It came from a web search;
Spotify was unreachable from the machine that built this, and "Soft Spot" has
several releases (single, album, acoustic, live) with different ids. **Press
play once and confirm it's the right recording before sending this to her.**

To change it:

1. Open keshi — "Soft Spot" in Spotify
2. Share → Copy Song Link
3. From `https://open.spotify.com/track/AbCdEf123456?si=…` take just
   `AbCdEf123456` and paste it into `CONTENT.music.spotifyTrackId`

Clear the id entirely and the closing section shows a TODO box instead.

---

## The tweak panel

Press **`d`** anywhere on the page (or add `?dev` to the URL). `Esc` closes it.

Live sliders for typing speed, reveal duration and easing, crossfade, font size
and heading scale, letter-spacing and line-height, the colours, vignette, blur,
section spacing, and the background veil/scrim.

Everything updates the page instantly via CSS custom properties. When it looks
right, hit **Copy CSS** — it prints a `:root { … }` block. Paste that over the
`:root` block in `styles.css` to make it permanent.

The panel is hidden until you press the key, so it won't appear for her. It is
still present in the deployed JavaScript — removing it entirely would need a
build step, which this project deliberately doesn't have.

---

## Local preview with live reload

```bash
git pull
node dev-server.js
```

No `npm install` — it has zero dependencies. It prints both URLs on startup:

```
  On this computer:   http://localhost:5173

  ON YOUR PHONE (same Wi-Fi) — open this:

      http://192.168.1.42:5173   (en0)
```

Type that second URL into your phone's browser. The address is your machine's,
so it will differ from the example — read it off your own terminal.

Use a different port with `PORT=8080 node dev-server.js`.

**How edits behave**

- **CSS edits hot-swap in place.** The page does *not* reload, so the gate stays
  open, revealed reasons stay revealed, and your scroll position is kept. That
  matters here — a full reload would dump you back at the entry gate every time
  you nudged a value.
- **HTML/JS edits reload**, then re-open the gate for you automatically so you
  don't re-tap it each time.
- `git pull` also triggers it, so changes pushed from elsewhere appear as soon
  as you pull.

**If your phone can't reach it**

- Both devices must be on the *same* Wi-Fi. Phone on cellular, or on a "Guest"
  network, won't work — guest networks usually block device-to-device traffic.
- First run on macOS may show a firewall prompt; allow it.
- On Windows, allow Node through Windows Defender Firewall on private networks.
- To find the address manually: `ipconfig getifaddr en0` (macOS),
  `hostname -I` (Linux), `ipconfig` (Windows, look for IPv4 Address).

The watcher polls rather than using `fs.watch`. That's deliberate: editors like
Vim and VS Code save via atomic rename, which silently breaks inode-based file
watching, and the recursive watcher went stale in testing.

---

## Deploying

Drag the whole folder onto [Netlify Drop](https://app.netlify.com/drop), or
`vercel deploy`. No configuration, no build command. It's plain static files.

---

## Known limits — please read

- **The music may not auto-start on her phone.** The gate button asks Spotify to
  play, but a Spotify embed is a cross-origin iframe and does not inherit your
  tap as user activation. iOS Safari is the strictest case. If playback doesn't
  begin within ~2 seconds, a small prompt points her at the player. The site is
  built so this degrades gracefully rather than looking broken.
- **Spotify embeds play a ~30 second preview** unless the listener is signed in
  with Premium in that browser. If she isn't, expect a clip, not the song.
- **The background painting was upscaled** from a 736px source to 1080px.
  Upscaling can't invent detail — it's sharpened and grained to recover
  perceived crispness, but it isn't a true 1080-native image. A higher-res
  source would look better, especially once the veil lifts at the end.
- **Check the provenance of that image** before putting this on a public URL.
  It may be a photograph of a public-domain Old Master still life, or it may be
  a contemporary designer's work still in copyright.

## Accessibility

- Reason cards are real `<button>`s: focusable, Enter/Space activatable.
- `prefers-reduced-motion` disables the typing animation and crossfades and
  shows everything directly.
- Text contrast was measured against the brightest 0.1% of background pixels
  under the text column, in both the opening and fully-revealed states:
  body text 6.7:1 / 7.2:1, dim text 4.6:1 / 5.0:1. All pass WCAG AA.
