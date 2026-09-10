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

Replace `photos/01.jpg` … `06.jpg` with hers. Then in `CONTENT.photos`:

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

1. Open keshi — "Soft Spot" in Spotify
2. Share → Copy Song Link
3. From `https://open.spotify.com/track/AbCdEf123456?si=…` take just
   `AbCdEf123456` and paste it into `CONTENT.music.spotifyTrackId`

Until you do, the closing section shows a visible TODO box instead of a player.

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
  body text 7.1:1 / 8.4:1, dim text 4.9:1 / 5.8:1. All pass WCAG AA.
