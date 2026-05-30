// TABLE VIEW — Sort / Filter / Paginate
// Operates on window.results; builds the table header and renders rows

const TABLE_COLUMNS = [
  { key: 'idx',           label: '#',                sortable: true  },
  { key: 'file_name',     label: 'Archivo',          sortable: true  },
  { key: 'parser_name',   label: 'Parser',           sortable: true  },
  { key: 'invoice_number',label: 'Nº Factura',       sortable: true  },
  { key: 'cups_original', label: 'CUPS original',    sortable: false },
  { key: 'cups_key',      label: 'CUPS normalizado', sortable: true  },
  { key: 'building_name', label: 'Edificio',         sortable: true  },
  { key: 'energy_type',   label: 'Tipo energía',     sortable: true  },
  { key: 'period',        label: 'Periodo',          sortable: false },
  { key: 'computed_month',label: 'Mes computado',   sortable: true  },
  { key: 'consumption_kwh',label: 'Consumo (kWh)',  sortable: true  },
  { key: 'total_amount_eur',label: 'Importe (€)',   sortable: true  },
  { key: 'cups_status',   label: 'CUPS',            sortable: false },
  { key: 'warnings',      label: 'Avisos',           sortable: false },
];

// Module-scoped state
let tableSortCol = 'idx';
let tableSortDir = 'asc';  // 'asc' | 'desc'
let tableFilter = '';
let tablePage = 0;
let tablePageSize = 50;

function initTableView() {
  buildTableHeader();
  // Filter input
  const filterInput = document.getElementById('table-filter');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      tableFilter = e.target.value.toLowerCase();
      tablePage = 0;
      refreshTable();
    });
  }
  // Page size
  const pageSizeSelect = document.getElementById('table-page-size');
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', (e) => {
      tablePageSize = parseInt(e.target.value, 10);
      tablePage = 0;
      refreshTable();
    });
  }
  // Initial render
  refreshTable();
}

function buildTableHeader() {
  const thead = document.getElementById('table-header-row');
  if (!thead) return;
  thead.innerHTML = TABLE_COLUMNS.map(col => {
    const sortIndicator = col.sortable ? ' ↕' : '';
    const cls = col.sortable ? 'p-2 text-left border border-gray-200 font-semibold bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 select-none transition-colors text-sm' : 'p-2 text-left border border-gray-200 font-semibold bg-gray-100 text-gray-500 text-sm';
    return `<th class="${cls}" data-col="${col.key}" title="${col.label}${sortIndicator}">${col.label}${sortIndicator}</th>`;
  }).join('');

  // Wire sort click
  thead.querySelectorAll('[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (tableSortCol === col) {
        tableSortDir = tableSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        tableSortCol = col;
        tableSortDir = 'asc';
      }
      tablePage = 0;
      refreshTable();
    });
  });
}

function getFilteredSorted() {
  const results = window.results || [];
  let rows = results.map((r, i) => ({ r, i }));

  // Filter
  if (tableFilter) {
    rows = rows.filter(({ r }) => {
      const searchText = [
        r.file_name, r.parser_name, r.invoice_number,
        r.cups_original, r.cups_key, r.building_name,
        r.energy_type, r.estado,
        String(r.computed_year || ''), String(r.computed_month || ''),
        String(r.consumption_kwh || ''), String(r.total_amount_eur || ''),
      ].join(' ').toLowerCase();
      return searchText.includes(tableFilter);
    });
  }

  // Sort
  const col = tableSortCol;
  rows.sort(({ r: a, i: ai }, { r: b, i: bi }) => {
    let va, vb;
    if (col === 'idx') {
      va = ai; vb = bi;
    } else if (col === 'period') {
      va = (a.period_start || '') + (a.period_end || '');
      vb = (b.period_start || '') + (b.period_end || '');
    } else if (col === 'computed_month') {
      va = (a.computed_year || 0) * 100 + (a.computed_month || 0);
      vb = (b.computed_year || 0) * 100 + (b.computed_month || 0);
    } else {
      va = (a[col] || '').toString().toLowerCase();
      vb = (b[col] || '').toString().toLowerCase();
    }
    if (va < vb) return tableSortDir === 'asc' ? -1 : 1;
    if (va > vb) return tableSortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return rows;
}

function refreshTable() {
  const tbody = document.getElementById('resultsBody');
  if (!tbody) return;

  const rows = getFilteredSorted();
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / tablePageSize));
  if (tablePage >= pageCount) tablePage = pageCount - 1;
  if (tablePage < 0) tablePage = 0;

  const start = tablePage * tablePageSize;
  const pageRows = rows.slice(start, start + tablePageSize);

  // Update sort indicators in header
  document.querySelectorAll('#table-header-row [data-col]').forEach(th => {
    const col = th.dataset.col;
    if (col === tableSortCol) {
      th.textContent = th.textContent.replace(/ ↕$/, '') + (tableSortDir === 'asc' ? ' ↑' : ' ↓');
    } else {
      th.textContent = th.textContent.replace(/ [↑↓]$/, '') + ' ↕';
    }
  });

  // Render rows
  if (pageRows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${TABLE_COLUMNS.length}" class="p-4 text-center text-gray-400 text-sm">Sin resultados</td></tr>`;
  } else {
    tbody.innerHTML = pageRows.map(({ r, i }) => buildTableRow(r, i)).join('');
  }

  // Wire row clicks
  tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', () => {
      const idx = parseInt(tr.dataset.idx, 10);
      if (typeof selectRow === 'function') selectRow(idx);
    });
  });

  // Update pagination
  renderPagination(total, pageCount);
}

function buildTableRow(result, rawIdx) {
  const cs = cupsStatus(result);
  const period = `${result.period_start || '—'} → ${result.period_end || '—'}`;
  const month = result.computed_year && result.computed_month
    ? `${result.computed_year}-${String(result.computed_month).padStart(2, '0')}`
    : '—';
  const cells = {
    idx: rawIdx + 1,
    file_name: `<span class="truncate max-w-32 block" title="${escapeHtml(result.file_name)}">${escapeHtml(result.file_name)}</span>`,
    parser_name: escapeHtml(result.parser_name),
    invoice_number: escapeHtml(result.invoice_number || '—'),
    cups_original: `<code class="text-xs">${escapeHtml(result.cups_original || '—')}</code>`,
    cups_key: `<code class="text-xs">${escapeHtml(result.cups_key || '—')}</code>`,
    building_name: escapeHtml(result.building_name || result.building_key || '—'),
    energy_type: escapeHtml(result.energy_type || '—'),
    period: escapeHtml(period),
    computed_month: escapeHtml(month),
    consumption_kwh: result.consumption_kwh != null && result.consumption_kwh !== 'NaN' ? escapeHtml(String(result.consumption_kwh)) : '—',
    total_amount_eur: result.total_amount_eur != null && result.total_amount_eur !== 'NaN' ? escapeHtml(String(result.total_amount_eur)) : '—',
    cups_status: `<span class="${cs.cls}">${cs.icon} ${cs.label}</span>`,
    warnings: warningBadge(result),
  };

  const isSelected = window.selectedIndex === rawIdx;

  return `<tr class="hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-100' : ''}" data-idx="${rawIdx}">
    ${TABLE_COLUMNS.map(col => `<td class="p-2 border border-gray-200 text-xs align-top">${cells[col.key] || ''}</td>`).join('')}
  </tr>`;
}

function renderPagination(total, pageCount) {
  const info = document.getElementById('pagination-info');
  const controls = document.getElementById('pagination-controls');
  if (!info || !controls) return;

  const start = tablePage * tablePageSize + 1;
  const end = Math.min(start + tablePageSize - 1, total);
  info.textContent = total === 0 ? 'Sin resultados' : `${start}–${end} de ${total}`;

  // Build page buttons as DOM elements (no string onclick)
  controls.innerHTML = '';

  function makeBtn(label, pageNum, isActive, isDisabled) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = `px-2 py-1 rounded text-xs border ${isActive ? 'bg-blue-600 text-white border-blue-600' : isDisabled ? 'opacity-40 cursor-not-allowed border-gray-300' : 'border-gray-300 hover:bg-gray-100'}`;
    if (!isDisabled) btn.onclick = () => { tablePage = pageNum; refreshTable(); };
    return btn;
  }

  const maxPages = 7;
  let startPage = Math.max(0, tablePage - 3);
  let endPage = Math.min(pageCount - 1, startPage + maxPages - 1);
  if (endPage - startPage < maxPages - 1) startPage = Math.max(0, endPage - maxPages + 1);

  controls.appendChild(makeBtn('‹', tablePage === 0 ? 0 : tablePage - 1, false, tablePage === 0));

  if (startPage > 0) {
    controls.appendChild(makeBtn('1', 0, false, false));
    if (startPage > 1) controls.appendChild(Object.assign(document.createElement('span'), { textContent: '…', className: 'px-1 text-gray-400' }));
  }
  for (let p = startPage; p <= endPage; p++) {
    controls.appendChild(makeBtn(String(p + 1), p, p === tablePage, false));
  }
  if (endPage < pageCount - 1) {
    if (endPage < pageCount - 2) controls.appendChild(Object.assign(document.createElement('span'), { textContent: '…', className: 'px-1 text-gray-400' }));
    controls.appendChild(makeBtn(String(pageCount), pageCount - 1, false, false));
  }

  controls.appendChild(makeBtn('›', tablePage >= pageCount - 1 ? tablePage : tablePage + 1, false, tablePage >= pageCount - 1));
}

// Expose for onclick handlers
window._tvGotoPage = (p) => { tablePage = p; refreshTable(); };
window._tvSetPageSize = (s) => { tablePageSize = parseInt(s, 10); tablePage = 0; refreshTable(); };

window.initTableView = initTableView;
window.refreshTable = refreshTable;
