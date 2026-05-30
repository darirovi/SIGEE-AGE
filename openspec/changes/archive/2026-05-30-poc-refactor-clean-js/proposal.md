# Proposal: poc-refactor-clean-js

## Intent

The PoC at `poc/parser-local/index.html` is a 1007-line single-file HTML app with ~800 lines of inline JS and ~300 lines of inline CSS. This structure is unmaintainable: 37 functions in one file makes navigation, testing, and adding parsers hard. Additionally, the CUPS seed is fetched via `fetch('./sample-data/controlled-cups.json')`, which fails with CORS when opened via `file://`. This change extracts the inline code into a clean multi-file module structure and embeds the seed to achieve `file://` compatibility — all without a build step.

## Scope

### In Scope
- Extract `<style>` block → `css/styles.css`
- Extract inline `<script>` into modules: `state.js`, `utils.js`, `marcadores.js`, `storage.js`, `validation.js`, `render.js`, `export.js`, `cups-modal.js`, `pdf.js`, `app.js`
- Extract parser functions into `js/parsers/` directory (one file per parser + `index.js` registry)
- Embed 22 CUPS entries as `const SEED_CUPS = {...}` in `storage.js` (no fetch, no CORS)
- Modify `loadControlledCups()`: try localStorage → if empty or corrupt, use `SEED_CUPS` directly
- Wire all modules via `<script src="...">` tags in dependency order in `index.html`
- Keep `vendor/pdf.min.js` as external dependency

### Out of Scope
- No bundler/build step in Phase 1
- No ES modules (`<script>` concatenation only)
- No changes to parser logic (regex, field extraction, warnings)
- No changes to backend Python code
- No testing framework

## Capabilities

### New Capabilities
None

### Modified Capabilities
None

## Approach

1. **Read** current `index.html` fully (1007 lines).
2. **Extract CSS** → `css/styles.css`. Remove `<style>` block from `index.html`, add `<link rel="stylesheet" href="css/styles.css">`.
3. **Create `js/` directory structure** and extract by function group:
   - `state.js` — global variables (`controlledCups`, `results`, `expectedCache`, `selectedIndex`, `debugVisible`, `cupsLoadWarning`)
   - `utils.js` — pure utility functions (`normalizeCups`, `parseSpanishNumber`, `parseSpanishDate`, `parseDateWithDots`, `computePeriodMonth`, `formatDate`, `parsePeriodRange`, `escapeHtml`)
   - `marcadores.js` — `MARCADORES` + `detectParser()`
   - `storage.js` — `SEED_CUPS` embedded constant + `loadControlledCups()` + `saveControlledCups()`
   - `validation.js` — `BLOCKING_CODES`, `buildWarnings()`, `createEmptyResult()`, `calcConfidence()`, `getExpectedFilename()`, `loadExpectedForResult()`, `validateAgainstExpected()`
   - `render.js` — UI functions (`cupsStatus()`, `warningBadge()`, `expectedBadge()`, `buildRow()`, `renderResults()`, `selectRow()`)
   - `export.js` — `exportJson()`, `exportCsv()`
   - `cups-modal.js` — `openCupsModal()`, `closeCupsModal()`, `renderCupsModal()`, `addCupsEntry()`, `removeCupsEntry()`, `revalidateResults()`
   - `pdf.js` — `extractPdfText()`
   - `app.js` — `init()` + event wiring + `processFiles()`
   - `parsers/index.js` — parser registry mapping parser name → parser function
   - `parsers/iberdrola.js`, `parsers/curenergia.js`, `parsers/naturgy-elec.js`, `parsers/naturgy-gas.js`, `parsers/energia-xxi.js`, `parsers/generic.js`
4. **Wire script tags** in `index.html` in dependency order: `state.js` first, then utilities, then parsers, then features, finally `app.js`.
5. **Test** by opening `index.html` via double-click (`file://`) — results table renders, CUPS modal works, no fetch errors.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `poc/parser-local/index.html` | Modified | Shell HTML with `<link>` + `<script>` tags |
| `poc/parser-local/css/styles.css` | New | Extracted CSS from `<style>` block |
| `poc/parser-local/js/state.js` | New | Global state variables |
| `poc/parser-local/js/utils.js` | New | Utility functions |
| `poc/parser-local/js/marcadores.js` | New | `MARCADORES` + `detectParser()` |
| `poc/parser-local/js/storage.js` | New | CUPS persistence + embedded `SEED_CUPS` |
| `poc/parser-local/js/validation.js` | New | Warning logic + validation |
| `poc/parser-local/js/render.js` | New | Table rendering functions |
| `poc/parser-local/js/export.js` | New | JSON/CSV export |
| `poc/parser-local/js/cups-modal.js` | New | CUPS management modal |
| `poc/parser-local/js/pdf.js` | New | PDF text extraction |
| `poc/parser-local/js/app.js` | New | `init()` + event wiring |
| `poc/parser-local/js/parsers/index.js` | New | Parser registry |
| `poc/parser-local/js/parsers/*.js` | New | One file per parser |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Script load order breaks globals | High | Document dependency order explicitly; `state.js` loads first |
| Globals accessed across files | Medium | Use window-prefixed globals (`window.controlledCups`) or a single `state` object |
| `file://` CORS on fetch after refactor | Low | Seed is now embedded; fetch only for `examples/parser_expected/` which only applies when served |
| Some inline `<style>` on modal elements | Low | Keep those inline or extract progressively |

## Rollback Plan

1. Revert `index.html` to inline `<style>` + `<script>` block from git history.
2. Delete the `css/` and `js/` directories.
3. No data migration needed — state lives in localStorage which is untouched.

## Dependencies

- `vendor/pdf.min.js` (unchanged, still external)

## Success Criteria

- [ ] `poc/parser-local/index.html` loads correctly via `file://` (double-click, no server)
- [ ] All 37 original functions are present and wired in extracted modules
- [ ] CUPS modal opens, shows seed data, and persists changes to localStorage
- [ ] PDF processing produces identical results to the original single-file version
- [ ] No `fetch()` calls on startup (eliminates file:// CORS errors)
- [ ] External refs to `./sample-data/` and `./examples/` remain as-is for served mode
