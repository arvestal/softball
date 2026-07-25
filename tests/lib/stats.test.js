const { STAT_COLUMNS, sortByAvgDesc, filterByIds } = require('../../src/lib/stats');

describe('STAT_COLUMNS', () => {
  it('includes every field the stats table needs, in display order', () => {
    expect(STAT_COLUMNS[0]).toEqual({ field: 'id', label: '#' });
    expect(STAT_COLUMNS.find((c) => c.field === 'AVG')).toEqual({ field: 'AVG', label: 'AVG', rate: true });
    expect(STAT_COLUMNS.map((c) => c.field)).toContain('OPS');
  });
});

describe('sortByAvgDesc', () => {
  it('returns players ordered by AVG descending', () => {
    const players = [
      { id: 1, AVG: 0.2 },
      { id: 2, AVG: 0.5 },
      { id: 3, AVG: 0.35 },
    ];
    expect(sortByAvgDesc(players).map((p) => p.id)).toEqual([2, 3, 1]);
  });

  it('does not mutate the input array', () => {
    const players = [{ id: 1, AVG: 0.2 }, { id: 2, AVG: 0.5 }];
    const original = [...players];
    sortByAvgDesc(players);
    expect(players).toEqual(original);
  });
});

describe('filterByIds', () => {
  it('keeps only players whose id is in the given list', () => {
    const players = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(filterByIds(players, [1, 3]).map((p) => p.id)).toEqual([1, 3]);
  });

  it('returns an empty array when no ids match', () => {
    expect(filterByIds([{ id: 1 }], [99])).toEqual([]);
  });
});
