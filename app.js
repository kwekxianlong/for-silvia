/* ============================================================================
   For Silvia — single-page birthday site
   No framework, no build step, no external JS libraries.

   ┌──────────────────────────────────────────────────────────────────────┐
   │  EVERYTHING YOU NEED TO EDIT IS IN THE `CONTENT` OBJECT BELOW.        │
   │  You should not have to touch index.html at all.                     │
   │                                                                      │
   │  THE WORDS BELOW ARE A DRAFT, NOT FACTS. Claude wrote them without   │
   │  knowing either of you. The observations are invented to show the    │
   │  register — swap each one for something that actually happened.      │
   └──────────────────────────────────────────────────────────────────────┘
   ========================================================================== */

const CONTENT = {

  /* -- 1. Entry gate ------------------------------------------------------ */
  gate: {
    line:   "Silvia — headphones in, if you have them. There's a song attached to this.",
    button: "Open",
    note:   "It starts with sound"
  },

  /* -- 2. Hero ------------------------------------------------------------ */
  hero: {
    name: "Silvia",
    line: "I rewrote this more times than I'd like to admit. This is the version that's true."
  },

  /* -- 3. The typed letter ------------------------------------------------
     INVENTED — replace both observations with real ones. The shape is the
     point: notice something small and specific rather than saying something
     large and general. Keep it short; it types one character at a time.   */
  letter:
    "I'm not good at this part, so here's what I've noticed instead. " +
    "You apologise before you explain what's wrong. You laugh at your own " +
    "jokes half a second early. You have never once made me feel like an " +
    "inconvenience.",

  /* -- 4. Photos ----------------------------------------------------------
       • photos[0] is the HERO portrait (top of the page).
       • photos[1..] fill the gallery, each with its caption.
       • All of them cycle through the background during the reasons.
     `w` and `h` are the real pixel dimensions. They set each frame's shape,
     so a landscape photo stays landscape instead of being cropped to fit a
     portrait box — keep them accurate when you swap a photo in.
     CAPTIONS ARE INVENTED. Replace them with what actually happened.      */
  photos: [
    { src: "photos/01.jpg", w: 958,  h: 1280,
      caption: "" },
    { src: "photos/02.jpg", w: 960,  h: 1280,
      caption: "You struck this pose unprompted, then immediately looked at the floor. Both halves are you." },
    { src: "photos/03.jpg", w: 960,  h: 1280,
      caption: "You walked the same stones twice so I could get it right, and said it was because you liked the garden." },
    { src: "photos/04.jpg", w: 1280, h: 960,
      caption: "Late, and you'd stopped performing by then. That's the version of you I like most." },
    { src: "photos/05.jpg", w: 960,  h: 1280,
      caption: "The light going, somewhere high up. You turned around before I asked you to." }
  ],

  /* -- 5. Reasons ---------------------------------------------------------
     INVENTED. These are written to be precise rather than sweet — each one
     names a behaviour you could point at, not a feeling. Keep that shape
     and put your own in.                                                  */
  reasons: {
    intro: "Five of them. One at a time — they aren't meant to be skimmed.",
    hint:  "tap to open",
    items: [
      "You're kind in the way that costs something. The kind that rearranges your own day.",
      "You ask the second question. Most people stop at the first and wait for their turn to talk.",
      "You have never made me smaller so that you could feel bigger. I didn't know how rare that was until I had it.",
      "You're honest about the unflattering things, which is the reason I believe you about the rest.",
      "You do the thing that frightens you, and then don't mention that it frightened you."
    ]
  },

  /* -- 6. Closing --------------------------------------------------------- */
  closing: {
    signoff: "Happy birthday, Silvia. Whatever this year asks of you, I'm on your side of it.",
    credit:  "keshi — “Soft Spot”",
    foot:    "Built over a few late nights, which was the easiest part of this."
  },

  /* -- Music --------------------------------------------------------------
     NO AUDIO FILE IS BUNDLED WITH THIS SITE, by design — the track is
     copyrighted. Playback is an official Spotify embed.

     ⚠ THE ID BELOW IS UNVERIFIED. It came from a web search; Spotify itself
     was unreachable from the machine that wrote this, and "Soft Spot" has
     several releases (single, album, acoustic, live) with different ids.
     PRESS PLAY ONCE AND CHECK IT IS THE RIGHT RECORDING before you send
     this to her.

     To replace it: Spotify → Share → Copy Song Link, then take the id
     between /track/ and the "?".                                         */
  music: {
    spotifyTrackId: "2aL4lMGhWdPpyPL6COPou7",
    label:  "Music",
    nudge:  "Tap play below to start the song"
  }
};

/* ==========================================================================
   Below this line is machinery. You shouldn't need to edit it.
   ========================================================================== */

(function () {
  "use strict";

  var TRACK_PLACEHOLDER = "PASTE_SPOTIFY_TRACK_ID_HERE";
  var root  = document.documentElement;
  var $     = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia &&
                     window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = {
    typeSpeed: 42,
    revealed:  0,
    visible:   "B",     // which portrait layer is currently shown
    portraitIndex: -1,
    spotify:   null,
    gateOpen:  false,
    playing:   false,
    sawPlayback: false
  };

  function cssNum(name, fallback) {
    var v = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------------------------------------------------------------- hero -- */

  function buildHero() {
    var host = $("hero");
    var p = CONTENT.photos[0];
    if (p) {
      var fig = el("figure", "hero__shot");
      var frame = el("div", "shot__frame");
      frame.style.aspectRatio = p.w + " / " + p.h;
      var img = new Image();
      img.src = p.src;
      img.width = p.w; img.height = p.h;     // reserves space, prevents jump
      img.alt = CONTENT.hero.name;
      img.decoding = "async";
      img.loading = "eager";
      img.setAttribute("fetchpriority", "high");
      markWhenLoaded(img);
      frame.appendChild(img);
      fig.appendChild(frame);
      host.appendChild(fig);
    }
    var h1 = el("h1", "hero__name", CONTENT.hero.name);
    var ln = el("p",  "hero__line", CONTENT.hero.line);
    host.appendChild(h1);
    host.appendChild(ln);
  }

  function markWhenLoaded(img) {
    if (img.complete && img.naturalWidth) { img.classList.add("is-in"); return; }
    img.addEventListener("load",  function () { img.classList.add("is-in"); });
    img.addEventListener("error", function () { img.classList.add("is-in"); });
  }

  /* -------------------------------------------------------------- letter -- */

  function buildLetter() {
    var host = $("letterSec");
    var text = CONTENT.letter;

    var p = el("p", "letter");
    var ghost = el("span", "letter__ghost", text);   // reserves full height
    ghost.setAttribute("aria-hidden", "true");
    var out = el("span", "letter__out");
    var caret = el("span", "caret");
    caret.setAttribute("aria-hidden", "true");
    out.appendChild(caret);
    p.appendChild(ghost);
    p.appendChild(out);

    var skip = el("button", "letter-skip", "Show it all");
    skip.type = "button";

    host.appendChild(p);
    host.appendChild(skip);

    function finish() {
      out.textContent = text;
      p.classList.add("is-done");
      skip.hidden = true;
      cancelled = true;
    }

    if (reduceMotion) { finish(); return; }

    var cancelled = false;
    var started = false;

    function run() {
      if (started) return;
      started = true;
      var t0 = null, shown = 0;
      function frame(ts) {
        if (cancelled) return;
        if (t0 === null) t0 = ts;
        var want = Math.floor((ts - t0) / Math.max(1, state.typeSpeed));
        if (want !== shown) {
          shown = Math.min(want, text.length);
          out.textContent = text.slice(0, shown);
          out.appendChild(caret);
        }
        if (shown >= text.length) { finish(); return; }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    p.addEventListener("click", finish);
    skip.addEventListener("click", finish);

    onceInView(host, run, "0px 0px -18% 0px");
  }

  /* ------------------------------------------------------------- gallery -- */

  function buildGallery() {
    var host = $("gallery");
    CONTENT.photos.slice(1).forEach(function (p) {
      var fig = el("figure", "shot");
      var frame = el("div", "shot__frame");
      frame.style.aspectRatio = p.w + " / " + p.h;
      var img = new Image();
      img.src = p.src;
      img.width = p.w; img.height = p.h;
      img.alt = p.caption || "";
      img.loading = "lazy";
      img.decoding = "async";
      markWhenLoaded(img);
      frame.appendChild(img);
      fig.appendChild(frame);
      if (p.caption) fig.appendChild(el("figcaption", null, p.caption));
      host.appendChild(fig);
    });
  }

  /* ------------------------------------------------------------- reasons -- */

  function buildReasons() {
    var host  = $("reasons");
    var items = CONTENT.reasons.items || [];

    if (CONTENT.reasons.intro) {
      host.appendChild(el("p", "reasons__intro", CONTENT.reasons.intro));
    }

    var buttons = [];

    items.forEach(function (txt, i) {
      // A real <button>: focusable and Enter/Space-activatable natively,
      // which is more reliable than div + role + keydown handlers.
      var b = el("button", "reason");
      b.type = "button";
      b.setAttribute("aria-expanded", "false");
      var hint = el("span", "reason__hint", CONTENT.reasons.hint || "tap to open");
      var body = el("span", "reason__text", txt);
      body.hidden = true;
      b.appendChild(hint);
      b.appendChild(body);

      b.addEventListener("click", function () {
        if (b.dataset.state !== "next") return;   // strictly one at a time
        hint.remove();
        body.hidden = false;
        b.dataset.state = "open";
        b.setAttribute("aria-expanded", "true");
        b.disabled = true;                        // nothing left to activate
        state.revealed += 1;
        advance(buttons);
        progress(state.revealed, items.length);
      });

      buttons.push(b);
      host.appendChild(b);
    });

    advance(buttons);
    watchForSharpAsset(host);
  }

  function advance(buttons) {
    var found = false;
    buttons.forEach(function (b) {
      if (b.dataset.state === "open") return;
      if (!found) { b.dataset.state = "next"; b.disabled = false; found = true; }
      else        { b.dataset.state = "locked"; b.disabled = true; }
    });
  }

  /* ------------------------------------------- background progression ----- */

  function progress(done, total) {
    var t = total ? done / total : 0;

    // The painting lifts out of darkness and comes into focus as she reads.
    var start = cssNum("--veil", 0.86);
    var end   = cssNum("--veil-end", 0.30);
    $("bgVeil").style.opacity  = (start + (end - start) * t).toFixed(3);
    $("bgSharp").style.opacity = t.toFixed(3);

    // Column scrim strengthens as the veil lifts, so the text stays readable
    // while the bouquet brightens around it.
    var s0 = cssNum("--scrim-start", 0.30);
    var s1 = cssNum("--scrim-end", 0.70);
    root.style.setProperty("--scrim", (s0 + (s1 - s0) * t).toFixed(3));

    if (done > 0) showPortrait(done);
  }

  function showPortrait(index) {
    var photos = CONTENT.photos;
    if (!photos.length) return;
    var op = String(cssNum("--portrait-opacity", 0.42));

    // Same portrait, just an opacity tweak from the dev panel: don't swap
    // layers, or the slider flickers between the two.
    if (index === state.portraitIndex) {
      ($("bgPort" + state.visible)).style.opacity = op;
      return;
    }
    var nextSlot = state.visible === "A" ? "B" : "A";
    var incoming = $("bgPort" + nextSlot);
    var outgoing = $("bgPort" + state.visible);
    incoming.src = photos[index % photos.length].src;
    incoming.style.opacity = op;
    outgoing.style.opacity = "0";
    state.visible = nextSlot;
    state.portraitIndex = index;
  }

  // The 1080px painting is ~600 KB and is only really *seen* once the veil
  // lifts, so it isn't fetched until she approaches the reasons.
  function watchForSharpAsset(node) {
    onceInView(node, function () { $("bgSharp").classList.add("is-loaded"); },
               "0px 0px 40% 0px");
  }

  function onceInView(node, fn, rootMargin) {
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { rootMargin: rootMargin || "0px", threshold: 0.01 });
    io.observe(node);
  }

  /* ------------------------------------------------------------- closing -- */

  function buildClosing() {
    var host = $("closing");
    host.appendChild(el("p", "closing__signoff", CONTENT.closing.signoff));
    host.appendChild(el("hr", "closing__rule"));
    host.appendChild(el("p", "closing__credit", CONTENT.closing.credit));

    var player = el("div", "player");
    player.id = "player";
    host.appendChild(player);

    if (CONTENT.closing.foot) {
      host.appendChild(el("p", "closing__foot", CONTENT.closing.foot));
    }
  }

  /* --------------------------------------------------------------- music -- */

  function initMusic() {
    var id = CONTENT.music.spotifyTrackId;
    var player = $("player");

    if (!id || id === TRACK_PLACEHOLDER) {
      var todo = el("div", "player__todo");
      todo.innerHTML =
        "<strong>No track set yet.</strong><br>" +
        "Open <code>app.js</code> and put the Spotify track id in " +
        "<code>CONTENT.music.spotifyTrackId</code>. " +
        "Spotify → Share → Copy Song Link, then take the id " +
        "between <code>/track/</code> and <code>?</code>.";
      player.appendChild(todo);
      return;
    }

    // Mount point the Spotify IFrame API replaces with its own iframe.
    var mount = el("div");
    mount.id = "spotifyMount";
    player.appendChild(mount);

    var settled = false;

    window.onSpotifyIframeApiReady = function (API) {
      try {
        API.createController(mount, {
          uri: "spotify:track:" + id,
          width: "100%",
          height: 152
        }, function (controller) {
          settled = true;
          state.spotify = controller;
          revealMusic();

          controller.addListener("playback_update", function (e) {
            if (!e || !e.data) return;
            state.sawPlayback = !e.data.isPaused;
            setPlayingUI(!e.data.isPaused);
          });
        });
      } catch (err) {
        fallbackEmbed(player, mount, id);
      }
    };

    var s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = function () { fallbackEmbed(player, mount, id); };
    document.head.appendChild(s);

    // If the API never initialises (blocked, offline, changed), degrade to a
    // plain embed rather than leaving an empty box.
    setTimeout(function () {
      if (!settled) fallbackEmbed(player, mount, id);
    }, 4000);
  }

  function fallbackEmbed(player, mount, id) {
    if (document.getElementById("spotifyFallback")) return;
    if (mount && mount.parentNode) mount.parentNode.removeChild(mount);
    var f = document.createElement("iframe");
    f.id = "spotifyFallback";
    f.src = "https://open.spotify.com/embed/track/" + id + "?utm_source=generator&theme=0";
    f.width = "100%";
    f.height = "152";
    f.loading = "lazy";
    f.title = "Spotify player";
    f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    player.appendChild(f);
    // No controller available, so the pill scrolls to the player instead.
    revealMusic();
    $("musicLabel").textContent = "Player";
  }

  // The music control must never sit on top of the entry gate.
  function revealMusic() {
    if (state.gateOpen) $("music").hidden = false;
  }

  function setPlayingUI(playing) {
    state.playing = playing;
    var btn = $("musicBtn");
    btn.setAttribute("aria-pressed", playing ? "false" : "true");
    btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    $("musicLabel").textContent = playing ? CONTENT.music.label : "Play";
  }

  function initMusicButton() {
    $("musicBtn").addEventListener("click", function () {
      if (state.spotify) {
        try { state.spotify.togglePlay(); return; } catch (e) { /* fall through */ }
      }
      var f = document.getElementById("spotifyFallback");
      if (f) f.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }

  /* ---------------------------------------------------------------- gate -- */

  function initGate() {
    $("gateLine").textContent = CONTENT.gate.line;
    $("gateBtn").textContent  = CONTENT.gate.button;
    $("gateNote").textContent = CONTENT.gate.note || "";

    var page = $("page");
    page.setAttribute("inert", "");
    page.setAttribute("aria-hidden", "true");

    $("gateBtn").addEventListener("click", function () {
      state.gateOpen = true;
      revealMusic();
      $("gate").classList.add("is-open");
      document.body.classList.remove("is-gated");
      page.removeAttribute("inert");
      page.removeAttribute("aria-hidden");
      page.classList.add("is-revealed");

      // The single user gesture. Ask Spotify to start inside the handler,
      // which is the only moment a browser will even consider it.
      if (state.spotify) {
        try { state.spotify.play(); } catch (e) { /* ignore */ }
      }

      // Cross-origin iframes do not inherit our user activation, and iOS
      // Safari is the strictest case, so assume it may not have started and
      // point her at the real play button if we never see playback begin.
      setTimeout(function () {
        if (!state.sawPlayback) nudgeToPlayer();
      }, 2200);

      var h1 = document.querySelector(".hero__name");
      if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    }, { once: true });
  }

  function nudgeToPlayer() {
    var m = $("music");
    if (m.hidden) return;
    var note = document.getElementById("musicNudge");
    if (note) return;
    note = el("span", null, CONTENT.music.nudge);
    note.id = "musicNudge";
    note.style.cssText =
      "position:absolute;right:0;bottom:52px;white-space:nowrap;" +
      "font-family:var(--font-ui);font-size:11px;color:var(--khaki);" +
      "background:rgba(10,9,8,.9);border:1px solid rgba(135,83,54,.5);" +
      "padding:7px 10px;";
    m.style.position = "relative";
    m.appendChild(note);
    setTimeout(function () { if (note.parentNode) note.remove(); }, 9000);
  }

  /* ----------------------------------------------------------------- go -- */

  buildHero();
  buildLetter();
  buildGallery();
  buildReasons();
  buildClosing();
  initMusic();
  initMusicButton();
  initGate();
  progress(0, (CONTENT.reasons.items || []).length);
  state.typeSpeed = cssNum("--type-speed", 42);

  /* =========================================================================
     DEV PANEL — press "d". Also opens automatically with ?dev in the URL.
     Built lazily so the deployed page pays nothing for it until asked.
     ========================================================================= */

  var DEV_GROUPS = [
    { title: "Type", items: [
      { label: "Base font size",  v: "--fs-base",  min: 13,  max: 24,  step: 0.5,  unit: "px" },
      { label: "Heading scale",   v: "--scale",    min: 1.05,max: 1.65,step: 0.01, unit: "" },
      { label: "Letter-spacing",  v: "--tracking", min: -0.03,max: 0.14,step: 0.005,unit: "em" },
      { label: "Line-height",     v: "--leading",  min: 1.2, max: 2.2, step: 0.02, unit: "" }
    ]},
    { title: "Motion", items: [
      { label: "Typing speed (ms/char)", v: "--type-speed",   min: 4, max: 160, step: 1, unit: "" },
      { label: "Reveal duration",        v: "--reveal-ms",    min: 0, max: 2000,step: 25,unit: "ms" },
      { label: "Reveal easing",          v: "--reveal-ease",  type: "select", options: [
          "cubic-bezier(.22,.61,.36,1)", "ease", "ease-in-out", "linear",
          "cubic-bezier(.16,1,.3,1)", "cubic-bezier(.68,-0.55,.27,1.55)" ] },
      { label: "Crossfade duration",     v: "--crossfade-ms", min: 0, max: 4000,step: 50,unit: "ms" }
    ]},
    { title: "Background", items: [
      { label: "Veil at start",     v: "--veil",             min: 0, max: 1,   step: 0.01, unit: "" },
      { label: "Veil at end",       v: "--veil-end",         min: 0, max: 1,   step: 0.01, unit: "" },
      { label: "Column scrim start",v: "--scrim-start",      min: 0, max: 1,   step: 0.01, unit: "" },
      { label: "Column scrim end",  v: "--scrim-end",        min: 0, max: 1,   step: 0.01, unit: "" },
      { label: "Vignette",          v: "--vignette",         min: 0, max: 1.4, step: 0.02, unit: "" },
      { label: "Blur",              v: "--bg-blur",          min: 0, max: 40,  step: 1,    unit: "px" },
      { label: "Portrait opacity",  v: "--portrait-opacity", min: 0, max: 1,   step: 0.02, unit: "" }
    ]},
    { title: "Layout", items: [
      { label: "Section spacing", v: "--section-gap", min: 24,  max: 220, step: 4,  unit: "px" },
      { label: "Column width",    v: "--measure",     min: 320, max: 820, step: 10, unit: "px" }
    ]},
    { title: "Colour", items: [
      { label: "Background", v: "--bg",    type: "color" },
      { label: "Text",       v: "--cream", type: "color" },
      { label: "Accent",     v: "--rust",  type: "color" },
      { label: "Dim text",   v: "--khaki", type: "color" }
    ]}
  ];

  var devPanel = null;

  function hexOf(name) {
    var raw = getComputedStyle(root).getPropertyValue(name).trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
    var m = raw.match(/rgba?\(([^)]+)\)/);
    if (!m) return "#000000";
    var p = m[1].split(",").map(function (x) { return parseInt(x, 10); });
    return "#" + p.slice(0, 3).map(function (n) {
      return ("0" + (n || 0).toString(16)).slice(-2);
    }).join("");
  }

  function buildDev() {
    var panel = el("aside", "dev");
    panel.id = "devPanel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Design tweak panel");

    panel.appendChild(el("h2", null, "TWEAKS"));
    panel.appendChild(el("p", "dev__sub",
      "Live. Press “d” to hide. Nothing here is saved — use " +
      "Copy CSS and paste the block into styles.css to keep it."));

    DEV_GROUPS.forEach(function (g) {
      var wrap = el("div", "dev__group");
      wrap.appendChild(el("h3", null, g.title.toUpperCase()));
      g.items.forEach(function (it) { wrap.appendChild(devRow(it)); });
      panel.appendChild(wrap);
    });

    var actions = el("div", "dev__actions");
    var copyBtn = el("button", null, "Copy CSS");
    copyBtn.type = "button";
    var resetBtn = el("button", null, "Reset");
    resetBtn.type = "button";
    var out = el("textarea", "dev__out");
    out.readOnly = true;
    out.hidden = true;

    copyBtn.addEventListener("click", function () {
      var css = exportCss();
      out.hidden = false;
      out.value = css;
      out.focus(); out.select();
      // navigator.clipboard is unavailable on file:// in several browsers,
      // so the textarea is always shown as a dependable fallback.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(css).then(function () {
          copyBtn.textContent = "Copied ✓";
          setTimeout(function () { copyBtn.textContent = "Copy CSS"; }, 1600);
        }, function () {
          copyBtn.textContent = "Select + copy below";
          setTimeout(function () { copyBtn.textContent = "Copy CSS"; }, 2400);
        });
      } else {
        copyBtn.textContent = "Select + copy below";
        setTimeout(function () { copyBtn.textContent = "Copy CSS"; }, 2400);
      }
    });

    resetBtn.addEventListener("click", function () {
      DEV_GROUPS.forEach(function (g) {
        g.items.forEach(function (it) { root.style.removeProperty(it.v); });
      });
      panel.remove();
      devPanel = null;
      state.typeSpeed = cssNum("--type-speed", 42);
      progress(state.revealed, (CONTENT.reasons.items || []).length);
      toggleDev();
    });

    actions.appendChild(copyBtn);
    actions.appendChild(resetBtn);
    actions.appendChild(out);
    panel.appendChild(actions);

    document.body.appendChild(panel);
    return panel;
  }

  function devRow(it) {
    var row = el("div", "dev__row");
    var id  = "dev" + it.v.replace(/[^a-z]/gi, "");
    var lab = el("label", null, it.label);
    lab.htmlFor = id;
    row.appendChild(lab);

    var input, output;

    if (it.type === "color") {
      input = el("input");
      input.type = "color";
      input.value = hexOf(it.v);
    } else if (it.type === "select") {
      input = el("select");
      it.options.forEach(function (o) {
        var op = el("option", null, o);
        op.value = o;
        input.appendChild(op);
      });
      input.value = getComputedStyle(root).getPropertyValue(it.v).trim();
    } else {
      input = el("input");
      input.type = "range";
      input.min = it.min; input.max = it.max; input.step = it.step;
      input.value = cssNum(it.v, it.min);
      output = el("output", null, input.value + (it.unit || ""));
      row.appendChild(output);
    }

    input.id = id;
    input.addEventListener("input", function () {
      var val = (it.type === "color" || it.type === "select")
                ? input.value
                : input.value + (it.unit || "");
      root.style.setProperty(it.v, val);
      if (output) output.textContent = val;
      if (it.v === "--type-speed") state.typeSpeed = parseFloat(input.value);
      if (it.v === "--veil" || it.v === "--veil-end" || it.v === "--portrait-opacity" ||
          it.v === "--scrim-start" || it.v === "--scrim-end") {
        progress(state.revealed, (CONTENT.reasons.items || []).length);
      }
    });

    row.appendChild(input);
    return row;
  }

  function exportCss() {
    var lines = ["/* Tweaked values — paste into :root in styles.css */", ":root {"];
    DEV_GROUPS.forEach(function (g) {
      lines.push("  /* " + g.title + " */");
      g.items.forEach(function (it) {
        var inline = root.style.getPropertyValue(it.v).trim();
        var val = inline || getComputedStyle(root).getPropertyValue(it.v).trim();
        lines.push("  " + it.v + ": " + val + ";");
      });
    });
    lines.push("}");
    return lines.join("\n");
  }

  function toggleDev() {
    if (!devPanel) devPanel = buildDev();
    devPanel.hidden = !devPanel.hidden;
  }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" ||
              t.tagName === "SELECT" || t.isContentEditable)) return;
    if (e.key === "d" || e.key === "D") { e.preventDefault(); toggleDev(); }
  });

  // Escape always closes the panel, including from inside its own fields —
  // otherwise the Copy CSS textarea traps you (the guard above, correctly,
  // ignores "d" while a form field has focus).
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && devPanel && !devPanel.hidden) {
      devPanel.hidden = true;
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    }
  });

  if (/[?&]dev\b/.test(location.search)) toggleDev();

})();
