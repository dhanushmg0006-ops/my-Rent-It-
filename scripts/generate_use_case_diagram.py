from __future__ import annotations

import argparse
import pathlib
import sys
import urllib.request
import zlib


def _encode6bit(b: int) -> str:
    if b < 10:
        return chr(48 + b)
    b -= 10
    if b < 26:
        return chr(65 + b)
    b -= 26
    if b < 26:
        return chr(97 + b)
    b -= 26
    if b == 0:
        return "-"
    if b == 1:
        return "_"
    raise ValueError(f"Invalid 6-bit value: {b}")


def _append3bytes(b1: int, b2: int, b3: int) -> str:
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    return "".join(_encode6bit(c) for c in (c1, c2, c3, c4))


def _encode(text: str) -> str:
    data = text.encode("utf-8")
    compressed = zlib.compress(data)[2:-4]
    encoded = []
    for idx in range(0, len(compressed), 3):
        b1 = compressed[idx]
        b2 = compressed[idx + 1] if idx + 1 < len(compressed) else 0
        b3 = compressed[idx + 2] if idx + 2 < len(compressed) else 0
        encoded.append(_append3bytes(b1, b2, b3))
    return "".join(encoded)


def _generate(puml_path: pathlib.Path, root: pathlib.Path) -> pathlib.Path:
    diagram_text = puml_path.read_text(encoding="utf-8")
    encoded = _encode(diagram_text)
    url = f"https://www.plantuml.com/plantuml/png/{encoded}"

    png_path = puml_path.with_suffix(".png")
    with urllib.request.urlopen(url) as response:
        png_path.write_bytes(response.read())

    print(f"Generated {png_path.relative_to(root)} from PlantUML server")
    return png_path


def main() -> None:
    root = pathlib.Path(__file__).resolve().parents[1]

    parser = argparse.ArgumentParser(description="Render PlantUML diagrams via the public PlantUML server.")
    parser.add_argument(
        "diagram",
        nargs="?",
        default=str(pathlib.Path("docs") / "use_case_diagram.puml"),
        help="Path to the .puml file to render (relative to repo root).",
    )

    args = parser.parse_args()

    diagram_path = pathlib.Path(args.diagram)
    if not diagram_path.is_absolute():
        diagram_path = root / diagram_path

    if diagram_path.suffix != ".puml":
        print("Error: diagram path must point to a .puml file", file=sys.stderr)
        raise SystemExit(1)

    if not diagram_path.exists():
        print(f"Error: {diagram_path.relative_to(root)} does not exist", file=sys.stderr)
        raise SystemExit(1)

    _generate(diagram_path, root)


if __name__ == "__main__":
    main()

