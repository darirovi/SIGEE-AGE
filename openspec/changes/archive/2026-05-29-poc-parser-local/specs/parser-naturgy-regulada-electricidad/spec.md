# Parser: naturgy_regulada_electricidad — Specification

## Purpose

Extract structured data from Naturgy / Comercializadora Regulada electricity invoices using text pattern matching. Produces `naturgy_regulada_electricidad` as `parser_name`.

## Marcadores / Detection Patterns

The parser SHALL be selected when the invoice text contains **at least 3** of:

- `Comercializadora Regulada, Gas & Power` (supplier marker)
- `DATOS DE LA FACTURA DE ELECTRICIDAD` (electricity data section)
- `INFORMACIÓN DE CONSUMO ELÉCTRICO` (electric consumption info)
- `Código unificado de punto de suministro CUPS` (CUPS label)
- `TOTAL IMPORTE FACTURA` (total invoice amount)

## Extraction Patterns

### Invoice Number

Pattern: `Nº factura:\s*([A-Z0-9]+)`

Example: `Nº factura: FE25137022313356`

### Period (Spanish text format)

The period appears as natural Spanish text: `20 de agosto de 2025 a 26 de agosto de 2025`

The parser SHALL use `parseSpanishDate()` to parse individual dates, then derive the range.

Pattern: `(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})\s+a\s+(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})`

Month name mapping: `enero=1, febrero=2, marzo=3, abril=4, mayo=5, junio=6, julio=7, agosto=8, septiembre=9, octubre=10, noviembre=11, diciembre=12`

Example: `20 de agosto de 2025 a 26 de agosto de 2025`
→ `period_start`: `2025-08-20`, `period_end`: `2025-08-26`

### Consumption (kWh)

Primary pattern: `Su consumo en el periodo facturado ha sido\s+(\d+)\s+kWh`

Fallback: `Consumo total:\s*(\d+)\s*kWh`

If the invoice contains period breakdowns (P1, P2, P3), the parser SHALL extract the total and MAY store individual periods in `raw_candidates`.

Example: `Su consumo en el periodo facturado ha sido 22 kWh.` → `consumption_kwh: "22"`

### Total Amount (EUR)

Primary pattern: `TOTAL IMPORTE FACTURA:\s*([\d.,]+)\s*€`

Fallback: `IMPORTE FACTURA:\s*([\d.,]+)\s*€`

Example: `TOTAL IMPORTE FACTURA: 7,80 €` → `total_amount_eur: "7.80"`

### CUPS

Pattern: `Código unificado de punto de suministro CUPS:\s*([A-Z0-9]+)`

Example: `Código unificado de punto de suministro CUPS: ES0022000006290850YS1P`
→ `cups_original: "ES0022000006290850YS1P"`

## Validation Rules

1. The parser MUST strip the 2-character suffix from CUPS before passing to `normalizeCups()`. Input `ES0022000006290850YS1P` → normalized `ES0022000006290850YS`.
2. `computed_year` and `computed_month` are derived from `period_end`.
3. All candidates MUST be stored in `raw_candidates`.

## Warning Codes This Parser Can Produce

| Code | Level | Blocking | Condition |
|------|-------|----------|-----------|
| `CUPS_NORMALIZED` | info | No | Suffix stripped from CUPS before normalization |
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
  "parser_name": "naturgy_regulada_electricidad",
  "parser_version": "1.0.0",
  "parse_source": "parser_especifico",
  "parse_confidence": 0.98,
  "energy_type": "electricidad",
  "supplier_name": "Comercializadora Regulada, Gas & Power, S.A.",
  "invoice_number": "FE25137022313356",
  "cups_original": "ES0022000006290850YS1P",
  "cups_key": "ES0022000006290850YS",
  "period_start": "2025-08-20",
  "period_end": "2025-08-26",
  "computed_year": 2025,
  "computed_month": 8,
  "consumption_kwh": "22",
  "total_amount_eur": "7.80",
  "raw_candidates": {
    "invoice_number": ["FE25137022313356"],
    "period": ["20 de agosto de 2025 a 26 de agosto de 2025"],
    "consumption_kwh": ["Su consumo en el periodo facturado ha sido 22 kWh.", "Consumo en P1: 1 kWh", "Consumo en P2: 3 kWh", "Consumo en P3: 18 kWh"],
    "total_amount_eur": ["TOTAL IMPORTE FACTURA: 7,80 €", "IMPORTE FACTURA: 7,80 €"],
    "cups": ["ES0022000006290850YS1P"]
  },
  "warnings": [
    {"level": "info", "code": "CUPS_NORMALIZED", "message": "CUPS normalizado automáticamente para comparación.", "field_name": "cups_key", "is_blocking": false}
  ]
}
```

## Scenarios

#### Scenario: Spanish month name parsed correctly

- GIVEN period text `20 de agosto de 2025 a 26 de agosto de 2025`
- WHEN `parseSpanishDate()` is applied to each date
- THEN `period_start` = `2025-08-20` and `period_end` = `2025-08-26`

#### Scenario: CUPS suffix stripped before normalization

- GIVEN `cups_original` is `"ES0022000006290850YS1P"`
- WHEN the parser processes it
- THEN `cups_key` SHALL be `"ES0022000006290850YS"` (suffix `1P` stripped)
- AND a `CUPS_NORMALIZED` info warning SHALL be present

#### Scenario: Total amount preferred over subtotal

- GIVEN the invoice contains both `TOTAL IMPORTE FACTURA: 7,80 €` and `IMPORTE FACTURA: 7,80 €`
- WHEN amount candidates are evaluated
- THEN the parser SHALL select the `TOTAL IMPORTE FACTURA` candidate
- AND store both in `raw_candidates.total_amount_eur`
