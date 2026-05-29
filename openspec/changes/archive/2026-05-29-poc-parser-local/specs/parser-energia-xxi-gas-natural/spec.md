# Parser: energia_xxi_gas_natural — Specification

## Purpose

Extract structured data from Energía XXI natural gas invoices using text pattern matching. Produces `energia_xxi_gas_natural` as `parser_name`. Must handle Catalan/Valencian text variants present in the invoice.

## Marcadores / Detection Patterns

The parser SHALL be selected when the invoice text contains **at least 3** of:

- `Energía XXI` (supplier marker)
- `INFORMACIÓ DEL CONSUM GAS` (gas consumption info — Catalan)
- `GAS NATURAL` (gas type marker)
- `Tipus de gas: Gas natural` (gas type label — Catalan)
- `CUPS:` (CUPS label)
- `TOTAL IMPORT FACTURA` (total invoice amount — Catalan)

## Extraction Patterns

### Invoice Number

Pattern: `Núm\. de factura:\s*([A-Z0-9]+)`

Example: `Núm. de factura: S25CON006941700`

### Period (Catalan format)

Pattern: `Període facturació:\s*del\s+(\d{2}/\d{2}/\d{4})\s+al\s+(\d{2}/\d{2}/\d{4})`

Example: `del 23/12/2024 al 27/02/2025`
→ `period_start`: `2024-12-23`, `period_end`: `2025-02-27`

### Consumption (kWh)

The parser SHALL extract consumption in **kWh**, NOT m³. The invoice may show both.

Primary pattern: `Consum\s+Total\s+([\d.,]+)\s*kWh`

Fallback pattern: `Consum\s+([\d.,]+),\d+\s*kWh`

Example: `Consum Total 8.650,000 kWh` → `consumption_kwh: "8650"`

The parser MUST detect and prefer kWh over m³ candidates.

### Total Amount (EUR)

Primary pattern: `TOTAL IMPORT FACTURA\s+([\d.,]+)\s*€`

Fallback pattern: `IMPORT FACTURA:\s*([\d.,]+)\s*€`

Example: `TOTAL IMPORT FACTURA 603,71 €` → `total_amount_eur: "603.71"`

### CUPS

Pattern: `CUPS:\s*([A-Z0-9]{22})`

Example: `CUPS: ES0234150035789683GC` → `cups_key: "ES0234150035789683GC"`

### Energy Type

Pattern: `Tipus de gas:\s*Gas natural`

When matched, `energy_type` SHALL be `"gas_natural"`.

## Validation Rules

1. `cups_key` MUST be produced by passing `cups_original` through `normalizeCups()`.
2. `computed_year` and `computed_month` MUST be derived from `period_end`.
3. The parser MUST extract the **total kWh consumption**, not the m³ value.
4. If multiple kWh candidates exist, the parser SHALL prefer the one labeled "Consum Total" or the larger value.
5. All candidates MUST be stored in `raw_candidates`.

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
  "parser_name": "energia_xxi_gas_natural",
  "parser_version": "1.0.0",
  "parse_source": "parser_especifico",
  "parse_confidence": 0.98,
  "energy_type": "gas_natural",
  "supplier_name": "Energía XXI Comercializadora de Referencia S.L.U.",
  "invoice_number": "S25CON006941700",
  "cups_original": "ES0234150035789683GC",
  "cups_key": "ES0234150035789683GC",
  "period_start": "2024-12-23",
  "period_end": "2025-02-27",
  "computed_year": 2025,
  "computed_month": 2,
  "consumption_kwh": "8650",
  "total_amount_eur": "603.71",
  "raw_candidates": {
    "invoice_number": ["S25CON006941700"],
    "period": ["del 23/12/2024 al 27/02/2025"],
    "consumption_kwh": ["Consum Total 8.650,000 kWh", "Consum 8.650,00 kWh"],
    "total_amount_eur": ["TOTAL IMPORT FACTURA 603,71 €", "IMPORT FACTURA: 603,71 €"],
    "cups": ["ES0234150035789683GC"],
    "energy_type": ["Tipus de gas: Gas natural", "GAS NATURAL"]
  },
  "warnings": []
}
```

## Scenarios

#### Scenario: kWh extracted, not m³

- GIVEN invoice text contains both `Consum 819,00 m³` and `Consum Total 8.650,000 kWh`
- WHEN consumption candidates are evaluated
- THEN the parser SHALL select the kWh value `"8650"`
- AND NOT the m³ value `"819"`

#### Scenario: Catalan period format parsed

- GIVEN period text `del 23/12/2024 al 27/02/2025`
- WHEN `parseSpanishDate()` is applied to each date
- THEN `period_start` = `2024-12-23` and `period_end` = `2025-02-27`
- AND `computed_year` = 2025, `computed_month` = 2

#### Scenario: Total with IVA preferred over pre-tax amount

- GIVEN invoice contains `TOTAL IMPORT FACTURA 603,71 €` and `Import total 498,93` (pre-tax)
- WHEN amount candidates are evaluated
- THEN the parser SHALL select `"603.71"` (with IVA)
- AND `"498.93"` SHALL be stored in `raw_candidates` but NOT used as `total_amount_eur`
