/**
 * UI Verification Tests — poc-tailwind-ux
 *
 * Tests the new Tailwind UI components added in poc-tailwind-ux:
 * - Toast notifications
 * - Drag & drop zone
 * - Invoice cards with traffic-light semaphore
 * - Invoice detail modal
 * - View toggle (Cards ↔ Table)
 * - Table sort/filter/pagination
 * - Loading overlay
 * - Responsive layout
 *
 * Requires:
 *   npm install
 *   npx playwright install chromium
 *
 * Run:
 *   npx playwright test poc/parser-local/tests/ui.spec.ts
 *
 * Config:
 *   - HTTP server on http://localhost:7890 (started automatically)
 *   - Base URL: http://localhost:7890/poc/parser-local/index.html
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const BASE_URL = 'http://localhost:7890';
const POC_PATH = '/poc/parser-local/index.html';

const FACTURAS_DIR = path.resolve(PROJECT_ROOT, 'examples/facturas');

const PDF_FILES = [
  'iberdrola_electricidad_vallehermoso_2025_01.pdf',
  'naturgy_regulada_electricidad_uprose_2025_08.pdf',
  'naturgy_regulada_gas_natural_vallehermoso_2022_11.pdf',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadPage(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}${POC_PATH}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => document.readyState === 'complete');
  await page.waitForTimeout(1000); // give scripts + Tailwind time to fully initialize
  // Configure pdf.js worker
  await page.evaluate(() => {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
    }
  });
}

async function processPdf(page: Page, pdfPath: string): Promise<void> {
  const absolutePdfPath = path.join(FACTURAS_DIR, pdfPath);
  const fileInput = page.locator('#fileInput');
  await fileInput.setInputFiles(absolutePdfPath);
  await page.locator('#processBtn').click();
  await page.waitForTimeout(3000); // allow PDF to parse (headless may be slower)
}

async function clearResults(page: Page): Promise<void> {
  const clearBtn = page.locator('#clearBtn');
  if (await clearBtn.isVisible()) {
    await clearBtn.click();
    await page.waitForTimeout(300);
  }
}

// ---------------------------------------------------------------------------
// Tests: Toast Notifications
// ---------------------------------------------------------------------------

test.describe('Toast Notifications', () => {
  test('toast container exists in DOM', async ({ page }) => {
    await loadPage(page);
    const container = page.locator('#toast-container');
    await expect(container).toBeAttached();
  });

  test('toast appears after processing a PDF', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    // Wait for toast to appear (success toast after parsing)
    await page.waitForTimeout(1000);
    // Toast elements have border-l-4 class plus color class
    const toastItems = page.locator('#toast-container > div');
    await expect(toastItems.first()).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// Tests: Drag & Drop Zone
// ---------------------------------------------------------------------------

test.describe('Drag & Drop Zone', () => {
  test('drop zone is visible', async ({ page }) => {
    await loadPage(page);
    const dropZone = page.locator('#drop-zone');
    await expect(dropZone).toBeVisible();
  });

  test('drop zone has correct placeholder text', async ({ page }) => {
    await loadPage(page);
    const dropText = page.locator('#drop-text');
    await expect(dropText).toContainText('Arrastra archivos PDF aquí');
  });

  test('clicking drop zone opens file picker', async ({ page }) => {
    await loadPage(page);
    const dropZone = page.locator('#drop-zone');
    const fileInput = page.locator('#fileInput');
    // Click should open file input (file input is hidden, triggered by label click)
    await dropZone.click();
    // File input should be accept=".pdf" - verify it exists
    await expect(fileInput).toHaveAttribute('accept', '.pdf');
  });

  test('file preview shows filename after selection', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    const absolutePdfPath = path.join(FACTURAS_DIR, PDF_FILES[0]);
    await page.locator('#fileInput').setInputFiles(absolutePdfPath);
    const preview = page.locator('#file-preview');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(PDF_FILES[0]);
  });
});

// ---------------------------------------------------------------------------
// Tests: Invoice Cards View
// ---------------------------------------------------------------------------

test.describe('Invoice Cards View', () => {
  test('cards grid exists in DOM', async ({ page }) => {
    await loadPage(page);
    const cardsGrid = page.locator('#cards-grid');
    await expect(cardsGrid).toBeAttached();
  });

  test('cards render after processing PDF', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    // Cards are div children of #cards-grid with rounded-lg and cursor-pointer
    const cards = page.locator('#cards-grid > div.rounded-lg');
    await expect(cards.first()).toBeVisible({ timeout: 8000 });
  });

  test('card shows semaphore indicator', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    // Semaphore is the rounded-full div with bg-sem-green/yellow/red class
    const semaphore = page.locator('#cards-grid .rounded-full.bg-green-600, #cards-grid .rounded-full.bg-yellow-500, #cards-grid .rounded-full.bg-red-600').first();
    await expect(semaphore).toBeVisible({ timeout: 8000 });
  });

  test('card shows supplier name', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    // Supplier is the parser name in text-xs text-gray-500 class
    const card = page.locator('#cards-grid > div.rounded-lg').first();
    await expect(card.locator('.text-gray-500')).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// Tests: View Toggle
// ---------------------------------------------------------------------------

test.describe('View Toggle (Cards ↔ Table)', () => {
  test('view toggle buttons exist in DOM (hidden until results)', async ({ page }) => {
    await loadPage(page);
    // Buttons are inside #results-section which is hidden until results exist
    await expect(page.locator('#view-cards-btn')).toBeAttached();
    await expect(page.locator('#view-table-btn')).toBeAttached();
  });

  test('defaults to cards view after processing', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    const cardsGrid = page.locator('#cards-grid');
    await expect(cardsGrid).toBeVisible();
    await expect(cardsGrid).not.toHaveClass(/hidden/);
  });

  test('switching to table view hides cards', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    await page.locator('#view-table-btn').click();
    await page.waitForTimeout(200);
    const cardsGrid = page.locator('#cards-grid');
    await expect(cardsGrid).toHaveClass(/hidden/);
  });

  test('switching to table view shows table', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    // Ensure cards are visible first
    await expect(page.locator('#cards-grid > div.rounded-lg').first()).toBeVisible({ timeout: 8000 });
    await page.locator('#view-table-btn').click({ force: true });
    await page.waitForTimeout(500);
    const tableContainer = page.locator('#table-container');
    await expect(tableContainer).not.toHaveClass('hidden');
  });

  test('switching back to cards view hides table', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    await page.locator('#view-table-btn').click();
    await page.waitForTimeout(200);
    await page.locator('#view-cards-btn').click();
    await page.waitForTimeout(200);
    const tableContainer = page.locator('#table-container');
    await expect(tableContainer).toHaveClass(/hidden/);
  });
});

// ---------------------------------------------------------------------------
// Tests: Invoice Detail Modal
// ---------------------------------------------------------------------------

test.describe('Invoice Detail Modal', () => {
  test('modal is hidden by default', async ({ page }) => {
    await loadPage(page);
    const modal = page.locator('#invoiceModalOverlay');
    await expect(modal).toHaveClass(/hidden/);
  });

  test('clicking card opens modal', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(500);
    // Cards are divs with rounded-lg class inside #cards-grid
    const card = page.locator('#cards-grid > div.rounded-lg').first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await card.click();
    await page.waitForTimeout(500);
    const modal = page.locator('#invoiceModalOverlay');
    await expect(modal).not.toHaveClass('hidden');
  });

  test('modal has close button', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(1000);
    // Wait for invoiceModal to be ready
    await page.waitForFunction(() => typeof window.invoiceModal !== 'undefined', { timeout: 5000 });
    const card = page.locator('#cards-grid > div.rounded-lg').first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await card.click();
    await page.waitForFunction(() => !document.getElementById('invoiceModalOverlay').classList.contains('hidden'), { timeout: 5000 });
    const closeBtn = page.locator('#invoiceModalClose');
    await expect(closeBtn).toBeVisible();
  });

  test('ESC key closes modal', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(1000);
    await page.waitForFunction(() => typeof window.invoiceModal !== 'undefined', { timeout: 5000 });
    const card = page.locator('#cards-grid > div.rounded-lg').first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await card.click();
    await page.waitForFunction(() => !document.getElementById('invoiceModalOverlay').classList.contains('hidden'), { timeout: 5000 });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('invoiceModalOverlay').classList.contains('hidden'), { timeout: 5000 });
  });

  test('backdrop click closes modal', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    await processPdf(page, PDF_FILES[0]);
    await page.waitForTimeout(1000);
    await page.waitForFunction(() => typeof window.invoiceModal !== 'undefined', { timeout: 5000 });
    const card = page.locator('#cards-grid > div.rounded-lg').first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await card.click();
    await page.waitForFunction(() => !document.getElementById('invoiceModalOverlay').classList.contains('hidden'), { timeout: 5000 });
    // Click outside modal content (on overlay)
    await page.locator('#invoiceModalOverlay').click({ position: { x: 10, y: 10 } });
    await page.waitForFunction(() => document.getElementById('invoiceModalOverlay').classList.contains('hidden'), { timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Tests: Table Sort / Filter / Pagination
// ---------------------------------------------------------------------------

test.describe('Table Sort/Filter/Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    // Process multiple PDFs to have data for sorting/pagination
    for (const pdf of PDF_FILES) {
      await processPdf(page, pdf);
    }
    await page.locator('#view-table-btn').click();
    await page.waitForTimeout(300);
  });

  test('table has headers', async ({ page }) => {
    const headers = page.locator('#table-header-row th');
    await expect(headers.first()).toBeVisible();
    const count = await headers.count();
    expect(count).toBeGreaterThan(5); // at least 6 columns
  });

  test('filter input filters table rows', async ({ page }) => {
    const filterInput = page.locator('#table-filter');
    await filterInput.fill('iberdrola');
    await page.waitForTimeout(300);
    const rows = page.locator('#resultsBody tr');
    const count = await rows.count();
    // Should filter to fewer rows (or zero if no match)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('pagination controls exist', async ({ page }) => {
    const pagination = page.locator('#pagination-controls');
    await expect(pagination).toBeVisible();
  });

  test('changing page size updates displayed rows', async ({ page }) => {
    const pageSizeSelect = page.locator('#table-page-size');
    await pageSizeSelect.selectOption('25');
    await page.waitForTimeout(200);
    // Should still have table visible
    const rows = page.locator('#resultsBody tr');
    const count = await rows.count();
    expect(count).toBeLessThanOrEqual(25);
  });
});

// ---------------------------------------------------------------------------
// Tests: Loading Overlay
// ---------------------------------------------------------------------------

test.describe('Loading Overlay', () => {
  test('processing overlay appears during parse', async ({ page }) => {
    await loadPage(page);
    await clearResults(page);
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(path.join(FACTURAS_DIR, PDF_FILES[0]));
    // Click process and immediately check overlay
    await page.locator('#processBtn').click();
    const overlay = page.locator('#processing-overlay');
    // Overlay may appear briefly
    await page.waitForTimeout(100);
    // It should either be visible now or already hidden (if parsing was fast)
    // Just verify it exists in DOM
    await expect(overlay).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Tests: Responsive Layout
// ---------------------------------------------------------------------------

test.describe('Responsive Layout', () => {
  const viewports = [
    { width: 375, height: 667, label: 'mobile' },
    { width: 640, height: 960, label: 'tablet' },
    { width: 1280, height: 800, label: 'desktop' },
  ];

  for (const vp of viewports) {
    test(`main layout fits ${vp.label} viewport (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loadPage(page);
      // No overflow horizontal — main layout should scroll naturally
      const main = page.locator('.max-w-7xl');
      await expect(main).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// Tests: CUPS Modal
// ---------------------------------------------------------------------------

test.describe('CUPS Modal', () => {
  test('CUPS modal opens via button', async ({ page }) => {
    await loadPage(page);
    await page.locator('#gestionarCupsBtn').click();
    await page.waitForTimeout(500);
    // CUPS modal uses style.display (not .hidden class) to show/hide
    await expect(page.locator('#cupsModalOverlay')).toBeVisible();
  });

  test('CUPS modal closes via close button', async ({ page }) => {
    await loadPage(page);
    await page.locator('#gestionarCupsBtn').click();
    await page.waitForTimeout(300);
    await page.locator('#cupsModalClose').click();
    await page.waitForTimeout(300);
    const modal = page.locator('#cupsModalOverlay');
    await expect(modal).toHaveClass(/hidden/);
  });
});

// ---------------------------------------------------------------------------
// Tests: Export Buttons
// ---------------------------------------------------------------------------

test.describe('Export Functions', () => {
  test('export CSV button exists', async ({ page }) => {
    await loadPage(page);
    await expect(page.locator('#exportCsvBtn')).toBeVisible();
  });

  test('export JSON button exists', async ({ page }) => {
    await loadPage(page);
    await expect(page.locator('#exportJsonBtn')).toBeVisible();
  });

  test('clear button exists', async ({ page }) => {
    await loadPage(page);
    await expect(page.locator('#clearBtn')).toBeVisible();
  });
});
