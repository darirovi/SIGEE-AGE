# Design: poc-tailwind-ux — UX/UI Refactor del Parser-Local PoC

## Technical Approach

Refactor UI of `poc/parser-local` using Tailwind CSS Play CDN + vanilla JS modules. Replace flat table + inline styles with a card-grid UI, drag&drop zone, toast notifications, detail modal, and sortable/filterable table. Zero build step — double-click `index.html` still works. All parsing logic untouched.

## Architecture Decisions

### Decision: Tailwind CDN Setup

**Choice**: Play CDN (`<script src="https://cdn.tailwindcss.com"></script>`) with inline config
**Alternatives**: Compile-time Tailwind (requires npm/build), CDN with separate config file (breaks zero-build)
**Rationale**: Play CDN supports `tailwind.config = { }` inline + arbitrary values (`bg-green-50` style) without build. Matches zero-build requirement. Version pinned in script tag.

### Decision: Drop Zone + Click Fallback

**Choice**: Single `#drop-zone` div handling `dragover`/`dragleave`/`drop` + hidden `<input type="file">` triggered on click
**Alternatives**: Two separate elements (redundant UX), library (breaks zero-build)
**Rationale**: Standard File API pattern. `drop` calls `processFiles()` directly (same path as button). Click fallback opens file picker natively.

### Decision: CSS Cleanup Strategy

**Choice**: Replace inline `style="..."` attributes in HTML with Tailwind classes; keep `styles.css` for `.spinner-icon` keyframe + any CSS that Tailwind can't replicate
**Alternatives**: Delete `styles.css` entirely (risky — some utilities may be missed), keep ALL inline styles (defeats purpose)
**Rationale**: Spinner animation is CSS-only (can't inline `@keyframes`). Tailwind handles everything else. `styles.css` becomes minimal.

### Decision: Card View vs Table — Dual View

**Choice**: Show cards grid as primary view; retain full 15-column table below for power users
**Alternatives**: Cards only (loses column detail), table only (misses spec requirement)
**Rationale**: Spec requires cards with semaphore AND 15-column table. Both coexist — cards on top for glanceability, table below for detail.

### Decision: Component Architecture (Vanilla JS, no bundler)

| Module | Responsibility |
|--------|----------------|
| `js/toast.js` | Toast manager: `showToast(msg, level)` — stack, auto-dismiss, DOM injection |
| `js/drop-zone.js` | Drag/drop handlers + click fallback; delegates to existing `processFiles()` |
| `js/invoice-modal.js` | Modal open/close, render invoice detail (20 fields, 5 sections) |
| `js/invoice-cards.js` | `renderCards()` — builds card grid from `window.results` |
| `js/table-view.js` | Sort/filter/paginate over `window.results`, reuses `buildRow()` from `render.js` |
| `js/render.js` | Unchanged row-building helpers (`cupsStatus`, `warningBadge`, `buildRow`) |
| `js/app.js` | Event wiring + init; imports toast/modal/drop-zone; wires new DOM IDs |

**Alternatives**: Single `app.js` (unmaintainable), ESM with importmap (browser compat risk)
**Rationale**: Clear separation matches existing module pattern. Each file has single responsibility. No bundler needed — `<script type="module">` works in all modern browsers.

### Decision: State Management

**Choice**: Keep `window.results`, `window.controlledCups`, `window.selectedIndex` as-is; new UI state (sort column, filter text, current page) lives in module-scoped vars inside `table-view.js`
**Alternatives**: Full reactive store (overkill), URL params (complexity)
**Rationale**: State is already global. UI state is ephemeral (lost on re-render anyway). No need to persist it.

### Decision: Toast Implementation

**Choice**: `js/toast.js` — DOM-based, appends `<div class="toast toast-{level}">` to `#toast-container`, auto-removes after 4000ms via `setTimeout`
**Alternatives**: Notification API (requires permission), third-party lib
**Rationale**: Works everywhere, no permission needed. Auto-dismiss via `remove()` call.

### Decision: Modal Implementation

**Choice**: Extend existing `#cupsModalOverlay` pattern into `#invoiceModalOverlay` + `#invoiceModalContent`. ES6 class `InvoiceModal` with `open(result)`, `close()`, `renderContent(result)`
**Alternatives**: `<dialog>` element (good support but harder to style consistently with Tailwind)
**Rationale**: Consistent with existing modal pattern. Reuses backdrop close + ESC key handling.

### Decision: Table Sorting/Filter/Pagination

**Choice**: `table-view.js` module — reads `window.results`, applies filter + sort in-memory, renders visible page. No server, no URL params.
**Alternatives**: URL params (breaks back button), full pagination API (overkill)
**Rationale**: Client-side is fast for PoC-scale data (<1000 invoices). Reuses existing `buildRow()` cells.

### Decision: File Structure for Refactored `poc/parser-local/`

```
poc/parser-local/
├── index.html                          # Modified: Tailwind CDN, new DOM structure
├── css/
│   └── styles.css                      # Keep: spinner @keyframes only
├── js/
│   ├── state.js                        # Unchanged
│   ├── utils.js                        # Unchanged
│   ├── seed-cups.js                    # Unchanged
│   ├── storage.js                      # Unchanged
│   ├── marcadores.js                   # Unchanged
│   ├── validation.js                   # Unchanged
│   ├── pdf.js                          # Unchanged
│   ├── parsers/                        # Unchanged
│   │   ├── iberdrola.js
│   │   ├── curenergia.js
│   │   ├── naturgy-elec.js
│   │   ├── naturgy-gas.js
│   │   ├── energia-xxi.js
│   │   ├── generic.js
│   │   └── index.js
│   ├── render.js                       # Unchanged (buildRow, cupsStatus, badges)
│   ├── export.js                       # Modified: add toast calls on export
│   ├── cups-modal.js                   # Unchanged (reused as-is)
│   ├── app.js                          # Modified: wire new IDs + new module inits
│   ├── toast.js                        # NEW: toast notification system
│   ├── drop-zone.js                    # NEW: drag&drop handlers
│   ├── invoice-modal.js                # NEW: invoice detail modal
│   ├── invoice-cards.js                # NEW: card grid renderer
│   └── table-view.js                   # NEW: sort/filter/paginate
└── vendor/                             # Unchanged
    ├── pdf.min.js
    └── pdf.worker.min.js
```

## Data Flow

```
File Drop/Click
     │
     ▼
processFiles()  ──►  pdf.js  ──►  parsers/  ──►  window.results
                                                       │
                    ┌─────────────────────────────────┼─────────────────────────────────┐
                    ▼                                 ▼                                 ▼
             invoice-cards.js                  table-view.js                   invoice-modal.js
             (card grid render)                (sort/filter/paginate)            (detail on click)
                    │                                 │                                 │
                    └─────────────────────────────────┼─────────────────────────────────┘
                                                      ▼
                                             toast.js (feedback)
```

## Interfaces / Contracts

### Toast API (`js/toast.js`)

```javascript
window.showToast(message: string, level: 'success' | 'error' | 'info'): void
```

### Invoice Modal API (`js/invoice-modal.js`)

```javascript
window.invoiceModal.open(result: InvoiceResult): void
window.invoiceModal.close(): void
```

### Card Renderer (`js/invoice-cards.js`)

```javascript
window.renderCards(): void   // reads window.results, renders #cards-grid
```

### Table View (`js/table-view.js`)

```javascript
window.initTableView(): void  // sets up sort/filter/paginate on #resultsBody
```

### Invoice Result Shape (unchanged — from `window.results`)

```typescript
interface InvoiceResult {
  file_name: string
  parser_name: string
  energy_type: string
  invoice_number: string
  cups_original: string
  cups_key: string
  building_key: string
  building_name: string
  period_start: string
  period_end: string
  computed_year: number
  computed_month: number
  consumption_kwh: number
  total_amount_eur: number
  controlled_cups_match: boolean
  warnings: Warning[]
  raw_text: string
  _validation: ValidationResult | null
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `toast.js` show/dismiss | Direct function call, check DOM |
| Unit | `invoice-cards.js` semaphore logic | Pass sample results, check color class |
| Unit | `table-view.js` sort/filter/paginate | Pass array, verify output |
| Integration | Full parse → card render → modal open | Manual: drop PDF, click card, verify modal |
| E2E | Double-click index.html loads without errors | Playwright: load file:// URL, check no console errors |

## Migration / Rollout

No migration required. This is a pure UI refactor with no data model changes. Rollback via `git checkout HEAD -- poc/parser-local/` as documented in proposal.

## Open Questions

- [ ] Should the spinner animation be moved into `styles.css` or kept inline in Tailwind config? (CSS keyframes can't be inlined)
- [ ] Do cards and table coexist, or does a toggle switch between them? (Spec implies both visible; implementer discretion on layout)
- [ ] Should the "Esperado" (validation) column remain in the table or move to the card? (Validation badges work in both)
