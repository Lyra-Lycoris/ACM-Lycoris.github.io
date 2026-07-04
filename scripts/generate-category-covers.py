from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images" / "category-covers"
SIZE = (1920, 1320)
SCALE = 1


PALETTES = {
    "algorithm": {"cyan": (0, 229, 255), "red": (255, 0, 60), "paper": (232, 238, 247)},
    "solution": {"cyan": (76, 205, 255), "red": (255, 64, 102), "paper": (238, 241, 232)},
    "graph-theory": {"cyan": (0, 229, 255), "red": (255, 0, 60), "paper": (225, 233, 244)},
    "advanced-cp": {"cyan": (64, 214, 255), "red": (255, 40, 82), "paper": (230, 236, 245)},
    "site-building": {"cyan": (0, 210, 255), "red": (255, 45, 82), "paper": (235, 242, 246)},
    "hack": {"cyan": (0, 255, 210), "red": (255, 54, 86), "paper": (225, 235, 232)},
    "gplt": {"cyan": (0, 229, 255), "red": (255, 0, 60), "paper": (236, 239, 246)},
}


def rgba(color, alpha):
    return (*color, alpha)


def canvas(seed: int) -> tuple[Image.Image, ImageDraw.ImageDraw, dict]:
    random.seed(seed)
    w, h = SIZE[0] * SCALE, SIZE[1] * SCALE
    img = Image.new("RGBA", (w, h), (6, 7, 13, 255))
    draw = ImageDraw.Draw(img, "RGBA")

    for y in range(h):
        t = y / h
        r = int(5 + 12 * t)
        g = int(7 + 10 * t)
        b = int(15 + 24 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    for x in range(0, w, 48):
        draw.line([(x, 0), (x, h)], fill=(255, 255, 255, 10), width=1)
    for y in range(0, h, 48):
        draw.line([(0, y), (w, y)], fill=(255, 255, 255, 9), width=1)

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((-260, -220, 660, 520), fill=(255, 0, 60, 36))
    gd.ellipse((w - 760, h - 520, w + 220, h + 260), fill=(0, 229, 255, 28))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(70)))

    vignette = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse((-w // 4, -h // 3, w + w // 4, h + h // 3), fill=210)
    vignette = Image.eval(vignette.filter(ImageFilter.GaussianBlur(80)), lambda p: 255 - p)
    img.alpha_composite(Image.new("RGBA", (w, h), (0, 0, 0, 0)))
    img.putalpha(Image.new("L", (w, h), 255))

    return img, ImageDraw.Draw(img, "RGBA"), {"w": w, "h": h}


def line_glow(img, points, color, width=4, blur=8, alpha=190):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")
    d.line(points, fill=rgba(color, alpha), width=width, joint="curve")
    glow = layer.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(glow)
    img.alpha_composite(layer)


def rounded(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def save(img: Image.Image, name: str):
    OUT.mkdir(parents=True, exist_ok=True)
    img = img.resize(SIZE, Image.Resampling.LANCZOS).convert("RGB")
    img.save(OUT / f"{name}.png", optimize=True)


def cover_algorithm():
    img, d, m = canvas(11)
    w, h = m["w"], m["h"]
    p = PALETTES["algorithm"]
    base_x, base_y = 170, 250
    for i, height in enumerate([88, 132, 64, 174, 108, 150, 78]):
        x = base_x + i * 125
        y = base_y + (190 - height)
        rounded(d, (x, y, x + 74, base_y + 190), 16, rgba(p["cyan"], 36), rgba(p["cyan"], 135), 3)
        d.rectangle((x + 16, y + 18, x + 58, y + 28), fill=rgba(p["paper"], 120))
    trunk = [(1060, 210), (930, 350), (1060, 500), (1180, 350), (1060, 210)]
    line_glow(img, trunk, p["red"], 5, 13, 190)
    for a, b in [((1060, 500), (870, 650)), ((1060, 500), (1260, 650)), ((930, 350), (760, 470)), ((1180, 350), (1370, 470))]:
        line_glow(img, [a, b], p["cyan"], 4, 10, 170)
    for x, y in [(1060, 210), (930, 350), (1180, 350), (1060, 500), (870, 650), (1260, 650), (760, 470), (1370, 470)]:
        d.ellipse((x - 18, y - 18, x + 18, y + 18), fill=rgba(p["paper"], 220), outline=rgba(p["cyan"], 220), width=3)
    save(img, "algorithm")


def cover_solution():
    img, d, m = canvas(22)
    w, h = m["w"], m["h"]
    p = PALETTES["solution"]
    rounded(d, (190, 150, 930, 980), 28, (232, 238, 247, 215), rgba(p["cyan"], 120), 3)
    for y in range(250, 850, 92):
        d.rectangle((250, y, 790, y + 16), fill=(20, 30, 42, 110))
        d.rectangle((250, y + 34, 620, y + 46), fill=(20, 30, 42, 75))
    for x, y in [(1010, 210), (1230, 360), (1120, 610), (1380, 780)]:
        rounded(d, (x - 78, y - 46, x + 78, y + 46), 20, rgba(p["cyan"], 28), rgba(p["cyan"], 150), 3)
        d.line((x - 40, y, x - 8, y + 28, x + 48, y - 34), fill=rgba(p["red"], 210), width=8)
    line_glow(img, [(820, 320), (1010, 210), (1230, 360), (1120, 610), (1380, 780)], p["red"], 5, 12, 180)
    for x in range(1040, 1540, 90):
        d.rectangle((x, 980 - (x % 5) * 28, x + 42, 1000), fill=rgba(p["cyan"], 70))
    save(img, "solution")


def cover_graph_theory():
    img, d, m = canvas(33)
    p = PALETTES["graph-theory"]
    nodes = [(300, 360), (540, 230), (760, 430), (990, 270), (1210, 500), (1450, 330), (1160, 760), (720, 760), (420, 620)]
    edges = [(0, 1), (1, 2), (2, 3), (3, 5), (2, 4), (4, 6), (6, 7), (7, 8), (8, 0), (1, 3), (2, 7), (3, 4)]
    path = {(0, 1), (1, 2), (2, 3), (3, 4), (4, 6)}
    for a, b in edges:
        color = p["red"] if (a, b) in path or (b, a) in path else p["cyan"]
        alpha = 220 if color == p["red"] else 115
        width = 7 if color == p["red"] else 4
        line_glow(img, [nodes[a], nodes[b]], color, width, 10, alpha)
    for i, (x, y) in enumerate(nodes):
        fill = rgba(p["red"], 230) if i in [0, 1, 2, 3, 4, 6] else rgba((14, 24, 36), 240)
        d.ellipse((x - 34, y - 34, x + 34, y + 34), fill=fill, outline=rgba(p["paper"], 225), width=4)
        d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=rgba(p["paper"], 180))
    for i in range(8):
        x = 220 + i * 60
        y = 980
        d.rectangle((x, y, x + 36, y + 36), fill=rgba(p["cyan"], 20 + i * 9), outline=rgba(p["cyan"], 80))
    save(img, "graph-theory")


def cover_advanced_cp():
    img, d, m = canvas(44)
    p = PALETTES["advanced-cp"]
    panels = [(190, 170, 660, 470), (720, 150, 1220, 475), (1280, 180, 1660, 500), (310, 560, 830, 950), (920, 565, 1550, 960)]
    for idx, box in enumerate(panels):
        rounded(d, box, 22, rgba((16, 26, 40), 210), rgba(p["cyan" if idx % 2 == 0 else "red"], 125), 3)
    for x in range(250, 610, 58):
        d.rectangle((x, 395 - (x % 7) * 12, x + 32, 420), fill=rgba(p["red"], 115))
    for row in range(5):
        for col in range(7):
            d.rectangle((770 + col * 58, 210 + row * 42, 806 + col * 58, 236 + row * 42), fill=rgba(p["cyan"], 35 + row * 13), outline=rgba(p["cyan"], 55))
    curve = [(940 + i * 45, 840 - int(160 * math.log(i + 1, 12))) for i in range(1, 12)]
    line_glow(img, curve, p["red"], 6, 14, 200)
    for x, y in [(1440, 260), (1510, 340), (1370, 410), (1560, 455)]:
        d.ellipse((x - 24, y - 24, x + 24, y + 24), fill=rgba(p["cyan"], 170), outline=rgba(p["paper"], 180), width=3)
    for a, b in [((1440, 260), (1510, 340)), ((1510, 340), (1370, 410)), ((1370, 410), (1560, 455))]:
        line_glow(img, [a, b], p["cyan"], 4, 8, 160)
    save(img, "advanced-cp")


def cover_site_building():
    img, d, m = canvas(55)
    p = PALETTES["site-building"]
    rounded(d, (250, 160, 1180, 830), 28, rgba((235, 242, 246), 212), rgba(p["cyan"], 125), 3)
    d.rectangle((250, 160, 1180, 250), fill=rgba((16, 26, 40), 235))
    for x in [305, 355, 405]:
        d.ellipse((x, 195, x + 24, 219), fill=rgba(p["red"], 190))
    rounded(d, (330, 310, 670, 720), 18, rgba((16, 26, 40), 80), rgba(p["red"], 120), 3)
    rounded(d, (720, 310, 1080, 450), 18, rgba(p["cyan"], 28), rgba(p["cyan"], 130), 3)
    rounded(d, (720, 500, 1080, 720), 18, rgba((16, 26, 40), 80), rgba(p["cyan"], 130), 3)
    pipeline = [(1220, 300), (1370, 300), (1370, 620), (1530, 620)]
    line_glow(img, pipeline, p["red"], 6, 13, 190)
    for x, y in [(1220, 300), (1370, 300), (1370, 620), (1530, 620)]:
        rounded(d, (x - 54, y - 36, x + 54, y + 36), 16, rgba((16, 26, 40), 230), rgba(p["cyan"], 150), 3)
    for y in range(350, 690, 70):
        d.rectangle((370, y, 610, y + 18), fill=rgba(p["paper"], 120))
    save(img, "site-building")


def cover_hack():
    img, d, m = canvas(66)
    p = PALETTES["hack"]
    terminals = [(190, 170, 780, 520), (930, 175, 1540, 520), (370, 640, 1370, 980)]
    for box in terminals:
        rounded(d, box, 24, rgba((8, 18, 24), 225), rgba(p["cyan"], 130), 3)
    for y in range(250, 470, 54):
        d.rectangle((260, y, 610, y + 14), fill=rgba(p["cyan"], 105))
        d.rectangle((260, y + 24, 710, y + 34), fill=rgba(p["paper"], 58))
    nodes = [(1020, 300), (1220, 240), (1420, 335), (1320, 455), (1120, 450), (890, 760), (1190, 800), (1490, 750)]
    for a, b in [(0, 1), (1, 2), (2, 3), (3, 4), (4, 0), (5, 6), (6, 7), (0, 6), (3, 7)]:
        line_glow(img, [nodes[a], nodes[b]], p["cyan"], 4, 10, 170)
    for x, y in nodes:
        d.ellipse((x - 24, y - 24, x + 24, y + 24), fill=rgba((12, 26, 32), 235), outline=rgba(p["cyan"], 210), width=4)
    for x in [520, 630, 740, 850, 960, 1070]:
        d.arc((x, 735, x + 90, 825), 210, 330, fill=rgba(p["red"], 150), width=5)
    d.polygon([(420, 850), (470, 785), (520, 850), (500, 850), (500, 920), (440, 920), (440, 850)], fill=rgba(p["red"], 155))
    save(img, "hack")


def cover_gplt():
    img, d, m = canvas(77)
    p = PALETTES["gplt"]
    rounded(d, (190, 150, 680, 900), 28, rgba((10, 20, 34), 225), rgba(p["cyan"], 135), 3)
    rounded(d, (780, 150, 1580, 900), 28, rgba((10, 20, 34), 210), rgba(p["red"], 120), 3)
    for i, y in enumerate(range(250, 780, 88)):
        fill = rgba(p["red"], 145) if i < 3 else rgba(p["cyan"], 110)
        d.rectangle((260, y, 600 - i * 22, y + 32), fill=fill)
        d.rectangle((260, y + 46, 520 - i * 16, y + 58), fill=rgba(p["paper"], 75))
    ladder = [(900, 790), (1040, 650), (1180, 650), (1320, 510), (1460, 510)]
    line_glow(img, ladder, p["red"], 8, 16, 210)
    for x, y in ladder:
        d.ellipse((x - 28, y - 28, x + 28, y + 28), fill=rgba(p["red"], 220), outline=rgba(p["paper"], 210), width=4)
    for x in [930, 1070, 1210, 1350]:
        d.line((x, 330, x, 795), fill=rgba(p["cyan"], 72), width=3)
    for y in [330, 430, 530, 630, 730]:
        d.line((880, y, 1510, y), fill=rgba(p["cyan"], 54), width=3)
    for i, (x, y) in enumerate([(950, 360), (1110, 430), (1260, 500), (1410, 610), (990, 710)]):
        rounded(d, (x - 56, y - 28, x + 56, y + 28), 14, rgba(p["cyan"], 32 + i * 14), rgba(p["cyan"], 130), 3)
    save(img, "gplt")


def main():
    cover_algorithm()
    cover_solution()
    cover_graph_theory()
    cover_advanced_cp()
    cover_site_building()
    cover_hack()
    cover_gplt()


if __name__ == "__main__":
    main()
