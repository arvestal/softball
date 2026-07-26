const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const FULL_MAX_PX = 2000;
const THUMB_WIDTH_PX = 480;

// Sharp/libvips only — unlike scripts/generate-gallery-images.js this runs on Railway's Linux
// container at request time, so it can't shell out to macOS's sips/mdls. Some HEIC variants
// (multi-reference "portrait"/burst containers) will fail here; that's surfaced to the admin as
// an upload error asking them to export as JPEG instead, rather than failing silently.
async function processUpload(buffer, dataDir, slug) {
  const fullDir = path.join(dataDir, 'full');
  const thumbDir = path.join(dataDir, 'thumb');
  fs.mkdirSync(fullDir, { recursive: true });
  fs.mkdirSync(thumbDir, { recursive: true });

  const image = sharp(buffer).rotate();

  await image.clone()
    .resize({ width: FULL_MAX_PX, height: FULL_MAX_PX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(fullDir, `${slug}.webp`));

  await image.clone()
    .resize({ width: THUMB_WIDTH_PX, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(thumbDir, `${slug}.webp`));
}

module.exports = { processUpload };
