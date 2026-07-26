# allenvestal.com

Allen Vestal's personal site, live at [allenvestal.com](https://allenvestal.com) — currently a
softball stats section, with more hobbies (overlanding, CNC, 3D printing) planned. Node/Express +
Handlebars.

## Structure

- `/` — landing page; `/about`, `/contact` — general site pages
- `/softball` — career stats + full game log
- `/softball/postseason` — all-time postseason stats + derived game log
- `/softball/:season` — a single season's stats + schedule (e.g. `/softball/fall19`)
- `/health` — Railway healthcheck; `/sitemap.xml` — for search engines

Softball stats come from GameChanger CSV exports (`data/gc_files/`), parsed once by
`scripts/generate-stats.js` into a committed static data module (`data/softball/seasons.js`) —
the server never parses CSVs at runtime. Standings/schedule data lives in
`data/softball/standings.js`.

## Deployment

Hosted on Railway, auto-deploying from `master`. DNS is managed on Cloudflare.

## Development

```
npm install
npm run dev          # nodemon, http://localhost:8080
npm run lint
npm test              # jest, 100% coverage required on src/lib, src/routes, src/app.js
npm run build:stats   # regenerate data/softball/seasons.js from data/gc_files/*.csv
```
