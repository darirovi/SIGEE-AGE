// INVOICE DETAIL MODAL
// Shows all 20 invoice fields in 5 sections
// Uses cupsStatus, getSemaphoreState, escapeHtml from utils.js

(function() {
  const overlay = document.getElementById('invoiceModalOverlay');
  const content = document.getElementById('invoice-modal-body');

  function open(result) {
    if (!overlay || !content || !result) return;
    content.innerHTML = renderContent(result);
    overlay.classList.remove('hidden');
    // ESC key handler
    document.addEventListener('keydown', handleEsc);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.removeEventListener('keydown', handleEsc);
  }

  function handleEsc(e) {
    if (e.key === 'Escape') close();
  }

  function renderContent(r) {
    const sem = getSemaphoreState(r);
    const month = r.computed_year && r.computed_month
      ? `${r.computed_year}-${String(r.computed_month).padStart(2, '0')}`
      : '—';
    const cups = cupsStatus(r);
    const warnings = r.warnings || [];

    const semDot = {
      green: 'bg-green-600',
      yellow: 'bg-yellow-500',
      red: 'bg-red-600',
      gray: 'bg-gray-400',
    }[sem.color] || 'bg-gray-400';

    const semText = {
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600',
      gray: 'text-gray-400',
    }[sem.color] || 'text-gray-400';

    function sectionTitle(text) {
      return `<h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 border-b border-gray-100 pb-1">${text}</h3>`;
    }

    function field(label, value) {
      const val = value !== null && value !== undefined && value !== 'NaN' ? String(value) : '—';
      return `
        <div class="flex gap-2 py-1.5 border-b border-gray-50 text-sm">
          <span class="text-gray-400 shrink-0 w-36">${label}:</span>
          <span class="text-gray-800 font-medium break-all">${escapeHtml(val)}</span>
        </div>`;
    }

    function warningRow(w) {
      const levelColors = {
        error: 'text-red-700 bg-red-50',
        warning: 'text-yellow-700 bg-yellow-50',
        info: 'text-blue-700 bg-blue-50',
      };
      const cls = levelColors[w.level] || 'text-gray-700 bg-gray-50';
      return `
        <div class="flex gap-2 py-1.5 px-2 rounded text-xs ${cls} mb-1">
          <span class="font-mono font-semibold shrink-0 w-36">${escapeHtml(w.code || '')}</span>
          <span>${escapeHtml(w.message || '')}</span>
          ${w.isBlocking ? '<span class="ml-auto font-bold shrink-0">⚠️ BLOQ.</span>' : ''}
        </div>`;
    }

    const warningsHtml = warnings.length > 0
      ? warnings.map(warningRow).join('')
      : '<p class="text-sm text-green-600 font-medium">✓ Sin avisos</p>';

    return `
      <!-- Header with semaphore -->
      <div class="flex items-center gap-4 mb-5 pb-4 border-b border-gray-200">
        <div class="w-14 h-14 rounded-full ${semDot} flex items-center justify-center shadow-sm">
          <div class="w-6 h-6 rounded-full bg-white/30"></div>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">${escapeHtml(r.parser_name)}</h2>
          <p class="text-sm ${semText} font-semibold">${sem.label}</p>
        </div>
      </div>

      <!-- Identification -->
      ${sectionTitle('Identificación')}
      ${field('Nº Factura', r.invoice_number)}
      ${field('CUPS original', r.cups_original)}
      ${field('CUPS normalizado', r.cups_key)}
      ${field('Archivo', r.file_name)}
      ${field('Tipo energía', r.energy_type)}

      <!-- Period -->
      ${sectionTitle('Período')}
      ${field('Periodo inicio', r.period_start)}
      ${field('Periodo fin', r.period_end)}
      ${field('Mes computado', month)}

      <!-- Energy -->
      ${sectionTitle('Energía')}
      ${field('Consumo (kWh)', r.consumption_kwh)}
      ${field('Importe total (€)', r.total_amount_eur)}

      <!-- Financial -->
      ${sectionTitle('Edificio / CUPS')}
      ${field('Edificio', r.building_name || r.building_key)}
      ${field('CUPS controlado', cups.icon + ' ' + cups.label)}

      <!-- Validation -->
      ${sectionTitle('Validación')}
      ${field('Estado', r.estado || '—')}
      <div class="mt-2">
        <p class="text-xs text-gray-400 mb-1">Avisos (${warnings.length}):</p>
        ${warningsHtml}
      </div>

      <!-- Debug link -->
      <div class="mt-5 pt-3 border-t border-gray-200">
        <button id="invoice-debug-btn" class="text-xs text-gray-400 hover:text-gray-600 underline">Abrir panel de debug</button>
      </div>
    `;
  }

  window.invoiceModal = { open, close };
})();
