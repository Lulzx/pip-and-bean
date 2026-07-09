#!/usr/bin/env python3
"""Generate all TTS lines from fish.audio s2.1-pro-free, measure durations, emit manifest."""
import json, subprocess, sys, time, urllib.request, os

ROOT = os.path.dirname(os.path.abspath(__file__))
API_KEY = os.environ.get("FISH_AUDIO_API_KEY")
if not API_KEY:
    sys.exit("Set FISH_AUDIO_API_KEY in the environment (never hardcode it).")
OUT = os.path.join(ROOT, "assets", "voices")
os.makedirs(OUT, exist_ok=True)

spec = json.load(open(os.path.join(ROOT, "script.json")))
voices = spec["voices"]
manifest = []

for line in spec["lines"]:
    path = os.path.join(OUT, f"{line['id']}.mp3")
    if not (os.path.exists(path) and os.path.getsize(path) > 5000):
        body = json.dumps({
            "text": line["text"],
            "reference_id": voices[line["speaker"]],
            "format": "mp3",
        }).encode()
        for attempt in range(4):
            try:
                req = urllib.request.Request(
                    "https://api.fish.audio/v1/tts", data=body, method="POST",
                    headers={
                        "Authorization": f"Bearer {API_KEY}",
                        "Content-Type": "application/json",
                        "model": "s2.1-pro-free",
                    })
                with urllib.request.urlopen(req, timeout=120) as r:
                    audio = r.read()
                if len(audio) < 2000:
                    raise RuntimeError(f"tiny response {len(audio)}")
                open(path, "wb").write(audio)
                break
            except Exception as e:
                print(f"  retry {line['id']} ({attempt+1}): {e}", flush=True)
                time.sleep(3 * (attempt + 1))
        else:
            print(f"FAILED {line['id']}", flush=True)
            sys.exit(1)
        time.sleep(0.5)
    dur = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path]).strip())
    manifest.append({**line, "file": f"assets/voices/{line['id']}.mp3", "duration": round(dur, 3)})
    print(f"{line['id']} [{line['speaker']}] {dur:.2f}s", flush=True)

json.dump(manifest, open(os.path.join(ROOT, "voice_manifest.json"), "w"), indent=1)
total = sum(m["duration"] for m in manifest)
print(f"\n{len(manifest)} lines, {total:.1f}s of speech total")
