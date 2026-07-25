# allenvestal.com

Allen Vestal's personal site — currently a softball stats section, with more hobbies
(overlanding, CNC, 3D printing) planned. Node/Express + Handlebars, deployed on Railway.

Softball stats come from GameChanger CSV exports (`data/gc_files/`), parsed once by
`scripts/generate-stats.js` into a committed static data module (`data/softball/seasons.js`) —
the server never parses CSVs at runtime.

## Development

```
npm install
npm run dev          # nodemon, http://localhost:8080
npm run lint
npm test              # jest, 100% coverage required on src/lib, src/routes, src/app.js
npm run build:stats   # regenerate data/softball/seasons.js from data/gc_files/*.csv
```
