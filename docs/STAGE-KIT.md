# Stage Kit — `lib/stage-kit.js`

The kit is the answer to a class of bugs this project used to have: a flag floating
above the castle, an oak hovering over the grass, three byte-identical copies of the
slide drifting apart. Its two principles:

1. **Anchored by construction** — generated props *measure the real `.ground`
   element* and derive their base from it. There is no hand-typed `bottom:` to get
   wrong.
2. **Deterministic** — all variation comes from a seeded mulberry32 PRNG keyed on
   stable strings (act id, prop kind, element id). The same project renders the same
   pixels every time; HyperFrames' seek-anywhere contract is never violated.

## API

Loaded once from `index.html`'s `<head>`. Each act calls exactly two guarded lines:

```js
// after `var $ = ...`, BEFORE any innerHTML copies:
if (window.HFKIT) HFKIT.dress("a3");

// right before registering the timeline:
if (window.HFKIT) HFKIT.wind(tl, "a3", 64.44);   // 64.44 = act duration
```

The guards mean an act opened standalone (without the kit) still runs — it just
renders without procedural scenery.

### `HFKIT.dress(actId)`

Runs once at mount, against `[data-composition-id=actId]`. Three jobs:

1. **Ambient layer** — for every `.phase` containing `.ground`/`.ground5`, injects
   an SVG strip of seeded grass tufts (6–9) and wildflowers (2–4) sitting exactly on
   the measured ground top edge. Inserted **immediately after the ground element**
   with no `z-index`, so DOM order keeps it behind every character and prop declared
   later. (A `z-index:1` here once painted a flower on Bean's face — don't.)
2. **Procedural oak** — fills `#<actId>-tree` with a seeded tree: leaning tapered
   trunk, two branch stubs, 3–4 foliage blobs with fruit. The trunk path terminates
   at the SVG's bottom edge (y=640 in a 560×640 box), so wherever the container
   sits, the tree is planted.
3. **`[data-kit]` props** — see the contract below.

### `HFKIT.wind(tl, actId, duration)`

Finds every `.hfkit-sway` element in the act and adds a plain GSAP
`fromTo(rotation: -amp → +amp, yoyo, repeat)` tween to the act timeline — origin
`50% 100%`, per-element seeded period (1.5–3.0 s), amplitude (2.2–5.4°), and start
offset, so nothing sways in lockstep. Because they're ordinary timeline tweens, they
are exactly as seek-safe as everything else.

Anything the kit generates that should move in the breeze is tagged `.hfkit-sway`:
foliage blobs, grass tufts, flower stems, castle/slide pennants. You can tag your
own elements too.

### `HFKIT.rng(seed)` / `HFKIT.hash(str)`

mulberry32 PRNG and FNV-1a string hash. Use these for any "random" look:
`var r = HFKIT.rng(HFKIT.hash("a2-myprop")); r() // → [0,1)`.

## The `data-kit` prop contract

Declare a prop in markup; the kit anchors it and draws it:

```html
<div id="a2-castle2" data-kit="castle" data-kit-tiers="3" data-kit-flag
     data-kit-sink="65" style="left:800px;bottom:135px;width:250px"></div>
```

| attribute | meaning |
|---|---|
| `data-kit="slide\|castle\|sandbox"` | which generator fills the element |
| `data-kit-sink="N"` | how many px the prop's base sits **below** the ground's top edge (things nestle into grass/sand). `bottom = measuredGroundHeight − sink` |
| `data-kit-tiers="3\|4"` | castle only: 3-tier classic or 4-tier mega |
| `data-kit-flag` | castle only: include the pennant (it joins the wind) |

The inline `bottom:` in `style` is a human-readable fallback; `dress()` overrides it
from the measured ground. `left`/`width` remain the author's staging decision.

### Generators

- **`slide`** — the Great Big Slide. Geometry is **canonical and never jittered**:
  Milo's a2 ladder climb (`x:1350`, `steps(7)` up the rungs) and the a4 slide-train
  **MotionPath** descent are choreographed against these exact coordinates. The kit
  single-sources the art (it used to be pasted into a1/a2/a4); the top pennant sways.
- **`castle`** — 3-tier (a1 "Ta-da", a2 crush victim, a3's pre-squashed continuity
  copy) or 4-tier mega (a4). Keeps the `.tier .t1….t4` group classes that the
  build-up (`scaleY` pop-ins) and CRUNCH squash tweens target. Seed adds sand
  speckles per tier.
- **`sandbox`** — the act's CSS still draws the frame (background/border/radius);
  the kit appends an interior SVG of seeded pebbles and one starfish.

## Adding a new prop kind

1. Write `mypropSvg(r, …)` in the kit — **build it so its base lands on the SVG's
   bottom edge**; that's what makes anchoring automatic.
2. Add a branch in `dress()`'s `[data-kit]` loop.
3. Tag markup: `<div data-kit="myprop" data-kit-sink="…" style="left:…;width:…">`.
4. Tag any breeze-reactive part `class="hfkit-sway"`.
5. If choreography will target sub-parts, give them stable classes and treat that
   geometry as canonical (see Decision 2 in [DECISIONS.md](DECISIONS.md)).

## What must never go in the kit

- `Math.random()`, `Date.now()`, network fetches — breaks deterministic rendering.
- Live physics stepping (Box2D/Bullet/…): the renderer seeks, it doesn't play.
  Bake simulations offline into keyframes if you need the physics *look*
  (see Decision 1 in [DECISIONS.md](DECISIONS.md)).
- Structural jitter on geometry that choreography targets.
