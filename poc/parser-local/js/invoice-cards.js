// INVOICE CARDS VIEW
// Renders window.results as semantic cards with traffic-light semaphore
// Uses cupsStatus, getSemaphoreState, escapeHtml from utils.js

function semanticMonth(result) {
  if (!result.computed_year || !result.computed_month) return '—';
  return `${result.computed_year}-${String(result.computed_month).padStart(2, '0')}`;
}

function formatEur(val) {
  if (val === null || val === undefined || val === 'NaN') return '—';
  const n = Number(val);
  if (isNaN(n)) return '—';
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function formatKwh(val) {
  if (val === null || val === undefined || val === 'NaN') return '—';
  const n = Number(val);
  if (isNaN(n)) return '—';
  return n.toLocaleString('es-ES') + ' kWh';
}

function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const results = window.results || [];
  if (results.length === 0) {
    grid.innerHTML = '<p class="text-gray-400 text-sm col-span-full text-center py-8">Sin resultados. Arrastra un PDF para procesar.</p>';
    return;
  }

  results.forEach((result, idx) => {
    const sem = getSemaphoreState(result);
    const month = semanticMonth(result);
    const cups = cupsStatus(result);
    const warnings = result.warnings || [];
    const blockingCount = warnings.filter(w => w.isBlocking).length;

    // Semaphore circle color classes (standard Tailwind equivalents)
    const semDot = {
      green: 'bg-green-600',
      yellow: 'bg-yellow-500',
      red: 'bg-red-600',
      gray: 'bg-gray-400',
    }[sem.color];

    const card = document.createElement('div');
    card.className = [
      'rounded-lg border p-4 cursor-pointer',
      'transition-all duration-200',
      'hover:shadow-lg hover:-translate-y-0.5',
      sem.bg, 'border-gray-200',
    ].join(' ');

    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate" title="${escapeHtml(result.file_name)}">${escapeHtml(result.file_name)}</p>
          <p class="text-xs text-gray-500 mt-0.5">${escapeHtml(result.parser_name)}</p>
        </div>
        <div class="w-12 h-12 rounded-full ${semDot} shadow-sm flex items-center justify-center ml-3 shrink-0" title="${sem.label}">
          <div class="w-5 h-5 rounded-full bg-white/30"></div>
        </div>
      </div>
      <div class="space-y-1 text-xs text-gray-600">
        <div class="flex justify-between">
          <span class="text-gray-400">Mes:</span>
          <span class="font-medium">${escapeHtml(month)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Consumo:</span>
          <span>${escapeHtml(formatKwh(result.consumption_kwh))}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Importe:</span>
          <span class="font-medium text-gray-800">${escapeHtml(formatEur(result.total_amount_eur))}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Edificio:</span>
          <span class="truncate ml-2" title="${escapeHtml(result.building_name || result.building_key || '—')}">${escapeHtml(result.building_name || result.building_key || '—')}</span>
        </div>
      </div>
      <div class="mt-3 pt-2 border-t border-gray-200/50 flex items-center justify-between">
        <span class="text-xs ${cups.cls === 'cups-controlled' ? 'text-green-700' : cups.cls === 'cups-uncontrolled' ? 'text-red-700' : 'text-gray-400'}">${cups.icon} ${cups.label}</span>
        ${warnings.length > 0 ? `<span class="text-xs ${blockingCount > 0 ? 'text-red-600 font-medium' : 'text-yellow-600'}">${blockingCount > 0 ? '⚠️ ' + blockingCount + ' bloq.' : '⚠️ ' + warnings.length + ' aviso(s)'}</span>` : '<span class="text-xs text-green-600">✓ Sin avisos</span>'}
      </div>
      <p class="text-xs text-blue-500 font-medium mt-2 text-center">Ver detalles →</p>
    `;

    card.addEventListener('click', () => {
      if (window.invoiceModal?.open) {
        window.invoiceModal.open(result);
      }
      // Also select row for debug panel
      if (typeof selectRow === 'function') selectRow(idx);
    });

    grid.appendChild(card);
  });
}

window.renderCards = renderCards;
