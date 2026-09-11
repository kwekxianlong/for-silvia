/* ============================================================================
   For Silvia
   No framework, no build step.

   ┌──────────────────────────────────────────────────────────────────────┐
   │  EVERYTHING YOU EDIT IS IN `CONTENT` BELOW. Don't touch index.html.  │
   │                                                                      │
   │  THE WORDS ARE A DRAFT. Claude wrote them without knowing either of  │
   │  you — every observation is invented to set the register. Replace    │
   │  them with things that actually happened.                            │
   └──────────────────────────────────────────────────────────────────────┘
   ========================================================================== */

const CONTENT = {

  /* -- 1. The lock ---------------------------------------------------------
     Six digits, DD MM YY. Note this is romance, not security: the code sits
     in this file and anyone can read it with View Source.                  */
  lock: {
    title: "Enter the special date",
    hint:  "DD MM YY",
    code:  "180999",
    error: "Not quite. Try again."
  },

  /* -- 2. Opening --------------------------------------------------------- */
  open: {
    name: "Silvia",
    line: "Open it slowly."
  },

  /* -- 3. The letter (INVENTED — replace) --------------------------------- */
  letter: {
    salutation: "To my favourite person,",
    body: "I don't say it enough, but you are the best part of my every day. " +
          "You apologise before you explain what's wrong. You laugh at your own " +
          "jokes half a second early. Here's to us, and to all the memories we " +
          "haven't made yet.",
    sign: "Happy birthday, my love."
  },

  /* -- 4. The blooms — each flower on the vine is one of her photos --------
     `w`/`h` are the real pixel sizes; they keep the browser from jumping
     while the photo loads. CAPTIONS ARE INVENTED. Replace them.           */
  blooms: [
    { src: "photos/01.jpg", w: 958,  h: 1280,
      caption: "The sea behind you, and you not looking at me once." },
    { src: "photos/02.jpg", w: 960,  h: 1280,
      caption: "You struck this pose unprompted, then looked straight at the floor." },
    { src: "photos/03.jpg", w: 960,  h: 1280,
      caption: "You walked the same stones twice so I could get it right." },
    { src: "photos/04.jpg", w: 1280, h: 960,
      caption: "Late, and you'd stopped performing by then." },
    { src: "photos/05.jpg", w: 960,  h: 1280,
      caption: "The light going, and you turned before I asked." }
  ],

  /* -- 5. Reasons (INVENTED — replace) ------------------------------------ */
  reasons: {
    title: "Some of the reasons",
    items: [
      "You are kind in the way that costs something.",
      "You ask the second question.",
      "You have never made me smaller so that you could feel bigger.",
      "You are honest about the unflattering things.",
      "You do the thing that frightens you, and don't mention that it did."
    ]
  },

  /* -- 6. Closing --------------------------------------------------------- */
  close: {
    question: "Will you be mine for another year?",
    credit:   "keshi — “Soft Spot”",
    foot:     "Made by hand, for you."
  },

  /* -- Music ---------------------------------------------------------------
     NO AUDIO FILE IS BUNDLED — the track is copyrighted. This is an official
     YouTube embed, which is what makes the FULL song possible and lets it
     repeat; a Spotify embed gives roughly 30 seconds unless the listener has
     Premium, and cannot be looped.

     The id below is keshi — "Soft Spot" (Official Music Video). YouTube was
     unreachable from the machine that built this, so PLAY IT ONCE AND CHECK.
     To change it: from https://www.youtube.com/watch?v=XXXXXXXXXXX take the
     XXXXXXXXXXX part.                                                      */
  music: {
    youTubeId: "4Lmcadu8ghM",
    label: "Music",
    nudge: "Tap to start the song"
  }
};

/* ==========================================================================
   Machinery below.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = { typeSpeed: 44, unlocked: false, entry: "", yt: null, playing: false };

  function cssNum(n, d) {
    var v = parseFloat(getComputedStyle(root).getPropertyValue(n));
    return isNaN(v) ? d : v;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function use(symbol) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#" + symbol);
    s.appendChild(u);
    s.setAttribute("aria-hidden", "true");
    return s;
  }
  function onceInView(node, fn, margin) {
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { rootMargin: margin || "0px 0px -12% 0px", threshold: 0.01 });
    io.observe(node);
  }

  /* ---- reveal-on-scroll ------------------------------------------------- */
  function rise(node) {
    node.classList.add("rise");
    onceInView(node, function () { node.classList.add("is-in"); });
    return node;
  }

  /* ---- the typing engine -------------------------------------------------
     One ghost copy holds the final height so nothing reflows mid-type.     */
  function typed(tag, cls, text) {
    var wrap = el(tag, (cls ? cls + " " : "") + "typed");
    var ghost = el("span", "typed__ghost", text);
    ghost.setAttribute("aria-hidden", "true");
    var out = el("span", "typed__out");
    var caret = el("span", "caret");
    caret.setAttribute("aria-hidden", "true");
    out.appendChild(caret);
    wrap.appendChild(ghost);
    wrap.appendChild(out);

    function finish() { out.textContent = text; wrap.classList.add("is-done"); }

    if (reduce) { finish(); return wrap; }

    var started = false;
    onceInView(wrap, function () {
      if (started) return;
      started = true;
      var t0 = null, shown = 0;
      (function frame(ts) {
        if (t0 === null) t0 = ts;
        var want = Math.floor((ts - t0) / Math.max(1, state.typeSpeed));
        if (want !== shown) {
          shown = Math.min(want, text.length);
          out.textContent = text.slice(0, shown);
          out.appendChild(caret);
        }
        if (shown >= text.length) { finish(); return; }
        requestAnimationFrame(frame);
      })(performance.now());
    });
    // a tap finishes it early
    wrap.addEventListener("click", finish);
    return wrap;
  }

  /* ---- the decorative vine ---------------------------------------------- */
  function buildVine() {
    var v = $("vine");
    v.appendChild(el("div", "vine__stem"));
    var h = Math.max(document.body.scrollHeight, window.innerHeight * 3);
    var step = 210, i = 0;
    for (var y = 120; y < h; y += step, i++) {
      var bit = el("div", "vine__bit");
      var isRose = i % 3 === 0;
      var size = isRose ? 54 : 40;
      bit.style.top = y + "px";
      bit.style.height = size + "px";
      bit.style.width = size + "px";
      bit.style.left = (i % 2 ? 44 : 8) + "px";
      bit.style.transform = "rotate(" + (i % 2 ? 22 : -26) + "deg)";
      bit.appendChild(use(isRose ? "rose" : "leaf"));
      v.appendChild(bit);
    }
  }

  /* ---- scenes ------------------------------------------------------------ */
  function buildOpen() {
    var s = $("sceneOpen");
    var env = el("div", "open__env");
    env.appendChild(use("envelope"));
    s.appendChild(rise(env));
    s.appendChild(rise(typed("h1", "open__name", CONTENT.open.name)));
    s.appendChild(rise(typed("p", "open__line", CONTENT.open.line)));
  }

  function buildLetter() {
    var s = $("sceneLetter");
    var paper = el("div", "paper");
    var inner = el("div", "paper__inner");
    inner.appendChild(typed("p", "paper__salutation", CONTENT.letter.salutation));
    inner.appendChild(typed("p", "paper__body", CONTENT.letter.body));
    inner.appendChild(typed("p", "paper__sign", CONTENT.letter.sign));
    paper.appendChild(inner);
    paper.appendChild(el("span", "paper__kiss"));
    s.appendChild(rise(paper));
  }

  function buildGarden() {
    var s = $("sceneGarden");
    var g = el("div", "garden");
    g.appendChild(el("div", "garden__stem"));
    CONTENT.blooms.forEach(function (b) {
      var wrap = el("div", "bloom");
      var frame = el("div", "bloom__frame");
      var img = new Image();
      img.src = b.src;
      img.width = b.w; img.height = b.h;
      img.alt = b.caption || "";
      img.loading = "lazy";
      img.decoding = "async";
      if (img.complete && img.naturalWidth) img.classList.add("is-in");
      else {
        img.addEventListener("load", function () { img.classList.add("is-in"); });
        img.addEventListener("error", function () { img.classList.add("is-in"); });
      }
      frame.appendChild(img);

      // The photograph is the flower. Leaves flank it; no rose beside it,
      // which read as ears and confused the idea.
      ["a", "b"].forEach(function (k) {
        var l = el("span", "bloom__leaf bloom__leaf--" + k);
        l.appendChild(use("leaf"));
        wrap.appendChild(l);
      });

      wrap.appendChild(frame);
      if (b.caption) wrap.appendChild(typed("p", "bloom__caption", b.caption));
      g.appendChild(rise(wrap));
    });
    s.appendChild(g);
  }

  function buildReasons() {
    var s = $("sceneReasons");
    s.appendChild(rise(typed("h2", "reasons__title", CONTENT.reasons.title)));
    var box = el("div", "reasons");
    CONTENT.reasons.items.forEach(function (t) {
      box.appendChild(rise(typed("p", "reason", t)));
    });
    s.appendChild(box);
  }

  function buildClose() {
    var s = $("sceneClose");
    s.appendChild(rise(typed("h2", "close__q", CONTENT.close.question)));
    var bow = el("div", "close__bow");
    bow.appendChild(use("bow"));
    s.appendChild(rise(bow));
    s.appendChild(rise(el("p", "close__credit", CONTENT.close.credit)));
    s.appendChild(rise(el("p", "close__foot", CONTENT.close.foot)));
  }

  /* ---- the lock ---------------------------------------------------------- */
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 21s-8-5.2-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 15.8 12 21 12 21Z"' +
    ' fill="#c2142a"/></svg>';

  function buildLock() {
    $("lockTitle").textContent = CONTENT.lock.title;
    $("lockHint").textContent = CONTENT.lock.hint;

    var slots = $("lockSlots");
    for (var i = 0; i < 6; i++) {
      slots.appendChild(el("span", "slot"));
      if (i === 1 || i === 3) {
        var sep = el("span", "slot");
        sep.style.borderBottom = "none";
        sep.style.width = "8px";
        sep.appendChild(el("span", "sep", "/"));
        slots.appendChild(sep);
      }
    }

    var pad = $("lockPad");
    ["1","2","3","4","5","6","7","8","9","","0","⌫"].forEach(function (k) {
      if (k === "") { pad.appendChild(el("span", "key key--ghost")); return; }
      var b = el("button", "key" + (k === "⌫" ? " key--back" : ""), k);
      b.type = "button";
      b.setAttribute("aria-label", k === "⌫" ? "Delete" : k);
      b.addEventListener("click", function () {
        if (k === "⌫") press(null); else press(k);
      });
      pad.appendChild(b);
    });

    document.addEventListener("keydown", function (e) {
      if (state.unlocked) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") { e.preventDefault(); press(null); }
    });

    paint();
  }

  function realSlots() {
    return Array.prototype.filter.call(
      $("lockSlots").children, function (n) { return !n.querySelector(".sep"); });
  }

  function paint() {
    realSlots().forEach(function (s, i) {
      var on = i < state.entry.length;
      s.classList.toggle("is-filled", on);
      s.innerHTML = on ? HEART : "";
    });
  }

  function press(digit) {
    $("lockError").classList.remove("is-on");
    if (digit === null) state.entry = state.entry.slice(0, -1);
    else if (state.entry.length < 6) state.entry += digit;
    paint();
    if (state.entry.length === 6) setTimeout(check, 220);
  }

  function check() {
    if (state.entry === String(CONTENT.lock.code)) { unlock(); return; }
    var card = document.querySelector(".lock__card");
    card.classList.add("is-wrong");
    $("lockError").textContent = CONTENT.lock.error;
    $("lockError").classList.add("is-on");
    setTimeout(function () {
      card.classList.remove("is-wrong");
      state.entry = "";
      paint();
    }, 560);
  }

  function unlock() {
    state.unlocked = true;
    $("lock").classList.add("is-open");
    document.body.classList.remove("is-locked");
    $("page").classList.add("is-open");
    $("page").removeAttribute("inert");
    $("page").removeAttribute("aria-hidden");

    // The one user gesture the whole audio story hangs off.
    startMusic();

    setTimeout(buildVine, 400);
    var n = document.querySelector(".open__name");
    if (n) { n.setAttribute("tabindex", "-1"); n.focus({ preventScroll: true }); }
  }

  /* ---- music: full track, on repeat -------------------------------------- */
  function initMusic() {
    var id = CONTENT.music.youTubeId;
    if (!id) return;
    window.onYouTubeIframeAPIReady = function () {
      state.yt = new YT.Player("ytHost", {
        videoId: id,
        playerVars: {
          autoplay: 0, controls: 0, playsinline: 1,
          loop: 1, playlist: id,          // `playlist` is what makes loop work
          modestbranding: 1, rel: 0
        },
        events: {
          onReady: function () { if (state.unlocked) startMusic(); },
          onStateChange: function (e) {
            if (e.data === YT.PlayerState.PLAYING) { setPlayUI(true); $("music").hidden = false; }
            if (e.data === YT.PlayerState.PAUSED)  setPlayUI(false);
            // belt and braces: loop=1 is unreliable, so restart on end too
            if (e.data === YT.PlayerState.ENDED) { try { state.yt.playVideo(); } catch (x) {} }
          }
        }
      });
    };
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  }

  function startMusic() {
    if (!state.yt || !state.yt.playVideo) return;
    try { state.yt.setVolume(100); state.yt.playVideo(); } catch (e) {}
    // Cross-origin frames don't inherit our tap, so surface the control if
    // playback never actually begins.
    setTimeout(function () { $("music").hidden = false; }, 1800);
  }

  function setPlayUI(on) {
    state.playing = on;
    var b = $("musicBtn");
    b.setAttribute("aria-pressed", on ? "false" : "true");
    b.setAttribute("aria-label", on ? "Pause music" : "Play music");
    $("musicLabel").textContent = on ? CONTENT.music.label : "Play";
  }

  function initMusicButton() {
    $("musicBtn").addEventListener("click", function () {
      if (!state.yt) return;
      try { state.playing ? state.yt.pauseVideo() : state.yt.playVideo(); } catch (e) {}
    });
  }

  /* ---- go ---------------------------------------------------------------- */
  $("page").setAttribute("inert", "");
  $("page").setAttribute("aria-hidden", "true");
  buildLock();
  buildOpen();
  buildLetter();
  buildGarden();
  buildReasons();
  buildClose();
  initMusic();
  initMusicButton();
  state.typeSpeed = cssNum("--type-speed", 44);

  /* =========================================================================
     DEV PANEL — press "d" (or add ?dev). Esc closes.
     ========================================================================= */
  var GROUPS = [
    { title: "Type", items: [
      { label: "Base font size", v: "--fs-base", min: 13, max: 24, step: .5, unit: "px" },
      { label: "Heading scale",  v: "--scale",   min: 1.05, max: 1.7, step: .01, unit: "" },
      { label: "Letter-spacing", v: "--tracking", min: -.03, max: .14, step: .005, unit: "em" },
      { label: "Line-height",    v: "--leading", min: 1.2, max: 2.2, step: .02, unit: "" }
    ]},
    { title: "Motion", items: [
      { label: "Typing speed (ms/char)", v: "--type-speed", min: 4, max: 160, step: 1, unit: "" },
      { label: "Reveal duration", v: "--reveal-ms", min: 0, max: 2200, step: 25, unit: "ms" },
      { label: "Reveal easing", v: "--reveal-ease", type: "select", options: [
        "cubic-bezier(.22,.61,.36,1)", "ease", "ease-in-out", "linear",
        "cubic-bezier(.16,1,.3,1)" ] }
    ]},
    { title: "Layout", items: [
      { label: "Section spacing", v: "--section-gap", min: 24, max: 240, step: 4, unit: "px" },
      { label: "Column width", v: "--measure", min: 320, max: 820, step: 10, unit: "px" },
      { label: "Vine opacity", v: "--vine-opacity", min: 0, max: 1, step: .02, unit: "" }
    ]},
    { title: "Colour", items: [
      { label: "Ground",   v: "--ink",      type: "color" },
      { label: "Rose",     v: "--rose",     type: "color" },
      { label: "Lit petal", v: "--rose-lit", type: "color" },
      { label: "Paper",    v: "--paper",    type: "color" },
      { label: "Ink on paper", v: "--script-ink", type: "color" },
      { label: "Text",     v: "--blush",    type: "color" },
      { label: "Dim text", v: "--blush-dim", type: "color" },
      { label: "Leaf",     v: "--leaf",     type: "color" }
    ]}
  ];
  var panel = null;

  function hexOf(n) {
    var raw = getComputedStyle(root).getPropertyValue(n).trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
    var m = raw.match(/rgba?\(([^)]+)\)/);
    if (!m) return "#000000";
    return "#" + m[1].split(",").slice(0, 3).map(function (x) {
      return ("0" + (parseInt(x, 10) || 0).toString(16)).slice(-2);
    }).join("");
  }

  function row(it) {
    var r = el("div", "dev__row");
    var id = "dev" + it.v.replace(/[^a-z]/gi, "");
    var lab = el("label", null, it.label); lab.htmlFor = id; r.appendChild(lab);
    var input, out;
    if (it.type === "color") {
      input = el("input"); input.type = "color"; input.value = hexOf(it.v);
    } else if (it.type === "select") {
      input = el("select");
      it.options.forEach(function (o) { var op = el("option", null, o); op.value = o; input.appendChild(op); });
      input.value = getComputedStyle(root).getPropertyValue(it.v).trim();
    } else {
      input = el("input"); input.type = "range";
      input.min = it.min; input.max = it.max; input.step = it.step;
      input.value = cssNum(it.v, it.min);
      out = el("output", null, input.value + (it.unit || "")); r.appendChild(out);
    }
    input.id = id;
    input.addEventListener("input", function () {
      var val = (it.type === "color" || it.type === "select")
              ? input.value : input.value + (it.unit || "");
      root.style.setProperty(it.v, val);
      if (out) out.textContent = val;
      if (it.v === "--type-speed") state.typeSpeed = parseFloat(input.value);
    });
    r.appendChild(input);
    return r;
  }

  function build() {
    var p = el("aside", "dev"); p.id = "devPanel"; p.hidden = true;
    p.setAttribute("aria-label", "Design tweak panel");
    p.appendChild(el("h2", null, "TWEAKS"));
    p.appendChild(el("p", "dev__sub",
      "Live. Press “d” or Esc to hide. Nothing is saved — use Copy CSS " +
      "and paste the block into styles.css to keep it."));
    GROUPS.forEach(function (g) {
      var w = el("div", "dev__group");
      w.appendChild(el("h3", null, g.title.toUpperCase()));
      g.items.forEach(function (it) { w.appendChild(row(it)); });
      p.appendChild(w);
    });
    var acts = el("div", "dev__actions");
    var copy = el("button", null, "Copy CSS"); copy.type = "button";
    var out = el("textarea", "dev__out"); out.readOnly = true; out.hidden = true;
    copy.addEventListener("click", function () {
      var lines = ["/* Paste into :root in styles.css */", ":root {"];
      GROUPS.forEach(function (g) {
        lines.push("  /* " + g.title + " */");
        g.items.forEach(function (it) {
          var inline = root.style.getPropertyValue(it.v).trim();
          lines.push("  " + it.v + ": " +
            (inline || getComputedStyle(root).getPropertyValue(it.v).trim()) + ";");
        });
      });
      lines.push("}");
      var css = lines.join("\n");
      out.hidden = false; out.value = css; out.focus(); out.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(css).then(function () {
          copy.textContent = "Copied ✓";
          setTimeout(function () { copy.textContent = "Copy CSS"; }, 1600);
        }, function () {});
      }
    });
    acts.appendChild(copy); acts.appendChild(out); p.appendChild(acts);
    document.body.appendChild(p);
    return p;
  }

  function toggle() { if (!panel) panel = build(); panel.hidden = !panel.hidden; }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" ||
              t.tagName === "SELECT" || t.isContentEditable)) return;
    if (e.key === "d" || e.key === "D") { e.preventDefault(); toggle(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel && !panel.hidden) {
      panel.hidden = true;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }
  });
  if (/[?&]dev\b/.test(location.search)) toggle();

})();
