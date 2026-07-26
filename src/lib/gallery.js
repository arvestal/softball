// Merges the generated manifest (slug, source filename, capture date — see
// scripts/generate-gallery-images.js) with the hand-authored alt text (data/gallery/photos.js)
// into the shape the gallery view needs.
function buildGalleryPhotos(manifest, photos) {
  const altBySlug = new Map(photos.map((p) => [p.slug, p.alt]));

  return manifest.map((entry) => ({
    slug: entry.slug,
    thumb: `/img/gallery/thumb/${entry.slug}.webp`,
    full: `/img/gallery/full/${entry.slug}.webp`,
    alt: altBySlug.get(entry.slug) || '',
  }));
}

module.exports = { buildGalleryPhotos };
