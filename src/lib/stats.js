// Column order/labels for the player-stats table, matching the old ng-grid
// columnDefs in public/app.js.
const STAT_COLUMNS = [
  { field: 'id', label: '#' },
  { field: 'Lastname', label: 'Name' },
  { field: 'GP', label: 'GP' },
  { field: 'PA', label: 'PA' },
  { field: 'AB', label: 'AB' },
  { field: 'H', label: 'H' },
  { field: 'S', label: '1B' },
  { field: 'D', label: '2B' },
  { field: 'T', label: '3B' },
  { field: 'HR', label: 'HR' },
  { field: 'RBI', label: 'RBI' },
  { field: 'R', label: 'R' },
  { field: 'TB', label: 'TB' },
  { field: 'BB', label: 'BB' },
  { field: 'SAC', label: 'SAC' },
  { field: 'FC', label: 'FC' },
  { field: 'K', label: 'K' },
  { field: 'AVG', label: 'AVG', rate: true },
  { field: 'OBP', label: 'OBP', rate: true },
  { field: 'SLG', label: 'SLG', rate: true },
  { field: 'OPS', label: 'OPS', rate: true },
];

function sortByAvgDesc(players) {
  return [...players].sort((a, b) => b.AVG - a.AVG);
}

function filterByIds(players, ids) {
  const idSet = new Set(ids);
  return players.filter((p) => idSet.has(p.id));
}

module.exports = { STAT_COLUMNS, sortByAvgDesc, filterByIds };
