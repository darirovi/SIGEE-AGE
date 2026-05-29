# Parser: curenergia_electricidad_pvpc — Specification

## Purpose

Extract structured data from Curenergía electricity invoices (PVPC tariff) using text pattern matching. Produces `curenergia_electricidad_pvpc` as `parser_name`.

## Marcadores / Detection Patterns

The parser SHALL be selected when the invoice text contains **at least 3** of:

- `CURENERGÍA` (supplier marker)
- `tarifa PVPC` (tariff marker)
- `Consumo energía activa` (active energy consumption marker)
- `CUPS:` (CUPS label)
- `Importe total` (total amount label)

## Extraction Patterns

### Invoice Number

Pattern: `Nº de factura:\s*([A-Z0-9_]+)`

Example match:
```
Nº de factura: FACTURA_DUMMY_2023_04
```

### Period

Pattern: `Período:\s*(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}/\d{2}/\d{4})`

Example: `01/04/2023 - 30/04/2023`
→ `period_start`: `2023-04-01`, `period_end`: `2023-04-30`

### Consumption (kWh)

Primary pattern: `Consumo energía activa:\s*(\d+)\s*kWh`

Fallback pattern: `Consumo total:\s*(\d+)\s*kWh`

Example: `Consumo energía activa: 150 kWh` → `consumption_kwh: "150"`

### Total Amount (EUR)

Pattern: `Importe total:\s*([\d.,]+)\s*€`

Example: `Importe total: 25,00 €` → `total_amount_eur: "25.00"`

### CUPS

Pattern: `CUPS:\s*([A-Z0-9]{20})`

Example: `CUPS: ES0031234567890AB` → `cups_key: "ES0031234567890AB"`

## Validation Rules

1. `cups_key` MUST be produced by passing `cups_original` through `normalizeCups()`.
2. `computed_year` and `computed_month` MUST be derived from `period_end`.
3. If the invoice contains period breakdowns (P1/P2/P3), the parser SHALL extract only the total consumption.
4. All candidates MUST be stored in `raw_candidates`.

## Warning Codes This Parser Can Produce

| Code | Level | Blocking | Condition |
|------|-------|----------|-----------|
| `CUPS_NORMALIZED` | info | No | `cups_original` differs from `cups_key` |
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
  "parser_name": "curenergia_electricidad_pvpc",
  "parser_version": "1.0.0",
  "parse_source": "parser_especifico",
  "parse_confidence": 0.98,
  "energy_type": "electricidad",
  "supplier_name": "Curenergía",
  "invoice_number": "FACTURA_DUMMY_2023_04",
  "cups_original": "ES0031234567890AB",
  "cups_key": "ES0031234567890AB",
  "period_start": "2023-04-01",
  "period_end": "2023-04-30",
  "computed_year": 2023,
  "computed_month": 4,
  "consumption_kwh": "150",
  "total_amount_eur": "25.00",
  "raw_candidates": {
    "invoice_number": ["FACTURA_DUMMY_2023_04"],
    "period": ["01/04/2023 - 30/04/2023"],
    "consumption_kwh": ["150 kWh"],
    "total_amount_eur": ["Importe total: 25,00 €"],
    "cups": ["ES0031234567890AB"]
  },
  "warnings": []
}
```

## Scenarios

#### Scenario: PVPC tariff consumption extracted correctly

- GIVEN valid Curenergía PVPC invoice text
- WHEN the parser is invoked
- THEN `consumption_kwh` reflects the total active energy consumption
- AND `energy_type` is `"electricidad"`

#### Scenario: CUPS without spaces

- GIVEN `cups_original` is `"ES0031234567890AB"` (no spaces)
- WHEN `normalizeCups()` is applied
- THEN `cups_key` equals `"ES0031234567890AB"` unchanged
- AND no `CUPS_NORMALIZED` warning is generated
