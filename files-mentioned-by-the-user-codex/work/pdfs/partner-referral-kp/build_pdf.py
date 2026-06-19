from pathlib import Path

from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path("/Users/a1/Documents/Codex/2026-06-19/files-mentioned-by-the-user-codex")
PREVIEW_DIR = ROOT / "work/presentations/partner-proposal-deck/tmp/hires"
OUTPUT_PDF = ROOT / "outputs/partner-referral-kp.pdf"

# 16:9 widescreen in points. 3840x2160 source images land at ~288 DPI.
SLIDE_WIDTH = 960
SLIDE_HEIGHT = 540


def main() -> None:
    slide_paths = sorted(PREVIEW_DIR.glob("slide-*.png"))
    if len(slide_paths) != 8:
        raise RuntimeError(f"Expected 8 slide PNG files, found {len(slide_paths)}")

    pdf = canvas.Canvas(str(OUTPUT_PDF), pagesize=(SLIDE_WIDTH, SLIDE_HEIGHT))
    pdf.setTitle("Partner Referral KP")
    pdf.setAuthor("Codex")

    for slide_path in slide_paths:
        image = ImageReader(str(slide_path))
        pdf.drawImage(
            image,
            0,
            0,
            width=SLIDE_WIDTH,
            height=SLIDE_HEIGHT,
            preserveAspectRatio=False,
            mask="auto",
        )
        pdf.showPage()

    pdf.save()


if __name__ == "__main__":
    main()
