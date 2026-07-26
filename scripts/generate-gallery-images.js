// Reads raw photos from tacoma/ (gitignored source, not committed — ~250 phone photos average
// several MB each), converts and resizes them into public/img/gallery/{full,thumb}/*.webp, and
// writes data/gallery/manifest.json (slug + original filename + capture date). Re-run and commit
// the diff if photos are added to or removed from tacoma/.
//
// macOS-only: shells out to `sips` (HEIC-in-.jpeg-clothing files exceed libvips' HEIF reference
// limit and sharp can't decode them directly) and `mdls` (reads the real EXIF capture date —
// file mtimes reflect when photos were copied onto this machine, not when they were taken).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, '../tacoma');
const GALLERY_DIR = path.join(__dirname, '../public/img/gallery');
const FULL_DIR = path.join(GALLERY_DIR, 'full');
const THUMB_DIR = path.join(GALLERY_DIR, 'thumb');
const MANIFEST_FILE = path.join(__dirname, '../data/gallery/manifest.json');

const FULL_MAX_PX = 2000;
const THUMB_WIDTH_PX = 480;

function captureDate(file) {
  try {
    const out = execFileSync('mdls', ['-name', 'kMDItemContentCreationDate', '-raw', file], { encoding: 'utf8' });
    const d = new Date(out.trim());
    if (!Number.isNaN(d.getTime())) return d;
  } catch {
    // fall through to mtime below
  }
  return fs.statSync(file).mtime;
}

function normalizeToJpeg(file, tmpDir) {
  const out = path.join(tmpDir, `${path.basename(file, path.extname(file))}.jpg`);
  execFileSync('sips', ['-s', 'format', 'jpeg', file, '--out', out], { stdio: 'ignore' });
  return out;
}

async function convertOne(sourceFile, slug, tmpDir) {
  const normalized = normalizeToJpeg(sourceFile, tmpDir);
  const image = sharp(normalized).rotate();

  await image.clone()
    .resize({ width: FULL_MAX_PX, height: FULL_MAX_PX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(FULL_DIR, `${slug}.webp`));

  await image.clone()
    .resize({ width: THUMB_WIDTH_PX, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(THUMB_DIR, `${slug}.webp`));
}

async function main(sourceDir = SOURCE_DIR) {
  fs.mkdirSync(FULL_DIR, { recursive: true });
  fs.mkdirSync(THUMB_DIR, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-'));

  const files = fs.readdirSync(sourceDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const withDates = files
    .map((f) => ({ file: path.join(sourceDir, f), name: f, date: captureDate(path.join(sourceDir, f)) }))
    .sort((a, b) => a.date - b.date);

  const manifest = [];
  for (let i = 0; i < withDates.length; i++) {
    const { file, name, date } = withDates[i];
    const slug = `tacoma-${String(i + 1).padStart(3, '0')}`;
    await convertOne(file, slug, tmpDir);
    manifest.push({ slug, source: name, date: date.toISOString() });
    console.log(`[${i + 1}/${withDates.length}] ${slug} <- ${name}`);
  }

  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
  fs.writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${manifest.length} photos to ${GALLERY_DIR}`);
  console.log(`Wrote manifest to ${MANIFEST_FILE}`);

  return manifest;
}

/* istanbul ignore if -- exercised by running the script, not by tests */
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { captureDate, normalizeToJpeg, main };
