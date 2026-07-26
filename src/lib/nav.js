const { SEASON_ORDER, SEASONS } = require('../../data/softball/standings');

const LABEL_ORDER = ['Summer', 'Fall', 'Winter', 'Spring'];

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

// Every season grouped by type, newest year first — powers the season-picker
// dropdown on season pages. The entry matching activeKey (if any) is flagged
// so it renders as the selected option.
function allSeasonGroups(activeKey) {
  const groups = groupSeasonsByLabel();
  return LABEL_ORDER
    .filter((label) => groups[label])
    .map((label) => ({
      label,
      seasons: groups[label].map((s) => ({ ...s, active: s.key === activeKey })),
    }));
}

// Most recent Summer season — the header nav's single "Season" link target.
function getDefaultSeasonKey() {
  return groupSeasonsByLabel().Summer[0].key;
}

module.exports = { allSeasonGroups, getDefaultSeasonKey };
