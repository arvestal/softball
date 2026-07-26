const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  resolveDataDir, listPhotos, writePhotos, nextSlug, addPhoto, updatePhotoAlt, deletePhoto,
} = require('../../src/lib/gallery-store');

describe('resolveDataDir', () => {
  const original = process.env.GALLERY_DATA_DIR;

  afterEach(() => {
    if (original === undefined) delete process.env.GALLERY_DATA_DIR;
    else process.env.GALLERY_DATA_DIR = original;
  });

  it('uses GALLERY_DATA_DIR when set', () => {
    process.env.GALLERY_DATA_DIR = '/data/gallery';
    expect(resolveDataDir()).toBe('/data/gallery');
  });

  it('falls back to a local .gallery-data folder when unset', () => {
    delete process.env.GALLERY_DATA_DIR;
    expect(resolveDataDir()).toContain('.gallery-data');
  });
});

describe('listPhotos', () => {
  let dataDir;

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-store-'));
  });

  it('returns an empty array when photos.json does not exist yet', () => {
    expect(listPhotos(dataDir)).toEqual([]);
  });

  it('returns the parsed contents when photos.json exists', () => {
    writePhotos(dataDir, [{ slug: 'tacoma-001', source: 'a.jpg', alt: 'A', date: '2020-01-01T00:00:00.000Z' }]);
    expect(listPhotos(dataDir)).toEqual([{ slug: 'tacoma-001', source: 'a.jpg', alt: 'A', date: '2020-01-01T00:00:00.000Z' }]);
  });
});

describe('nextSlug', () => {
  it('returns tacoma-001 for an empty list', () => {
    expect(nextSlug([])).toBe('tacoma-001');
  });

  it('continues from the highest existing numeric suffix', () => {
    const photos = [{ slug: 'tacoma-003' }, { slug: 'tacoma-001' }, { slug: 'tacoma-250' }];
    expect(nextSlug(photos)).toBe('tacoma-251');
  });

  it('ignores slugs that do not match the tacoma-NNN pattern', () => {
    expect(nextSlug([{ slug: 'not-a-tacoma-slug' }])).toBe('tacoma-001');
  });
});

describe('addPhoto / updatePhotoAlt / deletePhoto', () => {
  let dataDir;

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-store-'));
  });

  it('appends a new photo with the next slug and current date', () => {
    const entry = addPhoto(dataDir, { source: 'new.jpg', alt: 'A new photo' });
    expect(entry.slug).toBe('tacoma-001');
    expect(entry.source).toBe('new.jpg');
    expect(entry.alt).toBe('A new photo');
    expect(typeof entry.date).toBe('string');
    expect(listPhotos(dataDir)).toEqual([entry]);
  });

  it('updates the alt text for a matching slug and leaves others untouched', () => {
    writePhotos(dataDir, [
      { slug: 'tacoma-001', source: 'a.jpg', alt: 'old', date: '2020-01-01T00:00:00.000Z' },
      { slug: 'tacoma-002', source: 'b.jpg', alt: 'unchanged', date: '2020-01-02T00:00:00.000Z' },
    ]);

    const updated = updatePhotoAlt(dataDir, 'tacoma-001', 'new alt text');
    expect(updated.alt).toBe('new alt text');
    expect(listPhotos(dataDir)).toEqual([
      { slug: 'tacoma-001', source: 'a.jpg', alt: 'new alt text', date: '2020-01-01T00:00:00.000Z' },
      { slug: 'tacoma-002', source: 'b.jpg', alt: 'unchanged', date: '2020-01-02T00:00:00.000Z' },
    ]);
  });

  it('returns null from updatePhotoAlt when the slug does not exist', () => {
    writePhotos(dataDir, [{ slug: 'tacoma-001', source: 'a.jpg', alt: 'old', date: '2020-01-01T00:00:00.000Z' }]);
    expect(updatePhotoAlt(dataDir, 'tacoma-999', 'x')).toBeNull();
  });

  it('removes a photo entry and its image files', () => {
    writePhotos(dataDir, [{ slug: 'tacoma-001', source: 'a.jpg', alt: 'A', date: '2020-01-01T00:00:00.000Z' }]);
    fs.mkdirSync(path.join(dataDir, 'full'), { recursive: true });
    fs.mkdirSync(path.join(dataDir, 'thumb'), { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'full/tacoma-001.webp'), 'x');
    fs.writeFileSync(path.join(dataDir, 'thumb/tacoma-001.webp'), 'x');

    deletePhoto(dataDir, 'tacoma-001');

    expect(listPhotos(dataDir)).toEqual([]);
    expect(fs.existsSync(path.join(dataDir, 'full/tacoma-001.webp'))).toBe(false);
    expect(fs.existsSync(path.join(dataDir, 'thumb/tacoma-001.webp'))).toBe(false);
  });

  it('does not error when deleting a photo whose image files are already missing', () => {
    writePhotos(dataDir, [{ slug: 'tacoma-001', source: 'a.jpg', alt: 'A', date: '2020-01-01T00:00:00.000Z' }]);
    expect(() => deletePhoto(dataDir, 'tacoma-001')).not.toThrow();
    expect(listPhotos(dataDir)).toEqual([]);
  });
});
