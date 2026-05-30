// STORAGE — PERSISTENCE
// Uses SEED_CUPS from seed-cups.js (embedded), merges localStorage on top

function saveControlledCups() {
  try {
    localStorage.setItem('sigee-controlled-cups', JSON.stringify(window.controlledCups));
  } catch(e) {
    console.warn('[SIGEE] localStorage unavailable:', e);
    const errorEl = document.getElementById('cupsFormError');
    if (errorEl) errorEl.textContent = 'Error: no se pudo guardar. ¿Está el almacenamiento lleno?';
    return false;
  }
  return true;
}

async function loadControlledCups() {
  try {
    const stored = localStorage.getItem('sigee-controlled-cups');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        const isValid = Object.values(parsed).every(v =>
          v && typeof v === 'object' &&
          typeof v.building_key === 'string' &&
          typeof v.building_name === 'string'
        );
        if (!isValid) throw new Error('invalid shape');
        // Merge seed + localStorage (localStorage overrides seed)
        window.controlledCups = { ...window.SEED_CUPS, ...parsed };
        return;
      }
    }
  } catch(e) {
    console.warn('[SIGEE] localStorage parse failed, using seed:', e);
    window.cupsLoadWarning = 'ATENCIÓN: Se detectó corrupción en datos guardados. Usando lista original.';
  }
  // Seed fallback — deep copy to avoid mutation of SEED_CUPS
  window.controlledCups = JSON.parse(JSON.stringify(window.SEED_CUPS));
}
