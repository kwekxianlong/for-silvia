#!/usr/bin/env node
/* ============================================================================
   Dev server with live reload. Zero dependencies — just `node dev-server.js`.
   Binds to 0.0.0.0 so your phone on the same Wi-Fi can reach it.

   Dev-only. A static host never executes this file, so it's harmless to
   deploy, but you can delete it before deploying if you'd rather.
   ========================================================================== */

const http = require("http");
const fs   = require("fs");
const path = require("path");
const os   = require("os");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg":  "image/jpeg",  ".jpeg": "image/jpeg",
  ".png":  "image/png",   ".webp": "image/webp",
  ".gif":  "image/gif",   ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",".woff2":"font/woff2", ".woff": "font/woff",
  ".mp4":  "video/mp4",   ".txt":  "text/plain; charset=utf-8"
};

/* -- the snippet injected into every HTML response ------------------------ */
const CLIENT = `
<script data-livereload>
(function () {
  var es = new EventSource("/__livereload");

  es.addEventListener("css", function () {
    // Swap stylesheets in place. A full reload would throw away the gate,
    // your scroll position and any reasons you'd opened — which makes
    // tweaking the design maddening. This keeps all of it.
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) {
      var u = new URL(l.href, location.href);
      u.searchParams.set("__r", Date.now());
      l.href = u.href;
    });
    flash("css updated");
  });

  es.addEventListener("reload", function () {
    try {
      sessionStorage.setItem("__devScroll", String(window.scrollY));
    } catch (e) {}
    location.reload();
  });

  // Remember that the gate was opened, so you don't re-tap it on every
  // reload, and come back to roughly where you were.
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("gateBtn");
    if (btn) btn.addEventListener("click", function () {
      try { sessionStorage.setItem("__devGate", "1"); } catch (e) {}
    });
    var wasOpen = false;
    try { wasOpen = sessionStorage.getItem("__devGate") === "1"; } catch (e) {}
    if (wasOpen && btn) {
      btn.click();
      var y = 0;
      try { y = Number(sessionStorage.getItem("__devScroll")) || 0; } catch (e) {}
      if (y) setTimeout(function () { window.scrollTo(0, y); }, 80);
      flash("gate auto-opened (dev)");
    }
  });

  function flash(msg) {
    var n = document.createElement("div");
    n.textContent = msg;
    n.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:9999;" +
      "font:11px/1.4 system-ui,sans-serif;color:#eedbc2;background:rgba(10,9,8,.9);" +
      "border:1px solid #875336;padding:6px 9px;pointer-events:none;opacity:1;" +
      "transition:opacity .5s ease 1s";
    document.body.appendChild(n);
    requestAnimationFrame(function () { n.style.opacity = "0"; });
    setTimeout(function () { n.remove(); }, 2000);
  }
})();
</script>`;

/* -- connected browsers --------------------------------------------------- */
const clients = new Set();
function broadcast(event) {
  for (const res of clients) {
    try { res.write("event: " + event + "\ndata: 1\n\n"); } catch (e) {}
  }
}

/* -- watch for changes ---------------------------------------------------
   Polling, deliberately, rather than fs.watch. Two reasons: fs.watch with
   recursive:true went stale here after a few events, and many editors
   (Vim, VS Code) save via atomic rename, which silently breaks any
   inode-based watch. Polling a handful of files every 250ms is free and
   never misses an edit.                                                    */

const WATCH_EXT = new Set([".html", ".css", ".js"]);
const SELF = path.join(ROOT, "dev-server.js");
const seen = new Map();

function listFiles(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return out; }
  for (const e of entries) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(full, out);
    else if (WATCH_EXT.has(path.extname(e.name).toLowerCase()) && full !== SELF) {
      out.push(full);
    }
  }
  return out;
}

function signature(f) {
  try { const st = fs.statSync(f); return st.mtimeMs + ":" + st.size; }
  catch (e) { return null; }
}

for (const f of listFiles(ROOT)) seen.set(f, signature(f));

setInterval(() => {
  const changed = [];
  for (const f of listFiles(ROOT)) {
    const sig = signature(f);
    if (sig === null) continue;
    if (seen.has(f) && seen.get(f) !== sig) changed.push(f);
    seen.set(f, sig);
  }
  if (!changed.length) return;

  const cssOnly = changed.every(f => path.extname(f).toLowerCase() === ".css");
  const event = cssOnly ? "css" : "reload";
  const names = changed.map(f => path.relative(ROOT, f)).join(", ");
  console.log("  " + new Date().toLocaleTimeString() + "  " + names + " \u2192 " + event +
              (cssOnly ? "  (state preserved)" : ""));
  broadcast(event);
}, 250);

/* -- server --------------------------------------------------------------- */
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  if (url === "/__livereload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    res.write("retry: 1000\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  let rel = url === "/" ? "/index.html" : url;
  // keep requests inside the project directory
  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[\\/])+/, ""));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404</h1><p>" + rel + "</p>");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    if (ext === ".html") {
      let html = buf.toString("utf8");
      html = html.includes("</body>")
        ? html.replace("</body>", CLIENT + "\n</body>")
        : html + CLIENT;
      buf = Buffer.from(html, "utf8");
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(buf);
  });
}).listen(PORT, "0.0.0.0", () => {
  const nets = os.networkInterfaces();
  const lan = [];
  for (const name of Object.keys(nets)) {
    for (const n of nets[name] || []) {
      if (n.family === "IPv4" && !n.internal) lan.push({ name, addr: n.address });
    }
  }
  console.log("\n  For Silvia — dev server with live reload\n");
  console.log("  On this computer:   http://localhost:" + PORT);
  if (lan.length) {
    console.log("\n  ON YOUR PHONE (same Wi-Fi) — open this:\n");
    for (const l of lan) console.log("      http://" + l.addr + ":" + PORT + "   (" + l.name + ")");
  } else {
    console.log("\n  No LAN address found — are you connected to Wi-Fi?");
  }
  console.log("\n  CSS edits hot-swap without losing your place.");
  console.log("  HTML/JS edits reload, and re-open the gate for you.");
  console.log("  Ctrl+C to stop.\n");
});
