// EXPORT FUNCTIONS

function exportJson() {
  if (window.results.length === 0) return;
  const blob = new Blob([JSON.stringify(window.results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `parsed-invoices-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  if (window.results.length === 0) return;
  const headers = ['file_name','parser_name','energy_type','invoice_number','cups_original','cups_key','building_key','period_start','period_end','computed_year','computed_month','consumption_kwh','total_amount_eur','controlled_cups_match','warnings_count','has_blocking_warnings'];
  const rows = window.results.map(r => {
    const warningsStr = r.warnings.map(w=>w.code).join(';');
    const hasBlocking = r.warnings.some(w=>w.isBlocking);
    return [
      r.file_name, r.parser_name, r.energy_type||'', r.invoice_number||'',
      r.cups_original||'', r.cups_key||'', r.building_key||'',
      r.period_start||'', r.period_end||'', r.computed_year||'', r.computed_month||'',
      r.consumption_kwh||'', r.total_amount_eur||'',
      r.controlled_cups_match, r.warnings.length, hasBlocking
    ].map(v => {
      const s = String(v);
      return s.includes(',')||s.includes('"')||s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `parsed-invoices-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// CLEAR FUNCTION
// ============================================================
function clearResults() {
  window.results = [];
  window.selectedIndex = -1;
  window.expectedCache = {};
  document.getElementById('resultsBody').innerHTML = '';
  document.getElementById('debug-panel').style.display = 'none';
  document.getElementById('result-count').textContent = '';
}

// ============================================================
// UI HELPERS
// ============================================================
function showOverlay(show) {
  document.getElementById('processing-overlay').classList.toggle('active', show);
}
