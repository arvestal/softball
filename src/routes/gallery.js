const express = require('express');
const router = express.Router();

const { resolveDataDir, listPhotos } = require('../lib/gallery-store');
const { buildGalleryPhotos } = require('../lib/gallery');

router.get('/', (req, res) => {
  const galleryPhotos = buildGalleryPhotos(listPhotos(resolveDataDir()));

  res.render('gallery', {
    pageTitle: 'Gallery',
    metaDescription: `${galleryPhotos.length} photos from building out and overlanding in the Tacoma — camp kitchen build, rooftop tent, trail runs, and more.`,
    photos: galleryPhotos,
  });
});

module.exports = router;
