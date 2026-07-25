const { resultFor, decorateSchedule, championshipLevel } = require('../../src/lib/schedule');

describe('resultFor', () => {
  it('returns FFT for a forfeited game (0-0)', () => {
    expect(resultFor({ runs: 0, oppRuns: 0 })).toBe('FFT');
  });

  it('returns W when runs exceed opponent runs', () => {
    expect(resultFor({ runs: 10, oppRuns: 3 })).toBe('W');
  });

  it('returns T when runs equal opponent runs (non-zero)', () => {
    expect(resultFor({ runs: 5, oppRuns: 5 })).toBe('T');
  });

  it('returns L when runs are less than opponent runs', () => {
    expect(resultFor({ runs: 2, oppRuns: 9 })).toBe('L');
  });
});

describe('decorateSchedule', () => {
  it('labels home games with "vs" and away games with "@"', () => {
    const games = [
      { time: 't1', team: 'Home Team', runs: 1, oppRuns: 0, location: 'home', gametype: 'League', level: 'B' },
      { time: 't2', team: 'Away Team', runs: 0, oppRuns: 1, location: 'away', gametype: 'League', level: 'B' },
    ];
    const [home, away] = decorateSchedule(games);
    expect(home.opponentLabel).toBe('vs Home Team');
    expect(away.opponentLabel).toBe('@ Away Team');
  });

  it('adds a playoff note for Postseason games and none for League games', () => {
    const games = [
      { time: 't1', team: 'A', runs: 1, oppRuns: 0, location: 'home', gametype: 'Postseason', level: 'C' },
      { time: 't2', team: 'B', runs: 1, oppRuns: 0, location: 'home', gametype: 'League', level: 'C' },
    ];
    const [playoff, regular] = decorateSchedule(games);
    expect(playoff.playoffNote).toBe('- C League Playoffs');
    expect(regular.playoffNote).toBe('');
  });

  it('attaches a computed result to each game', () => {
    const [game] = decorateSchedule([{ time: 't1', team: 'A', runs: 5, oppRuns: 1, location: 'home', gametype: 'League', level: 'B' }]);
    expect(game.result).toBe('W');
  });
});

describe('championshipLevel', () => {
  it('returns the league level when the season ends on a postseason win', () => {
    const schedule = [
      { runs: 1, oppRuns: 0, gametype: 'League', level: 'B' },
      { runs: 10, oppRuns: 2, gametype: 'Postseason', level: 'B' },
    ];
    expect(championshipLevel(schedule)).toBe('B');
  });

  it('returns null when the season ends on a postseason loss', () => {
    const schedule = [{ runs: 2, oppRuns: 10, gametype: 'Postseason', level: 'B' }];
    expect(championshipLevel(schedule)).toBeNull();
  });

  it('returns null when the season does not end in the postseason', () => {
    const schedule = [{ runs: 10, oppRuns: 2, gametype: 'League', level: 'B' }];
    expect(championshipLevel(schedule)).toBeNull();
  });

  it('returns null for an empty schedule', () => {
    expect(championshipLevel([])).toBeNull();
  });
});
