describe('buildSeasonNavGroups', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('../../data/softball/standings');
  });

  it('groups seasons by label, newest year first, and drops labels with no seasons', () => {
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
    expect(groups.map((g) => g.label)).toEqual(['Summer', 'Fall']);

    const fallGroup = groups.find((g) => g.label === 'Fall');
    expect(fallGroup.seasons).toEqual([
      { key: 'fall2', year: 2022 },
      { key: 'fall1', year: 2020 },
    ]);
  });

  it('reflects the real standings data with all four season labels present', () => {
    const { buildSeasonNavGroups } = require('../../src/lib/nav');
    const groups = buildSeasonNavGroups();
    expect(groups.map((g) => g.label)).toEqual(['Summer', 'Fall', 'Winter', 'Spring']);
  });
});
