"""Generates Clean Pocket's app icons: a pocket with a green banknote and a euro sign,
matching the in-app logo. Run: python tools/make_icons.py
Requires Pillow (PIL). Writes into ../icons relative to this file.
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "icons")
os.makedirs(OUT, exist_ok=True)

BG = (20, 43, 36, 255)        # forest theme background
NOTE = (91, 227, 176, 255)    # --net
NOTE_LINE = (10, 90, 69, 255)
POCKET = (45, 51, 58, 255)
POCKET_EDGE = (74, 82, 91, 255)
HEM = (56, 63, 71, 255)
STITCH = (242, 183, 5, 255)   # --road


def draw_icon(size, padding_ratio=0.0, background=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = size * padding_ratio
    s = size - 2 * pad
    ox = oy = pad

    if background:
        d.rounded_rectangle([0, 0, size, size], radius=size * 0.22, fill=BG)

    def pt(x, y):
        # coordinates in a 96x96 design space, scaled + offset into (ox..ox+s)
        return (ox + x / 96.0 * s, oy + y / 96.0 * s)

    # banknote (slightly rotated look approximated with a plain rounded rect, good enough at icon size)
    note_box = [pt(20, 6), pt(76, 42)]
    d.rounded_rectangle([note_box[0][0], note_box[0][1], note_box[1][0], note_box[1][1]], radius=s * 0.05, fill=NOTE)
    inner = [pt(25, 11), pt(71, 37)]
    d.rounded_rectangle([inner[0][0], inner[0][1], inner[1][0], inner[1][1]], radius=s * 0.03, outline=NOTE_LINE, width=max(1, int(s * 0.015)))
    cx, cy = pt(48, 24)
    rr = s * 0.09
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=NOTE_LINE, width=max(1, int(s * 0.015)))
    # euro sign
    try:
        font = ImageFont.truetype("arialbd.ttf", int(s * 0.16))
    except Exception:
        font = ImageFont.load_default()
    txt = "€"
    bbox = d.textbbox((0, 0), txt, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1]), txt, fill=NOTE_LINE, font=font)

    # pocket
    pocket_pts = [
        pt(12, 40), pt(84, 40), pt(84, 68),
    ]
    d.polygon([pt(12, 40), pt(84, 40), pt(84, 68), pt(48, 92), pt(12, 68)], fill=POCKET, outline=POCKET_EDGE)
    d.rectangle([pt(12, 40)[0], pt(12, 40)[1], pt(84, 49)[0], pt(84, 49)[1]], fill=HEM)

    # stitch line (dashed)
    p1, p2, p3, p4 = pt(19, 55), pt(19, 67), pt(48, 85), pt(77, 67)
    p5 = pt(77, 55)
    d.line([p1, p2, p3, p4, p5], fill=STITCH, width=max(1, int(s * 0.014)), joint="curve")

    return img


def save(img, name):
    path = os.path.join(OUT, name)
    img.save(path)
    print("wrote", path, img.size)


if __name__ == "__main__":
    save(draw_icon(192), "icon-192.png")
    save(draw_icon(512), "icon-512.png")
    # maskable: keep the artwork inside the safe zone (padding ~ 20%)
    save(draw_icon(512, padding_ratio=0.12), "icon-maskable-512.png")
    save(draw_icon(180), "apple-touch-180.png")
