describe('nav helpers', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('../../data/softball/standings');
  });

  describe('buildSeasonNavGroups', () => {
    it('returns one entry per label pointing at its most recent year, and drops labels with no seasons', () => {
      jest.doMock('../../data/softball/standings', () => ({
        SEASON_ORDER: ['fall1', 'fall2', 'summer1'],
        SEASONS: {
          fall1: { label: 'Fall', year: 2020 },
          fall2: { label: 'Fall', year: 2022 },
          summer1: { label: 'Summer', year: 2021 },
        },
      }));

      const { buildSeasonNavGroups } = require('../../src/lib/nav');
      const groups = buildSeasonNavGroups();

      // Fixed order: Summer, Fall, Winter, Spring — Winter/Spring absent here.
      expect(groups).toEqual([
        { label: 'Summer', latestKey: 'summer1' },
        { label: 'Fall', latestKey: 'fall2' },
      ]);
    });

    it('reflects the real standings data with all four season labels present', () => {
      const { buildSeasonNavGroups } = require('../../src/lib/nav');
      const groups = buildSeasonNavGroups();
      expect(groups.map((g) => g.label)).toEqual(['Summer', 'Fall', 'Winter', 'Spring']);
    });
  });

  describe('seasonsForLabel', () => {
    it('returns every year for a label, newest first', () => {
      const { seasonsForLabel } = require('../../src/lib/nav');
      const fallSeasons = seasonsForLabel('Fall');
      expect(fallSeasons[0]).toEqual({ key: 'fall19', year: 2019 });
      expect(fallSeasons.map((s) => s.year)).toEqual([...fallSeasons.map((s) => s.year)].sort((a, b) => b - a));
    });

    it('returns an empty array for a label with no seasons', () => {
      const { seasonsForLabel } = require('../../src/lib/nav');
      expect(seasonsForLabel('NotASeason')).toEqual([]);
    });
  });
});
