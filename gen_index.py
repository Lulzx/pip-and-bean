#!/usr/bin/env python3
"""Generate index.html orchestrator from timeline.json."""
import json, os
ROOT = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(ROOT, "timeline.json")))
total = T["total"]
acts = {a["act"]: a for a in T["acts"]}

slots = []
for a in T["acts"]:
    slots.append(f'''      <div
        id="el-{a["act"]}"
        data-composition-id="{a["act"]}"
        data-composition-src="compositions/{a["act"]}.html"
        data-start="{a["start"]}"
        data-duration="{a["duration"]}"
        data-track-index="1"
        data-width="1920"
        data-height="1080"
      ></div>''')

voices = []
for l in T["lines"]:
    vol = 1.0 if l["speaker"] != "narrator" else 0.97
    voices.append(
        f'      <audio id="vo-{l["id"]}" src="{l["file"]}" data-start="{l["start"]}" '
        f'data-duration="{l["duration"]}" data-track-index="10" data-volume="{vol}"></audio>')

# g(line-id) helper
g = {l["id"]: l["start"] for l in T["lines"]}

bgm = f'''      <audio id="bgm-uke" src="assets/bgm/happy_whistling_ukulele.mp3" data-start="0" data-duration="{round(g["a2_10"]+2.0,2)}" data-track-index="11" data-volume="0.16"></audio>
      <audio id="bgm-sad" src="assets/bgm/dreamy_piano_fantasy.mp3" data-start="{round(g["a2_11"]-1.2,2)}" data-duration="{round(acts["a4"]["start"] - (g["a2_11"]-1.2),2)}" data-track-index="11" data-volume="0.13"></audio>
      <audio id="bgm-fun" src="assets/bgm/funshine.mp3" data-start="{acts["a4"]["start"]}" data-duration="{round(total-acts["a4"]["start"],2)}" data-track-index="11" data-volume="0.15"></audio>'''

sfx_events = [
    ("sfx/chime_s.mp3",  0.60, 0.50, "title sparkle"),
    ("sfx/boing_s.mp3",  g["a1_05"]+1.0, 0.55, "bounce 1"),
    ("sfx/boing_s.mp3",  g["a1_05"]+1.8, 0.55, "bounce 2"),
    ("sfx/boing_s.mp3",  g["a1_05"]+2.6, 0.55, "bounce 3"),
    ("sfx/boing_s.mp3",  g["a1_06"]+0.1, 0.6,  "whee jump"),
    ("sfx/pop_n.mp3",    g["a1_08"]+0.4, 0.6,  "castle ta-da"),
    ("sfx/whoosh_s.mp3", g["a1_10"]+1.3, 0.55, "race off"),
    ("sfx/thwack_n.mp3", g["a2_10"]+1.55, 0.8, "castle crunch"),
    ("sfx/chime_s.mp3",  g["a3_07"]+0.2, 0.32, "insight glow"),
    ("sfx/pop_n.mp3",    g["a4_01"]+6.6, 0.7,  "cloud pop"),
    ("sfx/boing_s.mp3",  g["a4_05"]+1.2, 0.5,  "build 1"),
    ("sfx/boing_s.mp3",  g["a4_05"]+2.6, 0.5,  "build 2"),
    ("sfx/boing_s.mp3",  g["a4_05"]+4.0, 0.5,  "build 3"),
    ("sfx/whoosh_s.mp3", g["a4_07"]+1.2, 0.6,  "slide train"),
    ("sfx/chime_s.mp3",  g["a4_09"]+1.0, 0.42, "sun returns"),
    ("sfx/pop_n.mp3",    g["a5_02"]+0.2, 0.62, "rule 1"),
    ("sfx/pop_n.mp3",    g["a5_03"]+0.2, 0.62, "rule 2"),
    ("sfx/pop_n.mp3",    g["a5_04"]+0.2, 0.62, "rule 3"),
    ("sfx/win_n.mp3",    g["a5_05"]+0.3, 0.35, "kindness jingle"),
]
sfx = []
dur_map = {"sfx/chime_s.mp3": 3.0, "sfx/boing_s.mp3": 1.4, "sfx/pop_n.mp3": 0.3,
           "sfx/whoosh_s.mp3": 1.8, "sfx/thwack_n.mp3": 0.61, "sfx/win_n.mp3": 3.79}
# spread SFX over tracks 12-14 so overlapping stings never share a track
track_ends = {12: -1.0, 13: -1.0, 14: -1.0}
for i, (src, t, vol, label) in enumerate(sfx_events):
    tr = next((k for k, e in track_ends.items() if t > e + 0.05), 14)
    track_ends[tr] = t + dur_map[src]
    sfx.append(f'      <audio id="sfx-{i:02d}" src="assets/{src}" data-start="{round(t,2)}" '
               f'data-duration="{dur_map[src]}" data-track-index="{tr}" data-volume="{vol}"></audio> <!-- {label} -->')

uke_end = round(g["a2_10"]+2.0, 2)
sad_in = round(g["a2_11"]-1.2, 2)
sad_end = acts["a4"]["start"]
fun_start = acts["a4"]["start"]

html = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      body {{
        margin: 0;
        background: #fff6e4;
      }}
      #root {{
        position: relative;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        background: #fff6e4;
      }}
      #root > div[data-composition-src] {{
        position: absolute;
        inset: 0;
      }}
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="root"
      data-start="0"
      data-width="1920"
      data-height="1080"
      data-duration="{total}"
    >
{chr(10).join(slots)}

      <!-- ─── Voice lines (fish.audio s2.1-pro-free) ─── -->
{chr(10).join(voices)}

      <!-- ─── BGM (public domain, FreePD via archive.org) ─── -->
{bgm}

      <!-- ─── SFX (CC0, OpenGameArt) ─── -->
{chr(10).join(sfx)}
    </div>

    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});

      // BGM fades — soft bed under the voices, dies at the castle crunch,
      // grieves on piano, comes back full sunshine for the turnaround.
      tl.fromTo("#bgm-uke", {{ volume: 0.03 }}, {{ volume: 0.16, duration: 2.0, ease: "sine.out" }}, 0);
      tl.to("#bgm-uke", {{ volume: 0.0, duration: 1.7, ease: "power2.in" }}, {round(g["a2_10"], 2)});
      tl.fromTo("#bgm-sad", {{ volume: 0.0 }}, {{ volume: 0.13, duration: 2.5, ease: "sine.inOut" }}, {sad_in});
      tl.to("#bgm-sad", {{ volume: 0.0, duration: 2.2, ease: "sine.in" }}, {round(sad_end-2.4, 2)});
      tl.fromTo("#bgm-fun", {{ volume: 0.0 }}, {{ volume: 0.15, duration: 1.8, ease: "sine.out" }}, {fun_start});
      tl.to("#bgm-fun", {{ volume: 0.0, duration: 4.0, ease: "sine.in" }}, {round(total-4.4, 2)});

      window.__timelines["root"] = tl;
    </script>
  </body>
</html>
'''
open(os.path.join(ROOT, "index.html"), "w").write(html)
print("index.html written,", len(html), "bytes")
