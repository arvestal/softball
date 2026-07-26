// Maps the volume-backed photos.json entries (see src/lib/gallery-store.js) into the shape the
// gallery view needs. photos.json is the single source of truth (slug, source, alt, date) —
// there's no separate manifest to join against once the admin panel owns this data.
function buildGalleryPhotos(photos) {
  return photos.map((p) => ({
    slug: p.slug,
    thumb: `/img/gallery/thumb/${p.slug}.webp`,
    full: `/img/gallery/full/${p.slug}.webp`,
    alt: p.alt || '',
  }));
}

module.exports = { buildGalleryPhotos };
