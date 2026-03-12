"""
Log Dog Timberworks — Thumbnail Generator
Run this from the root of your LogDog repo:
  python3 generate_thumbs.py

It will create thumbs/ subfolders inside images/large, images/medium, images/small
and write a compressed 800px-wide JPEG for each photo.
"""

from PIL import Image
import os

FOLDERS = ['images/large', 'images/medium', 'images/small']
THUMB_WIDTH = 800   # px wide — plenty sharp for the grid, tiny file size
QUALITY = 75        # JPEG quality — good balance of size vs clarity

for folder in FOLDERS:
    thumbs_dir = os.path.join(folder, 'thumbs')
    os.makedirs(thumbs_dir, exist_ok=True)

    for filename in sorted(os.listdir(folder)):
        if not filename.lower().endswith(('.jpg', '.jpeg')):
            continue

        src_path = os.path.join(folder, filename)
        dst_path = os.path.join(thumbs_dir, filename)

        with Image.open(src_path) as img:
            # Preserve orientation from EXIF
            try:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            # Resize to THUMB_WIDTH wide, maintain aspect ratio
            ratio = THUMB_WIDTH / img.width
            new_size = (THUMB_WIDTH, int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
            img.convert('RGB').save(dst_path, 'JPEG', quality=QUALITY, optimize=True)

        src_kb = os.path.getsize(src_path) // 1024
        dst_kb = os.path.getsize(dst_path) // 1024
        print(f'{filename}: {src_kb}KB → {dst_kb}KB')

print('\nDone! Thumbnails written to thumbs/ inside each folder.')
