#!/usr/bin/env python3
"""Build the AthlinkPro visual showcase — one tall, scrollable PDF page.

Real product screenshots stacked in funnel order, brand mark top-right, no
explanatory copy: the screens carry the story on their own.

Capture the source screenshots first (see docs/capture-showcase-shots.sh),
then:

    python3 docs/generate-showcase-pdf.py
"""

import os

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

SHOTS = "/tmp/athshots"
OUT = "docs/AthlinkPro-Showcase.pdf"
LOGO = "public/brand/athlinkpro-lockup.png"

BG = HexColor("#05070c")
LINE = HexColor("#161d2b")

PAGE_W = 1440.0          # points; matches the capture width for 1:1 framing
SIDE = 72.0              # gutter
GAP = 40.0               # space between screens
TOP = 150.0              # header band with the mark
BOTTOM = 84.0
RADIUS = 18.0

# Source screens, in the order a visitor meets them.
# (file, crop) — crop is (top, bottom) in *source* pixels, or None for whole image.
FULL = f"{SHOTS}/99-fullhome.png"
SCREENS = [
    (f"{SHOTS}/01-hero.png", None),
    (FULL, (1900, 4250)),     # How AthlinkPro Works — Athletes
    (FULL, (4300, 6500)),     # Run your coaching business
    (FULL, (6560, 7900)),     # pitching hero
    (FULL, (7960, 10250)),    # A walk through the app
    (f"{SHOTS}/05-search.png", None),
    (f"{SHOTS}/10-coach.png", None),
    (f"{SHOTS}/07-feed.png", None),
    (f"{SHOTS}/06-pricing.png", None),
    (f"{SHOTS}/09-join.png", (0, 1500)),
]


def load(path, crop):
    im = Image.open(path).convert("RGB")
    if crop:
        top, bottom = crop
        im = im.crop((0, top, im.width, min(bottom, im.height)))
    return im


def rounded(im, radius_px):
    """Round the corners so each screen reads as a card, not a raw dump."""
    from PIL import ImageDraw

    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius_px, fill=255)
    out = Image.new("RGB", im.size, (5, 7, 12))
    out.paste(im, (0, 0), mask)
    return out


def main():
    inner_w = PAGE_W - 2 * SIDE
    tiles = []
    for path, crop in SCREENS:
        if not os.path.exists(path):
            raise SystemExit(f"missing screenshot: {path}")
        im = load(path, crop)
        draw_h = inner_w * im.height / im.width
        scale = inner_w / im.width
        im = rounded(im, int(RADIUS / scale))
        tiles.append((im, draw_h))

    page_h = TOP + sum(h for _, h in tiles) + GAP * (len(tiles) - 1) + BOTTOM

    c = canvas.Canvas(OUT, pagesize=(PAGE_W, page_h))
    c.setTitle("AthlinkPro")
    c.setAuthor("AthlinkPro")

    c.setFillColor(BG)
    c.rect(0, 0, PAGE_W, page_h, stroke=0, fill=1)

    # Brand mark, top right.
    if os.path.exists(LOGO):
        logo = Image.open(LOGO)
        lw = 190.0
        lh = lw * logo.height / logo.width
        c.drawImage(LOGO, PAGE_W - SIDE - lw, page_h - 36 - lh,
                    width=lw, height=lh, mask="auto")

    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.line(SIDE, page_h - TOP + 26, PAGE_W - SIDE, page_h - TOP + 26)

    y = page_h - TOP
    for im, draw_h in tiles:
        y -= draw_h
        c.drawInlineImage(im, SIDE, y, width=inner_w, height=draw_h)
        y -= GAP

    c.showPage()
    c.save()
    print(f"wrote {OUT} — 1 page, {PAGE_W:.0f}x{page_h:.0f}pt, {len(tiles)} screens")


if __name__ == "__main__":
    main()
