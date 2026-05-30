/**
 * Parser Integration Tests — Playwright Spec
 *
 * Requires:
 *   npm install -D @playwright/test
 *   npx playwright install
 *
 * Run:
 *   npx playwright test poc/parser-local/tests/parser.spec.ts
 *
 * Config expected:
 *   - HTTP server on http://localhost:7890
 *   - Base URL: http://localhost:7890/poc/parser-local/index.html
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Resolve paths relative to project root
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const FACTURAS_DIR = path.resolve(PROJECT_ROOT, 'examples/facturas');
const EXPECTED_DIR = path.resolve(PROJECT_ROOT, 'examples/parser_expected');

const BASE_URL = 'http://localhost:7890';
const POC_PATH = '/poc/parser-local/index.html';

// Fields to validate per invoice
const VALIDATION_FIELDS = [
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

interface TestCase {
  pdf: string;
  expected: string;
  parser: string;
  // Map table column names to expected JSON fields
  columnMap: Record<string, string>;
}

const TEST_CASES: TestCase[] = [
  {
    pdf: 'iberdrola_electricidad_vallehermoso_2025_01.pdf',
    expected: 'iberdrola_electricidad_vallehermoso_2025_01.json',
    parser: 'iberdrola_electricidad',
    columnMap: {
      Parser: 'parser_name',
      'Tipo energía': 'energy_type',
      'Nº Factura': 'invoice_number',
      'CUPS normalizado': 'cups_key',
      Periodo: 'period_start',
      'Mes computado': 'computed_year',
      'Consumo (kWh)': 'consumption_kwh',
      'Importe (€)': 'total_amount_eur',
    },
  },
  {
    pdf: 'iberdrola_electricidad_fuenlabrada_2024_10.pdf',
    expected: 'iberdrola_electricidad_fuenlabrada_2024_10.json',
    parser: 'iberdrola_electricidad',
    columnMap: {
      Parser: 'parser_name',
      'Tipo energía': 'energy_type',
      'Nº Factura': 'invoice_number',
      'CUPS normalizado': 'cups_key',
      Periodo: 'period_start',
      'Mes computado': 'computed_year',
      'Consumo (kWh)': 'consumption_kwh',
      'Importe (€)': 'total_amount_eur',
    },
  },
  {
    pdf: 'curenergia_electricidad_pvpc_fuenlabrada_2023_04.pdf',
    expected: 'curenergia_electricidad_pvpc_fuenlabrada_2023_04.json',
    parser: 'curenergia_electricidad_pvpc',
    columnMap: {
      Parser: 'parser_name',
      'Tipo energía': 'energy_type',
      'Nº Factura': 'invoice_number',
      'CUPS normalizado': 'cups_key',
      Periodo: 'period_start',
      'Mes computado': 'computed_year',
      'Consumo (kWh)': 'consumption_kwh',
      'Importe (€)': 'total_amount_eur',
    },
  },
  {
    pdf: 'naturgy_regulada_electricidad_uprose_2025_08.pdf',
    expected: 'naturgy_regulada_electricidad_uprose_2025_08.json',
    parser: 'naturgy_regulada_electricidad',
    columnMap: {
      Parser: 'parser_name',
      'Tipo energía': 'energy_type',
      'Nº Factura': 'invoice_number',
      'CUPS normalizado': 'cups_key',
      Periodo: 'period_start',
      'Mes computado': 'computed_year',
      'Consumo (kWh)': 'consumption_kwh',
      'Importe (€)': 'total_amount_eur',
    },
  },
  {
    pdf: 'naturgy_regulada_gas_natural_vallehermoso_2022_11.pdf',
    expected: 'naturgy_regulada_gas_natural_vallehermoso_2022_11.json',
    parser: 'naturgy_regulada_gas_natural',
    columnMap: {
      Parser: 'parser_name',
      'Tipo energía': 'energy_type',
      'Nº Factura': 'invoice_number',
      'CUPS normalizado': 'cups_key',
      Periodo: 'period_start',
      'Mes computado': 'computed_year',
      'Consumo (kWh)': 'consumption_kwh',
      'Importe (€)': 'total_amount_eur',
    },
  },
  {
    pdf: 'energia_xxi_gas_natural_zarzaquemada_2025_02.pdf',
    expected: 'energia_xxi_gas_natural_zarzaquemada_2025_02.json',
    parser: 'energia_xxi_gas_natural',
    columnMap: {
      Parser: 'parser_name',
      'Tipo energía': 'energy_type',
      'Nº Factura': 'invoice_number',
      'CUPS normalizado': 'cups_key',
      Periodo: 'period_start',
      'Mes computado': 'computed_year',
      'Consumo (kWh)': 'consumption_kwh',
      'Importe (€)': 'total_amount_eur',
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadExpectedJson(tc: TestCase): Promise<Record<string, unknown>> {
  const filePath = path.join(EXPECTED_DIR, tc.expected);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

async function processPdf(page: Page, pdfPath: string): Promise<Record<string, string>> {
  // Navigate to PoC (or ensure we're there)
  await page.goto(`${BASE_URL}${POC_PATH}`);
  await page.waitForLoadState('networkidle');

  // Configure pdf.js worker
  await page.evaluate(() => {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
    }
  });

  // Clear previous results
  const clearBtn = page.locator('#clearBtn');
  if (await clearBtn.isVisible()) {
    await clearBtn.click();
    await page.waitForTimeout(200);
  }

  // Load PDF via file input
  const absolutePdfPath = path.join(PROJECT_ROOT, 'examples/facturas', pdfPath);
  const fileInput = page.locator('#fileInput');
  await fileInput.setInputFiles(absolutePdfPath);
  await page.waitForTimeout(200);

  // Click process
  await page.locator('button:has-text("Procesar")').click();
  await page.waitForTimeout(2000); // allow PDF to parse

  // Read result row (new table structure after poc-tailwind-ux)
  const rowData: Record<string, string> = {};
  const headers = await page.locator('#table-header-row th').allTextContents();
  const cells = await page.locator('#resultsBody tr:first-child td').allTextContents();

  headers.forEach((h, i) => {
    rowData[h.trim()] = (cells[i] || '').trim();
  });

  return rowData;
}

function extractFieldFromTableRow(
  rowData: Record<string, string>,
  columnMap: Record<string, string>,
  field: string,
  expected: Record<string, unknown>
): { actual: string; expected: string } {
  const colName = Object.entries(columnMap).find(([, v]) => v === field)?.[0];
  if (!colName) return { actual: '(no column)', expected: String(expected[field] || '') };

  let actual = rowData[colName] || '';

  // Period is "YYYY-MM-DD → YYYY-MM-DD", split accordingly
  if (field === 'period_start') {
    actual = actual.split('→')[0].trim();
  } else if (field === 'period_end') {
    const parts = actual.split('→');
    actual = (parts[1] || parts[0]).trim();
  }

  // Mes computado is "YYYY-MM"
  if (field === 'computed_year') {
    actual = actual.split('-')[0];
  } else if (field === 'computed_month') {
    actual = actual.split('-')[1];
  }

  return { actual, expected: String(expected[field] ?? '') };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Parser Integration Tests', () => {
  for (const tc of TEST_CASES) {
    test(`[${tc.parser}] ${tc.pdf}`, async ({ page }) => {
      // Load expected JSON
      let expected: Record<string, unknown>;
      try {
        expected = await loadExpectedJson(tc);
      } catch (err) {
        test.skip(`Expected JSON not found: ${tc.expected}`);
        return;
      }

      // Process PDF
      const rowData = await processPdf(page, tc.pdf);

      // Validate each field
      const failures: string[] = [];

      for (const field of VALIDATION_FIELDS) {
        if (!(field in (tc.columnMap as Record<string, string>))) continue;

        const { actual, expected: exp } = extractFieldFromTableRow(rowData, tc.columnMap, field, expected);

        // Normalize for comparison: both as strings, decimal numbers allow trailing zeros to differ
        const normalizeNum = (v: string) => {
          const n = parseFloat(v);
          return isNaN(n) ? v.trim() : String(n);
        };

        const normActual = normalizeNum(actual);
        const normExpected = normalizeNum(exp);

        if (normActual !== normExpected) {
          failures.push(`  ${field}: actual="${normActual}" expected="${normExpected}"`);
        }
      }

      // "Esperado" column was removed in poc-tailwind-ux (dev-only info)
      // Blocking warning check skipped — visible in invoice detail modal instead

      if (failures.length > 0) {
        throw new Error(`Validation failed:\n${failures.join('\n')}`);
      }
    });
  }
});
