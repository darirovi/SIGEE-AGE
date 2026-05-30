// UI — RESULTS TABLE

function cupsStatus(result) {
  if (!result.cups_key) return { cls:'cups-unknown', icon:'⚪', label:'desconocido' };
  return window.controlledCups[result.cups_key]
    ? { cls:'cups-controlled', icon:'🟢', label:'controlado' }
    : { cls:'cups-uncontrolled', icon:'🔴', label:'no controlado' };
}

function warningBadge(result) {
  const blocking = result.warnings.filter(w=>w.isBlocking).length;
  const nonBlocking = result.warnings.length - blocking;
  if (result.warnings.length === 0) return '<span class="badge badge-ok">Sin avisos</span>';
  if (blocking > 0) return `<span class="badge badge-error">${blocking} bloq., ${nonBlocking} no bloq.</span>`;
  return `<span class="badge badge-warn">${result.warnings.length} aviso(s)</span>`;
}

function expectedBadge(validation) {
  if (!validation || validation.status === 'na') return '<span class="expected-na">N/A</span>';
  if (validation.status === 'ok') return '<span class="expected-ok">✅ OK</span>';
  return `<span class="expected-warn" title="${validation.diffs.map(d=>`${d.field}: ${escapeHtml(d.actual)} ≠ ${escapeHtml(d.expected)}`).join(' | ')}">⚠️ ${validation.diffs.length} dif.</span>`;
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
    expectedBadge(result._validation)
  ];
}

async function renderResults() {
  const tbody = document.getElementById('resultsBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (let i = 0; i < window.results.length; i++) {
    const r = window.results[i];
    const tr = document.createElement('tr');
    if (i === window.selectedIndex) tr.classList.add('selected');
    const cells = buildRow(r, i);
    tr.innerHTML = '<td>' + cells.join('</td><td>') + '</td>';
    tr.addEventListener('click', () => selectRow(i));
    tbody.appendChild(tr);
  }
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
  document.getElementById('debug-panel').style.display = 'block';
  document.getElementById('debug-json-content').textContent = JSON.stringify(r, null, 2);
  document.getElementById('debug-raw-content').textContent = r.raw_text || '(sin texto)';
  const wc = document.getElementById('debug-warnings-content');
  if (r.warnings.length === 0) {
    wc.innerHTML = '<div style="font-size:0.75rem;color:#666;">Sin avisos</div>';
  } else {
    wc.innerHTML = r.warnings.map(w =>
      `<div class="debug-warning ${w.isBlocking?'blocking':w.level}">
        <span class="w-code">${escapeHtml(w.code)}</span>
        <span class="w-level">${w.level.toUpperCase()}</span>
        <span>${escapeHtml(w.message)}</span>
        <span>${w.isBlocking?' [BLOQ]':''}</span>
      </div>`
    ).join('');
  }
}
