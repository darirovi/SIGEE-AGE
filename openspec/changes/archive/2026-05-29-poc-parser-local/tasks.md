# Tasks: poc-parser-local — Browser PDF Parser PoC

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1800–2200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|----|-------|
| T-001 | Infrastructure (vendor dirs, controlled-cups.json, README) | PR 1 | Foundation |
| T-002 | Utility functions (normalizeCups, parseSpanishNumber, date parsers, computePeriodMonth) | PR 2 | Standalone utils, no dependencies |
| T-003 | PDF extraction + detectParser + marcadores map | PR 3 | pdf.js wiring + detection logic |
| T-004 | Specific parsers: iberdrola + curenergia | PR 4 | First two electricity parsers |
| T-005 | Specific parsers: naturgy electricidad + naturgy gas | PR 5 | Naturgy pair |
| T-006 | Specific parsers: energia XXI gas + generic fallback | PR 6 | Final specific + generic |
| T-007 | UI + debug panel + export + validation | PR 7 | Wiring all together |

---

## Phase 1: Infrastructure (T-001)

- [x] T-001.1 Create directory structure: `poc/parser-local/`, `poc/parser-local/vendor/`, `poc/parser-local/sample-data/`
- [x] T-001.2 Download and place `pdf.min.js` and `pdf.worker.min.js` in `poc/parser-local/vendor/` (from pdf.js releases — no CDN)
- [x] T-001.3 Create `poc/parser-local/sample-data/controlled-cups.json` from `data/seed/cups_controlados.csv` (array of CUPS strings)
- [x] T-001.4 Create `poc/parser-local/README.md` with: how to open (file://), how to add vendor files, how to add a new parser

## Phase 2: Utility Functions (T-002)

- [x] T-002.1 Implement `normalizeCups(cupsRaw)` in `poc/parser-local/index.html` — strip spaces, uppercase, suffix stripping (22-char → 20-char)
- [x] T-002.2 Implement `parseSpanishNumber(input)` — comma decimal, period thousands, strip € kWh m³
- [x] T-002.3 Implement `parseSpanishDate(input)` — Spanish month names, range support, returns ISO `YYYY-MM-DD` or null
- [x] T-002.4 Implement `parseDateWithDots(input)` — `dd.mm.yyyy` format, range support, returns ISO `YYYY-MM-DD` or null
- [x] T-002.5 Implement `computePeriodMonth(periodEnd)` — derive `computed_year` and `computed_month` from `period_end` (ISO string)
- [x] T-002.6 Test each utility in browser console (ad-hoc manual verification)

## Phase 3: PDF Extraction + Parser Detection (T-003)

- [x] T-003.1 Implement `extractPdfText(file)` using `pdfjsLib.getDocument()` + `page.getTextContent()` — load from `vendor/` paths, return combined text or throw
- [x] T-003.2 Implement `associateControlledCups(cupsKey, controlledCups)` — lookup CUPS in controlled list, return building name or null
- [x] T-003.3 Implement `buildWarnings(result)` — generate warning objects for MISSING_*, ZERO_*, UNREADABLE_PDF, etc.
- [x] T-003.4 Implement `detectParser(text)` with marcadores map: iberdrola (5 marcadores), curenergia (5), naturgy-electricidad (5), naturgy-gas (6), energia-xxi (6), generic (fallback). Threshold: ≥3 matches
- [x] T-003.5 Wire `processFiles(files)` — async per-file, call extractPdfText → detectParser → specific parser → buildWarnings → store result

## Phase 4: Specific Parsers — Electricity (T-004)

- [ ] T-004.1 Implement `iberdrola_electricidad(text)` — patrones: Nº FACTURA, PERIODO DE FACTURACIÓN (dd/mm/yyyy), Consumo total, TOTAL €+, CUPS label. Store raw_candidates, compute confidence 0.98
- [ ] T-004.2 Implement `curenergia_electricidad_pvpc(text)` — patrones: Nº de factura, Período, Consumo energía activa, Importe total, CUPS:. Store raw_candidates, compute confidence 0.98
- [ ] T-004.3 Validate iberdrola parser against `examples/parser_expected/iberdrola_electricidad_fuenlabrada_2024_10.json` and `iberdrola_electricidad_vallehermoso_2025_01.json`
- [ ] T-004.4 Validate curenergia parser against `examples/parser_expected/curenergia_electricidad_pvpc_fuenlabrada_2023_04.json`

## Phase 5: Specific Parsers — Naturgy (T-005)

- [ ] T-005.1 Implement `naturgy_regulada_electricidad(text)` — Spanish date range ("20 de agosto de 2025 a 26 de agosto de 2025"), TOTAL IMPORTE FACTURA, CUPS with suffix strip. Store raw_candidates, compute confidence 0.98
- [ ] T-005.2 Implement `naturgy_regulada_gas_natural(text)` — parseDateWithDots for dd.mm.yyyy period, Total a pagar, Consumo kWh (sum partial periods), Código CUPS. Store raw_candidates, compute confidence 0.98
- [ ] T-005.3 Validate naturgy electricidad parser against `examples/parser_expected/naturgy_regulada_electricidad_uprose_2025_08.json`
- [ ] T-005.4 Validate naturgy gas parser against `examples/parser_expected/naturgy_regulada_gas_natural_vallehermoso_2022_11.json`

## Phase 6: Specific Parsers — Energia XXI + Generic (T-006)

- [ ] T-006.1 Implement `energia_xxi_gas_natural(text)` — Catalan format: Núm. de factura, Període facturació (dd/mm/yyyy), Consum Total kWh (not m³), TOTAL IMPORT FACTURA, CUPS. Store raw_candidates, compute confidence 0.98
- [ ] T-006.2 Implement `generic_invoice_parser(text)` — fallback: broad regex for CUPS ES{20-22}, dates, kWh, € amounts. Lower confidence 0.60–0.80, requires_visual_review=true, GENERIC_PARSER_USED warning
- [ ] T-006.3 Validate energia XXI parser against `examples/parser_expected/energia_xxi_gas_natural_zarzaquemada_2025_02.json`

## Phase 7: UI + Debug Panel + Export + Validation (T-007)

- [ ] T-007.1 Build HTML structure: file input (multiple, accept pdf), results table (filename, parser, CUPS, period, kWh, EUR, status light), debug panel (collapsed by default), export buttons
- [ ] T-007.2 Implement CSS: traffic light indicators (green/yellow/red), debug panel toggle, responsive layout, offline-first styling
- [ ] T-007.3 Wire results table — render each `InvoiceParseResult` as a table row with traffic light based on warnings (red if any blocking, else yellow if warnings, else green)
- [ ] T-007.4 Implement debug panel: show full raw extracted text + full JSON for selected file, with copy buttons
- [ ] T-007.5 Implement `exportJson(results)` — Blob + createObjectURL download of array of InvoiceParseResult
- [ ] T-007.6 Implement `exportCsv(results)` — Blob download with headers: filename, parser_name, cups_key, period_start, period_end, consumption_kwh, total_amount_eur, warnings
- [ ] T-007.7 Run full validation: process all 6 example PDFs, compare key fields against expected JSONs (cups_key, consumption_kwh, total_amount_eur, period_start/end within 1 day tolerance)
- [ ] T-007.8 Final browser test: open `index.html` via file://, process all 6 PDFs, verify no external requests (DevTools Network tab)
