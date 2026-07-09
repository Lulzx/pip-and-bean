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

  /* ── dress an act: ambient tufts+flowers on every grounded phase,
       and regenerate any #<act>-tree oak procedurally ── */
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
