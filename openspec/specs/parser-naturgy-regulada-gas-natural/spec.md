# Parser: naturgy_regulada_gas_natural — Specification

## Purpose

Extract structured data from Naturgy / Comercializadora Regulada natural gas invoices using text pattern matching. Produces `naturgy_regulada_gas_natural` as `parser_name`. Must handle period dates in `dd.mm.yyyy` format and partial period consumption breakdowns.

## Marcadores / Detection Patterns

The parser SHALL be selected when the invoice text contains **at least 3** of:

- `Comercializadora Regulada, Gas & Power` (supplier marker)
- `aquí tienes tu factura de gas` (gas invoice opening phrase)
- `Tus datos de suministro de gas` (gas supply data label)
- `Total a pagar` (total to pay label)
- `Consumo kWh` (consumption label)
- `Código CUPS:` (CUPS label)

## Extraction Patterns

### Invoice Number

Pattern: `Nº factura:\s*([A-Z0-9]+)`

Example: `Nº factura: FE22137025647128`

### Period (dot-separated date format)

Pattern: `Gas:\s*Del\s+(\d{2}\.\d{2}\.\d{4})\s+al\s+(\d{2}\.\d{2}\.\d{4})`

The parser SHALL use `parseDateWithDots()` to parse each date.

Example: `Gas: Del 10.09.2022 al 07.11.2022`
→ `period_start`: `2022-09-10`, `period_end`: `2022-11-07`

### Consumption (kWh)

The parser SHALL extract the **total kWh consumption**. The invoice may show partial period breakdowns that sum to the total.

Primary pattern: `Consumo kWh:\s*(\d+)\s*m³\s*x\s*[\d,]+(\s*kWh/\s*m³)?\s*([\d.,]+)\s*kWh`

Alternative: if partial periods exist, sum all `(\d+)\s*kWh` values at end of each period line.

Example: `Consumo kWh: 30 m³ x 10,567 kWh* 317 kWh` → `consumption_kwh: "317"`

Period breakdown example:
```
Período de 10.09.2022 a 30.09.2022 113 kWh
Período de 01.10.2022 a 07.11.2022 204 kWh
```
→ Parser SHALL sum to `317 kWh`

### Total Amount (EUR)

Pattern: `Total a pagar\s+([\d.,]+)€`

Example: `Total a pagar 63,61€` → `total_amount_eur: "63.61"`

The parser MUST distinguish `Total a pagar` from `Total gas` or `Base imponible`.

### CUPS

Pattern: `Código CUPS:\s*([A-Z0-9]{22})`

Example: `Código CUPS: ES0217020101041874FT` → `cups_key: "ES0217020101041874FT"`

## Validation Rules

1. `cups_key` MUST be produced by passing `cups_original` through `normalizeCups()`.
2. `computed_year` and `computed_month` MUST be derived from `period_end`.
3. If period breakdowns are present and a total is also present, the parser SHOULD verify the sum matches the total; if they differ, it SHALL use the total and MAY add `MULTIPLE_CONSUMPTION_CANDIDATES`.
4. All candidates MUST be stored in `raw_candidates`.

## Warning Codes This Parser Can Produce

| Code | Level | Blocking | Condition |
|------|-------|----------|-----------|
| `CUPS_NORMALIZED` | info | No | `cups_original` differs from `cups_key` |
| `PERIOD_CROSSES_MONTHS` | info | No | Period spans multiple months |
| `MULTIPLE_AMOUNT_CANDIDATES` | warning | No | Multiple amount matches |
| `MULTIPLE_CONSUMPTION_CANDIDATES` | warning | No | Multiple consumption matches, or sum check fails |
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
  "parser_name": "naturgy_regulada_gas_natural",
  "parser_version": "1.0.0",
  "parse_source": "parser_especifico",
  "parse_confidence": 0.98,
  "energy_type": "gas_natural",
  "supplier_name": "Comercializadora Regulada, Gas & Power, S.A.",
  "invoice_number": "FE22137025647128",
  "cups_original": "ES0217020101041874FT",
  "cups_key": "ES0217020101041874FT",
  "period_start": "2022-09-10",
  "period_end": "2022-11-07",
  "computed_year": 2022,
  "computed_month": 11,
  "consumption_kwh": "317",
  "total_amount_eur": "63.61",
  "raw_candidates": {
    "invoice_number": ["FE22137025647128"],
    "period": ["Del 10.09.2022 al 07.11.2022"],
    "consumption_kwh": ["30 m³ x 10,567 kWh* 317 kWh"],
    "total_amount_eur": ["Total a pagar 63,61€"],
    "cups": ["ES0217020101041874FT"]
  },
  "warnings": []
}
```

## Scenarios

#### Scenario: Dot-separated dates parsed correctly

- GIVEN period text `Del 10.09.2022 al 07.11.2022`
- WHEN `parseDateWithDots()` is applied to each date
- THEN `period_start` = `2022-09-10` and `period_end` = `2022-11-07`

#### Scenario: Partial period consumptions summed

- GIVEN invoice shows `Período de 10.09.2022 a 30.09.2022 113 kWh` and `Período de 01.10.2022 a 07.11.2022 204 kWh`
- WHEN the parser extracts consumption
- THEN `consumption_kwh` SHALL be `"317"` (sum of both periods)

#### Scenario: Total a pagar preferred over Base imponible

- GIVEN invoice contains `Total a pagar 63,61€` and `Base imponible 52,57` (pre-tax)
- WHEN amount candidates are evaluated
- THEN the parser SHALL select `"63.61"` (total with IVA)
- AND NOT `"52.57"`
