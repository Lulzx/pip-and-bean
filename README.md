# 🎈 Pip & Bean — *The Big Slide Day*

A hand-crafted, paper-cut storybook cartoon for little kids, rendered entirely from
**HTML + SVG + GSAP** using [HyperFrames](https://hyperframes.heygen.com) — no video
editor, no timeline app. The whole ~4-minute episode is a set of deterministic,
seek-safe compositions that render straight to MP4.

> **The story:** Pip loves to bounce and Bean loves to build. When a grumpy new kid,
> Milo, shows up and stomps through the fun, Pip & Bean discover that grumpy on the
> outside is often just lonely on the inside — and that kindness is *sunshine you can
> share.* The weather literally follows the kindness: the world dims when Milo is
> unkind and blooms back to full sun when the three become friends.

---

## ✨ What's inside

- **Five acts** (`compositions/a1`–`a5`), mounted into one root timeline in `index.html`.
- **Original cast** — Pip, Bean, and Milo are drawn as inline SVG and animated
  procedurally (blinks, talk-sync mouths, bounces, elastic overshoots).
- **Emotion-driven art direction** — a desaturated overlay for sad beats, a gray cloud
  that hides the sun, warm sunbursts for the payoff. Light canvas throughout; sadness is
  never "dark."
- **Curved motion** — characters ride the slide along a real **GSAP MotionPath** that
  hugs the chute (steep at the top, flattening into the run-out), not a straight line.
- **Procedural stage kit** (`lib/stage-kit.js`) — a seeded (deterministic) scenery
  layer: the oak tree is generated geometry, grass tufts and wildflowers sprout along
  every ground line, and everything sways in an analytic, seek-safe wind. Generated
  props measure the real `.ground` element and plant themselves on it — grounding is
  guaranteed by construction, never by hand-typed pixel offsets.
- **Single-sourced props** — the slide, sandcastles, and sandboxes are kit-built too
  (`data-kit="slide|castle|sandbox"` + a `data-kit-sink` depth): one canonical slide
  instead of three copies, castles with seeded sand speckles and wind-swayed pennants,
  sandboxes scattered with seeded pebbles and a starfish.
- **Playful transitions** — circle-iris wipes, vertical pushes, and a blur crossfade for
  the sad wind-down.
- **Full voiceover + music + SFX** — narrator, Pip, Bean, and Milo, over soft CC0 music
  and cartoon SFX (assets resolved locally; see *Assets* below).

## 🎨 Design language

| | |
|---|---|
| **Display type** | Baloo 2 (800) — chunky storybook headlines & name tags |
| **Voice type** | Patrick Hand — speech bubbles & narrator caption band |
| **Canvas** | cream `#FFF6E4`, sky `#C9E9F4`, ink `#4A3B2F` |
| **Accents** | coral `#FF7A45`, sun `#FFD34E`, grass `#A8D879` |
| **Cast** | Pip orange `#FF9F4A` · Bean green `#7BC96F` · Milo `#A8A0B5 → #9B7BE0` |

## 📚 Documentation

| doc | what's in it |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | script→TTS→timeline→render pipeline, acts, audio tracks |
| [docs/STAGE-KIT.md](docs/STAGE-KIT.md) | the procedural stage kit API + `data-kit` prop contract |
| [docs/EPISODE.md](docs/EPISODE.md) | story, cast, act-by-act beats, key timestamps |
| [docs/WORKFLOW.md](docs/WORKFLOW.md) | dev loop, visual verification, render performance |
| [docs/DECISIONS.md](docs/DECISIONS.md) | engineering decision log — read before changing things |

## 🚀 Run it

```bash
npm run dev      # live preview server (keep running)
npm run check    # lint + validate + inspect
npm run render   # render to MP4 (GPU-accelerated)
npm run publish  # publish and get a shareable link
```

`npm run render` is tuned for a fast local render (`--gpu --browser-gpu --workers 8`).
For a maximum-quality pass use `npm run render:quality`.

## 📁 Project structure

```
index.html            root timeline — mounts the five acts + audio tracks
lib/stage-kit.js      seeded procedural scenery + wind (ground-anchored)
compositions/a1..a5   the five acts (self-contained HTML compositions)
frame.md              creative brief: concept, palette, type, audio plan
script.json           per-line voiceover script (speaker + text)
timeline.json         act/line timing map
meta.json             project id + title
assets/               fonts, voices, bgm, sfx   (git-ignored — resolved locally)
renders/              rendered MP4s             (git-ignored)
```

## 🔊 Assets

Media (fonts, voices, background music, SFX) and rendered output are **git-ignored** to
keep the repo lightweight — this repository holds the *source* of the composition.
All music and sound effects are **CC0 / public domain**; character voices are generated
TTS. Regenerate or re-resolve locally before rendering.

## 🛠️ Built with

- [HyperFrames](https://hyperframes.heygen.com) — HTML-to-video rendering
- [GSAP](https://gsap.com) 3 + MotionPathPlugin — animation & curved motion
- Inline SVG for every character, prop, and background

---

<sub>♥ Pip & Bean — a kindness story for the very young.</sub>
