# Design: poc-refactor-clean-js — Extract PoC into Modular JS

## Technical Approach

Refactor the 1007-line single-file `index.html` PoC into a clean multi-file structure under `poc/parser-local/`. CSS moves to `css/styles.css`. All inline `<script>` content splits into `js/` modules using the **global `window` namespace** (not ES modules) for `file://` compatibility. SEED_CUPS embeds directly in `js/seed-cups.js`, eliminating the startup `fetch('./sample-data/controlled-cups.json')`.

## Architecture Decisions

### Decision: Global namespace over ES modules

| Option | Decision | Rationale |
|--------|----------|-----------|
| ES modules (`import/export`) | Rejected | `file://` origin blocks CORS for local imports; requires a dev server |
| Global `window` namespace + script tag order | **Chosen** | Works via double-click with no server; all browsers support it |
| IIFE wrapping per file | Rejected | Unnecessary complexity; globals are fine for this PoC scale |

### Decision: Seed data embedded, not fetched

| Option | Decision | Rationale |
|--------|----------|-----------|
| Fetch `./sample-data/controlled-cups.json` on startup | Rejected | Blocks `file://`; fetch fails with CORS |
| Embed SEED_CUPS in `js/seed-cups.js` | **Chosen** | Zero network dependency; works offline |
| Merge localStorage on top of seed | **Chosen** | User-added CUPS persist across sessions |

### Decision: Script tag load order drives dependency resolution

| Option | Decision | Rationale |
|--------|----------|-----------|
| Dynamic `import()` in code | Rejected | ES modules; CORS issues on `file://` |
| Script tag order | **Chosen** | Browser executes sequentially; `window.controlledCups` is available when needed |
| Bundle with a tool (esbuild/vite) | Rejected | Adds build step; contradicts "open index.html directly" goal |

## Data Flow

```
PDF file selected
       │
       ▼
app.js:processFiles() ──→ pdf.js:extractPdfText()
       │                         │
       ▼                         ▼
marcadores.js:detectParser()  text
       │                         │
       ▼                         ▼
parsers/index.js ──→ [iberdrola.js | curenergia.js | naturgy-elec.js | naturgy-gas.js | energia-xxi.js | generic.js]
       │                                    │
       │    ◄── utils.js (normalizeCups, parseSpanishNumber, etc.)
       ▼
validation.js:buildWarnings() + validateAgainstExpected()
       │
       ▼
render.js:renderResults() ──→ DOM
       │
       ▼
export.js:exportJson/exportCsv() ──→ Blob download
```

**State flow**: `js/state.js` defines globals on `window`. All modules read/write via `window.controlledCups`, `window.results`, etc.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `poc/parser-local/index.html` | Modify | Remove `<style>...</style>`, replace with `<link>`. Remove all inline `<script>`. Move modal HTML into `<body>`. Add ordered `<script src="js/...">` tags. |
| `poc/parser-local/css/styles.css` | Create | All CSS from the `<style>` block (lines 9–64 of original). |
| `poc/parser-local/js/state.js` | Create | `window.controlledCups = {}`, `window.results = []`, `window.expectedCache = {}`, `window.selectedIndex = -1`, `window.debugVisible = true`, `window.cupsLoadWarning = null` |
| `poc/parser-local/js/utils.js` | Create | `normalizeCups`, `parseSpanishNumber`, `parseSpanishDate`, `parseDateWithDots`, `computePeriodMonth`, `formatDate`, `parsePeriodRange`, `escapeHtml`, `MONTH_MAP` — all as named exports on `window` |
| `poc/parser-local/js/seed-cups.js` | Create | `window.SEED_CUPS = { ... }` — 22-entry CUPS map embedded as plain object |
| `poc/parser-local/js/storage.js` | Create | `loadControlledCups()` — merges localStorage over SEED_CUPS. `saveControlledCups()` — `localStorage.setItem('sigee-controlled-cups', JSON.stringify(controlledCups))` with try/catch |
| `poc/parser-local/js/marcadores.js` | Create | `MARCADORES` constant + `detectParser()` — extracted verbatim from original |
| `poc/parser-local/js/parsers/index.js` | Create | `PARSERS` registry map `{ iberdrola_electricidad: parseIberdrolaElectricidad, ... }`. Also defines `processFiles()` which was inline in the original |
| `poc/parser-local/js/parsers/iberdrola.js` | Create | `parseIberdrolaElectricidad()` extracted |
| `poc/parser-local/js/parsers/curenergia.js` | Create | `parseCurenergiaPvpc()` extracted |
| `poc/parser-local/js/parsers/naturgy-elec.js` | Create | `parseNaturgyReguladaElectricidad()` extracted |
| `poc/parser-local/js/parsers/naturgy-gas.js` | Create | `parseNaturgyReguladaGasNatural()` extracted |
| `poc/parser-local/js/parsers/energia-xxi.js` | Create | `parseEnergiaXXiGasNatural()` extracted |
| `poc/parser-local/js/parsers/generic.js` | Create | `parseGenericInvoice()` extracted |
| `poc/parser-local/js/validation.js` | Create | `BLOCKING_CODES`, `VALIDATION_FIELDS`, `buildWarnings()`, `validateAgainstExpected()`, `createEmptyResult()`, `calcConfidence()`, `getExpectedFilename()`, `loadExpectedForResult()` |
| `poc/parser-local/js/render.js` | Create | `cupsStatus()`, `warningBadge()`, `expectedBadge()`, `buildRow()`, `renderResults()`, `selectRow()` |
| `poc/parser-local/js/export.js` | Create | `exportJson()`, `exportCsv()` — Blob + createObjectURL (no fetch) |
| `poc/parser-local/js/cups-modal.js` | Create | `openCupsModal()`, `closeCupsModal()`, `renderCupsModal()`, `addCupsEntry()`, `removeCupsEntry()`, `revalidateResults()` |
| `poc/parser-local/js/pdf.js` | Create | `extractPdfText()` using pdfjsLib |

## Script Tag Order in index.html

```html
<script src="vendor/pdf.min.js"></script>   <!-- 3rd-party PDF lib -->
<script src="js/state.js"></script>        <!-- globals first -->
<script src="js/utils.js"></script>        <!-- pure utils -->
<script src="js/seed-cups.js"></script>   <!-- SEED_CUPS data -->
<script src="js/storage.js"></script>      <!-- uses SEED_CUPS -->
<script src="js/marcadores.js"></script>   <!-- parser detection -->
<script src="js/parsers/iberdrola.js"></script>
<script src="js/parsers/curenergia.js"></script>
<script src="js/parsers/naturgy-elec.js"></script>
<script src="js/parsers/naturgy-gas.js"></script>
<script src="js/parsers/energia-xxi.js"></script>
<script src="js/parsers/generic.js"></script>
<script src="js/parsers/index.js"></script>  <!-- PARSERS registry + processFiles -->
<script src="js/validation.js"></script>
<script src="js/render.js"></script>
<script src="js/export.js"></script>
<script src="js/cups-modal.js"></script>
<script src="js/pdf.js"></script>
<script src="js/app.js"></script>           <!-- init() + event wiring -->
```

## Interfaces / Key Implementation Notes

**`window.controlledCups`** — same shape as original: `{ [cups_key]: { building_key, building_name, energy_type, supplier } }`. Stored in localStorage under key `'sigee-controlled-cups'` (note the hyphen, per original code).

**`loadControlledCups()`** — 3-step: (1) try localStorage, (2) if corrupt/missing, set `cupsLoadWarning` and fall back to `SEED_CUPS`, (3) no fetch needed.

**Parser functions** — each calls `createEmptyResult()` from `validation.js` and uses utilities from `utils.js` via global `window.normalizeCups` etc.

**Modal HTML** — currently at EOF after `</script>`, outside `<body>`. Must be moved inside `<body>` before `</body>`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| `file://` load | All scripts load, no errors, 22 CUPS shown | Open `index.html` directly; check console |
| CUPS modal | Add entry, remove entry, persistence across reload | Click "Gestionar CUPS", add a test CUPS, reload |
| PDF parsing | Each parser extracts correct fields | Process sample PDFs from `examples/facturas/` |
| Export | JSON/CSV download triggers | Click export buttons, inspect downloaded file |
| Server mode | Expected JSON files load via HTTP | Serve via `npx serve .` and process PDFs |

## Migration / Rollout

No migration needed — this is a pure refactor of a PoC with no production users. The old `index.html` is replaced entirely. The `sample-data/controlled-cups.json` remains on disk (not deleted) but is no longer fetched at runtime.

## Open Questions

- [ ] None — the spec is complete and the extraction boundaries are clear from the existing code.
