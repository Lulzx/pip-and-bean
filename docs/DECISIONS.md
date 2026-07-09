# Decision Log

Why things are the way they are. Read before "improving" any of these.

## 1. No live physics engine — determinism is non-negotiable

HyperFrames renders by **seeking** a paused timeline to arbitrary frame times and
screenshotting. A live Box2D/Bullet simulation is iterative and stateful — it cannot
be seeked, and parallel render workers each seek different times. So:

- "Physics" is expressed as analytic motion (sine wind, eased tweens, MotionPath).
- If a hero moment ever truly needs simulated dynamics (e.g. a realistic castle
  crumble), run the sim **offline as a build step** and bake the sampled transforms
  into GSAP keyframes. The runtime only ever plays back.

## 2. The slide's geometry is canonical — single-sourced but never jittered

The kit generates the slide, but with **zero structural randomness**, because two
set-pieces are choreographed against its exact coordinates:

- a2: Milo's charge (`x:1350`) ends at the ladder base and his climb steps up the
  rungs (`y:-560, steps(7)`).
- a4: the slide-train MotionPath (`{0,0} → {-300,250} → {-640,500} → {-900,615} →
  {-1060,640}`, curviness 1.15) hugs the drawn chute.

Change the chute path ⇒ re-tune both. The same logic applies to castle tier layout
(`.t1–.t4` build-up and CRUNCH squash target it, and a4's separate flag lands on the
mega castle's known top). Seeds add *decoration* (speckles, pebbles), never
*structure*, on choreography-bearing props.

## 3. Grounding by construction, not by eyeballing

Root cause of the floating-flag / hovering-tree / detached-bubble bugs: every prop
was placed by hand-typed pixel offsets with no shared spatial model. The fix is
structural — `HFKIT.dress()` measures the actual `.ground` element and derives every
generated prop's `bottom` from it (`data-kit-sink` expresses intentional nestling).
Generators are built so their art terminates at the SVG's bottom edge. A kit prop
*cannot* float. New props must follow this pattern; new hand-typed `bottom:` values
on scene props are a code smell.

## 4. Layering is DOM order, never z-index (for scenery)

The ambient layer is inserted immediately after `.ground` with **no z-index**, so
everything declared later (cast, props, bubbles) paints over it naturally. A
`z-index:1` on the ambient layer once put a wildflower on Bean's face — positioned
elements with any z-index jump above all z-index-auto siblings. Reserve z-index for
the deliberate overlay stack (bubbles 50, captions 60, dim 70, iris 90).

## 5. Sub-composition `<head>`s don't re-execute — shared libs live in `index.html`

MotionPathPlugin loaded from a4's own `<head>` did nothing in the mounted render
(the slide train silently fell back to its `fromTo` start state). Mounted
sub-compositions only get *their body* instantiated; scripts must already exist on
the parent page. Rule: every runtime dependency (GSAP, plugins, stage kit) is loaded
in `index.html`'s head; act-local `<script src>` tags are only a courtesy for
standalone viewing, and all kit calls are guarded (`if (window.HFKIT) …`).

## 6. Voice audio is the timing skeleton — never regenerate casually

Every bubble, talk-cycle, caption, and SFX is hand-synced to measured MP3 durations
in `timeline.json`. Regenerating TTS (even the same text) yields slightly different
durations and silently desyncs everything downstream. Regenerate only changed lines,
then re-measure → re-layout → re-generate `index.html` → re-verify affected scenes.

## 7. House style for on-screen text: no em/en dashes

Caption and bubble text uses commas/periods instead of `—`/`–` (user preference; it
also reads better to young audiences and matches the spoken narration, which never
"pronounces" a dash). The a5 byline uses `♥` instead of a dash. Code comments may
still use dashes freely.

## 8. Bubbles must sit on their speakers

A bubble's tail points at the mouth of whoever is talking; when a character moves
mid-phase (Milo's charge/climb), the bubble position tracks the *position at speech
time*, not the layout position. When a bubble can't clear an overlapping UI element
(Milo under the a5 subscribe pill), dim the UI during the line rather than moving
the bubble away from its speaker.

## 9. The repo is source-only; secrets live in the environment

Media (fonts, voices, BGM, SFX, renders, snapshots) is git-ignored — the repo holds
the composition source that *produces* the video. API keys are read from env vars
(`FISH_AUDIO_API_KEY`); a key was once hardcoded in `gen_tts.py` and pushed public —
it must be treated as compromised and rotated. Don't repeat that.

## 10. Render speed flags are quality-neutral; the 2× path is blocked by design

`--gpu --browser-gpu --workers 8` cut renders ~21% with identical output. The
further ~2× `drawElementImage` fast-capture path is auto-disabled because the
circle-iris transitions animate `clip-path` mid-frame; forcing it would corrupt
those frames. Trading the iris wipes for transform-only transitions is the known
lever if render time ever matters more than the look.
