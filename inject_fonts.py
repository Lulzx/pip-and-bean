#!/usr/bin/env python3
"""Inject inline data-URI @font-face block into each act sub-composition (idempotent)."""
import base64, glob, os, re
ROOT = os.path.dirname(os.path.abspath(__file__))

def b64(p):
    return base64.b64encode(open(os.path.join(ROOT, "assets", "fonts", p), "rb").read()).decode()

block = (
    "<style data-hf-fonts>\n"
    "@font-face{font-family:'Baloo 2';font-weight:800;font-style:normal;"
    "src:url(data:font/woff2;base64," + b64("baloo2-800.woff2") + ") format('woff2')}\n"
    "@font-face{font-family:'Baloo 2';font-weight:400;font-style:normal;"
    "src:url(data:font/woff2;base64," + b64("baloo2-400.woff2") + ") format('woff2')}\n"
    "@font-face{font-family:'Patrick Hand';font-weight:400;font-style:normal;"
    "src:url(data:font/woff2;base64," + b64("patrickhand-400.woff2") + ") format('woff2')}\n"
    "</style>"
)

for f in sorted(glob.glob(os.path.join(ROOT, "compositions", "a*.html"))):
    src = open(f).read()
    src = re.sub(r"<style data-hf-fonts>.*?</style>\n?", "", src, flags=re.S)
    src = src.replace("<template>", "<template>\n      " + block, 1)
    open(f, "w").write(src)
    print("fonts ->", os.path.basename(f))
