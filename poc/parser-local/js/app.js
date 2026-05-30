// APP ENTRY POINT — init + event wiring

async function init() {
  // Configure pdf.js worker (required for off-thread PDF parsing)
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  }

  try {
    await loadControlledCups();
  } catch(e) { /* keep empty */ }

  if (window.cupsLoadWarning) {
    const banner = document.getElementById('cupsLoadWarning');
    banner.textContent = window.cupsLoadWarning;
    banner.classList.remove('hidden');
    window.cupsLoadWarning = null;
  }

  // File input (hidden, triggered by drop-zone click)
  document.getElementById('fileInput').addEventListener('change', function() {
    if (this.files.length > 0) processFiles(this.files);
  });

  // Process button
  document.getElementById('processBtn').addEventListener('click', () => {
    const fi = document.getElementById('fileInput');
    if (fi.files.length > 0) processFiles(fi.files);
  });

  // Export buttons
  document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);

  // Clear
  document.getElementById('clearBtn').addEventListener('click', clearResults);

  // View toggle
  document.getElementById('view-cards-btn').addEventListener('click', () => switchView('cards'));
  document.getElementById('view-table-btn').addEventListener('click', () => switchView('table'));

  // CUPS modal
  document.getElementById('gestionarCupsBtn').addEventListener('click', openCupsModal);
  document.getElementById('cupsModalClose').addEventListener('click', closeCupsModal);
  document.getElementById('cupsModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('cupsModalOverlay')) closeCupsModal();
  });
  document.getElementById('cupsAddBtn').addEventListener('click', addCupsEntry);
  document.getElementById('cupsModalTableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('.cups-remove-btn');
    if (btn) removeCupsEntry(btn.dataset.cupsKey);
  });
  document.getElementById('cupsInputKey').addEventListener('blur', function() {
    this.value = normalizeCups(this.value).normalized;
  });

  // Invoice modal close + debug
  document.getElementById('invoiceModalClose').addEventListener('click', () => invoiceModal.close());
  document.getElementById('invoiceModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('invoiceModalOverlay')) invoiceModal.close();
  });
  // Delegated invoice modal events
  document.getElementById('invoice-modal-body').addEventListener('click', (e) => {
    const btn = e.target.closest('#invoice-debug-btn');
    if (btn) {
      document.getElementById('debug-panel').classList.toggle('hidden');
      invoiceModal.close();
    }
  });

  // Unified ESC key handler for all modals
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    // Invoice modal
    if (!document.getElementById('invoiceModalOverlay').classList.contains('hidden')) {
      invoiceModal.close();
    }
    // Cups modal
    const cupsOverlay = document.getElementById('cupsModalOverlay');
    if (cupsOverlay && !cupsOverlay.classList.contains('hidden')) {
      closeCupsModal();
    }
  });

  // Debug toggle
  document.getElementById('toggleDebugBtn')?.addEventListener('click', () => {
    window.debugVisible = !window.debugVisible;
    const panel = document.getElementById('debug-panel');
    const btn = document.getElementById('toggleDebugBtn');
    if (!window.debugVisible) {
      panel.classList.add('hidden');
      btn.textContent = 'Mostrar debug';
    } else {
      if (window.selectedIndex >= 0) panel.classList.remove('hidden');
      btn.textContent = 'Ocultar debug';
    }
  });

  // Initialize drop zone
  initDropZone();

  // Initialize table view
  initTableView();
}

// ============================================================
// VIEW TOGGLE (Cards ↔ Table)
// ============================================================
let currentView = 'cards'; // 'cards' | 'table'

function switchView(view) {
  currentView = view;
  const cardsGrid = document.getElementById('cards-grid');
  const tableContainer = document.getElementById('table-container');
  const cardsBtn = document.getElementById('view-cards-btn');
  const tableBtn = document.getElementById('view-table-btn');

  if (view === 'cards') {
    cardsGrid.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    cardsBtn.classList.add('bg-white', 'shadow', 'text-gray-800');
    cardsBtn.classList.remove('text-gray-500');
    tableBtn.classList.remove('bg-white', 'shadow', 'text-gray-800');
    tableBtn.classList.add('text-gray-500');
  } else {
    cardsGrid.classList.add('hidden');
    tableContainer.classList.remove('hidden');
    tableBtn.classList.add('bg-white', 'shadow', 'text-gray-800');
    tableBtn.classList.remove('text-gray-500');
    cardsBtn.classList.remove('bg-white', 'shadow', 'text-gray-800');
    cardsBtn.classList.add('text-gray-500');
    // Refresh table when switching to it
    if (typeof refreshTable === 'function') refreshTable();
  }
}

// Expose to window for use by invoice-cards and renderResults
window.switchView = switchView;
window.getCurrentView = () => currentView;

init();
