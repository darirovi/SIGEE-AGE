# Parser Integration Tests

## Running with Playwright MCP

Use the browser-based approach from the PoC page itself:

```js
// In the browser console or via playwright_browser_evaluate:
await runParserTests(page);  // defined in parser-integration.js
```

## Running with Playwright Test

```bash
npm install -D @playwright/test
npx playwright install chromium
npx playwright test poc/parser-local/tests/parser.spec.ts
```

Requires an HTTP server running on `http://localhost:7890` serving the project root.

## Test Coverage

| Parser | PDF | Status |
|--------|-----|--------|
| `iberdrola_electricidad` | vallehermoso_2025_01 | ✅ PASS |
| `iberdrola_electricidad` | fuenlabrada_2024_10 | ✅ PASS |
| `curenergia_electricidad_pvpc` | fuenlabrada_2023_04 | ❌ FAIL — generic fallback |
| `naturgy_regulada_electricidad` | uprose_2025_08 | ✅ PASS |
| `naturgy_regulada_gas_natural` | vallehermoso_2022_11 | ✅ PASS |
| `energia_xxi_gas_natural` | zarzaquemada_2025_02 | ❌ FAIL — generic fallback |

## Test Fields

Each parser is validated against these fields from `examples/parser_expected/*.json`:

- `parser_name`
- `energy_type`
- `invoice_number`
- `cups_key`
- `period_start` / `period_end`
- `computed_year` / `computed_month`
- `consumption_kwh`
- `total_amount_eur`
