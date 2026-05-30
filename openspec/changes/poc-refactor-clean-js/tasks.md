# Tasks: poc-refactor-clean-js — Extract Single-File PoC into Modular JS

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1000 (800 JS + 300 CSS across 18 new/modified files) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Single PR with size:exception (maintainer-approved) |
| Delivery strategy | single-pr |
| Chain strategy | size:exception |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full extraction: CSS + all JS modules + rewritten index.html | PR 1 | All files extracted; size:exception required from maintainer |

> **Rationale**: This is a pure extraction refactor — ~1000 lines split across 18 files. Each file is a clean, reviewable slice of the original. The diff against the original is large only because we're deleting the inline block and adding file references. No logic changes. Single PR with size:exception is appropriate for a PoC-level refactor.

## Phase 1: Infrastructure — Directory Structure

- [x] 1.1 Create `poc/parser-local/css/` directory
- [x] 1.2 Create `poc/parser-local/js/` directory
- [x] 1.3 Create `poc/parser-local/js/parsers/` directory

## Phase 2: CSS Extraction

- [x] 2.1 Extract `<style>` block (lines 9–64 of `index.html`) → `poc/parser-local/css/styles.css`
- [x] 2.2 Add `<link rel="stylesheet" href="css/styles.css">` to `<head>` in `index.html`
- [x] 2.3 Remove the `<style>...</style>` block from `index.html`

## Phase 3: Foundation Modules (no dependencies)

- [x] 3.1 Extract globals block (lines 141–149) → `poc/parser-local/js/state.js` — assign all vars to `window.controlledCups`, `window.results`, `window.expectedCache`, `window.selectedIndex`, `window.debugVisible`, `window.cupsLoadWarning`
- [x] 3.2 Extract utility functions (lines 154–241) → `poc/parser-local/js/utils.js` — `normalizeCups`, `parseSpanishNumber`, `parseSpanishDate`, `parseDateWithDots`, `computePeriodMonth`, `formatDate`, `parsePeriodRange`, `escapeHtml`, `MONTH_MAP`
- [x] 3.3 Embed 22 CUPS entries as `window.SEED_CUPS = {...}` → `poc/parser-local/js/seed-cups.js` (source from `data/seed/cups_controlados.csv`)
- [x] 3.4 Extract `loadControlledCups()` + `saveControlledCups()` + SEED_CUPS dependency (lines 246–303, stripped of fetch) → `poc/parser-local/js/storage.js`

## Phase 4: Parser Detection & Registration

- [x] 4.1 Extract `MARCADORES` constant + `detectParser()` (lines 308–342) → `poc/parser-local/js/marcadores.js`
- [x] 4.2 Extract `parseIberdrolaElectricidad()` (lines 401–418) → `poc/parser-local/js/parsers/iberdrola.js`
- [x] 4.3 Extract `parseCurenergiaPvpc()` (lines 420–465) → `poc/parser-local/js/parsers/curenergia.js`
- [x] 4.4 Extract `parseNaturgyReguladaElectricidad()` (lines 467–482) → `poc/parser-local/js/parsers/naturgy-elec.js`
- [x] 4.5 Extract `parseNaturgyReguladaGasNatural()` (lines 500–512) → `poc/parser-local/js/parsers/naturgy-gas.js`
- [x] 4.6 Extract `parseEnergiaXXiGasNatural()` (lines 484–498) → `poc/parser-local/js/parsers/energia-xxi.js`
- [x] 4.7 Extract `parseGenericInvoice()` (lines 514–543) → `poc/parser-local/js/parsers/generic.js`
- [x] 4.8 Create `poc/parser-local/js/parsers/index.js` — PARSERS registry + `processFiles()` (lines 599–633)

## Phase 5: Validation & Rendering

- [x] 5.1 Extract validation functions (lines 347–594) → `poc/parser-local/js/validation.js` — `BLOCKING_CODES`, `buildWarnings()`, `createEmptyResult()`, `calcConfidence()`, `getExpectedFilename()`, `loadExpectedForResult()`, `validateAgainstExpected()`, `VALIDATION_FIELDS`
- [x] 5.2 Extract render functions (lines 638–735) → `poc/parser-local/js/render.js` — `cupsStatus()`, `warningBadge()`, `expectedBadge()`, `buildRow()`, `renderResults()`, `selectRow()` (including inline toggleDebugBtn listener)
- [x] 5.3 Extract export functions (lines 740–770) + `clearResults()` (lines 775–782) + `showOverlay()` (lines 787–789) → `poc/parser-local/js/export.js`

## Phase 6: CUPS Modal

- [x] 6.1 Extract CUPS modal functions (lines 794–907) → `poc/parser-local/js/cups-modal.js` — `openCupsModal()`, `closeCupsModal()`, `renderCupsModal()`, `addCupsEntry()`, `removeCupsEntry()`, `revalidateResults()`

## Phase 7: PDF & App Entry Point

- [x] 7.1 Extract `extractPdfText()` (lines 548–560) → `poc/parser-local/js/pdf.js`
- [x] 7.2 Extract `init()` (lines 912–953) → `poc/parser-local/js/app.js` — pdf.js worker config, CUPS load, event wiring for all buttons

## Phase 8: Rewrite index.html Shell

- [x] 8.1 Remove all inline `<script>...</script>` blocks from `index.html`
- [x] 8.2 Move modal HTML (`<div id="cupsModalOverlay">`, lines 956–1005) from EOF to inside `<body>` before `</body>`
- [x] 8.3 Insert `<script src="vendor/pdf.min.js"></script>` in `<head>`
- [x] 8.4 Insert all module `<script>` tags in dependency order (per spec): state → utils → seed-cups → storage → marcadores → parsers/*.js → parsers/index.js → validation → render → export → cups-modal → pdf → app.js
- [x] 8.5 Remove `DOMContentLoaded` wrapper from `app.js init` call (keep as call, remove event listener wrapper — scripts are sequential)

## Phase 9: Verification

- [ ] 9.1 Verify `file://` compatibility: double-click `index.html`, page loads without JS errors, CUPS modal shows 22 seed entries
- [ ] 9.2 Verify HTTP server mode: `python3 -m http.server` serves page, PDF processing works, no console errors
- [ ] 9.3 Verify no `fetch()` call on startup (seed is embedded; no `controlled-cups.json` fetch)
- [ ] 9.4 Verify `gestionarCupsBtn` opens modal with 22 entries
- [ ] 9.5 Verify localStorage persistence: add a CUPS entry, reload page, entry persists
