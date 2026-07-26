const { SEASON_ORDER, SEASONS } = require('../../data/softball/standings');

// Groups every season by its label (Winter/Spring/Summer/Fall), newest year
// first within each group.
function groupSeasonsByLabel() {
  const groups = {};
  for (const key of SEASON_ORDER) {
    const { label, year } = SEASONS[key];
    groups[label] = groups[label] || [];
    groups[label].push({ key, year });
  }
  for (const label of Object.keys(groups)) {
    groups[label].sort((a, b) => b.year - a.year);
  }
  return groups;
}

// One nav link per season type, pointing at its most recent year.
function buildSeasonNavGroups() {
  const groups = groupSeasonsByLabel();
  // Fixed order matching the old nav: Summer, Fall, Winter, Spring.
  return ['Summer', 'Fall', 'Winter', 'Spring']
    .filter((label) => groups[label])
    .map((label) => ({ label, latestKey: groups[label][0].key }));
}

// Every year for a given season label, for the in-page year tabs.
function seasonsForLabel(label) {
  return groupSeasonsByLabel()[label] || [];
}

module.exports = { buildSeasonNavGroups, seasonsForLabel };
