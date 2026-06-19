import math
import struct
import zlib
from pathlib import Path


WIDTH = 1600
HEIGHT = 1000
OUT = Path("outputs/assets/signal-field.png")


def clamp(value):
    return max(0, min(255, int(value)))


def gaussian(x, y, cx, cy, sx, sy):
    return math.exp(-(((x - cx) ** 2) / (2 * sx * sx) + ((y - cy) ** 2) / (2 * sy * sy)))


def write_png(path, width, height, rows):
    raw = b"".join(b"\x00" + row for row in rows)

    def chunk(kind, data):
        return (
            struct.pack(">I", len(data))
            + kind
            + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
        )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 8))
        + chunk(b"IEND", b"")
    )


rows = []
for y in range(HEIGHT):
    row = bytearray()
    yn = y / HEIGHT
    for x in range(WIDTH):
        xn = x / WIDTH
        base = 18 + 9 * (1 - yn)
        g1 = gaussian(x, y, WIDTH * 0.76, HEIGHT * 0.16, 430, 210)
        g2 = gaussian(x, y, WIDTH * 0.22, HEIGHT * 0.64, 360, 260)
        g3 = gaussian(x, y, WIDTH * 0.55, HEIGHT * 0.52, 540, 300)
        g4 = gaussian(x, y, WIDTH * 0.88, HEIGHT * 0.78, 320, 300)
        wave = (math.sin(xn * 16 + yn * 10) + math.sin(xn * 7 - yn * 18)) * 0.5
        vignette = gaussian(x, y, WIDTH * 0.5, HEIGHT * 0.48, 980, 700)
        haze = math.sin(xn * 31.0 + yn * 13.0) * 2.4 + math.sin(xn * 9.0 - yn * 24.0) * 2.2

        r = base + g1 * 112 + g2 * 58 + g3 * 31 + g4 * 70 + wave * 8 + haze
        g = base + g1 * 172 + g2 * 118 + g3 * 84 + g4 * 118 + wave * 11 + haze
        b = base + g1 * 62 + g2 * 51 + g3 * 43 + g4 * 37 + wave * 7 + haze

        edge = 0.54 + 0.58 * vignette
        row.extend((clamp(r * edge), clamp(g * edge), clamp(b * edge)))
    rows.append(bytes(row))

write_png(OUT, WIDTH, HEIGHT, rows)
