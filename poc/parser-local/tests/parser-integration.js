/**
 * Parser Integration Tests
 *
 * Runs each of the 6 example PDFs through the PoC parser and validates
 * the extracted fields against examples/parser_expected/*.json
 *
 * Usage (Playwright MCP):
 *   playwright_browser_navigate → this file as a data: URL or fetch + eval
 *
 * Or standalone:
 *   node tests/parser-integration.js
 *
 * Expected setup:
 *   - HTTP server running on http://localhost:7890
 *   - pdf.js worker configured
 *   - All examples/facturas/*.pdf and examples/parser_expected/*.json present
 */

const BASE_URL = 'http://localhost:7890';
const POC_PATH = '/poc/parser-local/index.html';
const FACTURAS_DIR = '/examples/facturas/';
const EXPECTED_DIR = '/examples/parser_expected/';

// Fields to compare (exclude runtime-only fields like raw_text, raw_candidates, _validation)
const COMPARE_FIELDS = [
  'parser_name',
  'energy_type',
  'invoice_number',
  'cups_key',
  'period_start',
  'period_end',
  'computed_year',
  'computed_month',
  'consumption_kwh',
  'total_amount_eur',
];

// Test cases: PDF file → expected JSON file
const TEST_CASES = [
  {
    pdf: 'iberdrola_electricidad_vallehermoso_2025_01.pdf',
    expected: 'iberdrola_electricidad_vallehermoso_2025_01.json',
    parser: 'iberdrola_electricidad',
  },
  {
    pdf: 'iberdrola_electricidad_fuenlabrada_2024_10.pdf',
    expected: 'iberdrola_electricidad_fuenlabrada_2024_10.json',
    parser: 'iberdrola_electricidad',
  },
  {
    pdf: 'curenergia_electricidad_pvpc_fuenlabrada_2023_04.pdf',
    expected: 'curenergia_electricidad_pvpc_fuenlabrada_2023_04.json',
    parser: 'curenergia_electricidad_pvpc',
  },
  {
    pdf: 'naturgy_regulada_electricidad_uprose_2025_08.pdf',
    expected: 'naturgy_regulada_electricidad_uprose_2025_08.json',
    parser: 'naturgy_regulada_electricidad',
  },
  {
    pdf: 'naturgy_regulada_gas_natural_vallehermoso_2022_11.pdf',
    expected: 'naturgy_regulada_gas_natural_vallehermoso_2022_11.json',
    parser: 'naturgy_regulada_gas_natural',
  },
  {
    pdf: 'energia_xxi_gas_natural_zarzaquemada_2025_02.pdf',
    expected: 'energia_xxi_gas_natural_zarzaquemada_2025_02.json',
    parser: 'energia_xxi_gas_natural',
  },
];

/**
 * Compare two values deeply, returning differences.
 * Handles Decimal→String comparison (e.g. 23.70 vs "23.70")
 */
function compareValues(actual, expected, field) {
  const diffs = [];

  // Normalize both sides to string for numeric-like fields
  const normalize = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return String(v);
    return String(v).trim();
  };

  const a = normalize(actual);
  const e = normalize(expected);

  if (a !== e) {
    diffs.push({ field, actual: a, expected: e });
  }
  return diffs;
}

/**
 * Run all test cases and return a summary.
 * This function is designed to run inside the browser page context.
 */
async function runTests(page) {
  const results = [];

  for (const tc of TEST_CASES) {
    const result = { pdf: tc.pdf, parser: tc.parser, passed: false, errors: [], diffs: [] };

    try {
      // 1. Load expected JSON
      const expectedResp = await fetch(EXPECTED_DIR + tc.expected);
      if (!expectedResp.ok) {
        result.errors.push(`Could not load expected JSON: ${tc.expected} (${expectedResp.status})`);
        results.push(result);
        continue;
      }
      const expected = await expectedResp.json();

      // 2. Load PDF and set on input
      const pdfResp = await fetch(FACTURAS_DIR + tc.pdf);
      if (!pdfResp.ok) {
        result.errors.push(`Could not load PDF: ${tc.pdf} (${pdfResp.status})`);
        results.push(result);
        continue;
      }
      const pdfBuffer = await pdfResp.arrayBuffer();
      const pdfFile = new File([pdfBuffer], tc.pdf, { type: 'application/pdf' });

      // Reset state
      await page.evaluate(() => {
        // Clear previous results
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) clearBtn.click();
      });
      await page.waitForTimeout(200);

      // Set file on input and trigger change
      const { selectedParser } = await page.evaluate(async (fileData) => {
        const dt = new DataTransfer();
        dt.items.add(fileData);
        const input = document.getElementById('fileInput');
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return {};
      }, pdfFile);

      await page.waitForTimeout(200);

      // Click process
      await page.click('button:has-text("Procesar")');
      await page.waitForTimeout(1500); // wait for PDF processing

      // Read result from table
      const { rowData, hasBlockingWarnings } = await page.evaluate(() => {
        const rows = document.querySelectorAll('.results-table tbody tr');
        if (rows.length === 0) return { rowData: null, hasBlockingWarnings: false };

        const cells = rows[0].querySelectorAll('td');
        const headers = Array.from(document.querySelectorAll('.results-table thead th')).map(h => h.textContent.trim());

        const rowData = {};
        headers.forEach((h, i) => { rowData[h] = cells[i]?.textContent?.trim() || ''; });

        // Check for blocking warnings in the warnings cell
        const warningsCell = rows[0].querySelector('td:nth-child(13)');
        const warningsText = warningsCell?.textContent || '';
        const hasBlocking = warningsText.includes('[BLOQ]') || warningsText.includes('🔴');

        return { rowData, hasBlockingWarnings: hasBlocking };
      });

      if (!rowData) {
        result.errors.push('No result row found after processing');
        results.push(result);
        continue;
      }

      // 3. Compare key fields
      const diffs = [];
      for (const field of COMPARE_FIELDS) {
        const colMap = {
          parser_name: 'Parser',
          energy_type: 'Tipo energía',
          invoice_number: 'Nº Factura',
          cups_key: 'CUPS normalizado',
          period_start: 'Periodo',
          period_end: 'Periodo',
          computed_year: 'Mes computado',
          computed_month: 'Mes computado',
          consumption_kwh: 'Consumo (kWh)',
          total_amount_eur: 'Importe (€)',
        };

        const col = colMap[field];
        if (!col || !rowData[col]) {
          diffs.push({ field, actual: '(missing column)', expected: expected[field] });
          continue;
        }

        let actual = rowData[col];

        // Period is displayed as "start → end", extract relevant part
        if (field === 'period_start' || field === 'period_end') {
          const parts = actual.split('→').map(p => p.trim());
          actual = field === 'period_start' ? parts[0] : (parts[1] || parts[0]);
        }

        // Mes computado is "YYYY-MM", extract year or month
        if (field === 'computed_year') {
          actual = actual.split('-')[0];
        }
        if (field === 'computed_month') {
          actual = actual.split('-')[1];
        }

        const fieldDiffs = compareValues(actual, expected[field], field);
        diffs.push(...fieldDiffs);
      }

      // 4. Check warnings
      // Expected fixtures have no blocking warnings (controlled CUPS or test fixtures)
      // In the PoC, CUPS controlled check may differ — we only fail on unexpected blocking warnings
      if (hasBlockingWarnings) {
        result.errors.push('Blocking warnings detected in result');
      }

      result.diffs = diffs;
      result.passed = diffs.length === 0 && result.errors.length === 0;

    } catch (err) {
      result.errors.push(`Exception: ${err.message}`);
    }

    results.push(result);
  }

  return results;
}

/**
 * Print a test summary to console.
 */
function printSummary(results) {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\n========================================`);
  console.log(`  Parser Integration Test Results`);
  console.log(`========================================`);
  console.log(`  Passed: ${passed}/${results.length}`);
  console.log(`  Failed: ${failed}/${results.length}`);
  console.log(`========================================\n`);

  for (const r of results) {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}  ${r.parser} — ${r.pdf}`);
    if (r.errors.length > 0) {
      for (const e of r.errors) console.log(`       ERROR: ${e}`);
    }
    if (r.diffs.length > 0) {
      for (const d of r.diffs) {
        console.log(`       DIFF [${d.field}]: actual="${d.actual}" expected="${d.expected}"`);
      }
    }
  }

  console.log(`\n========================================\n`);
  return { passed, failed, results };
}

// Export for Playwright MCP usage
if (typeof window !== 'undefined') {
  window.runParserTests = runTests;
  window.printParserTestSummary = printSummary;
}

if (typeof module !== 'undefined') {
  module.exports = { runTests, printSummary, TEST_CASES, COMPARE_FIELDS };
}
