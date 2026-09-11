/* ============================================================================
   For Silvia
   No framework, no build step.

   All the words and photos live in the CONTENT object below. Nothing else
   needs editing. You can also change them in the browser: add ?edit to the
   URL, or press "e".
   ========================================================================== */

const CONTENT = {

  /* -- 1. The lock ---------------------------------------------------------
     Six digits, DD MM YY. This is romance, not security: the code is in this
     file and anyone can read it with View Source.                          */
  lock: {
    title: "Enter the special date",
    hint:  "DD MM YY",
    code:  "180999",
    error: "Not this. Try again."
  },

  /* -- 2. Opening --------------------------------------------------------- */
  open: { name: "Silvia", line: "Open it slowly." },

  /* -- 3. The letter, behind the envelope --------------------------------- */
  letter: {
    hint: "Tap to open",
    salutation: "To my favourite person,",
    body: "I don't say it enough, but you are the best part of my every day. " +
          "When I'm with you, my mind is quiet, my thoughts are calm, and my " +
          "heart is full. You are excited to celebrate birthday but with your " +
          "love, everyday I am excited to celebrate life.",
    sign: "Happy birthday, my love."
  },

  /* -- 4. The blooms — each flower on the vine is one of her photos --------
     `w`/`h` are the real pixel sizes; they stop the page jumping as each
     photo loads.                                                           */
  blooms: [
    { src: "photos/02.jpg", w: 960,  h: 1280,
      caption: "May the world always surprise you with something good." },
    { src: "photos/03.jpg", w: 960,  h: 1280,
      caption: "Wish that life is always kind to you." },
    { src: "photos/04.jpg", w: 1280, h: 960,
      caption: "Hoping you'd find a reason to smile without trying." },
    { src: "photos/05.jpg", w: 960,  h: 1280,
      caption: "Finger crossed for you to find comfort in ordinary days." }
  ],

  /* -- 5. Reasons --------------------------------------------------------- */
  reasons: {
    title: "Some of the reasons you are special:",
    items: [
      "You have a cheap taste in food. Get better.",
      "You pretend you don't want me, it's cute.",
      "You are the only VIP member in 2 Luckin Coffee Whatsapp Channel.",
      "You sometimes go crazy. Very.",
      "You look for condoms first thing in every Watsons."
    ]
  },

  /* -- 6. Closing --------------------------------------------------------- */
  close: {
    question: "Surprise! I am your biggest gift this year!",
    credit:   "Keshi \u2014 \u201cSoft Spot\u201d",
    foot:     "Made by Harrison, for you."
  },

  /* -- Music ---------------------------------------------------------------
     NO AUDIO FILE IS BUNDLED — the track is copyrighted. This is an official
     YouTube embed, which is what makes the full song possible and lets it
     repeat. To change it, take the XXXXXXXXXXX from
     https://www.youtube.com/watch?v=XXXXXXXXXXX                            */
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

  var state = { typeSpeed: 44, unlocked: false, entry: "", yt: null,
                playing: false, editing: false };

  /* ---- your edits ---------------------------------------------------------
     The editor writes here. Kept in this browser only — it is not saved back
     to the file, so use "Copy text" and paste the block into app.js (or send
     it on) to make changes permanent.                                      */
  var STORE = "silvia.copy.v1";

  function getPath(p) {
    return p.split(".").reduce(function (o, k) { return o && o[k]; }, CONTENT);
  }
  function setPath(p, v) {
    var ks = p.split("."), last = ks.pop();
    ks.reduce(function (o, k) { return o[k]; }, CONTENT)[last] = v;
  }
  function loadOverrides() {
    var raw;
    try { raw = localStorage.getItem(STORE); } catch (e) { return; }
    if (!raw) return;
    try {
      var o = JSON.parse(raw);
      Object.keys(o).forEach(function (p) {
        if (getPath(p) !== undefined) setPath(p, o[p]);
      });
    } catch (e) {}
  }
  function saveOverride(p, v) {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) {}
    o[p] = v;
    try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {}
  }
  loadOverrides();

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
  function typed(tag, cls, text, opts) {
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

    if (reduce || state.editing) { finish(); return wrap; }

    var started = false;
    function run() {
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
    }

    // Blocks inside the envelope wait for it to be opened; everything else
    // starts when it scrolls into view.
    if (opts && opts.manual) wrap.startTyping = run;
    else onceInView(wrap, run);

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
    s.appendChild(rise(typed("h1", "open__name", CONTENT.open.name)));
    s.appendChild(rise(typed("p", "open__line", CONTENT.open.line)));
  }

  // Built inline rather than via <use> so the flap is a targetable element
  // and can swing open on its own.
  function envelopeEl() {
    var btn = el("button", "env");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open the letter");

    var stage = el("div", "env__stage");
    stage.innerHTML =
      '<svg class="env__body" viewBox="0 0 200 132" aria-hidden="true">' +
        '<rect x="2" y="2" width="196" height="128" rx="4" fill="url(#gEnv)"/>' +
        '<path d="M2 130 76 66 2 6Z" fill="#7d0d1b"/>' +
        '<path d="M198 130 124 66 198 6Z" fill="#7d0d1b"/>' +
        '<path d="M2 130 100 58 198 130Z" fill="#9c1526"/>' +
      '</svg>' +
      '<svg class="env__flap" viewBox="0 0 200 132" aria-hidden="true">' +
        '<path d="M2 6 100 76 198 6V2H2Z" fill="#8e1020"/>' +
        '<path d="M2 6 100 76 198 6" fill="none" stroke="#c2405a" stroke-width="2" opacity=".45"/>' +
      '</svg>' +
      '<svg class="env__seal" viewBox="0 0 200 132" aria-hidden="true">' +
        '<circle cx="100" cy="74" r="19" fill="url(#gSeal)"/>' +
        '<circle cx="100" cy="74" r="13" fill="none" stroke="#8a6c12" stroke-width="1.2" opacity=".8"/>' +
        '<path d="M94 74c0-4 3-6 6-6s6 2 6 6-3 7-6 9c-3-2-6-5-6-9Z" fill="#8a6c12" opacity=".75"/>' +
      '</svg>';
    btn.appendChild(stage);
    btn.appendChild(el("span", "env__hint", CONTENT.letter.hint || "Tap to open"));
    return btn;
  }

  function buildLetter() {
    var s = $("sceneLetter");
    var env = envelopeEl();

    var wrap = el("div", "letter-wrap");
    var slot = el("div");
    var paper = el("div", "paper");
    var inner = el("div", "paper__inner");
    var blocks = [
      typed("p", "paper__salutation", CONTENT.letter.salutation, { manual: true }),
      typed("p", "paper__body", CONTENT.letter.body, { manual: true }),
      typed("p", "paper__sign", CONTENT.letter.sign, { manual: true })
    ];
    blocks.forEach(function (b) { inner.appendChild(b); });
    paper.appendChild(inner);
    paper.appendChild(el("span", "paper__kiss"));
    slot.appendChild(paper);
    wrap.appendChild(slot);

    var opened = false;
    env.addEventListener("click", function () {
      if (opened) return;
      opened = true;
      env.classList.add("is-open");
      env.setAttribute("aria-expanded", "true");
      wrap.classList.add("is-open");
      // let the flap swing before the words start
      var delay = reduce || state.editing ? 0 : 620;
      setTimeout(function () {
        blocks.forEach(function (b, i) {
          if (b.startTyping) setTimeout(b.startTyping, i * 90);
        });
      }, delay);
    });

    s.appendChild(rise(env));
    s.appendChild(wrap);

    if (state.editing) env.click();   // editing shows everything at once
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
     TEXT + PHOTO EDITOR — press "e", or add ?edit to the URL.
     Edits live in this browser only. "Copy text" gives you the block to make
     them permanent.
     ========================================================================= */

  var FIELDS = [
    { group: "The lock", items: [
      { p: "lock.title", label: "Title" },
      { p: "lock.hint",  label: "Hint under the title" },
      { p: "lock.code",  label: "Unlock code (6 digits, DD MM YY)" },
      { p: "lock.error", label: "Wrong-code message" }
    ]},
    { group: "Opening", items: [
      { p: "open.name", label: "Her name" },
      { p: "open.line", label: "Line underneath" }
    ]},
    { group: "The letter", items: [
      { p: "letter.hint",       label: "Text on the envelope" },
      { p: "letter.salutation", label: "Salutation" },
      { p: "letter.body",       label: "Body", big: true },
      { p: "letter.sign",       label: "Sign-off" }
    ]},
    { group: "Reasons", items: [
      { p: "reasons.title",    label: "Heading" },
      { p: "reasons.items.0",  label: "Reason 1" },
      { p: "reasons.items.1",  label: "Reason 2" },
      { p: "reasons.items.2",  label: "Reason 3" },
      { p: "reasons.items.3",  label: "Reason 4" },
      { p: "reasons.items.4",  label: "Reason 5" }
    ]},
    { group: "Closing", items: [
      { p: "close.question", label: "Question" },
      { p: "close.credit",   label: "Song credit" },
      { p: "close.foot",     label: "Footer line" }
    ]},
    { group: "Music", items: [
      { p: "music.youTubeId", label: "YouTube video id" }
    ]}
  ];

  var editor = null;

  function renderAll() {
    ["sceneOpen", "sceneLetter", "sceneGarden", "sceneReasons", "sceneClose"]
      .forEach(function (id) { $(id).innerHTML = ""; });
    buildOpen(); buildLetter(); buildGarden(); buildReasons(); buildClose();
  }

  function savePhotos() {
    saveOverride("blooms", CONTENT.blooms.map(function (b) {
      // never persist image data: a couple of photos would blow the storage quota
      return { src: b.src.indexOf("data:") === 0 ? "" : b.src,
               w: b.w, h: b.h, caption: b.caption };
    }));
  }

  function photoRows(host) {
    host.innerHTML = "";
    CONTENT.blooms.forEach(function (b, i) {
      var row = el("div", "ed__photo");
      row.draggable = true;
      row.dataset.i = i;

      var thumb = el("div", "ed__thumb");
      var im = new Image(); im.src = b.src; im.alt = "";
      thumb.appendChild(im);

      var mid = el("div", "ed__pmid");
      var cap = el("textarea");
      cap.value = b.caption || "";
      cap.setAttribute("aria-label", "Caption for photo " + (i + 1));
      cap.addEventListener("input", function () {
        CONTENT.blooms[i].caption = cap.value;
        savePhotos(); schedule();
      });
      mid.appendChild(cap);

      var tools = el("div", "ed__ptools");
      function tool(txt, label, fn) {
        var b2 = el("button", "ed__tool", txt);
        b2.type = "button"; b2.setAttribute("aria-label", label);
        b2.addEventListener("click", fn);
        return b2;
      }
      // arrows as well as drag: dragging is awkward on a phone
      tools.appendChild(tool("\u2191", "Move up", function () { move(i, -1); }));
      tools.appendChild(tool("\u2193", "Move down", function () { move(i, 1); }));

      var pick = el("input"); pick.type = "file"; pick.accept = "image/*";
      pick.style.display = "none";
      pick.addEventListener("change", function () {
        var f = pick.files && pick.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          var probe = new Image();
          probe.onload = function () {
            CONTENT.blooms[i].src = fr.result;
            CONTENT.blooms[i].w = probe.naturalWidth;
            CONTENT.blooms[i].h = probe.naturalHeight;
            renderAll(); photoRows(host);
            note("Showing your file. It lives only in this browser \u2014 send " +
                 "me the image to put it in the site for good.");
          };
          probe.src = fr.result;
        };
        fr.readAsDataURL(f);
      });
      tools.appendChild(tool("\u21bb", "Replace photo", function () { pick.click(); }));
      tools.appendChild(tool("\u2715", "Remove photo", function () {
        if (CONTENT.blooms.length <= 1) return;
        CONTENT.blooms.splice(i, 1);
        savePhotos(); renderAll(); photoRows(host);
      }));
      tools.appendChild(pick);

      row.appendChild(thumb); row.appendChild(mid); row.appendChild(tools);

      row.addEventListener("dragstart", function (e) {
        row.classList.add("is-drag");
        e.dataTransfer.setData("text/plain", String(i));
        e.dataTransfer.effectAllowed = "move";
      });
      row.addEventListener("dragend", function () { row.classList.remove("is-drag"); });
      row.addEventListener("dragover", function (e) { e.preventDefault(); row.classList.add("is-over"); });
      row.addEventListener("dragleave", function () { row.classList.remove("is-over"); });
      row.addEventListener("drop", function (e) {
        e.preventDefault(); row.classList.remove("is-over");
        var from = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (isNaN(from) || from === i) return;
        var moved = CONTENT.blooms.splice(from, 1)[0];
        CONTENT.blooms.splice(i, 0, moved);
        savePhotos(); renderAll(); photoRows(host);
      });

      host.appendChild(row);
    });

    function move(i, d) {
      var j = i + d;
      if (j < 0 || j >= CONTENT.blooms.length) return;
      var m = CONTENT.blooms.splice(i, 1)[0];
      CONTENT.blooms.splice(j, 0, m);
      savePhotos(); renderAll(); photoRows(host);
    }
  }

  var reTimer = null;
  function schedule() { clearTimeout(reTimer); reTimer = setTimeout(renderAll, 260); }

  function note(msg) {
    var n = document.querySelector(".ed__saved");
    if (!n) return;
    n.textContent = msg;
    clearTimeout(note._t);
    note._t = setTimeout(function () { n.textContent = ""; }, 4200);
  }

  function buildEditor() {
    var w = el("aside", "ed"); w.id = "editor"; w.hidden = true;
    w.setAttribute("aria-label", "Edit the words and photos");

    var bar = el("div", "ed__bar");
    bar.appendChild(el("h2", null, "EDIT"));
    var close = el("button", "ed__close", "Done"); close.type = "button";
    close.addEventListener("click", function () { toggleEditor(); });
    bar.appendChild(close);

    var body = el("div", "ed__body");
    body.appendChild(el("p", "ed__note",
      "Type and the page updates behind this. Changes are kept in this browser " +
      "only \u2014 press Copy text when you're happy and paste it back to me, or " +
      "into app.js, to make them permanent."));

    var pg = el("div", "ed__group");
    pg.appendChild(el("h3", null, "PHOTOS \u2014 DRAG, OR USE THE ARROWS"));
    var phost = el("div", "ed__photos");
    pg.appendChild(phost);
    body.appendChild(pg);

    FIELDS.forEach(function (g) {
      var gr = el("div", "ed__group");
      gr.appendChild(el("h3", null, g.group.toUpperCase()));
      g.items.forEach(function (it) {
        var f = el("div", "ed__field");
        var id = "ed_" + it.p.replace(/\./g, "_");
        var lab = el("label", null, it.label); lab.htmlFor = id; f.appendChild(lab);
        var inp = el(it.big ? "textarea" : "input");
        inp.id = id;
        inp.value = getPath(it.p) == null ? "" : String(getPath(it.p));
        inp.addEventListener("input", function () {
          setPath(it.p, inp.value);
          saveOverride(it.p, inp.value);
          if (it.p === "lock.code") return;        // lock is already behind us
          schedule();
        });
        f.appendChild(inp);
        gr.appendChild(f);
      });
      body.appendChild(gr);
    });

    var out = el("textarea", "ed__out"); out.readOnly = true; out.hidden = true;
    body.appendChild(out);
    body.appendChild(el("p", "ed__saved"));

    var acts = el("div", "ed__acts");
    var copy = el("button", null, "Copy text"); copy.type = "button";
    copy.addEventListener("click", function () {
      var text = serialise();
      out.hidden = false; out.value = text; out.focus(); out.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          note("Copied. Paste it back to me and I'll put it in the site.");
        }, function () { note("Select the box below and copy it."); });
      } else { note("Select the box below and copy it."); }
    });
    var reset = el("button", "ghost", "Reset"); reset.type = "button";
    reset.addEventListener("click", function () {
      try { localStorage.removeItem(STORE); } catch (e) {}
      location.reload();
    });
    acts.appendChild(copy); acts.appendChild(reset);

    w.appendChild(bar); w.appendChild(body); w.appendChild(acts);
    document.body.appendChild(w);
    photoRows(phost);
    return w;
  }

  function serialise() {
    function s(v) { return JSON.stringify(String(v)); }
    var L = [];
    L.push("// Paste over the CONTENT object in app.js");
    L.push("lock: {");
    L.push("  title: " + s(CONTENT.lock.title) + ",");
    L.push("  hint:  " + s(CONTENT.lock.hint) + ",");
    L.push("  code:  " + s(CONTENT.lock.code) + ",");
    L.push("  error: " + s(CONTENT.lock.error));
    L.push("},");
    L.push("open: { name: " + s(CONTENT.open.name) + ", line: " + s(CONTENT.open.line) + " },");
    L.push("letter: {");
    L.push("  hint: " + s(CONTENT.letter.hint || "") + ",");
    L.push("  salutation: " + s(CONTENT.letter.salutation) + ",");
    L.push("  body: " + s(CONTENT.letter.body) + ",");
    L.push("  sign: " + s(CONTENT.letter.sign));
    L.push("},");
    L.push("blooms: [");
    CONTENT.blooms.forEach(function (b) {
      var src = b.src.indexOf("data:") === 0 ? "photos/REPLACE-ME.jpg" : b.src;
      L.push("  { src: " + s(src) + ", w: " + b.w + ", h: " + b.h +
             ", caption: " + s(b.caption || "") + " },");
    });
    L.push("],");
    L.push("reasons: {");
    L.push("  title: " + s(CONTENT.reasons.title) + ",");
    L.push("  items: [");
    CONTENT.reasons.items.forEach(function (t) { L.push("    " + s(t) + ","); });
    L.push("  ]");
    L.push("},");
    L.push("close: {");
    L.push("  question: " + s(CONTENT.close.question) + ",");
    L.push("  credit: " + s(CONTENT.close.credit) + ",");
    L.push("  foot: " + s(CONTENT.close.foot));
    L.push("},");
    L.push("music: { youTubeId: " + s(CONTENT.music.youTubeId) + " }");
    return L.join("\n");
  }

  function toggleEditor() {
    if (!editor) editor = buildEditor();
    var opening = editor.hidden;
    editor.hidden = !opening;
    state.editing = opening;
    document.body.classList.toggle("is-editing", opening);
    if (opening) {
      // get past the lock so the page behind is actually visible
      if (!state.unlocked) { state.entry = String(CONTENT.lock.code); unlock(); }
      renderAll();
    } else { renderAll(); }
  }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" ||
              t.tagName === "SELECT" || t.isContentEditable)) return;
    if (e.key === "e" || e.key === "E") { e.preventDefault(); toggleEditor(); }
  });
  if (/[?&]edit\b/.test(location.search)) setTimeout(toggleEditor, 60);

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
