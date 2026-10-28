"""Generate optional smaller WebP files; never overwrite the source images."""
from pathlib import Path
from html import unescape
from urllib.parse import quote
import re
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
target = ROOT / 'img/responsive'
target.mkdir(exist_ok=True)
html = (ROOT / 'index.html').read_text(encoding='utf-8')
generated = {}

def enhance(match):
    tag = match.group()
    src_match = re.search(r'\bsrc="([^"]+)"', tag)
    if not src_match:
        return tag
    src = unescape(src_match[1])
    original = ROOT / src
    if original.suffix.lower() != '.webp' or not original.is_file() or original.stat().st_size < 180_000:
        return tag
    if src not in generated:
        with Image.open(original) as image:
            image = ImageOps.exif_transpose(image)
            if image.width < 1100:
                return tag
            options = []
            for width in (640, 1024):
                name = original.stem + '-' + str(width) + '.webp'
                output = target / name
                resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                resized.save(output, 'WEBP', quality=85, method=5)
                options.append((output.relative_to(ROOT).as_posix(), width, output.stat().st_size))
            options.append((src, image.width, original.stat().st_size))
            generated[src] = options
    options = generated[src]
    srcset = ', '.join(f'{quote(file, safe="/")} {width}w' for file, width, _ in options)
    tag = re.sub(r'\s+srcset="[^"]*"|\s+sizes="[^"]*"', '', tag)
    # Panoramas span most of the viewport; editorial photos use half the desktop width.
    sizes = '(max-width: 768px) 100vw, 100vw' if 'panoram' in src.lower() else '(max-width: 768px) 100vw, 60vw'
    return tag[:-1] + f' srcset="{srcset}" sizes="{sizes}">'

html = re.sub(r'<img\b[^>]*>', enhance, html, flags=re.S)
(ROOT / 'index.html').write_text(html, encoding='utf-8')
report = {src: {'originalBytes': options[-1][2], 'mobileBytes': options[0][2], 'variants': [o[0] for o in options[:-1]]} for src, options in generated.items()}
(ROOT / 'data/image-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(generated)} photographs prepared; originals retained.')
