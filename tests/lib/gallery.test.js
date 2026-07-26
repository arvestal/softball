const { buildGalleryPhotos } = require('../../src/lib/gallery');

describe('buildGalleryPhotos', () => {
  it('builds thumb/full URLs for each photo, preserving order and alt text', () => {
    const photos = [
      { slug: 'tacoma-001', source: 'IMG_0001.jpeg', date: '2020-01-01T00:00:00.000Z', alt: 'First photo' },
      { slug: 'tacoma-002', source: 'IMG_0002.jpeg', date: '2020-01-02T00:00:00.000Z', alt: 'Second photo' },
    ];

    expect(buildGalleryPhotos(photos)).toEqual([
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

  it('falls back to an empty string when a photo has no alt text', () => {
    const photos = [{ slug: 'tacoma-003', source: 'IMG_0003.jpeg', date: '2020-01-03T00:00:00.000Z' }];
    expect(buildGalleryPhotos(photos)).toEqual([
      { slug: 'tacoma-003', thumb: '/img/gallery/thumb/tacoma-003.webp', full: '/img/gallery/full/tacoma-003.webp', alt: '' },
    ]);
  });
});
