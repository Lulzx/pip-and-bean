/* ═══════════════════════════════════════════════════════════════════
   HFKIT — Pip & Bean stage kit
   Procedural, seeded, seek-safe scenery + wind for every act.

   Principles:
   • DETERMINISTIC — seeded mulberry32 PRNG, never Math.random/Date.
   • ANCHORED BY CONSTRUCTION — generated props measure the real
     .ground element and plant themselves on it; they cannot float.
   • SEEK-SAFE — wind is plain GSAP yoyo tweens on the act timeline.

   Usage inside an act's script:
     if (window.HFKIT) HFKIT.dress("a3");        // after $ is defined,
                                                 // BEFORE innerHTML copies
     if (window.HFKIT) HFKIT.wind(tl, "a3", 64.44);  // before registering tl
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── seeded PRNG ── */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) { /* mulberry32 */
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var GRASS = [["#7fb558", "#659a44"], ["#8fc763", "#659a44"], ["#9bd06e", "#71a84e"]];
  var PETALS = ["#ff9f4a", "#f26d6d", "#ffd34e", "#9b7be0", "#7ec8e3"];

  /* ── grass tuft: 3-4 blades growing up from (x, 0-baseline) ── */
  function tuftSvg(r, x) {
    var h = 24 + r() * 26;
    var c = GRASS[Math.floor(r() * GRASS.length)][1];
    var blades = "", n = 3 + Math.floor(r() * 2);
    for (var i = 0; i < n; i++) {
      var dx = (i - (n - 1) / 2) * (7 + r() * 4);
      var bh = h * (0.65 + r() * 0.4);
      blades += '<path d="M0,0 Q' + (dx * 0.6).toFixed(1) + ',' + (-bh * 0.55).toFixed(1) +
        " " + dx.toFixed(1) + "," + (-bh).toFixed(1) +
        '" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>';
    }
    return '<g transform="translate(' + x.toFixed(0) + ',0)"><g class="hfkit-sway">' + blades + "</g></g>";
  }

  /* ── tiny flower: stem + petals, planted at (x, 0-baseline) ── */
  function flowerSvg(r, x) {
    var h = 30 + r() * 18;
    var petal = PETALS[Math.floor(r() * PETALS.length)];
    var p = "";
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2;
      p += '<circle cx="' + (Math.cos(a) * 8).toFixed(1) + '" cy="' + (Math.sin(a) * 8).toFixed(1) +
        '" r="6" fill="' + petal + '" stroke="#4a3b2f" stroke-width="1.5"/>';
    }
    return '<g transform="translate(' + x.toFixed(0) + ',0)"><g class="hfkit-sway">' +
      '<path d="M0,0 Q2,' + (-h / 2).toFixed(0) + ' 0,' + (-h).toFixed(0) +
      '" fill="none" stroke="#659a44" stroke-width="4" stroke-linecap="round"/>' +
      '<g transform="translate(0,' + (-h).toFixed(0) + ')">' + p +
      '<circle r="5" fill="#ffd34e" stroke="#4a3b2f" stroke-width="1.5"/></g></g></g>';
  }

  /* ── procedural oak: trunk + branch stubs + foliage blobs + fruit.
       Built in a 560×640 box; the trunk base ends at y=640 EXACTLY, so
       wherever the container's bottom edge sits, the tree is planted. ── */
  function treeSvg(r) {
    var cx = 270 + (r() - 0.5) * 30;        // trunk center at base
    var lean = (r() - 0.5) * 70;            // top-of-trunk lean
    var bw = 40 + r() * 10;                 // base half-width
    var topY = 320 + r() * 40, topX = cx + lean, tw = 13 + r() * 5;
    var trunk =
      "M" + (cx - bw).toFixed(0) + ",640 " +
      "C" + (cx - bw + 6).toFixed(0) + "," + (500 + r() * 40).toFixed(0) + " " +
      (topX - tw - 14).toFixed(0) + "," + (topY + 70).toFixed(0) + " " +
      (topX - tw).toFixed(0) + "," + topY.toFixed(0) + " " +
      "L" + (topX + tw).toFixed(0) + "," + topY.toFixed(0) + " " +
      "C" + (topX + tw + 16).toFixed(0) + "," + (topY + 80).toFixed(0) + " " +
      (cx + bw - 6).toFixed(0) + "," + (510 + r() * 40).toFixed(0) + " " +
      (cx + bw).toFixed(0) + ",640 Z";
    /* two branch stubs reaching into the side foliage */
    var b1y = topY + 60 + r() * 30, b2y = topY + 110 + r() * 30;
    var branches =
      '<path d="M' + (topX - 6).toFixed(0) + "," + b1y.toFixed(0) +
      " Q" + (topX - 70).toFixed(0) + "," + (b1y - 45).toFixed(0) +
      " " + (topX - 118).toFixed(0) + "," + (b1y - 66).toFixed(0) +
      '" fill="none" stroke="#82582c" stroke-width="20" stroke-linecap="round"/>' +
      '<path d="M' + (topX + 6).toFixed(0) + "," + b2y.toFixed(0) +
      " Q" + (topX + 76).toFixed(0) + "," + (b2y - 50).toFixed(0) +
      " " + (topX + 126).toFixed(0) + "," + (b2y - 76).toFixed(0) +
      '" fill="none" stroke="#82582c" stroke-width="18" stroke-linecap="round"/>';
    /* 3-4 foliage blobs, each in its own sway group (origin at blob base) */
    var blobs = "", spots = [
      [topX - 115, 235 + r() * 25, 118 + r() * 18, 84 + r() * 12],
      [topX + 120, 195 + r() * 25, 132 + r() * 20, 92 + r() * 14],
      [topX + (r() - 0.5) * 40, 128 + r() * 22, 118 + r() * 16, 86 + r() * 12]
    ];
    if (r() > 0.45) spots.push([topX + (r() > 0.5 ? 30 : -35), 210 + r() * 30, 96, 70]);
    spots.forEach(function (s, i) {
      var g = GRASS[i % GRASS.length];
      var fruit = "";
      var nf = 1 + Math.floor(r() * 2);
      for (var f = 0; f < nf; f++) {
        fruit += '<circle cx="' + ((r() - 0.5) * s[2] * 1.1).toFixed(0) +
          '" cy="' + ((r() - 0.5) * s[3] * 0.9).toFixed(0) + '" r="11" fill="#f26d6d"/>';
      }
      blobs += '<g transform="translate(' + s[0].toFixed(0) + "," + s[1].toFixed(0) + ')">' +
        '<g class="hfkit-sway"><ellipse rx="' + s[2].toFixed(0) + '" ry="' + s[3].toFixed(0) +
        '" fill="' + g[0] + '" stroke="' + g[1] + '" stroke-width="6"/>' + fruit + "</g></g>";
    });
    return '<path d="' + trunk + '" fill="#a5773f" stroke="#82582c" stroke-width="6" stroke-linejoin="round"/>' +
      branches + blobs;
  }

  /* ── the Great Big Slide. Geometry is CANONICAL — the a2 ladder climb
       and the a4 motion-path descent are choreographed against these
       exact coordinates — so the kit single-sources it but never
       jitters it. ── */
  function slideSvg() {
    return '<svg viewBox="0 0 950 760" style="overflow:visible">' +
      '<rect x="806" y="120" width="26" height="640" rx="12" fill="#e8b84b" stroke="#c49a2f" stroke-width="5"/>' +
      '<rect x="716" y="120" width="26" height="640" rx="12" fill="#e8b84b" stroke="#c49a2f" stroke-width="5"/>' +
      '<g stroke="#c49a2f" stroke-width="9" stroke-linecap="round">' +
      '<line x1="722" y1="640" x2="836" y2="640"/><line x1="722" y1="520" x2="836" y2="520"/>' +
      '<line x1="722" y1="400" x2="836" y2="400"/><line x1="722" y1="280" x2="836" y2="280"/><line x1="722" y1="180" x2="836" y2="180"/></g>' +
      '<path d="M760,60 Q900,60 900,130 L830,130 Q810,110 760,110 Z" fill="#f26d6d" stroke="#c0392b" stroke-width="6"/>' +
      '<path d="M40,720 C240,700 420,620 520,470 C600,350 640,220 700,140 L810,140 C760,240 720,380 640,520 C540,680 320,760 60,760 Z" fill="#f26d6d" stroke="#c0392b" stroke-width="7" stroke-linejoin="round"/>' +
      '<path d="M60,742 C300,732 500,650 610,500" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.5"/>' +
      '<path class="hfkit-sway" d="M718,120 L718,64 L788,80 L718,96" fill="#ffd34e" stroke="#c49a2f" stroke-width="5" stroke-linejoin="round"/></svg>';
  }

  /* ── sandcastle: 3-tier classic or 4-tier mega. Tier layout is fixed
       (the build-up tweens target .t1–.t4 and the a4 flag is planted on
       the mega's known top), the seed adds sand speckles; the pennant
       joins the wind. ── */
  function castleSvg(r, tiers, flag) {
    function specks(x, y, w, h, n) {
      var s = "";
      for (var i = 0; i < n; i++) {
        s += '<circle cx="' + (x + 8 + r() * (w - 16)).toFixed(0) +
          '" cy="' + (y + 8 + r() * (h - 16)).toFixed(0) +
          '" r="' + (2 + r() * 2.4).toFixed(1) + '" fill="#d9bc7f"/>';
      }
      return s;
    }
    if (tiers === 4) {
      return '<svg viewBox="0 0 430 330" style="overflow:visible">' +
        '<g class="tier t1"><rect x="15" y="252" width="400" height="76" rx="12" fill="#e8c887" stroke="#c9a25c" stroke-width="6"/><rect x="40" y="234" width="34" height="26" rx="6" fill="#e8c887" stroke="#c9a25c" stroke-width="5"/><rect x="356" y="234" width="34" height="26" rx="6" fill="#e8c887" stroke="#c9a25c" stroke-width="5"/>' + specks(15, 252, 400, 76, 6) + "</g>" +
        '<g class="tier t2"><rect x="70" y="164" width="290" height="94" rx="11" fill="#f2d8a0" stroke="#c9a25c" stroke-width="6"/><rect x="96" y="146" width="30" height="24" rx="6" fill="#f2d8a0" stroke="#c9a25c" stroke-width="5"/><rect x="304" y="146" width="30" height="24" rx="6" fill="#f2d8a0" stroke="#c9a25c" stroke-width="5"/>' + specks(70, 164, 290, 94, 5) + "</g>" +
        '<g class="tier t3"><rect x="130" y="84" width="170" height="86" rx="10" fill="#e8c887" stroke="#c9a25c" stroke-width="6"/>' + specks(130, 84, 170, 86, 4) + "</g>" +
        '<g class="tier t4"><rect x="178" y="26" width="74" height="64" rx="9" fill="#f2d8a0" stroke="#c9a25c" stroke-width="6"/>' + specks(178, 26, 74, 64, 2) + "</g></svg>";
    }
    return '<svg viewBox="0 0 240 200" style="overflow:visible">' +
      '<g class="tier t1"><rect x="20" y="140" width="200" height="58" rx="10" fill="#e8c887" stroke="#c9a25c" stroke-width="5"/>' + specks(20, 140, 200, 58, 5) + "</g>" +
      '<g class="tier t2"><rect x="55" y="86" width="130" height="60" rx="9" fill="#f2d8a0" stroke="#c9a25c" stroke-width="5"/>' + specks(55, 86, 130, 60, 3) + "</g>" +
      '<g class="tier t3"><rect x="88" y="40" width="64" height="52" rx="8" fill="#e8c887" stroke="#c9a25c" stroke-width="5"/>' + specks(88, 40, 64, 52, 2) +
      (flag ? '<path class="hfkit-sway" d="M120,38 L120,6 L152,14 L120,22" fill="#f26d6d" stroke="#c0392b" stroke-width="4" stroke-linejoin="round"/>' : "") +
      "</g></svg>";
  }

  /* ── sandbox interior: the frame stays the act's CSS; the kit scatters
       seeded pebbles and a little starfish inside ── */
  function sandboxDeco(r, w, h) {
    var inner = "";
    var n = 5 + Math.floor(r() * 4);
    for (var i = 0; i < n; i++) {
      var px = 34 + r() * (w - 68), py = h * 0.45 + r() * (h * 0.4);
      var pr = 5 + r() * 6;
      inner += '<ellipse cx="' + px.toFixed(0) + '" cy="' + py.toFixed(0) +
        '" rx="' + pr.toFixed(1) + '" ry="' + (pr * 0.72).toFixed(1) +
        '" fill="' + (r() > 0.5 ? "#dfc389" : "#cbb06e") + '" stroke="#b89a55" stroke-width="2"/>';
    }
    var sx = 40 + r() * (w - 110), sy = h * 0.35 + r() * (h * 0.3);
    inner += '<g transform="translate(' + sx.toFixed(0) + "," + sy.toFixed(0) +
      ") scale(0.62) rotate(" + (r() * 60 - 30).toFixed(0) + ')">' +
      '<path d="M20,0 L24,16 L40,20 L24,24 L20,40 L16,24 L0,20 L16,16 Z" fill="#ff9f4a" stroke="#d97a24" stroke-width="3" stroke-linejoin="round"/></g>';
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h +
      '" style="position:absolute;left:0;top:0;pointer-events:none">' + inner + "</svg>";
  }

  /* ── dress an act: ambient tufts+flowers on every grounded phase,
       regenerate any #<act>-tree oak, and build/anchor every
       [data-kit] prop (slide / castle / sandbox) ── */
  function dress(actId) {
    var root = document.querySelector('[data-composition-id="' + actId + '"]');
    if (!root) return;
    var phases = root.querySelectorAll(".phase");
    Array.prototype.forEach.call(phases, function (ph, pi) {
      var g = ph.querySelector(".ground, .ground5");
      if (!g) return;
      var r = rng(hash(actId + "-amb-" + pi));
      var gh = 200;
      try { gh = parseInt(getComputedStyle(g).height, 10) || 200; } catch (e) {}
      var layer = document.createElement("div");
      layer.className = "hfkit-ambient";
      /* no z-index: painted in DOM order (right after .ground), so
         characters and props declared later always draw on top */
      layer.style.cssText = "position:absolute;left:0;right:0;bottom:" + (gh - 6) +
        "px;height:0;pointer-events:none";
      var inner = "";
      var n = 6 + Math.floor(r() * 4);
      for (var i = 0; i < n; i++) inner += tuftSvg(r, (i + 0.2 + r() * 0.6) * (1920 / n));
      var nf = 2 + Math.floor(r() * 3);
      for (i = 0; i < nf; i++) inner += flowerSvg(r, 120 + r() * 1680);
      layer.innerHTML =
        '<svg width="1920" height="10" viewBox="0 0 1920 10" style="position:absolute;bottom:0;overflow:visible">' +
        '<g transform="translate(0,10)">' + inner + "</g></svg>";
      g.insertAdjacentElement("afterend", layer);
    });
    var t = root.querySelector("#" + actId + "-tree");
    if (t) t.innerHTML = treeSvg(rng(hash(actId + "-oak")));

    /* [data-kit] props: anchor to the measured ground (bottom = groundTop
       - data-kit-sink), then generate the art. The prop cannot float —
       its base is derived from the real ground element, not a hand-typed
       offset. */
    var props = root.querySelectorAll("[data-kit]");
    Array.prototype.forEach.call(props, function (el, i) {
      var kind = el.getAttribute("data-kit");
      var ph = el.closest(".phase");
      var g = ph && ph.querySelector(".ground, .ground5");
      if (g) {
        var gh = 200;
        try { gh = parseInt(getComputedStyle(g).height, 10) || 200; } catch (e) {}
        var sink = parseFloat(el.getAttribute("data-kit-sink") || "0");
        el.style.bottom = (gh - sink) + "px";
      }
      var r = rng(hash(actId + "-" + kind + "-" + (el.id || i)));
      if (kind === "slide") {
        el.innerHTML = slideSvg();
      } else if (kind === "castle") {
        el.innerHTML = castleSvg(r,
          parseInt(el.getAttribute("data-kit-tiers") || "3", 10),
          el.hasAttribute("data-kit-flag"));
      } else if (kind === "sandbox") {
        el.insertAdjacentHTML("beforeend",
          sandboxDeco(r, el.offsetWidth || 640, el.offsetHeight || 130));
      }
    });
  }

  /* ── wind: phase-offset sine sway on every .hfkit-sway in the act.
       Plain yoyo tweens on the paused timeline — seek-safe. ── */
  function wind(tl, actId, dur) {
    if (!window.gsap) return;
    var root = document.querySelector('[data-composition-id="' + actId + '"]');
    if (!root) return;
    var els = root.querySelectorAll(".hfkit-sway");
    Array.prototype.forEach.call(els, function (el, i) {
      var r = rng(hash(actId + "-wind") + i * 7919);
      var period = 1.5 + r() * 1.5;
      var amp = 2.2 + r() * 3.2;
      var reps = Math.max(1, Math.ceil(dur / period));
      tl.fromTo(el, { rotation: -amp }, {
        rotation: amp, duration: period, ease: "sine.inOut",
        yoyo: true, repeat: reps, transformOrigin: "50% 100%"
      }, r() * 0.8);
    });
  }

  window.HFKIT = { dress: dress, wind: wind, rng: rng, hash: hash };
})();
