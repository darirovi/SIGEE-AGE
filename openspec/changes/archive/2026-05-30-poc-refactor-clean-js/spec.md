# Delta for poc-refactor-clean-js

## Purpose

Extract the 1007-line single-file PoC HTML app into a clean multi-file module structure with embedded CUPS seed data, eliminating `fetch()` on startup to achieve `file://` compatibility.

---

## ADDED Requirements

### Requirement: File Structure

The system SHALL produce the following directory layout under `poc/parser-local/`:

```
poc/parser-local/
├── index.html                          # Shell HTML with <link> + <script> tags
├── css/
│   └── styles.css                      # All CSS extracted from <style> block
├── js/
│   ├── state.js                        # Global state variables
│   ├── utils.js                        # Pure utility functions
│   ├── storage.js                      # SEED_CUPS + loadControlledCups() + saveControlledCups()
│   ├── marcadores.js                    # MARCADORES constant + detectParser()
│   ├── validation.js                    # buildWarnings(), validateAgainstExpected(), VALIDATION_FIELDS
│   ├── render.js                       # renderResults(), buildRow(), cupsStatus(), warningBadge(), expectedBadge()
│   ├── export.js                       # exportJson(), exportCsv()
│   ├── cups-modal.js                    # CUPS management modal functions
│   ├── pdf.js                          # extractPdfText()
│   ├── app.js                          # init() + event wiring
│   └── parsers/
│       ├── index.js                    # Parser registry map
│       ├── iberdrola.js                 # Iberdrola electricidad parser
│       ├── curenergia.js                # Curenergia electricidad PVPC parser
│       ├── naturgy-elec.js             # Naturgy electricidad parser
│       ├── naturgy-gas.js               # Naturgy gas natural parser
│       ├── energia-xxi.js               # Energia XXI gas natural parser
│       └── generic.js                  # Generic invoice parser
```

#### Scenario: File tree reflects all extraction targets

- GIVEN the refactoring is complete
- WHEN listing `poc/parser-local/`
- THEN all listed files and directories exist

---

### Requirement: Module Exports — `state.js`

The `state.js` module SHALL export the following globals via the `window` object:

| Variable | Type | Description |
|----------|------|-------------|
| `controlledCups` | `Object` | CUPS map: `{ [cups_key]: { building_key, building_name, energy_type, supplier } }` |
| `results` | `Array` | Parsed invoice results array |
| `selectedIndex` | `Number` | Currently selected row index (-1 if none) |
| `debugVisible` | `Boolean` | Debug panel visibility state |
| `expectedCache` | `Object` | Cache of loaded expected files: `{ [filename]: parsed_object }` |
| `cupsLoadWarning` | `String` | Warning message if CUPS failed to load |

The system SHALL assign these as `window.controlledCups`, `window.results`, etc. for cross-file access.

#### Scenario: State module exposes all globals

- GIVEN `state.js` is loaded
- WHEN `window.controlledCups` is accessed
- THEN it returns an object
- AND `window.results` returns an array

---

### Requirement: Module Exports — `utils.js`

The `utils.js` module SHALL export all functions as named exports:

- `normalizeCups(cups)` — normalizes CUPS string per SIGEE-AGE rules
- `parseSpanishNumber(str)` — parses Spanish-formatted numbers (1.234,56 → 1234.56)
- `parseSpanishDate(str)` — parses Spanish date strings
- `parseDateWithDots(str)` — parses dates with dot separator (dd.mm.yyyy)
- `computePeriodMonth(periodEnd)` — computes [year, month] from `period_end` date
- `formatDate(date)` — formats date as DD/MM/YYYY
- `parsePeriodRange(periodStr)` — parses period range string
- `escapeHtml(str)` — escapes HTML special characters

#### Scenario: Utils functions are callable

- GIVEN `utils.js` is loaded
- WHEN calling `normalizeCups('ES 0022 0000 0621 2876 CB')`
- THEN it returns `'ES0022000006212876CB'`

---

### Requirement: Module Exports — `storage.js`

The `storage.js` module SHALL export:

- `SEED_CUPS` — embedded constant: 22-entry object mapping CUPS key → CUPS entry
- `loadControlledCups()` — returns CUPS from localStorage if valid, else `SEED_CUPS`
- `saveControlledCups(cups)` — persists CUPS to localStorage

The `loadControlledCups()` function MUST:
1. Read `localStorage.getItem('controlledCups')`
2. Parse as JSON; if corrupt or missing, return `SEED_CUPS`
3. If valid, merge with `SEED_CUPS` (localStorage overrides seed)

#### Scenario: Load falls back to seed on empty storage

- GIVEN localStorage is empty
- WHEN calling `loadControlledCups()`
- THEN it returns `SEED_CUPS` with 22 entries

#### Scenario: Load merges localStorage with seed

- GIVEN localStorage contains `{ 'ESXXX': { building_key: 'B001' } }`
- WHEN calling `loadControlledCups()`
- THEN result has seed entries PLUS the localStorage entry

---

### Requirement: Module Exports — `marcadores.js`

The `marcadores.js` module SHALL export:

- `MARCADORES` — object mapping parser name → marker/regex pattern array
- `detectParser(text)` — returns parser name string or `'generic'`

#### Scenario: detectParser returns iberdrola for matching text

- GIVEN text containing 'Iberdrola' markers
- WHEN calling `detectParser(text)`
- THEN it returns `'iberdrola'`

---

### Requirement: Module Exports — `parsers/index.js`

The `parsers/index.js` module SHALL export:

- `PARSERS` — object mapping parser name → parse function
- Each parser file exports its named parse function

#### Scenario: Parser registry maps names to functions

- GIVEN parsers are loaded
- WHEN accessing `PARSERS['iberdrola']`
- THEN it returns a function

---

### Requirement: Module Exports — `validation.js`

The `validation.js` module SHALL export:

- `BLOCKING_CODES` — set of blocking warning codes
- `VALIDATION_FIELDS` — array of field names to validate
- `buildWarnings(result, cups)` — builds warning array for a result
- `validateAgainstExpected(result, expected)` — validates result against expected values
- `createEmptyResult()` — creates empty result object with all 20 fields
- `calcConfidence(result)` — computes confidence score
- `getExpectedFilename(result)` — returns expected filename for a result
- `loadExpectedForResult(result)` — loads expected JSON from cache or fetch

#### Scenario: buildWarnings returns array of warning objects

- GIVEN a result object and CUPS entry
- WHEN calling `buildWarnings(result, cups)`
- THEN it returns an array where each element has `code`, `level`, `message`

---

### Requirement: Module Exports — `render.js`

The `render.js` module SHALL export:

- `renderResults(results)` — renders full results table
- `buildRow(r, index)` — builds single table row HTML string
- `cupsStatus(cups, normalizedCups)` — returns status badge HTML
- `warningBadge(warnings)` — returns warning badge HTML
- `expectedBadge(result)` — returns expected vs actual badge HTML
- `selectRow(index)` — handles row selection

#### Scenario: renderResults updates DOM

- GIVEN results array
- WHEN calling `renderResults(results)`
- THEN it populates the results table tbody with rows

---

### Requirement: Module Exports — `export.js`

The `export.js` module SHALL export:

- `exportJson()` — exports results as JSON download
- `exportCsv()` — exports results as CSV download

Both SHALL use `Blob` + `URL.createObjectURL` (no fetch, works in `file://`).

#### Scenario: JSON export triggers download

- GIVEN results exist
- WHEN clicking export JSON button
- THEN a file download is triggered with valid JSON content

---

### Requirement: Module Exports — `cups-modal.js`

The `cups-modal.js` module SHALL export:

- `openCupsModal()` — opens CUPS management modal
- `closeCupsModal()` — closes modal
- `renderCupsModal()` — renders CUPS list inside modal
- `addCupsEntry(entry)` — adds new CUPS entry, saves, revalidates
- `removeCupsEntry(cupsKey)` — removes entry, saves, revalidates
- `revalidateResults()` — re-runs validation on all results

#### Scenario: Add CUPS entry persists and revalidates

- GIVEN modal is open
- WHEN adding a new CUPS entry
- THEN it is saved to localStorage
- AND `revalidateResults()` is called

---

### Requirement: Module Exports — `pdf.js`

The `pdf.js` module SHALL export:

- `extractPdfText(file)` — extracts text from PDF using pdf.js

#### Scenario: PDF extraction returns text

- GIVEN a valid PDF file
- WHEN calling `extractPdfText(file)`
- THEN it returns a string containing extracted text

---

### Requirement: Module Exports — `app.js`

The `app.js` module SHALL export:

- `init()` — initializes app: loads CUPS, wires event listeners
- `wireEvents()` — attaches all DOM event listeners
- `processFiles(files)` — processes selected PDF files

#### Scenario: init loads CUPS and wires events

- GIVEN all scripts are loaded
- WHEN calling `init()`
- THEN `controlledCups` is populated
- AND all button listeners are attached

---

### Requirement: Script Load Order

The `index.html` SHALL include `<script>` tags in this EXACT order:

```html
<script src="vendor/pdf.min.js"></script>
<script src="js/state.js"></script>
<script src="js/utils.js"></script>
<script src="js/storage.js"></script>
<script src="js/marcadores.js"></script>
<script src="js/parsers/index.js"></script>
<script src="js/validation.js"></script>
<script src="js/render.js"></script>
<script src="js/export.js"></script>
<script src="js/cups-modal.js"></script>
<script src="js/pdf.js"></script>
<script src="js/app.js"></script>
```

This order is REQUIRED for `file://` compatibility — no ES modules.

#### Scenario: Scripts load without errors in file:// mode

- GIVEN `index.html` is opened via double-click (file://)
- WHEN page loads
- THEN no JavaScript errors occur
- AND results table renders

---

### Requirement: CSS Extraction

All CSS currently in the `<style>` block of `index.html` SHALL be moved to `css/styles.css`.

The `index.html` SHALL have `<link rel="stylesheet" href="css/styles.css">` inserted in `<head>`.

Inline styles on modal HTML elements (e.g., `style="display:none"` on the modal overlay) MAY remain inline.

#### Scenario: CSS extracted to external file

- GIVEN `css/styles.css` exists with all styles
- WHEN `index.html` loads
- THEN all styles are applied correctly

---

### Requirement: Breaking Change — No Runtime CUPS Fetch

The system SHALL NOT fetch `controlled-cups.json` at runtime.

The `SEED_CUPS` constant embedded in `storage.js` provides all initial CUPS data.

`fetch()` calls SHALL only remain for `./examples/parser_expected/*.json` files (expected values), which are only loaded when the page is served via HTTP server.

#### Scenario: No fetch on startup in file:// mode

- GIVEN page is opened via `file://`
- WHEN page loads
- THEN no network requests are made
- AND CUPS list shows 22 entries from seed

---

### Requirement: Data Model — `controlledCups`

The `controlledCups` object SHALL be:

```javascript
{
  [cups_key: string]: {
    building_key: string,
    building_name: string,
    energy_type: string,   // 'electricidad' | 'gas_natural'
    supplier: string
  }
}
```

#### Scenario: Controlled CUPS structure

- GIVEN `loadControlledCups()` returns data
- THEN each entry has `building_key`, `building_name`, `energy_type`, `supplier`

---

### Requirement: Data Model — `results`

The `results` array elements SHALL be result objects with 20 fields as defined in the original PoC: `filename`, `parser`, `invoice_number`, `cups_original`, `cups_normalized`, `building_name`, `energy_type`, `period_start`, `period_end`, `computed_month`, `consumption_kwh`, `total_eur`, ` supplier`, `contract_type`, `warnings`, `confidence`, `expected_match`, `warnings_count`, `is_blocking`, `processed_at`.

#### Scenario: Results array has 20 fields

- GIVEN a processed PDF
- WHEN result is added to `results`
- THEN it has all 20 specified fields

---

### Requirement: Testing Approach — file:// Compatibility

The refactored app SHALL meet these criteria when opened via `file://`:

1. `index.html` loads without errors
2. CUPS modal shows 22 seed entries
3. Adding a CUPS entry persists to localStorage
4. Reloading the page shows persisted CUPS entries
5. No JavaScript console errors

#### Scenario: CUPS modal works in file:// mode

- GIVEN `index.html` opened via double-click
- WHEN clicking "Gestionar CUPS" button
- THEN modal opens showing 22 entries

---

### Requirement: Testing Approach — Server Mode

When served via HTTP server, the app SHALL additionally:

1. Load `examples/parser_expected/*.json` files on demand
2. Display expected vs actual badges on results
3. Produce identical parsing results to the original single-file version

#### Scenario: Server mode loads expected files

- GIVEN page is served via `http://localhost:...`
- WHEN processing a PDF with an expected file
- THEN `expected_match` badge appears on the result row
