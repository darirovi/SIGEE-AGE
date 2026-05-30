// UI — RESULTS TABLE (legacy, used by table-view.js buildTableRow / warningBadge)
// Uses cupsStatus, escapeHtml from utils.js

function warningBadge(result) {
  const blocking = result.warnings.filter(w=>w.isBlocking).length;
  const nonBlocking = result.warnings.length - blocking;
  if (result.warnings.length === 0) return '<span class="inline-block px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Sin avisos</span>';
  if (blocking > 0) return `<span class="inline-block px-1.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">${blocking} bloq., ${nonBlocking} no bloq.</span>`;
  return `<span class="inline-block px-1.5 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">${result.warnings.length} aviso(s)</span>`;
}

function buildRow(result, idx) {
  const cs = cupsStatus(result);
  const period = `${result.period_start||'—'} → ${result.period_end||'—'}`;
  const month = result.computed_year && result.computed_month ? `${result.computed_year}-${String(result.computed_month).padStart(2,'0')}` : '—';
  return [
    idx + 1,
    escapeHtml(result.file_name),
    escapeHtml(result.parser_name),
    escapeHtml(result.invoice_number || '—'),
    escapeHtml(result.cups_original || '—'),
    escapeHtml(result.cups_key || '—'),
    escapeHtml(result.building_name || result.building_key || '—'),
    escapeHtml(result.energy_type || '—'),
    period,
    month,
    result.consumption_kwh !== null && result.consumption_kwh !== 'NaN' ? escapeHtml(String(result.consumption_kwh)) : '—',
    result.total_amount_eur !== null && result.total_amount_eur !== 'NaN' ? escapeHtml(String(result.total_amount_eur)) : '—',
    `<span class="${cs.cls}">${cs.icon} ${cs.label}</span>`,
    warningBadge(result),
  ];
}

async function renderResults() {
  // Show results section
  const section = document.getElementById('results-section');
  if (section) section.classList.remove('hidden');

  // Re-render current view
  const view = window.getCurrentView ? window.getCurrentView() : 'cards';
  if (view === 'cards') {
    if (typeof renderCards === 'function') renderCards();
  } else {
    if (typeof refreshTable === 'function') refreshTable();
  }

  // Update count
  document.getElementById('result-count').textContent = window.results.length > 0 ? `(${window.results.length})` : '';
}

// ============================================================
// DEBUG PANEL
// ============================================================
async function selectRow(idx) {
  window.selectedIndex = idx;
  await renderResults();
  const r = window.results[idx];
  if (!r) return;
  const debugPanel = document.getElementById('debug-panel');
  if (debugPanel) {
    debugPanel.classList.remove('hidden');
    document.getElementById('debug-json-content').textContent = JSON.stringify(r, null, 2);
    document.getElementById('debug-raw-content').textContent = r.raw_text || '(sin texto)';
    const wc = document.getElementById('debug-warnings-content');
    if (r.warnings.length === 0) {
      wc.innerHTML = '<div class="text-xs text-gray-500">Sin avisos</div>';
    } else {
      wc.innerHTML = r.warnings.map(w =>
        `<div class="flex gap-2 py-1 border-b border-gray-100 text-xs ${w.isBlocking?'text-red-700 font-semibold':w.level==='warning'?'text-yellow-700':'text-blue-700'}">
          <span class="font-mono shrink-0 w-36">${escapeHtml(w.code||'')}</span>
          <span>${(w.level||'').toUpperCase()}</span>
          <span class="flex-1">${escapeHtml(w.message||'')}</span>
          <span>${w.isBlocking?' [BLOQ.]':''}</span>
        </div>`
      ).join('');
    }
  }
}
