// Click-to-sort for .stats-table headers. No framework, no build step —
// server still renders the default sort (AVG desc); this just lets you
// re-sort by any column in the browser.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stats-table').forEach(initSortableTable);
});

function initSortableTable(table) {
  const headers = table.querySelectorAll('thead th');
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  headers.forEach((th, index) => {
    th.classList.add('sortable');
    th.addEventListener('click', () => sortByColumn(tbody, index, th, headers));
  });
}

function sortByColumn(tbody, index, th, headers) {
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const nextDir = th.getAttribute('data-sort-dir') === 'desc' ? 'asc' : 'desc';

  headers.forEach((h) => h.removeAttribute('data-sort-dir'));
  th.setAttribute('data-sort-dir', nextDir);

  const cellText = (row) => row.children[index].textContent.trim();
  const isNumeric = rows.every((row) => cellText(row) === '' || !Number.isNaN(parseFloat(cellText(row))));

  rows.sort((a, b) => {
    const cmp = isNumeric
      ? parseFloat(cellText(a) || 0) - parseFloat(cellText(b) || 0)
      : cellText(a).localeCompare(cellText(b));
    return nextDir === 'asc' ? cmp : -cmp;
  });

  rows.forEach((row) => tbody.appendChild(row));
}
