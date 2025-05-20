#!/usr/bin/env python3
from pathlib import Path
from typing import List, Tuple
import argparse
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from svgpathtools import parse_path, Path as SvgPath
import svgwrite


# ————————————————————————————————————————————————
# Helpers
# ————————————————————————————————————————————————
def _glyph_path(font: TTFont, glyph_name: str) -> str:
    pen = SVGPathPen(font.getGlyphSet())
    font.getGlyphSet()[glyph_name].draw(pen)
    return pen.getCommands()


def _phrase_paths(text: str, font_file: Path) -> Tuple[List[str], float, float]:
    """
    Return a list of SVG-path “d” strings for every glyph in `text`
    translated to the proper advance offset plus total width & height.
    """
    tt = TTFont(str(font_file))
    cmap = tt.getBestCmap()
    hmtx = tt["hmtx"]
    head = tt["head"]
    ascender = tt["hhea"].ascender
    descender = tt["hhea"].descender  # negative

    x_cursor = 0.0
    paths: List[str] = []
    for ch in text:
        glyph = cmap.get(ord(ch))
        if glyph is None:
            x_cursor += tt["hhea"].advanceWidthMax
            continue
        raw = _glyph_path(tt, glyph)
        if not raw.strip():
            x_cursor += hmtx[glyph][0]
            continue
        svg_path = parse_path(raw).translated(complex(x_cursor, ascender))
        paths.append(svg_path.d())
        x_cursor += hmtx[glyph][0]

    width = x_cursor
    height = ascender - descender
    return paths, width, height


# ————————————————————————————————————————————————
# Main generators
# ————————————————————————————————————————————————
def write_svg(paths: List[str], width: float, height: float, out_file: Path) -> None:
    dwg = svgwrite.Drawing(
        filename=str(out_file),
        size=(f"{int(width)}", f"{int(height)}"),
        viewBox=f"0 0 {int(width)} {int(height)}",
    )
    grp = dwg.g(id="title-paths", fill="none", stroke="#5d4037", stroke_width="2",
                stroke_linecap="round", stroke_linejoin="round")
    for p in paths:
        grp.add(dwg.path(d=p))
    dwg.add(grp)
    dwg.save()


def emit_inline(paths: List[str], width: float, height: float) -> None:
    print(f'<svg id="title-svg" viewBox="0 0 {int(width)} {int(height)}" '
          f'preserveAspectRatio="xMidYMid meet" class="animated-svg-title">')
    print('  <g id="title-paths" fill="none" stroke="#5d4037" stroke-width="2" '
          'stroke-linecap="round" stroke-linejoin="round">')
    for p in paths:
        print(f'    <path d="{p}" />')
    print("  </g>")
    print("</svg>")


# ————————————————————————————————————————————————
# CLI
# ————————————————————————————————————————————————
def main() -> None:
    ap = argparse.ArgumentParser(description="Vectorise text into SVG paths.")
    ap.add_argument("text", help="Text to vectorise")
    ap.add_argument("--font", required=True, help="Path to .ttf/.otf font file")
    ap.add_argument("--out", help="Output SVG file (omit to print inline snippet)")
    args = ap.parse_args()

    paths, w, h = _phrase_paths(args.text, Path(args.font))
    if not paths:
        raise SystemExit("No paths created – check font & text.")

    if args.out:
        write_svg(paths, w, h, Path(args.out))
    else:
        emit_inline(paths, w, h)


if __name__ == "__main__":
    main()