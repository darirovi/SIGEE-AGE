# SIGEE-AGE Parser Local PoC

Browser-based PDF invoice parser PoC. Extracts energy consumption data from electricity and gas natural invoices without any server-side processing.

## How to use

1. **Open in browser** — no server needed:
   ```
   file:///<path-to-repo>/poc/parser-local/index.html
   ```

2. **Get vendor files** — pdf.js is required for PDF extraction:
   - Follow the instructions in `vendor/README.md` to download `pdf.min.js` and `pdf.worker.min.js`
   - Place them in `poc/parser-local/vendor/`

3. **Open the PoC** — select one or more PDF invoice files and the parser will:
   - Extract text client-side using pdf.js
   - Detect which supplier parser to use
   - Extract: CUPS, period dates, consumption (kWh / m³), total amount (€)
   - Show results with traffic-light status

## File structure

```
poc/parser-local/
├── index.html              ← Entry point (open directly in browser)
├── README.md               ← This file
├── vendor/                 ← pdf.js library (download separately)
│   ├── README.md           ← Download instructions
│   ├── pdf.min.js
│   └── pdf.worker.min.js
└── sample-data/
    └── controlled-cups.json  ← Known CUPS registry for building lookup
```

## How to add a new parser

1. Add a new function to the `<script>` section in `index.html`:
   ```js
   function myparser_electricidad(text) {
     // text: full extracted PDF text
     // Return: InvoiceParseResult object
   }
   ```

2. Register it in the `marcadores` map (used by `detectParser`):
   ```js
   const marcadores = {
     // ... existing entries ...
     myparser: {
       patterns: ['UNIQUE_MARKER_1', 'UNIQUE_MARKER_2', /* ... */],
       fn: myparser_electricidad
     }
   };
   ```

3. Detection threshold: a parser is selected if ≥ 3 of its marcadores are found in the text.

## Parser naming convention

| Parser name | Energy type | Source |
|---|---|---|
| `iberdrola_electricidad` | Electricity | Iberdrola 2.0A/2.1A |
| `curenergia_electricidad_pvpc` | Electricity | Curenergia PVPC |
| `naturgy_regulada_electricidad` | Electricity | Naturgy Comercializadora Regulada |
| `naturgy_regulada_gas_natural` | Gas natural | Naturgy Comercializadora Regulada |
| `energia_xxi_gas_natural` | Gas natural | Energía XXI (Catalan format) |
| `generic_invoice_parser` | Any | Fallback — broad regex, lower confidence |

## Business rules implemented

- **CUPS normalization**: single `normalizeCups()` function — strips spaces, uppercases, strips 2-char suffix
- **Total with IVA, always**: parser extracts the final total, not base imponible
- **Computed month/year**: derived from `period_end`, never `period_start`
- **Decimal, not float**: all amounts and consumption use precise decimal arithmetic
