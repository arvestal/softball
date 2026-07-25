const fs = require('fs');
const os = require('os');
const path = require('path');

const { toSeasonKey, parseCsv, aggregate, buildSeasonData, main } = require('../scripts/generate-stats');

const FIXTURES_DIR = path.join(__dirname, 'fixtures/gc_files');

describe('toSeasonKey', () => {
  it('converts a "YYseason" filename stem to "seasonYY"', () => {
    expect(toSeasonKey('17fall')).toBe('fall17');
    expect(toSeasonKey('20winter')).toBe('winter20');
  });

  it('passes through stems that do not match the pattern', () => {
    expect(toSeasonKey('postseason')).toBe('postseason');
    expect(toSeasonKey('coed')).toBe('coed');
  });
});

describe('parseCsv', () => {
  it('parses rows into player stat objects, keyed by column name', () => {
    const rows = parseCsv(path.join(FIXTURES_DIR, '17fall.csv'));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      id: 1, Lastname: 'J. Smith', GP: 10, PA: 30, AB: 28, H: 14, S: 10, D: 3, T: 1,
      HR: 0, RBI: 5, R: 6, FC: 1, BB: 2, K: 3, SAC: 1, TB: 19,
      AVG: 0.5, OBP: 0.533, SLG: 0.679, OPS: 1.212,
    });
  });

  it('omits the first-initial prefix when First is blank', () => {
    const rows = parseCsv(path.join(FIXTURES_DIR, '17fall.csv'));
    expect(rows[1].Lastname).toBe('Doe');
  });
});

describe('aggregate', () => {
  it('sums counting stats across seasons for the same player id', () => {
    const seasonA = [{ id: 1, Lastname: 'J. Smith', GP: 5, PA: 10, AB: 9, H: 3, S: 2, D: 1, T: 0, HR: 0, RBI: 1, R: 1, FC: 0, BB: 1, K: 1, SAC: 0, TB: 4 }];
    const seasonB = [{ id: 1, Lastname: 'J. Smith', GP: 5, PA: 10, AB: 9, H: 3, S: 2, D: 1, T: 0, HR: 0, RBI: 1, R: 1, FC: 0, BB: 1, K: 1, SAC: 0, TB: 4 }];
    const [combined] = aggregate([seasonA, seasonB]);
    expect(combined.GP).toBe(10);
    expect(combined.AB).toBe(18);
    expect(combined.H).toBe(6);
    expect(combined.AVG).toBeCloseTo(6 / 18);
  });

  it('keeps players who only appear in one season as their own entry', () => {
    const seasonA = [{ id: 1, Lastname: 'A', GP: 1, PA: 1, AB: 1, H: 1, S: 1, D: 0, T: 0, HR: 0, RBI: 0, R: 0, FC: 0, BB: 0, K: 0, SAC: 0, TB: 1 }];
    const seasonB = [{ id: 2, Lastname: 'B', GP: 1, PA: 1, AB: 1, H: 0, S: 0, D: 0, T: 0, HR: 0, RBI: 0, R: 0, FC: 0, BB: 0, K: 1, SAC: 0, TB: 0 }];
    const result = aggregate([seasonA, seasonB]);
    expect(result.map((p) => p.id).sort()).toEqual([1, 2]);
  });
});

describe('buildSeasonData', () => {
  it('splits regular seasons and postseason, and skips coed', () => {
    const data = buildSeasonData(FIXTURES_DIR);
    expect(Object.keys(data.bySeasonKey)).toEqual(['fall17']);
    expect(data.postseason).toHaveLength(1);
    expect(data.career.find((p) => p.id === 1).Lastname).toBe('J. Smith');
    // coed's player (id 1, Amy Jones) must not leak into fall17 or career via a stray merge.
    expect(data.career.some((p) => p.Lastname === 'A. Jones')).toBe(false);
  });

  it('aggregates career totals across the regular season and postseason fixtures', () => {
    const data = buildSeasonData(FIXTURES_DIR);
    const careerSmith = data.career.find((p) => p.id === 1);
    // fall17 (AB 28, H 14) + postseason (AB 5, H 3)
    expect(careerSmith.AB).toBe(33);
    expect(careerSmith.H).toBe(17);
  });
});

describe('main', () => {
  it('writes a generated data module to the given output path', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'softball-stats-'));
    const outputFile = path.join(tmpDir, 'nested', 'seasons.js');

    const data = main(FIXTURES_DIR, outputFile);

    expect(fs.existsSync(outputFile)).toBe(true);
    const written = fs.readFileSync(outputFile, 'utf8');
    expect(written).toContain('GENERATED FILE');
    expect(require(outputFile)).toEqual(data);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('defaults to the real gc_files directory and committed output path', () => {
    const data = main();
    expect(Object.keys(data.bySeasonKey).length).toBeGreaterThan(0);
  });
});
