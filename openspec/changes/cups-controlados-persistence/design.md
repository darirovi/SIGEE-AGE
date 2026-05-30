# Design: CUPS Controlados Persistence

## Technical Approach

Implement a browser-based modal UI in `poc/parser-local/index.html` for viewing, adding, and removing controlled CUPS entries, backed by `localStorage` persistence with a JSON seed fallback. The modal is opened via a "Gestionar CUPS" toolbar button and closes via an X button or backdrop click. Every add/remove triggers re-validation of all results via `buildWarnings()`.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | `localStorage` key `'sigee-controlled-cups'` | Single-file PoC — no backend. `localStorage` is synchronous and survives page refresh. |
| Seed fallback | Fetch `./sample-data/controlled-cups.json` on empty/missing/corrupt localStorage | Preserves the 23-entry seed as source of truth; user changes persist across sessions. |
| Modal CSS | Inline in existing `<style>` block, reusing `.badge`, `button`, `.card` | Single-file constraint; avoids separate stylesheet. Modal uses fixed overlay + centered div pattern. |
| Re-validation scope | Call `buildWarnings()` for every `results` entry on every add/remove | `buildWarnings()` already accepts `controlledCups`; running it for all results ensures badges and warning counts stay current. |
| Per-row delete | No confirmation dialog | POC scope — simplicity over safety. |

## Data Flow

```
init()
  └── loadControlledCups()
        ├── localStorage.getItem('sigee-controlled-cups') → parse
        │     └── success → use parsed data
        └── failure/null → fetch ./sample-data/controlled-cups.json
              └── parse → use as seed

openCupsModal()
  └── renderCupsModal()  → builds table from controlledCups

addCupsEntry() [on "Añadir" click]
  ├── validate fields + duplicate check
  ├── controlledCups[cups_key] = {...}
  ├── saveControlledCups() → localStorage.setItem
  ├── renderCupsModal()
  └── revalidateAndRenderResults()

removeCupsEntry(key) [on per-row "Eliminar" click]
  ├── delete controlledCups[key]
  ├── saveControlledCups() → localStorage.setItem
  ├── renderCupsModal()
  └── revalidateAndRenderResults()

revalidateAndRenderResults()
  └── for each r in results:
        r.warnings = buildWarnings(r, controlledCups)
        → renderResults()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `poc/parser-local/index.html` | Modify | Add storage funcs, modal HTML/CSS, toolbar button, all event handlers |

## Detailed Changes to `index.html`

### 1. CSS additions (inside existing `<style>` block)

```css
/* Modal overlay */
#cupsModal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; align-items: center; justify-content: center; }
/* Modal panel */
#cupsModal > div { background: #fff; border-radius: 8px; padding: 1.5rem; max-width: 700px; width: 90%; max-height: 85vh; display: flex; flex-direction: column; gap: 0.75rem; }
/* Modal header row */
.cups-modal-header { display: flex; justify-content: space-between; align-items: center; }
.cups-modal-header h3 { margin: 0; color: #333; }
/* Table wrapper */
.cups-table-wrap { overflow-y: auto; max-height: 50vh; }
/* Form row */
.cups-form-row { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: flex-end; }
.cups-form-row label { display: flex; flex-direction: column; font-size: 0.75rem; gap: 0.2rem; }
.cups-form-row input, .cups-form-row select { padding: 0.3rem 0.4rem; font-size: 0.8rem; border: 1px solid #ccc; border-radius: 4px; }
.cups-form-row .btn-add { padding: 0.3rem 0.8rem; background: #0066cc; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
#cupsFormError { color: #c00; font-size: 0.75rem; margin: 0; }
```

### 2. Toolbar button (inside `.toolbar` div, after export buttons)

```html
<button id="gestionarCupsBtn">Gestionar CUPS</button>
```

### 3. Modal HTML (before `processing-overlay` div, inside `<body>`)

```html
<div id="cupsModal">
  <div>
    <div class="cups-modal-header">
      <h3>CUPS Controlados</h3>
      <button id="cupsModalClose" style="background:none;border:none;font-size:1.2rem;cursor:pointer;">✕</button>
    </div>
    <div class="cups-table-wrap">
      <table class="results-table" id="cupsModalTable">
        <thead>
          <tr>
            <th>CUPS</th><th>Edificio</th><th>Nombre</th><th>Tipo</th><th>Distribuidora</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody id="cupsModalTableBody"></tbody>
      </table>
    </div>
    <form id="cupsAddForm" class="cups-form-row">
      <label>CUPS<input type="text" id="cupsFormKey" placeholder="ES0022..." /></label>
      <label>Edificio<input type="text" id="cupsFormBuildingKey" placeholder="VALLEHERMOSO" /></label>
      <label>Nombre<input type="text" id="cupsFormBuildingName" placeholder="Vallehermoso" /></label>
      <label>Tipo
        <select id="cupsFormEnergyType">
          <option value="electricidad">Electricidad</option>
          <option value="gas_natural">Gas Natural</option>
        </select>
      </label>
      <label>Distribuidora<input type="text" id="cupsFormSupplier" placeholder="Iberdrola" /></label>
      <button type="submit" class="btn-add">Añadir</button>
    </form>
    <p id="cupsFormError"></p>
  </div>
</div>
```

### 4. Storage functions (add after `UTILITIES` comment block)

```javascript
function saveControlledCups() {
  try {
    localStorage.setItem('sigee-controlled-cups', JSON.stringify(controlledCups));
  } catch(e) {
    console.warn('[SIGEE] localStorage unavailable:', e);
  }
}

async function loadControlledCups() {
  try {
    const stored = localStorage.getItem('sigee-controlled-cups');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        controlledCups = parsed;
        return;
      }
    }
  } catch(e) {
    console.warn('[SIGEE] localStorage parse failed, using seed:', e);
  }
  // Seed fallback
  try {
    const resp = await fetch('./sample-data/controlled-cups.json');
    const txt = await resp.text();
    const jsonStr = txt.replace(/#.*$/gm, '').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    controlledCups = JSON.parse(jsonStr);
  } catch(e) {
    console.warn('[SIGEE] Seed load failed, using empty:', e);
    controlledCups = {};
  }
}
```

### 5. Modal functions (add after `showOverlay`)

```javascript
function openCupsModal() {
  document.getElementById('cupsModal').style.display = 'flex';
  renderCupsModal();
}

function closeCupsModal() {
  document.getElementById('cupsModal').style.display = 'none';
}

function renderCupsModal() {
  const tbody = document.getElementById('cupsModalTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const keys = Object.keys(controlledCups).sort();
  if (keys.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">Sin entradas</td></tr>';
    return;
  }
  for (const key of keys) {
    const entry = controlledCups[key];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${escapeHtml(key)}</code></td>
      <td>${escapeHtml(entry.building_key)}</td>
      <td>${escapeHtml(entry.building_name)}</td>
      <td>${escapeHtml(entry.energy_type)}</td>
      <td>${escapeHtml(entry.supplier)}</td>
      <td><button class="danger" style="padding:0.2rem 0.5rem;font-size:0.7rem;" onclick="removeCupsEntry('${escapeHtml(key)}')">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  }
}

function addCupsEntry() {
  const errorEl = document.getElementById('cupsFormError');
  errorEl.textContent = '';
  const cupsRaw = document.getElementById('cupsFormKey').value.trim();
  const building_key = document.getElementById('cupsFormBuildingKey').value.trim();
  const building_name = document.getElementById('cupsFormBuildingName').value.trim();
  const energy_type = document.getElementById('cupsFormEnergyType').value;
  const supplier = document.getElementById('cupsFormSupplier').value.trim();
  if (!cupsRaw || !building_key || !building_name || !supplier) {
    errorEl.textContent = 'Todos los campos son obligatorios';
    return;
  }
  const { normalized } = normalizeCups(cupsRaw);
  if (controlledCups[normalized]) {
    errorEl.textContent = 'Este CUPS ya existe';
    return;
  }
  controlledCups[normalized] = { building_key, building_name, energy_type, supplier };
  saveControlledCups();
  // Clear form
  document.getElementById('cupsFormKey').value = '';
  document.getElementById('cupsFormBuildingKey').value = '';
  document.getElementById('cupsFormBuildingName').value = '';
  document.getElementById('cupsFormSupplier').value = '';
  renderCupsModal();
  revalidateAndRenderResults();
}

function removeCupsEntry(key) {
  delete controlledCups[key];
  saveControlledCups();
  renderCupsModal();
  revalidateAndRenderResults();
}

function revalidateAndRenderResults() {
  for (const r of results) {
    r.warnings = buildWarnings(r, controlledCups);
    if (r.cups_key && controlledCups[r.cups_key]) {
      r.controlled_cups_match = true;
      r.building_key = controlledCups[r.cups_key].building_key;
      r.building_name = controlledCups[r.cups_key].building_name;
    } else {
      r.controlled_cups_match = false;
    }
  }
  renderResults();
}
```

### 6. Modify `init()` — replace the direct fetch with `loadControlledCups()`

Change:
```javascript
async function init() {
  // ...
  try {
    const resp = await fetch('./sample-data/controlled-cups.json');
    // ...parse...
    controlledCups = JSON.parse(jsonStr);
  } catch(e) { /* keep empty */ }
```

To:
```javascript
async function init() {
  // ...
  await loadControlledCups();
```

### 7. CUPS blur normalization — attach to the CUPS input field

In `openCupsModal()` or via event delegation on the form, add a blur listener on `#cupsFormKey` that normalizes on blur:
```javascript
document.getElementById('cupsFormKey').addEventListener('blur', function() {
  const { normalized } = normalizeCups(this.value);
  this.value = normalized;
});
```

### 8. Event listeners — add in `init()` after existing button listeners

```javascript
document.getElementById('gestionarCupsBtn').addEventListener('click', openCupsModal);
document.getElementById('cupsModalClose').addEventListener('click', closeCupsModal);
document.getElementById('cupsModal').addEventListener('click', function(e) {
  if (e.target === this) closeCupsModal();
});
document.getElementById('cupsAddForm').addEventListener('submit', function(e) {
  e.preventDefault();
  addCupsEntry();
});
```

## Interfaces / Contracts

```typescript
type EnergyType = 'electricidad' | 'gas_natural';

interface ControlledCup {
  building_key: string;
  building_name: string;
  energy_type: EnergyType;
  supplier: string;
}

// Global (window-scope in index.html)
declare let controlledCups: Record<string, ControlledCup>;
declare let results: ParsedResult[];
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `normalizeCups` edge cases; duplicate detection; field validation | Direct function calls in browser console or test file |
| Integration | Add→save→reload→verify; remove→save→reload→verify | Manual: add entry, close modal, reopen, verify entry persists |
| E2E | Add/remove flows end-to-end; re-validation after add/remove | Open modal, add entry, verify results table CUPS badge changes from 🔴 to 🟢 |

## Migration / Rollout

No migration required. The seed file `controlled-cups.json` remains unchanged and is only fetched when localStorage is empty or corrupt. Existing results are unaffected unless a CUPS change affects their `UNCONTROLLED_CUPS` warning status, which is the intended behavior.

## Open Questions

None. All decisions are resolved by the spec and existing codebase patterns.
