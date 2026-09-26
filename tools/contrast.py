"""Clean Pocket contrast check. Parses the theme CSS custom properties out of css/app.css and
prints the WCAG contrast ratio of --muted and --ink against --surface and --bg, for each of the
four themes. Exits 1 (after printing the table) if any ratio for --muted falls under 4.5:1 (the
AA text threshold this app targets); --ink is checked too as a sanity backstop.

Run: python tools/contrast.py
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CSS_PATH = os.path.join(ROOT, "css", "app.css")

THEMES = [
    ("forest", r":root\s*\{"),
    ("graphite", r':root\[data-theme="graphite"\]\s*\{'),
    ("black", r':root\[data-theme="black"\]\s*\{'),
    ("light", r':root\[data-theme="light"\]\s*\{'),
]
VARS = ["--bg", "--surface", "--ink", "--muted"]
MIN_RATIO = 4.5


def read_block(css, start_pattern):
    m = re.search(start_pattern, css)
    if not m:
        raise SystemExit("theme block not found: %s" % start_pattern)
    start = m.end()
    depth = 1
    i = start
    while depth > 0:
        if css[i] == "{":
            depth += 1
        elif css[i] == "}":
            depth -= 1
        i += 1
    return css[start:i - 1]


def parse_vars(block):
    out = {}
    for name in VARS:
        m = re.search(re.escape(name) + r":\s*(#[0-9a-fA-F]{3,8})\s*;", block)
        if m:
            out[name] = m.group(1)
    return out


def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def rel_luminance(rgb):
    r, g, b = (srgb_to_linear(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(hex_a, hex_b):
    la = rel_luminance(hex_to_rgb(hex_a))
    lb = rel_luminance(hex_to_rgb(hex_b))
    lighter, darker = max(la, lb), min(la, lb)
    return (lighter + 0.05) / (darker + 0.05)


def main():
    with open(CSS_PATH, "r", encoding="utf-8") as f:
        css = f.read()

    rows = []
    failures = []
    for theme_name, pattern in THEMES:
        block = read_block(css, pattern)
        # inherited vars (forest ":root" block also carries vars every theme overrides only
        # partially, but each theme below explicitly redefines bg/surface/ink/muted)
        v = parse_vars(block)
        for fg_name in ["--muted", "--ink"]:
            for bg_name in ["--surface", "--bg"]:
                ratio = contrast(v[fg_name], v[bg_name])
                ok = ratio >= MIN_RATIO
                rows.append((theme_name, fg_name, bg_name, v[fg_name], v[bg_name], ratio, ok))
                if fg_name == "--muted" and not ok:
                    failures.append((theme_name, fg_name, bg_name, ratio))

    header = "%-10s %-8s %-9s %-9s %-9s %-7s %s" % ("theme", "fg", "fg-hex", "bg", "bg-hex", "ratio", "pass")
    print(header)
    print("-" * len(header))
    for theme_name, fg_name, bg_name, fg_hex, bg_hex, ratio, ok in rows:
        print("%-10s %-8s %-9s %-9s %-9s %-7.2f %s" % (
            theme_name, fg_name, fg_hex, bg_name, bg_hex, ratio, "PASS" if ok else "FAIL"
        ))

    print()
    if failures:
        print("FAIL: %d contrast check(s) under %.1f:1" % (len(failures), MIN_RATIO))
        for theme_name, fg_name, bg_name, ratio in failures:
            print(" - %s %s on %s: %.2f" % (theme_name, fg_name, bg_name, ratio))
        sys.exit(1)
    print("CONTRAST: PASS (all --muted ratios >= %.1f:1)" % MIN_RATIO)


if __name__ == "__main__":
    main()
