const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('renders the landing page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('View softball stats');
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
  it('renders the postseason stats and derived game log', async () => {
    const res = await request(app).get('/softball/postseason');
    expect(res.status).toBe(200);
    expect(res.text).toContain('PostSeason:');
  });
});

describe('GET /softball/:season', () => {
  it('renders a known season with its stats and schedule', async () => {
    const res = await request(app).get('/softball/fall19');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Fall 2019');
    expect(res.text).toContain('League Champs!');
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
