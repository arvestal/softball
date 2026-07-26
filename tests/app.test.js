const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const app = require('../src/app');
const { writePhotos } = require('../src/lib/gallery-store');

const originalGalleryDataDir = process.env.GALLERY_DATA_DIR;

beforeAll(() => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-fixture-'));
  writePhotos(dataDir, [
    { slug: 'tacoma-001', source: 'IMG_0001.jpeg', alt: 'A test photo', date: '2020-01-01T00:00:00.000Z' },
  ]);
  process.env.GALLERY_DATA_DIR = dataDir;
});

afterAll(() => {
  if (originalGalleryDataDir === undefined) delete process.env.GALLERY_DATA_DIR;
  else process.env.GALLERY_DATA_DIR = originalGalleryDataDir;
});

describe('GET /', () => {
  it('renders the landing page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('View softball stats');
  });

  it('falls back to a "dev" cache-busting version when RAILWAY_GIT_COMMIT_SHA is unset', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('/css/main.css?v=dev');
  });

  it('includes an og:image for link previews', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('<meta property="og:image" content="https://allenvestal.com/img/og-preview.png">');
    expect(res.text).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it('header nav has one link per season type, pointing at its most recent year', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('href="/softball/summer18">Summer</a>');
    expect(res.text).toContain('href="/softball/fall19">Fall</a>');
    expect(res.text).toContain('href="/softball/winter20">Winter</a>');
    expect(res.text).toContain('href="/softball/spring19">Spring</a>');
  });
});

describe('GET /about', () => {
  it('renders the about page', async () => {
    const res = await request(app).get('/about');
    expect(res.status).toBe(200);
    expect(res.text).toContain('About');
  });
});

describe('GET /contact', () => {
  it('renders the contact page', async () => {
    const res = await request(app).get('/contact');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Contact');
  });

  it('lists all social links including GitHub as an icon', async () => {
    const res = await request(app).get('/contact');
    expect(res.text).toContain('aria-label="GitHub"');
    expect(res.text).toContain('href="https://github.com/arvestal"');
  });
});

describe('GET /gallery', () => {
  it('renders the gallery grid with thumb/full links and alt text for every photo', async () => {
    const res = await request(app).get('/gallery');
    expect(res.status).toBe(200);
    expect(res.text).toContain('gallery-grid');
    expect(res.text).toContain('/img/gallery/thumb/tacoma-001.webp');
    expect(res.text).toContain('/img/gallery/full/tacoma-001.webp');
  });

  it('has a nav link to the gallery page', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('href="/gallery">Gallery</a>');
  });
});

describe('GET /sitemap.xml', () => {
  it('lists static and per-season softball pages', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/xml');
    expect(res.text).toContain('<loc>https://allenvestal.com/about</loc>');
    expect(res.text).toContain('<loc>https://allenvestal.com/gallery</loc>');
    expect(res.text).toContain('<loc>https://allenvestal.com/softball/fall19</loc>');
  });
});

describe('www redirect', () => {
  it('redirects www.allenvestal.com to the bare domain', async () => {
    const res = await request(app).get('/softball').set('Host', 'www.allenvestal.com');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('https://allenvestal.com/softball');
  });

  it('does not redirect other hosts', async () => {
    const res = await request(app).get('/').set('Host', 'allenvestal.com');
    expect(res.status).toBe(200);
  });
});

describe('GET /health', () => {
  it('reports ok for the Railway healthcheck', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /softball', () => {
  it('renders career totals, sorted by AVG descending, plus the full game log', async () => {
    const res = await request(app).get('/softball');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Career:');
  });

  it('has a unique meta description mentioning the career record', async () => {
    const res = await request(app).get('/softball');
    expect(res.text).toContain('name="description" content="Allen Vestal&#x27;s career softball stats across');
  });

  it('renders a championship banner for each season that won it all', async () => {
    const res = await request(app).get('/softball');
    expect(res.text).toContain('Total Championships: 6');
    expect(res.text).toContain('career-banner');
    expect(res.text).toContain('Winter 2017');
    expect(res.text).toContain('Fall 2017');
    expect(res.text).toContain('Winter 2018');
    expect(res.text).toContain('Summer 2018');
    expect(res.text).toContain('Fall 2019');
    expect(res.text).toContain('Winter 2020');
  });
});

describe('GET /softball/postseason', () => {
  it('renders the postseason stats and derived game log with no season tabs, like career', async () => {
    const res = await request(app).get('/softball/postseason');
    expect(res.status).toBe(200);
    expect(res.text).toContain('PostSeason:');
    expect(res.text).not.toContain('season-tabs');
  });
});

describe('GET /softball/:season', () => {
  it('renders a known season with its stats and schedule', async () => {
    const res = await request(app).get('/softball/fall19');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Fall 2019');
    expect(res.text).toContain('League Champs!');
  });

  it('shows a year tab per Fall season, with the current year active', async () => {
    const res = await request(app).get('/softball/fall19');
    expect(res.text).toContain('href="/softball/fall14"');
    expect(res.text).toMatch(/href="\/softball\/fall19" class="season-tab active"/);
  });

  it('does not show a championship banner for a season that did not win it all', async () => {
    const res = await request(app).get('/softball/spring17');
    expect(res.status).toBe(200);
    expect(res.text).not.toContain('League Champs!');
  });

  it('404s for an unknown season key', async () => {
    const res = await request(app).get('/softball/notaseason');
    expect(res.status).toBe(404);
    expect(res.text).toContain('Season Not Found');
  });
});

describe('unmatched routes', () => {
  it('404s with the generic error page', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.text).toContain('Page Not Found');
  });
});

describe('static assets', () => {
  it('serves the stylesheet from public/', async () => {
    const res = await request(app).get('/css/main.css');
    expect(res.status).toBe(200);
  });
});
