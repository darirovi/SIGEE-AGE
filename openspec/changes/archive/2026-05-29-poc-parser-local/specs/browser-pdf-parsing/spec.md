# Browser PDF Parsing — Specification

## Purpose

PoC browser-only application that extracts text from PDFs using pdf.js and applies JavaScript parsers specific to each energy supplier. Runs 100% offline from a single HTML file with no backend, CDN, or internet dependency.

## Requirements

### Requirement: pdf.js Integration

The system SHALL load pdf.js from a local `vendor/` directory (no CDN). The application SHALL open directly via `file://` without a web server.

#### Scenario: pdf.js loads from vendor

- GIVEN the user opens `index.html` in a browser
- WHEN pdf.js is requested
- THEN the browser loads `vendor/pdf.min.js` and `vendor/pdf.worker.min.js` from relative paths
- AND no network requests are made to external hosts

#### Scenario: Multiple PDF selection

- GIVEN the user is on the main UI
- WHEN the user clicks the file input and selects multiple `.pdf` files
- THEN all selected files are queued for processing
- AND each file is processed independently and asynchronously

### Requirement: Text Extraction

The system SHALL extract text from each PDF using pdf.js `getDocument()` and `page.getTextContent()`. If no readable text is found, the system SHALL produce the `UNREADABLE_PDF` warning and skip the file.

#### Scenario: Successful text extraction

- GIVEN a PDF with readable text
- WHEN `pdfjsLib.getDocument()` is called
- THEN text is extracted from all pages via `page.getTextContent()`
- AND the combined text is passed to the parser detection function

#### Scenario: PDF without readable text

- GIVEN a scanned or image-only PDF
- WHEN text extraction yields fewer than 20 characters
- THEN the result SHALL contain warning `UNREADABLE_PDF` with level `error` and `is_blocking: true`
- AND parse_confidence SHALL be 0

### Requirement: Parser Detection

The system SHALL call `detectParser(text)` to identify the correct supplier-specific parser before extraction. Detection SHALL use marcadores (marker strings) present in the invoice text. If no parser matches, the system SHALL fall back to `generic_invoice_parser`.

#### Scenario: Specific parser detected

- GIVEN invoice text containing Iberdrola marcadores
- WHEN `detectParser(text)` is called
- THEN it SHALL return `iberdrola_electricidad`
- AND the corresponding specific parser is invoked

#### Scenario: No parser matches — fallback

- GIVEN invoice text with no recognized marcadores
- WHEN `detectParser(text)` is called
- THEN it SHALL return `generic_invoice_parser`
- AND the generic parser SHALL be invoked

### Requirement: Async Per-File Processing

Each PDF file SHALL be processed asynchronously. Results SHALL be displayed in the results table as each file completes, in order of completion.

#### Scenario: Multiple files processed concurrently

- GIVEN 6 PDF files are selected
- WHEN the files are queued
- THEN all 6 MAY be processed in parallel
- AND each result appears in the table when its processing completes
- AND no file blocks another

### Requirement: Result Structure

Each parser output SHALL conform to the common `InvoiceParseResult` contract. The UI SHALL display a table with: filename, parser name, CUPS, period, consumption (kWh), total (EUR), and traffic-light status.

#### Scenario: Result displayed in table

- GIVEN a successful parse result
- WHEN the result is available
- THEN the UI table SHALL display: filename, parser_name, cups_key, period_start–period_end, consumption_kwh, total_amount_eur
- AND a traffic-light indicator (green/yellow/red) based on warnings

### Requirement: Debug Panel

The system SHALL provide an expandable debug panel showing the full extracted text and the complete JSON output for each processed file.

#### Scenario: Debug panel shows full output

- GIVEN a processed file is selected
- WHEN the user expands the debug panel
- THEN the panel SHALL show: raw extracted text (full, untruncated) and the full JSON result object
- AND the raw text SHALL be copyable

### Requirement: Export

The system SHALL allow exporting results as JSON and as CSV via `Blob` + `URL.createObjectURL` download links. Export SHALL include all processed files.

#### Scenario: JSON export

- GIVEN at least one processed file exists
- WHEN the user clicks "Export JSON"
- THEN a `.json` file SHALL be downloaded containing an array of all `InvoiceParseResult` objects

#### Scenario: CSV export

- GIVEN at least one processed file exists
- WHEN the user clicks "Export CSV"
- THEN a `.csv` file SHALL be downloaded with headers: filename, parser_name, cups_key, period_start, period_end, consumption_kwh, total_amount_eur, warnings

## Warning Codes Produced by This Capability

| Code | Level | Blocking | Description |
|------|-------|----------|-------------|
| `UNREADABLE_PDF` | error | Yes | PDF has no extractable text |

## JSON Output Contract

Every parser result SHALL contain:

```json
{
  "parser_name": "string",
  "parser_version": "string",
  "parse_source": "parser_especifico | parser_generico",
  "parse_confidence": 0.0,
  "energy_type": "electricidad | gas_natural | gasoleo",
  "supplier_name": "string | null",
  "invoice_number": "string | null",
  "cups_original": "string | null",
  "cups_key": "string | null",
  "period_start": "YYYY-MM-DD | null",
  "period_end": "YYYY-MM-DD | null",
  "computed_year": "number | null",
  "computed_month": "number | null",
  "consumption_kwh": "string | null",
  "total_amount_eur": "string | null",
  "raw_candidates": {},
  "warnings": []
}
```
