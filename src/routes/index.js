const express = require('express');
const router = express.Router();

const { SEASON_ORDER } = require('../../data/softball/standings');

router.get('/', (req, res) => {
  res.render('home', {
    metaDescription: 'Allen Vestal’s personal site — softball stats and other hobbies.',
  });
});

router.get('/about', (req, res) => {
  res.render('about', {
    pageTitle: 'About',
    metaDescription: 'About Allen Vestal — GD men’s softball league stats, overlanding, CNC, and 3D printing.',
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    pageTitle: 'Contact',
    metaDescription: 'Get in touch with Allen Vestal.',
  });
});

router.get('/sitemap.xml', (req, res) => {
  const base = 'https://allenvestal.com';
  const today = new Date().toISOString().split('T')[0];
  const paths = [
    '/', '/about', '/contact', '/softball', '/softball/postseason',
    ...SEASON_ORDER.map((key) => `/softball/${key}`),
  ];
  const urls = paths.map((path) => `
  <url><loc>${base}${path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`).join('');
  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

module.exports = router;
