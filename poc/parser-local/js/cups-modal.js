// CUPS MODAL FUNCTIONS

function openCupsModal() {
  document.getElementById('cupsModalOverlay').style.display = 'flex';
  renderCupsModal();
}

function closeCupsModal() {
  document.getElementById('cupsModalOverlay').style.display = 'none';
}

function renderCupsModal() {
  const tbody = document.getElementById('cupsModalTableBody');
  if (!tbody) return;
  const cups = Object.entries(window.controlledCups);
  if (cups.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:16px;text-align:center;color:#666;">No hay CUPS controlados. Añade el primero.</td></tr>';
    return;
  }
  tbody.innerHTML = cups.map(([key, val]) => {
    const typeLabel = val.energy_type === 'gas_natural' ? 'Gas' : 'Elec.';
    const bgStyle = val.energy_type === 'gas_natural' ? '#fef3c7' : '#dbeafe';
    return `<tr>
      <td style="padding:8px;border:1px solid #ddd;font-family:monospace;font-size:13px;">${escapeHtml(key)}</td>
      <td style="padding:8px;border:1px solid #ddd;"></td>
      <td style="padding:8px;border:1px solid #ddd;"></td>
      <td style="padding:8px;border:1px solid #ddd;"><span style="background:${bgStyle};padding:2px 6px;border-radius:4px;font-size:12px;">${typeLabel}</span></td>
      <td style="padding:8px;border:1px solid #ddd;font-size:13px;">${escapeHtml(val.supplier)}</td>
      <td style="padding:8px;border:1px solid #ddd;"><button class="cups-remove-btn" data-cups-key="${escapeHtml(key)}" style="background:#dc2626;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Eliminar</button></td>
    </tr>`;
  }).join('');

  // Fill building_key and building_name cells via textContent
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    const key = row.cells[0].textContent;
    const val = window.controlledCups[key];
    if (val) {
      row.cells[1].textContent = val.building_key;
      row.cells[2].textContent = val.building_name;
    }
  });
}

function addCupsEntry() {
  const errorEl = document.getElementById('cupsFormError');
  errorEl.textContent = '';

  const cupsKeyRaw = document.getElementById('cupsInputKey').value.trim();
  const buildingKey = document.getElementById('cupsInputBuildingKey').value.trim();
  const buildingName = document.getElementById('cupsInputBuildingName').value.trim();
  const energyType = document.getElementById('cupsInputEnergyType').value;
  const supplier = document.getElementById('cupsInputSupplier').value.trim();

  if (!cupsKeyRaw || !buildingKey || !buildingName || !supplier) {
    errorEl.textContent = 'Todos los campos son obligatorios.';
    return;
  }

  const cupsKey = normalizeCups(cupsKeyRaw).normalized;
  if (!cupsKey) {
    errorEl.textContent = 'CUPS inválido tras normalización.';
    return;
  }

  if (window.controlledCups[cupsKey]) {
    errorEl.textContent = 'Este CUPS ya existe en la lista.';
    return;
  }

  window.controlledCups[cupsKey] = {
    building_key: buildingKey,
    building_name: buildingName,
    energy_type: energyType,
    supplier: supplier
  };

  if (!saveControlledCups()) {
    delete window.controlledCups[cupsKey];
    errorEl.textContent = 'Error: no se pudo guardar. ¿Está el almacenamiento lleno?';
    return;
  }
  renderCupsModal();
  revalidateResults();

  document.getElementById('cupsInputKey').value = '';
  document.getElementById('cupsInputBuildingKey').value = '';
  document.getElementById('cupsInputBuildingName').value = '';
  document.getElementById('cupsInputSupplier').value = '';
}

function removeCupsEntry(cupsKey) {
  if (!window.controlledCups[cupsKey]) return;
  delete window.controlledCups[cupsKey];
  if (!saveControlledCups()) {
    const errorEl = document.getElementById('cupsFormError');
    if (errorEl) errorEl.textContent = 'Error: no se pudo guardar. ¿Está el almacenamiento lleno?';
  }
  renderCupsModal();
  revalidateResults();
}

function revalidateResults() {
  if (!window.results || window.results.length === 0) return;
  window.results.forEach(r => {
    r.warnings = buildWarnings(r, window.controlledCups);
    r._validation = null;
  });
  renderResults();
}
