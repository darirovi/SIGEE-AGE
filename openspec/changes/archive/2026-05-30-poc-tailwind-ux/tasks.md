# Tasks: poc-tailwind-ux — UX/UI Refactor del Parser-Local PoC

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900–1200 |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR (single-pr strategy) |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: High

> High risk due to ~5 new JS modules + major HTML restructure. Single-PR accepted via `exception-ok` delivery strategy.

---

## Phase 1: Foundation — Tailwind Setup + Spinner Animation

- [x] 1.1 Add `<script src="https://cdn.tailwindcss.com"></script>` + inline `tailwind.config` to `index.html` (spinner @keyframes via CSS custom property + Tailwind arbitrary values)
- [x] 1.2 Delete `css/styles.css` (all utilities replaced by Tailwind) — kept minimal @keyframes spin only
- [x] 1.3 Remove `<link rel="stylesheet" href="css/styles.css" />` from `index.html`
- [x] 1.4 Wire Tailwind CDN in `<head>` before vendor scripts; verify page loads without errors

---

## Phase 2: Toast Notification System

- [x] 2.1 Create `js/toast.js` — `window.showToast(msg, level)` with 3 levels (success/error/info), 4s auto-dismiss, vertical stack in `#toast-container`
- [x] 2.2 Add `<div id="toast-container">` to `index.html` (fixed bottom-right)
- [x] 2.3 Call `showToast('Parseo iniciado', 'info')` in `pdf.js` `processFiles()` on file drop; call `showToast('Parseo completado', 'success')` on success, `showToast(error, 'error')` on failure
- [x] 2.4 Add toast feedback to `export.js` — success toast after CSV/JSON export
- [ ] 2.5 Verify: toast appears/disappears correctly, stacking works, no console errors

---

## Phase 3: Drop Zone

- [x] 3.1 Create `js/drop-zone.js` — `#drop-zone` div handling `dragover`/`dragleave`/`drop` + hidden `<input type="file">` triggered on click (click fallback)
- [x] 3.2 Replace current file input/toolbar in `index.html` with styled drop zone: dashed border, file icon, filename + size preview
- [x] 3.3 Drop zone calls `processFiles()` directly (same path as button); shows spinner on drop
- [x] 3.4 Hide/show original `#fileInput` + `#processBtn` toolbar; keep Gestionar CUPS button
- [ ] 3.5 Verify: drag highlights zone, drop processes file, click opens file picker, file name shown

---

## Phase 4: Invoice Cards View

- [x] 4.1 Create `js/invoice-cards.js` — `window.renderCards()` reads `window.results`, renders cards into `#cards-grid`
- [x] 4.2 Each card shows: filename, parser name, semantic month (YYYY-MM), semaphore circle (48px min), consumption kWh, total EUR, building name
- [x] 4.3 Semaphore logic: GREEN=`validada`+no blocking warnings; YELLOW=`corregida` or non-blocking warnings; RED=any blocking warning
- [x] 4.4 Card hover: `hover:shadow-lg` elevation; cursor pointer; "Ver detalles" text visible on hover
- [x] 4.5 Add `#cards-grid` container to `index.html` (CSS grid: 1col mobile, 2col tablet, 3-4col laptop)
- [ ] 4.6 Verify: cards render for parsed results, semaphore colors correct, hover effect works

---

## Phase 5: Invoice Detail Modal

- [x] 5.1 Create `js/invoice-modal.js` — `InvoiceModal` class with `open(result)`, `close()`, `renderContent(result)`, ESC key + backdrop dismiss
- [x] 5.2 Modal renders 5 sections: Identification (cups, invoice number, date), Period (start/end/computed), Energy (type, kWh, price), Financial (base, IVA, total), Validation (estado, warnings array)
- [x] 5.3 Add `#invoiceModalOverlay` + `#invoiceModalContent` to `index.html` (reuse `#cupsModalOverlay` pattern)
- [x] 5.4 Card click → `invoiceModal.open(window.results[idx])`; close button + overlay click → `invoiceModal.close()`
- [x] 5.5 **REMOVE "Esperado" column** from table header in `index.html` (Decision #3)
- [x] 5.6 Remove `expectedBadge()` from `render.js` (no longer needed anywhere)
- [ ] 5.7 Verify: modal opens on card click, all 20 fields displayed in 5 sections, ESC/backdrop close

---

## Phase 6: Table View (Sort/Filter/Paginate)

- [x] 6.1 Create `js/table-view.js` — `window.initTableView()` reads `window.results`, applies text filter + sort + pagination, renders `#resultsBody`
- [x] 6.2 Keep all 14 columns (Esperado removed); make `#resultsBody` sortable (click header → asc/desc toggle); add text filter input above table
- [x] 6.3 Pagination: 25/50/100 rows per page; prev/next/page-num controls
- [x] 6.4 Preserve `buildRow()` cells from `render.js` for table rows (reuse TD structure without expectedBadge)
- [ ] 6.5 Verify: sort toggles direction, filter narrows results, pagination limits rows correctly

---

## Phase 7: View Toggle (Cards ↔ Table)

- [x] 7.1 Add toggle switcher (tab/button) above results area in `index.html` — "Cards" / "Tabla"
- [x] 7.2 Toggle state: module-scoped var in `app.js`; default to cards view
- [x] 7.3 Show `#cards-grid` + hide table when cards active; vice versa for table view
- [x] 7.4 After `renderResults()` completes (new parse), re-render current view; maintain selected view across parses
- [ ] 7.5 Verify: toggle switches between views instantly; state preserved on new parse

---

## Phase 8: Loading Spinner + Layout Polish

- [x] 8.1 Replace `#processing-overlay` with Tailwind: fixed overlay, white centered box, spinner circle using Tailwind `animate-spin` (define in config inline)
- [x] 8.2 Apply Tailwind responsive layout to entire page: `max-w-7xl mx-auto px-4 py-6`
- [x] 8.3 Replace all remaining inline styles in `index.html` with Tailwind utility classes
- [ ] 8.4 Verify: loading overlay appears during parse, responsive breakpoints work (375px/640px/1024px+)

---

## Phase 9: Integration & End-to-End Verification

- [ ] 9.1 Full flow: double-click `index.html` → no console errors
- [ ] 9.2 Drop a real PDF → toast appears → results show as cards with correct semaphore
- [ ] 9.3 Click a card → modal opens with correct 20 fields
- [ ] 9.4 Switch to Table view → sort/filter/paginate work correctly
- [ ] 9.5 Export CSV/JSON → toast success appears
- [ ] 9.6 Mobile viewport (375px) → layout is usable, no horizontal overflow
