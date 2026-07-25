const { SEASON_ORDER, SEASONS } = require('../../data/softball/standings');

// Groups every season by its label (Winter/Spring/Summer/Fall) for the nav
// dropdowns, newest year first within each group.
function buildSeasonNavGroups() {
  const groups = {};
  for (const key of SEASON_ORDER) {
    const { label, year } = SEASONS[key];
    groups[label] = groups[label] || [];
    groups[label].push({ key, year });
  }
  for (const label of Object.keys(groups)) {
    groups[label].sort((a, b) => b.year - a.year);
  }
  // Fixed order matching the old nav: Summer, Fall, Winter, Spring.
  return ['Summer', 'Fall', 'Winter', 'Spring']
    .filter((label) => groups[label])
    .map((label) => ({ label, seasons: groups[label] }));
}

module.exports = { buildSeasonNavGroups };
