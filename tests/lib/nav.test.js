describe('nav helpers', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('../../data/softball/standings');
  });

  describe('allSeasonGroups', () => {
    it('groups seasons by label, newest year first, and drops labels with no seasons', () => {
      jest.doMock('../../data/softball/standings', () => ({
        SEASON_ORDER: ['fall1', 'fall2', 'summer1'],
        SEASONS: {
          fall1: { label: 'Fall', year: 2020 },
          fall2: { label: 'Fall', year: 2022 },
          summer1: { label: 'Summer', year: 2021 },
        },
      }));

      const { allSeasonGroups } = require('../../src/lib/nav');
      const groups = allSeasonGroups();

      // Fixed order: Summer, Fall, Winter, Spring — Winter/Spring absent here.
      expect(groups.map((g) => g.label)).toEqual(['Summer', 'Fall']);

      const fallGroup = groups.find((g) => g.label === 'Fall');
      expect(fallGroup.seasons).toEqual([
        { key: 'fall2', year: 2022, active: false },
        { key: 'fall1', year: 2020, active: false },
      ]);
    });

    it('flags the season matching activeKey', () => {
      const { allSeasonGroups } = require('../../src/lib/nav');
      const groups = allSeasonGroups('fall19');
      const fallGroup = groups.find((g) => g.label === 'Fall');
      expect(fallGroup.seasons.find((s) => s.key === 'fall19').active).toBe(true);
      expect(fallGroup.seasons.find((s) => s.key === 'fall18').active).toBe(false);
    });

    it('reflects the real standings data with all four season labels present', () => {
      const { allSeasonGroups } = require('../../src/lib/nav');
      const groups = allSeasonGroups();
      expect(groups.map((g) => g.label)).toEqual(['Summer', 'Fall', 'Winter', 'Spring']);
    });
  });

  describe('getDefaultSeasonKey', () => {
    it('returns the most recent Summer season key', () => {
      const { getDefaultSeasonKey } = require('../../src/lib/nav');
      expect(getDefaultSeasonKey()).toBe('summer18');
    });
  });
});
