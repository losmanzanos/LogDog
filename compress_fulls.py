"""
Log Dog Timberworks — Full Image Compressor
Run this from the root of your LogDog repo BEFORE pushing to GitHub:
  python3 compress_fulls.py

This resizes and compresses the full-size images in images/large, images/medium,
and images/small to a max of 1800px wide — plenty sharp on any screen, but a
fraction of the original iPhone file size. It overwrites in place (backs up originals
to a _originals/ subfolder first so nothing is lost).
"""

from PIL import Image, ImageOps
import os, shutil

FOLDERS = ['images/large', 'images/medium', 'images/small']
MAX_WIDTH = 1800   # px — sharp on retina screens, fast to load
QUALITY = 82       # JPEG quality — visually lossless at this size

for folder in FOLDERS:
    backup_dir = os.path.join(folder, '_originals')
    os.makedirs(backup_dir, exist_ok=True)

    for filename in sorted(os.listdir(folder)):
        if not filename.lower().endswith(('.jpg', '.jpeg')):
            continue

        src_path = os.path.join(folder, filename)
        backup_path = os.path.join(backup_dir, filename)

        # Back up original if not already done
        if not os.path.exists(backup_path):
            shutil.copy2(src_path, backup_path)

        with Image.open(src_path) as img:
            # Preserve EXIF orientation
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            # Only downsize if larger than MAX_WIDTH
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_size = (MAX_WIDTH, int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)

            img.convert('RGB').save(src_path, 'JPEG', quality=QUALITY, optimize=True)

        orig_kb = os.path.getsize(backup_path) // 1024
        new_kb = os.path.getsize(src_path) // 1024
        print(f'{folder}/{filename}: {orig_kb}KB → {new_kb}KB')

print('\nDone! Originals saved in _originals/ subfolders.')
print('Run generate_thumbs.py after this if you haven\'t already.')
