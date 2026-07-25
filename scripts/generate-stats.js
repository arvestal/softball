/*
 * One-off generator: reads the raw GameChanger CSV exports in data/gc_files
 * and writes the static data/softball/seasons.js module the app reads at
 * runtime. Run manually after any CSV changes:
 *
 *   node scripts/generate-stats.js
 *
 * The server never re-runs this — the output is committed to git.
 *
 * Column lookup note: every export has the same 152-column header (offensive
 * stats followed by a pitching/fielding block). Several names repeat in both
 * blocks (GP, H, BB, SO, R, HR, TB, SB, CS, SB%, PIK, BABIP, LOB, GB%) — we
 * only want the offensive occurrence, which always comes first, so columns
 * are located by name via indexOf() rather than a hardcoded position. (The
 * old build-stats.js used a hand-counted positional array with a hole-count
 * mistake starting at the XBH column, which silently shifted every field
 * after it by one — this rewrite avoids that class of bug entirely.)
 */
const path = require('path');
const fs = require('fs');

const GC_FILES_DIR = path.join(__dirname, '../data/gc_files');
const OUTPUT_FILE = path.join(__dirname, '../data/softball/seasons.js');

const NEEDED_COLUMNS = [
  'GP', 'PA', 'AB', 'H', '1B', '2B', '3B', 'HR', 'RBI', 'R',
  'FC', 'BB', 'SO', 'SAC', 'SF', 'TB', 'AVG', 'OBP', 'SLG', 'OPS',
];

// Maps a gc_files CSV filename stem ("17fall") to the season key used
// throughout the app ("fall17").
function toSeasonKey(fileStem) {
  const match = fileStem.match(/^(\d{2})(fall|winter|spring|summer)$/);
  if (!match) return fileStem; // postseason.csv, coed.csv pass through unchanged
  const [, year, season] = match;
  return `${season}${year}`;
}

function parseCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((line) => line.trim() !== '');
  const header = lines[0].split(',');
  const colIndex = {};
  for (const name of NEEDED_COLUMNS) colIndex[name] = header.indexOf(name);
  colIndex.Number = header.indexOf('Number');
  colIndex.Last = header.indexOf('Last');
  colIndex.First = header.indexOf('First');

  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    const get = (name) => cols[colIndex[name]];
    const firstInitial = get('First') === '' ? '' : `${get('First').substring(0, 1)}. `;

    // Per-season rate stats are taken directly from GameChanger's own
    // columns (not recomputed) so individual season pages match what the
    // site has always shown. Career/postseason aggregation recomputes rate
    // stats from summed counting stats — see aggregate() below.
    return {
      id: +get('Number'),
      Lastname: `${firstInitial}${get('Last')}`,
      GP: +get('GP'),
      PA: +get('PA'),
      AB: +get('AB'),
      H: +get('H'),
      S: +get('1B'),
      D: +get('2B'),
      T: +get('3B'),
      HR: +get('HR'),
      RBI: +get('RBI'),
      R: +get('R'),
      FC: +get('FC'),
      BB: +get('BB'),
      K: +get('SO'),
      SAC: +get('SAC') + +get('SF'),
      TB: +get('TB'),
      AVG: parseFloat(get('AVG')),
      OBP: parseFloat(get('OBP')),
      SLG: parseFloat(get('SLG')),
      OPS: parseFloat(get('OPS')),
    };
  });
}

// Sums counting stats across seasons for the same player id, then
// recomputes rate stats from the summed totals.
function aggregate(playerArrays) {
  const combined = [].concat(...playerArrays);

  const totals = combined.reduce((acc, row) => {
    const existing = acc.find((item) => item.id === row.id);
    if (existing) {
      existing.GP += row.GP;
      existing.PA += row.PA;
      existing.AB += row.AB;
      existing.H += row.H;
      existing.S += row.S;
      existing.D += row.D;
      existing.T += row.T;
      existing.HR += row.HR;
      existing.RBI += row.RBI;
      existing.R += row.R;
      existing.FC += row.FC;
      existing.BB += row.BB;
      existing.K += row.K;
      existing.SAC += row.SAC;
      existing.TB += row.TB;
    } else {
      acc.push({ ...row });
    }
    return acc;
  }, []);

  return totals.map(({ id, Lastname, GP, PA, AB, H, S, D, T, HR, RBI, R, FC, BB, K, SAC, TB }) => ({
    id, Lastname, GP, PA, AB, H, S, D, T, HR, RBI, R, FC, BB, K, SAC, TB,
    AVG: H / AB,
    OBP: (H + BB) / (AB + BB + SAC),
    SLG: TB / AB,
    OPS: ((H + BB) / (AB + BB + SAC)) + (TB / AB),
  }));
}

function buildSeasonData(gcFilesDir) {
  const files = fs.readdirSync(gcFilesDir).filter((f) => f.endsWith('.csv'));

  const bySeasonKey = {};
  let postseason = [];

  for (const file of files) {
    const stem = file.replace(/\.csv$/, '');
    if (stem === 'coed') continue; // no standings/schedule data for coed; out of scope

    const rows = parseCsv(path.join(gcFilesDir, file));

    if (stem === 'postseason') {
      postseason = rows;
    } else {
      bySeasonKey[toSeasonKey(stem)] = rows;
    }
  }

  const career = aggregate([...Object.values(bySeasonKey), postseason]);

  return { bySeasonKey, career, postseason };
}

function main(gcFilesDir = GC_FILES_DIR, outputFile = OUTPUT_FILE) {
  const data = buildSeasonData(gcFilesDir);

  const banner = `/*
 * GENERATED FILE - do not edit by hand.
 * Produced by scripts/generate-stats.js from data/gc_files/*.csv.
 * Re-run that script and commit the diff if the source CSVs change.
 */\n`;
  const body = `module.exports = ${JSON.stringify(data, null, 2)};\n`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, banner + body);

  console.log(`Wrote ${outputFile}`);
  console.log(`  seasons: ${Object.keys(data.bySeasonKey).length}, postseason players: ${data.postseason.length}, career players: ${data.career.length}`);

  return data;
}

/* istanbul ignore if -- exercised by running the script, not by tests */
if (require.main === module) {
  main();
}

module.exports = { toSeasonKey, parseCsv, aggregate, buildSeasonData, main };
