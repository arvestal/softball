const fs = require('fs');
const path = require('path');

// Railway mounts the persistent volume at /data in production (GALLERY_DATA_DIR=/data/gallery).
// Locally this defaults to a gitignored folder so admin features work without a real volume.
function resolveDataDir() {
  return process.env.GALLERY_DATA_DIR || path.join(__dirname, '../../.gallery-data');
}

function photosFile(dataDir) {
  return path.join(dataDir, 'photos.json');
}

// Returns [] if photos.json doesn't exist yet (fresh volume, nothing migrated/uploaded).
function listPhotos(dataDir) {
  const file = photosFile(dataDir);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writePhotos(dataDir, photos) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(photosFile(dataDir), `${JSON.stringify(photos, null, 2)}\n`);
}

// tacoma-001, tacoma-002, ... continuing from the highest existing numeric suffix.
function nextSlug(photos) {
  const max = photos.reduce((highest, p) => {
    const match = /^tacoma-(\d+)$/.exec(p.slug);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `tacoma-${String(max + 1).padStart(3, '0')}`;
}

function addPhoto(dataDir, { source, alt }) {
  const photos = listPhotos(dataDir);
  const slug = nextSlug(photos);
  const entry = { slug, source, alt, date: new Date().toISOString() };
  writePhotos(dataDir, [...photos, entry]);
  return entry;
}

function updatePhotoAlt(dataDir, slug, alt) {
  const photos = listPhotos(dataDir);
  const updated = photos.map((p) => (p.slug === slug ? { ...p, alt } : p));
  writePhotos(dataDir, updated);
  return updated.find((p) => p.slug === slug) || null;
}

function deletePhoto(dataDir, slug) {
  const photos = listPhotos(dataDir);
  const remaining = photos.filter((p) => p.slug !== slug);
  writePhotos(dataDir, remaining);

  [`full/${slug}.webp`, `thumb/${slug}.webp`].forEach((rel) => {
    const file = path.join(dataDir, rel);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
}

module.exports = {
  resolveDataDir, listPhotos, writePhotos, nextSlug, addPhoto, updatePhotoAlt, deletePhoto,
};
