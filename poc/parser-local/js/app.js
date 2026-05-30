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
    banner.style.display = 'block';
    window.cupsLoadWarning = null;
  }

  document.getElementById('processBtn').addEventListener('click', () => {
    const fi = document.getElementById('fileInput');
    if (fi.files.length > 0) processFiles(fi.files);
  });
  document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
  document.getElementById('clearBtn').addEventListener('click', clearResults);

  // Wire CUPS modal
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

  // Debug toggle
  document.getElementById('toggleDebugBtn')?.addEventListener('click', () => {
    window.debugVisible = !window.debugVisible;
    const panel = document.getElementById('debug-panel');
    const btn = document.getElementById('toggleDebugBtn');
    if (!window.debugVisible) {
      panel.style.display = 'none';
      btn.textContent = 'Mostrar debug';
    } else {
      if (window.selectedIndex >= 0) panel.style.display = 'block';
      btn.textContent = 'Ocultar debug';
    }
  });
}

init();
