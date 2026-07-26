# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

# allenvestal.com — Project Context

Allen Vestal's personal site, live at [allenvestal.com](https://allenvestal.com). Node.js +
Express, Handlebars views, no database — softball stats plus a photo gallery (`/gallery`) of the
overlanding-build Tacoma, with more hobbies (CNC, 3D printing, woodworking) and eventually
software/website design planned as the site grows into a portfolio for `vestal.services` LLC
(not registered yet as of 2026-07-26). Deployed on Railway, DNS on Cloudflare.

This repo was refactored (2026-07) from an AngularJS 1.x/ng-grid SPA with a runtime-CSV-parsing
Express API into the current server-rendered form. It's also the source, alongside
[playoff-fantasy](https://github.com/arvestal/playoff-fantasy), for the
[website-starter](https://github.com/arvestal/website-starter) template repo — if a convention
here turns out to be wrong or improves, consider porting the fix there too.

## Commands

```bash
npm run dev          # nodemon, http://localhost:8080
npm run lint
npm test               # jest with coverage (100% lines/branches/functions/statements required
                        # on src/app.js, src/lib/**, src/routes/**, scripts/generate-stats.js)
npm run build:stats    # regenerate data/softball/seasons.js from data/gc_files/*.csv
npm run build:gallery  # regenerate public/img/gallery/* + data/gallery/manifest.json from tacoma/
                        # (macOS-only — see Gallery pipeline below)
```

## Architecture map

- `src/app.js` — entry point: Handlebars engine + helpers, static files, `/health`, www→root
  redirect, 404 handler. Exports `app` unconditionally; only calls `.listen()` when run directly
  (`require.main === module`), so `tests/app.test.js` can drive it with `supertest`.
- `src/lib/helpers.js` — Handlebars helpers (`number3`)
- `src/lib/nav.js` — season nav-group / year-tab data (`buildSeasonNavGroups`, `seasonsForLabel`)
- `src/lib/schedule.js` — per-game result (W/L/T/FFT), schedule display fields, championship-banner check
- `src/lib/stats.js` — stat table column config, AVG-desc sort, id-whitelist filter
- `src/routes/index.js` — `/`, `/about`, `/contact`, `/sitemap.xml`
- `src/routes/softball.js` — `/softball` (career), `/softball/postseason`, `/softball/:season`
- `src/routes/gallery.js` — `/gallery`; joins `data/gallery/manifest.json` with
  `data/gallery/photos.js` via `src/lib/gallery.js`'s `buildGalleryPhotos`
- `views/*.hbs` — Handlebars templates; `views/layouts/main.hbs` is the shared layout
- `data/gc_files/*.csv` — raw GameChanger season exports (source of truth for stats)
- `data/softball/seasons.js` — **generated**, committed. Per-season + career + postseason player
  stats. Produced by `scripts/generate-stats.js`; never hand-edited.
- `data/softball/standings.js` — **hand-authored**, committed. Win/loss/schedule data (not
  derivable from the CSVs) plus the two curated roster-id whitelists (`CAREER_PLAYER_IDS`,
  `POSTSEASON_PLAYER_IDS`) that limit which players show on the career/postseason tables.
- `data/gallery/manifest.json` — **generated**, committed. `{slug, source, date}` per photo, in
  chronological order. Produced by `scripts/generate-gallery-images.js`; never hand-edited.
- `data/gallery/photos.js` — **hand-authored**, committed. `{slug, alt}` pairs — alt text needs
  human/model judgment about image content, so it can't be generated. Must stay in sync 1:1 with
  `manifest.json`'s slugs (add/remove an entry here whenever the manifest gains or drops a photo).
- `public/img/gallery/{full,thumb}/*.webp` — **generated**, committed (~108MB total for 250
  photos as of 2026-07-26). Full images capped at 2000px on the long edge; thumbs at 480px wide.

## Data pipeline

Stats are static and don't change at runtime — no DB, no request-time CSV parsing, no cache
layer. `scripts/generate-stats.js` is a one-off script (`npm run build:stats`) that reads
`data/gc_files/*.csv`, computes per-season and aggregate (career/postseason) stats, and writes
`data/softball/seasons.js` as a plain committed JS module the app just `require()`s. Re-run and
commit the diff if the source CSVs change; the server never touches the CSVs directly.

**Column lookup**: every CSV export shares one 152-column header (offensive stats, then a
pitching/fielding block). Several names repeat in both blocks (`GP`, `H`, `BB`, `SO`, `R`, `HR`,
`TB`, `SB`, `CS`, `SB%`, `PIK`, `BABIP`, `LOB`, `GB%`) — the offensive occurrence always comes
first, so columns are located by name (`header.indexOf(name)`), never by hardcoded position. The
pre-refactor code used a hand-counted positional array with a hole-count mistake starting at the
`XBH` column, which silently shifted every field after it by one for years without anyone
noticing (the resulting numbers still looked plausible). Don't reintroduce a positional array.

**Per-season vs. aggregate rate stats**: per-season `AVG`/`OBP`/`SLG`/`OPS` are taken directly
from GameChanger's own columns (not recomputed), matching what the site has always shown for a
single season. Career/postseason aggregation sums counting stats across seasons and then
recomputes rate stats from those sums (`H/AB`, `(H+BB)/(AB+BB+SAC)`, etc.) — this intentionally
omits HBP, a pre-existing simplification from the original app that's preserved rather than
"fixed," so historical career numbers don't shift.

## Gallery pipeline

`tacoma/` at the repo root holds the raw source photos (gitignored — currently 250 phone photos,
~110MB after dropping exact/near-duplicates, way too large to commit as-is). `npm run
build:gallery` (`scripts/generate-gallery-images.js`) reads every photo in `tacoma/`, sorts by
real EXIF capture date (not file mtime — mtimes only reflect when photos were copied onto this
machine), converts each to WebP at two sizes, and writes `public/img/gallery/{full,thumb}/*.webp`
plus `data/gallery/manifest.json`. Re-run and commit the diff whenever photos are added to or
removed from `tacoma/`; the running server never touches `tacoma/` directly (it's not deployed —
only the generated `public/img/gallery/*` output is).

**macOS-only.** The script shells out to two system tools sharp/libvips can't replace:
`sips -s format jpeg` to normalize HEIC-in-`.jpeg`-clothing files (iPhone photos with many
auxiliary image references exceed libvips' HEIF security limit — `sharp` throws `"Security limit
exceeded: Number of references in iref box"` on them directly), and `mdls -name
kMDItemContentCreationDate` for the real capture date. Don't try to run this on Linux/CI without
swapping in cross-platform equivalents first.

**Alt text is hand-authored, not generated** (`data/gallery/photos.js`) — writing it requires
actually looking at each photo. When adding new photos: run `build:gallery` first, then view each
new thumb and add a `{slug, alt}` entry. Avoid describing anything personally identifying visible
in a shot (license plates, street addresses/house numbers) even if legible in the photo.

**Near-duplicate photos**: a straight file-hash dedupe won't catch burst shots (same scene,
slightly different framing/exposure) — this repo's first pass used a perceptual hash (dHash,
8x8 grayscale, Hamming distance ≤8) to cluster near-duplicates before generating anything, then
deleted the lower-quality file from each cluster directly out of `tacoma/`. Only 8 of the original
258 photos turned out to be true near-duplicates; most of a phone camera roll like this is
genuinely distinct shots, not bursts — don't assume heavy duplication without checking.

## Conventions

- **Git workflow: commit straight to `main`, no feature branches or PRs.** The project owner
  explicitly asked for this (2026-07-25) after several PRs — "it's just text content anyways."
  This reverses the branch+PR workflow used earlier in the same refactor; if they ever want it
  back for this repo, that instruction would need to be explicit again. Still run `npm run lint`
  and the full test suite (100% coverage gate) before every commit — only the branch/PR ceremony
  was relaxed, not the quality bar.
- Sortable stats tables (`public/js/sortable-table.js`) are vanilla JS, no build step, no
  framework — consistent with dropping AngularJS/ng-grid entirely rather than reaching for a new
  frontend framework.
- Season pages (`views/softball/season.hbs`) are one shared template for every regular season
  *and* postseason — season-specific data comes from the route, not from 25 near-duplicate
  templates (which is what the pre-refactor `public/partials/*.html` was).

## Known footguns / past bugs (don't reintroduce)

- A tracked `.DS_Store` used to break `git pull`/`git checkout` repeatedly ("local changes would
  be overwritten") because Finder keeps rewriting it. It's untracked now (`**/.DS_Store` in
  `.gitignore`) — if this ever recurs, `git rm --cached` it, don't just retry the pull.
- `railway redeploy` re-deploys whatever commit is *already built* — it does **not** pull a new
  commit after a push. To actually deploy new code: `railway service source connect --repo
  arvestal/allenvestal.com --branch main --service softball` (forces a fresh pull + build). Always
  confirm the deployed commit hash via `railway deployment list --json` rather than assuming a
  redeploy picked up the latest push.
  - **As of 2026-07-26 this footgun no longer applies day-to-day**: the `softball` service now has
    a GitHub push-to-`main` deploy trigger (Railway's `Service.repoTriggers`, added via the
    `deploymentTriggerCreate` GraphQL mutation — there's no CLI/dashboard shortcut for it), so
    ordinary pushes auto-deploy on their own, matching `playoff-fantasy`. The manual
    `source connect` trick above is now only needed if the trigger itself ever gets removed or
    stops firing. The trigger had been missing since the repo rename (`softball` →
    `allenvestal.com`) because Railway's GitHub App wasn't authorized on the renamed repo —
    `Service.repoTriggers` returned `[]` and `deploymentTriggerCreate` failed with "no one in the
    project has access to it" until repo access was re-granted at
    `github.com/settings/installations`.
- The custom domain's Railway-issued certificate got stuck in
  `CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP` for an extended period even with verified-correct
  DNS (likely from repeated delete/recreate churn tripping a Let's Encrypt rate limit). Fix used:
  proxy the apex through Cloudflare (matching `www`, which was already proxied) instead of
  waiting on or retrying Railway's cert — Cloudflare's own Universal SSL cert already covers the
  apex (its SAN list includes both the bare domain and `*.domain`), so this sidesteps Railway's
  stuck internal state entirely rather than fixing it. See `www`'s Cloudflare DNS record as the
  reference for how the apex should also be configured if this happens again.
- Railway's free plan allows only one custom domain per service — `www` can't be a second Railway
  custom domain. It's a Cloudflare Page Rule (`www.allenvestal.com/*` → `https://allenvestal.com/$1`,
  301) instead.
- `npm install`/`npm pull` can fail against a stale `package-lock.json` if it was generated on a
  machine with a now-defunct private registry configured (this repo's original lockfile pointed
  at a dead GoDaddy-internal Artifactory instance) — delete the lockfile and reinstall fresh
  rather than debugging registry auth for a registry that shouldn't be in the resolution path
  anymore.
- A CSS change can deploy successfully and still not show up for a returning visitor: Cloudflare
  stamps static assets like `/css/main.css` with a long browser `Cache-Control` (observed:
  `public, max-age=14400`, 4 hours) regardless of what Express sends, so a browser that already
  fetched the old CSS won't even re-check the server for up to 4 hours. Fixed by cache-busting the
  stylesheet URL with Railway's auto-injected `RAILWAY_GIT_COMMIT_SHA` (`src/app.js` sets
  `res.locals.assetVersion`, `views/layouts/main.hbs` appends it as `?v=...`) so every deploy gets
  a new URL. If a CSS/JS change ever looks like it "didn't take" after a successful deploy, hard
  refresh first before assuming the deploy failed.

## Local dev

```bash
npm install
npm run build:stats   # only needed if data/softball/seasons.js is missing/stale
npm run dev
```

No `.env` is required for local dev — the app has no external services to configure. `.env` in
this repo (gitignored) holds GoDaddy/Cloudflare/Railway API tokens used for *operating* the
deployed site (DNS, hosting), not runtime app config.

## Deployment

- Railway project **allen-vestal**, service **softball**, connected to `arvestal/allenvestal.com`
  (repo renamed from `softball` 2026-07-26) on `main` (renamed from `master` same day). Builds
  via Railpack (no Dockerfile — the repo intentionally has none; see the redeploy footgun above
  for how to force a fresh deploy after pushing).
- Custom domain `allenvestal.com` (apex, proxied through Cloudflare — see the stuck-cert footgun
  above for why). `www.allenvestal.com` redirects to the apex via a Cloudflare Page Rule.
- DNS is on Cloudflare (migrated from GoDaddy 2026-07-25); GoDaddy remains the registrar only.
- `/health` returns `200 {"status":"ok"}` for Railway's healthcheck.
