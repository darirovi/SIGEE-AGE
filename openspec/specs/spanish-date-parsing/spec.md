# Spanish Date Parsing — Specification

## Purpose

Two utility functions for parsing dates in Spanish and Catalan invoice formats:
- `parseSpanishDate(input)` — parses Spanish month names (`enero`, `agosto`, etc.)
- `parseDateWithDots(input)` — parses `dd.mm.yyyy` format used in Naturgy gas invoices

Both return a string in ISO format `YYYY-MM-DD`.

## Requirements

### Requirement: parseSpanishDate — Spanish Month Names

The function SHALL parse dates written in Spanish format with month names.

Supported month names (case-insensitive):
`enero=1, febrero=2, marzo=3, abril=4, mayo=5, junio=6, julio=7, agosto=8, septiembre=9, octubre=10, noviembre=11, diciembre=12`

Pattern: `(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})`

#### Scenario: Simple Spanish date

- GIVEN input string `"20 de agosto de 2025"`
- WHEN `parseSpanishDate("20 de agosto de 2025")` is called
- THEN the result SHALL be `"2025-08-20"`

#### Scenario: Date with leading zero day

- GIVEN input string `"05 de marzo de 2024"`
- WHEN `parseSpanishDate("05 de marzo de 2024")` is called
- THEN the result SHALL be `"2024-03-05"`

#### Scenario: Case insensitive month name

- GIVEN input string `"10 DE ENERO DE 2025"`
- WHEN `parseSpanishDate("10 DE ENERO DE 2025")` is called
- THEN the result SHALL be `"2025-01-10"`

### Requirement: parseSpanishDate — Date Range

The function SHALL parse a full period range string and return the start date as ISO.

Pattern: `(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})\s+a\s+(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})`

#### Scenario: Period range returns start date

- GIVEN input string `"20 de agosto de 2025 a 26 de agosto de 2025"`
- WHEN `parseSpanishDate("20 de agosto de 2025 a 26 de agosto de 2025")` is called
- THEN the result SHALL be `"2025-08-20"` (returns start date)

### Requirement: parseDateWithDots — dd.mm.yyyy Format

The function SHALL parse dates in `dd.mm.yyyy` dot-separated format, common in Naturgy gas invoices.

Pattern: `(\d{2})\.(\d{2})\.(\d{4})`

#### Scenario: Single dot-separated date

- GIVEN input string `"10.09.2022"`
- WHEN `parseDateWithDots("10.09.2022")` is called
- THEN the result SHALL be `"2022-09-10"`

#### Scenario: Dot-separated date range

- GIVEN input string `"Del 10.09.2022 al 07.11.2022"`
- WHEN `parseDateWithDots("Del 10.09.2022 al 07.11.2022")` is called
- THEN the result SHALL be `"2022-09-10"` (returns start date of range)

### Requirement: ISO Output Format

Both functions SHALL return dates as `YYYY-MM-DD` strings in 24-hour ISO format.

### Requirement: Return NaN on Failure

If the input does not match the expected pattern, the function SHALL return `null` or `NaN`.

## Function Signatures

```javascript
/**
 * @param {string} input - Spanish date string, e.g. "20 de agosto de 2025" or "20 de agosto de 2025 a 26 de agosto de 2025"
 * @returns {string|null} - ISO date string "YYYY-MM-DD" or null if unparseable
 */
function parseSpanishDate(input) { ... }

/**
 * @param {string} input - Dot-separated date string, e.g. "10.09.2022" or "Del 10.09.2022 al 07.11.2022"
 * @returns {string|null} - ISO date string "YYYY-MM-DD" or null if unparseable
 */
function parseDateWithDots(input) { ... }
```

## Examples

| Input | Function | Output |
|-------|----------|--------|
| `"20 de agosto de 2025"` | `parseSpanishDate` | `"2025-08-20"` |
| `"05 de marzo de 2024"` | `parseSpanishDate` | `"2024-03-05"` |
| `"20 de agosto de 2025 a 26 de agosto de 2025"` | `parseSpanishDate` | `"2025-08-20"` |
| `"10.09.2022"` | `parseDateWithDots` | `"2022-09-10"` |
| `"Del 10.09.2022 al 07.11.2022"` | `parseDateWithDots` | `"2022-09-10"` |
| `"10/12/2024"` | `parseDateWithDots` | `null` (wrong format) |
