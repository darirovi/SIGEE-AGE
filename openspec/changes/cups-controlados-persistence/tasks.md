# Tasks: CUPS Controlados Persistence

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full implementation | PR 1 | All tasks in single PR targeting `poc/parser-local/index.html` |

## Phase 1: Foundation — Storage Functions

- [x] T-001 **Add `saveControlledCups()` and `loadControlledCups()` functions** — Add after the UTILITIES comment block in `poc/parser-local/index.html`. `saveControlledCups()` wraps `localStorage.setItem` in try/catch. `loadControlledCups()` checks localStorage first, falls back to fetching `./sample-data/controlled-cups.json` and parsing with the existing JSON-cleaning logic.

## Phase 2: Infrastructure — Init Integration

- [x] T-002 **Modify `init()` to call `loadControlledCups()`** — In `poc/parser-local/index.html`, replace the inline fetch+parse block for controlled-cups.json with `await loadControlledCups()`. This decouples the seed loading from init and enables the storage layer to take over on subsequent loads.

## Phase 3: Modal UI — HTML Structure

- [x] T-003 **Add modal HTML before `processing-overlay` div** — Add the `#cupsModal` overlay container with inner div, header row (h3 + close button), table wrapper with `id="cupsModalTable"`, tbody `id="cupsModalTableBody"`, and the add form with all five fields (cupsFormKey, cupsFormBuildingKey, cupsFormBuildingName, cupsFormEnergyType select, cupsFormSupplier) plus error paragraph `id="cupsFormError"`.

## Phase 4: Modal UI — CSS Styles

- [x] T-004 **Add modal CSS inside existing `<style>` block** — Add all modal styles: `#cupsModal` overlay (fixed, semi-transparent backdrop, z-index 200, centered flex), `.cups-modal-header` (flex row, space-between), `.cups-table-wrap` (overflow-y auto, max-height 50vh), `.cups-form-row` (flex, gap, wrap, align-items flex-end), form label/input/select sizing, `.btn-add` styling, `#cupsFormError` (red, small).

## Phase 5: Toolbar — Button

- [x] T-005 **Add "Gestionar CUPS" toolbar button** — Inside the `.toolbar` div, after existing export buttons, add `<button id="gestionarCupsBtn">Gestionar CUPS</button>`.

## Phase 6: Core Functions — Modal Rendering

- [x] T-006 **Add `openCupsModal()` and `renderCupsModal()`** — Add after `showOverlay`. `openCupsModal()` sets display to flex and calls `renderCupsModal()`. `renderCupsModal()` clears tbody, sorts keys, renders each row with escaped HTML, per-row "Eliminar" button calling `removeCupsEntry(key)`, and empty-state row if no entries.

## Phase 7: Core Functions — Add Entry

- [x] T-007 **Add `addCupsEntry()` with validation and duplicate check** — On form submit, validate all fields non-empty, check `controlledCups[normalized]` does not exist, normalize CUPS via `normalizeCups()`, save entry, clear form, call `saveControlledCups()`, re-render modal, call `revalidateAndRenderResults()`. Show error in `cupsFormError` on validation failure.

## Phase 8: Core Functions — CUPS Normalization on Blur

- [x] T-008 **Add CUPS normalization on input blur** — In `openCupsModal()` (or in init after form exists), attach a blur listener to `#cupsFormKey` that calls `normalizeCups()` and updates the input value with the normalized result.

## Phase 9: Core Functions — Remove Entry

- [x] T-009 **Add `removeCupsEntry(key)` function** — Delete `controlledCups[key]`, call `saveControlledCups()`, re-render modal, call `revalidateAndRenderResults()`.

## Phase 10: Wiring — Event Listeners

- [x] T-010 **Add all modal event listeners in `init()`** — After existing button listeners: click on `#gestionarCupsBtn` → `openCupsModal`; click on `#cupsModalClose` → `closeCupsModal`; click on `#cupsModal` backdrop → `closeCupsModal`; submit on `#cupsAddForm` → `preventDefault` + `addCupsEntry`.

## Phase 11: Testing

- [x] T-011 **Manual test: localStorage persistence across reload** — Open modal, add a new CUPS entry, close modal, reload the page, reopen modal, verify the entry persists and is not lost.
- [x] T-012 **Manual test: re-validation updates results table badges** — Parse a PDF with an unknown CUPS (should show red/uncontrolled badge), add that CUPS to controlled list via modal, verify the results table badge updates to green/controlled without re-parsing.

---

## Implementation Order

1. **T-001** (storage funcs) → enables everything else
2. **T-002** (init wiring) → uses storage funcs
3. **T-003** + **T-004** + **T-005** (UI shell) → independent of logic
4. **T-006** (modal rendering) → needs modal HTML in DOM
5. **T-007** + **T-008** + **T-009** (CRUD functions) → need modal structure
6. **T-010** (event listeners) → wires everything together
7. **T-011** + **T-012** (tests) → verify end-to-end behavior

## Files Affected

| File | Tasks |
|------|-------|
| `poc/parser-local/index.html` | T-001 through T-010 |
