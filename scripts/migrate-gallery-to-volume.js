// One-off migration: merges the currently-committed data/gallery/manifest.json +
// data/gallery/photos.js into a single photos.json on the volume-backed GALLERY_DATA_DIR, and
// copies public/img/gallery/{full,thumb}/*.webp there too. Run this once against the deployed
// volume, verify /gallery and /admin both serve correctly from it, then delete this script and
// remove public/img/gallery/* + data/gallery/{manifest.json,photos.js} from git.
const fs = require('fs');
const path = require('path');

const manifest = require('../data/gallery/manifest.json');
const photos = require('../data/gallery/photos');
const { resolveDataDir, writePhotos, listPhotos } = require('../src/lib/gallery-store');

function buildMergedPhotos() {
  const altBySlug = new Map(photos.map((p) => [p.slug, p.alt]));
  return manifest.map((m) => ({
    slug: m.slug, source: m.source, date: m.date, alt: altBySlug.get(m.slug) || '',
  }));
}

function copyImages(dataDir) {
  const publicDir = path.join(__dirname, '../public/img/gallery');
  ['full', 'thumb'].forEach((sub) => {
    const srcDir = path.join(publicDir, sub);
    const destDir = path.join(dataDir, sub);
    fs.mkdirSync(destDir, { recursive: true });
    fs.readdirSync(srcDir).forEach((file) => {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    });
  });
}

function main(dataDir = resolveDataDir()) {
  const existing = listPhotos(dataDir);
  if (existing.length > 0) {
    console.log(`${dataDir}/photos.json already has ${existing.length} entries — skipping. Delete it first to re-migrate.`);
    return existing;
  }

  const merged = buildMergedPhotos();
  copyImages(dataDir);
  writePhotos(dataDir, merged);
  console.log(`Migrated ${merged.length} photos to ${dataDir}`);
  return merged;
}

/* istanbul ignore if -- exercised by running the script, not by tests */
if (require.main === module) {
  main();
}

module.exports = { buildMergedPhotos, main };
