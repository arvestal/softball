const express = require('express');
const router = express.Router();

const manifest = require('../../data/gallery/manifest.json');
const photos = require('../../data/gallery/photos');
const { buildGalleryPhotos } = require('../lib/gallery');

router.get('/', (req, res) => {
  const galleryPhotos = buildGalleryPhotos(manifest, photos);

  res.render('gallery', {
    pageTitle: 'Gallery',
    metaDescription: `${galleryPhotos.length} photos from building out and overlanding in the Tacoma — camp kitchen build, rooftop tent, trail runs, and more.`,
    photos: galleryPhotos,
  });
});

module.exports = router;
