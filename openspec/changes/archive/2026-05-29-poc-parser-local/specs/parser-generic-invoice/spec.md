# Parser: generic_invoice_parser — Specification

## Purpose

Extract basic structured data from any invoice PDF when no supplier-specific parser matches. Produces `generic_invoice_parser` as `parser_name`. Its results REQUIRE visual review and do NOT support batch validation.

## Marcadores / Detection Patterns

The generic parser is the **fallback** — it has no specific marcadores. It is invoked when `detectParser()` returns `null` or when no specific parser's marcadores threshold is met.

The generic parser SHALL attempt extraction using broad patterns:

- CUPS: pattern `ES[A-Z0-9]{20,22}` anywhere in text
- Dates: pattern matching `dd/mm/yyyy`, `dd.mm.yyyy`, or Spanish month names
- Consumption: pattern matching `\d+[\d.,]*\s*kWh`
- Amount: pattern matching `[\d.,]+\s*€` or similar currency patterns
- Invoice number: alphanumeric sequences near `factura`, `invoice`, `nº`
- Energy type: keyword matching `electricidad`, `gas`, `gas natural`, `gasoil`

## Extraction Patterns

### CUPS

Pattern: `ES([A-Z0-9]{20,22})`

Example: `ES0234150035789683GC` → `cups_key: "ES0234150035789683GC"`

### Dates

The parser SHALL use `parseSpanishDate()` and `parseDateWithDots()` to extract date ranges from any recognized format.

### Consumption (kWh)

Pattern: `([\d.,]+)\s*kWh`

The parser SHALL extract all matches and store them in `raw_candidates`. If multiple exist, it SHALL select the largest value and add `MULTIPLE_CONSUMPTION_CANDIDATES`.

### Total Amount (EUR)

Pattern: `([\d.,]+)\s*€`

The parser SHALL extract all matches and store them in `raw_candidates`. If multiple exist, it SHALL select the largest value and add `MULTIPLE_AMOUNT_CANDIDATES`.

### Invoice Number

Pattern: `[A-Z0-9]{8,20}` near `factura` or `invoice`

### Energy Type

Pattern: `electricidad` → `"electricidad"`, `gas\s*natural` → `"gas_natural"`, `gasoil` → `"gasoleo"`

## Validation Rules

1. The generic parser MUST always set `parse_source` to `"parser_generico"`.
2. The generic parser MUST always set `requires_visual_review` to `true`.
3. All extraction candidates MUST be stored in `raw_candidates`.
4. `parse_confidence` SHOULD be lower than specific parsers (e.g., 0.60–0.80).
5. The parser MUST produce `GENERIC_PARSER_USED` warning with level `warning`.

## Warning Codes This Parser Can Produce

| Code | Level | Blocking | Condition |
|------|-------|----------|-----------|
| `GENERIC_PARSER_USED` | warning | No | Always generated when this parser is used |
| `LOW_CONFIDENCE` | warning | No | `parse_confidence` below 0.80 |
| `CUPS_NORMALIZED` | info | No | CUPS was transformed |
| `PERIOD_CROSSES_MONTHS` | info | No | Period spans multiple months |
| `MULTIPLE_AMOUNT_CANDIDATES` | warning | No | Multiple amount matches |
| `MULTIPLE_CONSUMPTION_CANDIDATES` | warning | No | Multiple consumption matches |
| `ZERO_CONSUMPTION` | warning | No | Consumption is `0` |
| `ZERO_OR_NEGATIVE_AMOUNT` | warning | No | Amount is `0` or negative |
| `MISSING_PERIOD_START` | error | Yes | Period start not found |
| `MISSING_PERIOD_END` | error | Yes | Period end not found |
| `MISSING_CONSUMPTION` | error | Yes | No consumption match found |
| `MISSING_TOTAL_AMOUNT` | error | Yes | No amount match found |
| `UNKNOWN_CUPS` | error | Yes | No CUPS match found |

## Expected JSON Output Structure

```json
{
  "parser_name": "generic_invoice_parser",
  "parser_version": "1.0.0",
  "parse_source": "parser_generico",
  "parse_confidence": 0.65,
  "energy_type": "electricidad",
  "supplier_name": null,
  "invoice_number": "FACTURA_2025_001",
  "cups_original": "ES123456789012345AB",
  "cups_key": "ES123456789012345AB",
  "period_start": "2025-01-01",
  "period_end": "2025-01-31",
  "computed_year": 2025,
  "computed_month": 1,
  "consumption_kwh": "150",
  "total_amount_eur": "45.00",
  "raw_candidates": {
    "invoice_number": ["FACTURA_2025_001"],
    "consumption_kwh": ["150 kWh", "100 kWh"],
    "total_amount_eur": ["45.00 €", "35.00 €"]
  },
  "warnings": [
    {"level": "warning", "code": "GENERIC_PARSER_USED", "message": "Se ha usado un parser genérico. Revisa visualmente la factura antes de validar.", "field_name": "parser_name", "is_blocking": false},
    {"level": "warning", "code": "MULTIPLE_AMOUNT_CANDIDATES", "message": "Se han detectado varios importes posibles. Revisa el total con IVA incluido antes de validar.", "field_name": "total_amount_eur", "is_blocking": false}
  ]
}
```

## Scenarios

#### Scenario: Generic parser invoked as fallback

- GIVEN invoice text with no recognized supplier marcadores
- WHEN `detectParser(text)` returns `null`
- THEN the generic parser SHALL be invoked
- AND `GENERIC_PARSER_USED` warning SHALL be present
- AND `parse_source` SHALL be `"parser_generico"`

#### Scenario: Multiple consumption candidates

- GIVEN invoice text contains `150 kWh` and `100 kWh`
- WHEN consumption candidates are extracted
- THEN `raw_candidates.consumption_kwh` SHALL contain both values
- AND the parser SHALL select `"150"` (larger value)
- AND `MULTIPLE_CONSUMPTION_CANDIDATES` warning SHALL be added

#### Scenario: Result requires visual review

- GIVEN a successful generic parse with all critical fields found
- WHEN the result is displayed
- THEN the traffic light SHALL be **yellow**
- AND batch validation SHALL NOT be available
