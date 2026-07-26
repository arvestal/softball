const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('renders the landing page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('View softball stats');
  });

  it('header nav links Season to the most recent Summer', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('href="/softball/summer18">Season</a>');
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
});

describe('GET /sitemap.xml', () => {
  it('lists static and per-season softball pages', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/xml');
    expect(res.text).toContain('<loc>https://allenvestal.com/about</loc>');
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
});

describe('GET /softball/postseason', () => {
  it('renders the postseason stats and derived game log, with Postseason selected in the picker', async () => {
    const res = await request(app).get('/softball/postseason');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<option value="\/softball\/postseason" selected>Postseason<\/option>/);
  });
});

describe('GET /softball/:season', () => {
  it('renders a known season with its stats and schedule', async () => {
    const res = await request(app).get('/softball/fall19');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Fall 2019');
    expect(res.text).toContain('League Champs!');
  });

  it('shows a season picker with every Fall year, the current one selected', async () => {
    const res = await request(app).get('/softball/fall19');
    expect(res.text).toContain('<option value="/softball/fall14">Fall 2014</option>');
    expect(res.text).toMatch(/<option value="\/softball\/fall19" selected>Fall 2019<\/option>/);
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
