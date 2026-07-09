# Workflow

The dev loop for changing, verifying, and shipping the episode.

## Commands

```bash
npm run dev             # preview server — long-running, keep it in the background
npm run check           # lint + validate + inspect  → run after EVERY edit
npm run render          # fast MP4 render (GPU flags, ~105-110s on an M4 Pro)
npm run render:quality  # --quality high, for a final master
npm run publish         # publish and get a shareable link
```

`npm run check` must report **0 errors** before a change is considered done. The
four standing warnings are known and accepted: per-act `composition_file_too_large`
(the acts are self-contained by design), two `content_overlap` false positives
(timed bubbles that never co-appear), and the a5 sunburst's intentional overflow.

## Visual verification — the snapshot method

Never trust a layout change without looking at it. The efficient pattern:

```bash
# frames at the midpoint of every dialogue line you touched:
npx hyperframes snapshot --at 60.0,67.5,70.2 --no-end -o snapshots/review
# then READ the generated contact-sheet.jpg (it grids the frames)
```

- Line midpoints come from `timeline.json` (`start + duration/2`).
- For motion (the slide train, a walk), sample 3–4 closely spaced times
  (e.g. `--at 192.0,192.4,192.8,193.2`) and check the arc frame by frame.
- Keep `snapshots/` out of git (it's ignored); delete review dirs when done.

This catches the bugs `check` can't: a bubble floating away from its speaker, a
prop off its anchor, a transition revealing the wrong phase.

## Audio: never regenerate blindly

Voice MP3s are the timing source of truth — **regenerating them shifts every
measured duration** and desyncs all hand-tuned choreography. Only run `gen_tts.py`
when a line's text actually changes, then:

1. re-measure → `voice_manifest.json`,
2. re-lay-out `timeline.json`,
3. re-run `gen_index.py`,
4. re-check every scene the shifted lines touch.

`gen_tts.py` reads `FISH_AUDIO_API_KEY` from the environment. Do not hardcode keys.

Verify audio landed in a render without listening to 4 minutes:

```bash
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 renders/latest.mp4
ffmpeg -ss 18 -t 6 -i renders/latest.mp4 -af volumedetect -f null - 2>&1 | grep volume
```

(BGM-only gaps sit around −31 dB mean; voice+SFX stretches around −20 dB.)

## Render performance

`npm run render` = `hyperframes render --gpu --browser-gpu --workers 8`
(~105–110 s for the full 254 s episode on a 12-core M4 Pro, GPU h264 encode).

Known ceiling: the ~2× `--experimental-fast-capture` path **cannot** engage — the
circle-iris transitions animate `clip-path` (a compositor-incompatible prop), so the
engine correctly falls back to screenshot capture. Swapping the iris wipes for
opacity/transform-only transitions would unlock it, at the cost of the storybook
wipe look.

Render logs may show `ERR_ABORTED` for BGM/SFX at page load — benign; the muxer
reads the audio files directly and the final MP4 carries all tracks (verify as
above).

## Git & repo

- Repo: <https://github.com/Lulzx/pip-and-bean> (public).
- The repo is **source-only**: `assets/`, `audio/`, `renders/`, `snapshots/`, and
  all media extensions are git-ignored. Never force-add media.
- Commit messages explain *why* (the choreography constraints, the anchoring
  rationale), not just what.

## Checklist for any visual change

1. Edit.
2. `npm run check` → 0 errors.
3. Snapshot the affected moments; read the contact sheet.
4. If choreography-adjacent (slide, castle tiers, line timing): re-verify the
   moments listed in [EPISODE.md](EPISODE.md#timing-source-of-truth).
5. `npm run render`; spot-check; commit; push.
