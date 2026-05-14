#!/usr/bin/env python3
"""
North IT — extracteur d'images base64
Utilisation : python extract_base64_images.py .
"""

import re, base64, os, sys, hashlib
from pathlib import Path
from io import BytesIO
from PIL import Image

def b64_to_webp(b64_data, dest_path, max_width=800):
    try:
        raw = base64.b64decode(b64_data)
        img = Image.open(BytesIO(raw)).convert("RGBA")
        if img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
        is_photo = img.width * img.height > 20000
        img.save(dest_path, "WEBP",
                 quality=85 if is_photo else 100,
                 lossless=not is_photo,
                 method=6)
        return True
    except Exception as e:
        print(f"  Echec conversion {dest_path.name}: {e}")
        return False

def process_html(html_path, img_dir):
    html = html_path.read_text(encoding="utf-8")
    pattern = re.compile(
        r'(src|srcset)="data:image/(\w+);base64,([A-Za-z0-9+/=]+)"',
        re.DOTALL
    )
    count = 0
    img_dir.mkdir(parents=True, exist_ok=True)

    def replace_match(m):
        nonlocal count
        attr, fmt, data = m.group(1), m.group(2), m.group(3)
        short_hash = hashlib.md5(data[:64].encode()).hexdigest()[:8]
        stem = html_path.stem
        fname = f"{stem}_{count:02d}_{short_hash}.webp"
        dest = img_dir / fname
        rel_path = os.path.relpath(dest, html_path.parent).replace("\\", "/")
        if not dest.exists():
            if b64_to_webp(data, dest):
                orig_kb = len(data) * 3 / 4 / 1024
                new_kb = dest.stat().st_size / 1024
                saving = 100 - (new_kb / orig_kb * 100) if orig_kb > 0 else 0
                print(f"  OK  {fname}  {orig_kb:.0f} Ko -> {new_kb:.0f} Ko  (-{saving:.0f}%)")
                count += 1
                return f'{attr}="{rel_path}"'
            else:
                return m.group(0)
        else:
            count += 1
            return f'{attr}="{rel_path}"'

    new_html = pattern.sub(replace_match, html)
    return new_html, count

def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    html_files = [f for f in root.glob("*.html")]

    if not html_files:
        print("Aucun fichier .html trouve dans", root)
        sys.exit(1)

    img_dir = root / "images"
    total = 0

    print(f"\n{len(html_files)} fichier(s) HTML trouves\n")

    for html_path in sorted(html_files):
        print(f"Traitement : {html_path.name}")
        new_html, n = process_html(html_path, img_dir)
        if n > 0:
            backup = html_path.with_suffix(".html.bak")
            if not backup.exists():
                backup.write_bytes(html_path.read_bytes())
                print(f"  Backup -> {backup.name}")
            html_path.write_text(new_html, encoding="utf-8")
            total += n
        else:
            print("  Aucune image base64 detectee")
        print()

    print(f"Termine : {total} image(s) extraite(s) dans le dossier images/")
    print("Verifiez visuellement le site, puis supprimez les .bak si tout est OK.")

if __name__ == "__main__":
    main()
