const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const { processUpload } = require('../../src/lib/gallery-upload');

describe('processUpload', () => {
  let dataDir;

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-upload-'));
  });

  it('writes a full and thumb WebP, downscaling the thumb but not enlarging the full image', async () => {
    const input = await sharp({
      create: {
        width: 600, height: 400, channels: 3, background: { r: 200, g: 50, b: 50 },
      },
    }).jpeg().toBuffer();

    await processUpload(input, dataDir, 'tacoma-test');

    const fullMeta = await sharp(path.join(dataDir, 'full/tacoma-test.webp')).metadata();
    const thumbMeta = await sharp(path.join(dataDir, 'thumb/tacoma-test.webp')).metadata();

    expect(fullMeta.format).toBe('webp');
    expect(fullMeta.width).toBe(600);
    expect(fullMeta.height).toBe(400);

    expect(thumbMeta.format).toBe('webp');
    expect(thumbMeta.width).toBe(480);
    expect(thumbMeta.height).toBe(320);
  });

  it('rejects when the buffer is not a decodable image', async () => {
    await expect(processUpload(Buffer.from('not an image'), dataDir, 'tacoma-bad')).rejects.toThrow();
  });
});
