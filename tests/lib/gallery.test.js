const { buildGalleryPhotos } = require('../../src/lib/gallery');

describe('buildGalleryPhotos', () => {
  it('joins manifest entries with their alt text and builds thumb/full URLs', () => {
    const manifest = [
      { slug: 'tacoma-001', source: 'IMG_0001.jpeg', date: '2020-01-01T00:00:00.000Z' },
      { slug: 'tacoma-002', source: 'IMG_0002.jpeg', date: '2020-01-02T00:00:00.000Z' },
    ];
    const photos = [
      { slug: 'tacoma-001', alt: 'First photo' },
      { slug: 'tacoma-002', alt: 'Second photo' },
    ];

    expect(buildGalleryPhotos(manifest, photos)).toEqual([
      {
        slug: 'tacoma-001',
        thumb: '/img/gallery/thumb/tacoma-001.webp',
        full: '/img/gallery/full/tacoma-001.webp',
        alt: 'First photo',
      },
      {
        slug: 'tacoma-002',
        thumb: '/img/gallery/thumb/tacoma-002.webp',
        full: '/img/gallery/full/tacoma-002.webp',
        alt: 'Second photo',
      },
    ]);
  });

  it('falls back to an empty string when a manifest entry has no matching alt text', () => {
    const manifest = [{ slug: 'tacoma-003', source: 'IMG_0003.jpeg', date: '2020-01-03T00:00:00.000Z' }];
    expect(buildGalleryPhotos(manifest, [])).toEqual([
      { slug: 'tacoma-003', thumb: '/img/gallery/thumb/tacoma-003.webp', full: '/img/gallery/full/tacoma-003.webp', alt: '' },
    ]);
  });
});
