# Parser: iberdrola_electricidad — Specification

## Purpose

Extract structured data from Iberdrola electricity invoices (Iberdrola Clientes, S.A.U.) using text pattern matching. Produces `iberdrola_electricidad` as `parser_name`.

## Marcadores / Detection Patterns

The parser SHALL be selected when the invoice text contains **at least 3** of:

- `IBERDROLA CLIENTES, S.A.U.` (supplier marker)
- `RESUMEN DE FACTURA` (invoice summary marker)
- `PERIODO DE FACTURACIÓN` (billing period marker)
- `Identificación punto de suministro (CUPS)` (CUPS label)
- `Consumo total de esta factura` (consumption total label)

## Extraction Patterns

### Invoice Number

Pattern: `Nº FACTURA:\s*(\d+)`

Example match:
```
Nº FACTURA:
21250131040000158
```

### Period

Pattern: `PERIODO DE FACTURACIÓN:\s*(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}/\d{2}/\d{4})`

Example match: `10/12/2024 - 15/01/2025`
→ `period_start`: `2024-12-10`, `period_end`: `2025-01-15`

### Consumption (kWh)

The parser SHALL extract total consumption, not partial period consumptions.

Primary pattern: `Consumo total de esta factura[.\s]*(\d+)\s*kWh`

Fallback pattern: `Total:\s*(\d+)\s*kWh`

Example match: `Consumo total de esta factura.\n88 kWh` → `consumption_kwh: "88"`

### Total Amount (EUR)

The parser SHALL extract the **final total with IVA included**, not subtotals or pre-tax amounts.

Primary pattern: `TOTAL\s+([\d.,]+)\s*€`

Fallback pattern: `TOTAL IMPORTE FACTURA\s+([\d.,]+)\s*€`

Example match: `TOTAL 23,70€` → `total_amount_eur: "23.70"`

### CUPS

Pattern: `Identificación punto de suministro \(CUPS\):\s*([A-Z0-9\s]+)`

Example match: `Identificación punto de suministro (CUPS): ES 0022 0000 0621 2876 CB`
→ `cups_original: "ES 0022 0000 0621 2876 CB"`

## Validation Rules

1. `cups_key` MUST be produced by passing `cups_original` through `normalizeCups()`.
2. `computed_year` and `computed_month` MUST be derived from `period_end` (year and month of the closing date).
3. If multiple consumption candidates exist, the parser SHALL prefer the candidate labeled "total" or "consumo total".
4. If multiple amount candidates exist, the parser SHALL select the one labeled "TOTAL" or "TOTAL IMPORTE FACTURA".
5. All candidates (invoice_number, period, consumption, amount, cups) MUST be stored in `raw_candidates`.

## Warning Codes This Parser Can Produce

| Code | Level | Blocking | Condition |
|------|-------|----------|-----------|
| `CUPS_NORMALIZED` | info | No | `cups_original` differs from `cups_key` after normalization |
| `PERIOD_CROSSES_MONTHS` | info | No | `period_start` and `period_end` are in different months |
| `MULTIPLE_AMOUNT_CANDIDATES` | warning | No | More than one amount match found |
| `MULTIPLE_CONSUMPTION_CANDIDATES` | warning | No | More than one consumption match found |
| `ZERO_CONSUMPTION` | warning | No | Extracted consumption is `0` |
| `ZERO_OR_NEGATIVE_AMOUNT` | warning | No | Extracted amount is `0` or negative |
| `MISSING_PERIOD_START` | error | Yes | Period start not found |
| `MISSING_PERIOD_END` | error | Yes | Period end not found |
| `MISSING_CONSUMPTION` | error | Yes | No consumption match found |
| `MISSING_TOTAL_AMOUNT` | error | Yes | No amount match found |
| `UNKNOWN_CUPS` | error | Yes | No CUPS match found |

## Expected JSON Output Structure

```json
{
  "parser_name": "iberdrola_electricidad",
  "parser_version": "1.0.0",
  "parse_source": "parser_especifico",
  "parse_confidence": 0.98,
  "energy_type": "electricidad",
  "supplier_name": "Iberdrola Clientes, S.A.U.",
  "invoice_number": "21250131040000158",
  "cups_original": "ES 0022 0000 0621 2876 CB",
  "cups_key": "ES0022000006212876CB",
  "period_start": "2024-12-10",
  "period_end": "2025-01-15",
  "computed_year": 2025,
  "computed_month": 1,
  "consumption_kwh": "88",
  "total_amount_eur": "23.70",
  "raw_candidates": {
    "invoice_number": ["21250131040000158"],
    "period": ["10/12/2024 - 15/01/2025"],
    "consumption_kwh": ["88 kWh", "Total: 88 kWh"],
    "total_amount_eur": ["TOTAL 23,70€"],
    "cups": ["ES 0022 0000 0621 2876 CB"]
  },
  "warnings": []
}
```

## Scenarios

#### Scenario: All fields extracted successfully

- GIVEN valid Iberdrola invoice text with all fields present
- WHEN the parser is invoked
- THEN all critical fields are populated
- AND `parse_confidence` >= 0.95
- AND `warnings` is empty or contains only info-level warnings

#### Scenario: CUPS with spaces normalized

- GIVEN `cups_original` is `"ES 0022 0000 0621 2876 CB"`
- WHEN `normalizeCups()` is applied
- THEN `cups_key` becomes `"ES0022000006212876CB"`
- AND a `CUPS_NORMALIZED` info warning is added

#### Scenario: Period spanning December to January

- GIVEN period `10/12/2024 - 15/01/2025`
- WHEN period is parsed
- THEN `period_start` = `2024-12-10`, `period_end` = `2025-01-15`
- AND `computed_year` = 2025, `computed_month` = 1
- AND a `PERIOD_CROSSES_MONTHS` info warning MAY be added
