# poc-parser-local-ui Specification

## Purpose

UI layer for the parser-local PoC. Provides a professional interface with cards, drag&drop upload, toast notifications, detail modal, and responsive layout — without any changes to parsing logic.

## Requirements

### Requirement: Upload Drag & Drop Zone

The system SHALL provide a file upload area with drag & drop support and visual file preview.

- GIVEN user has opened the PoC in a browser
- WHEN user drags a PDF file over the drop zone
- THEN the zone SHALL highlight with a dashed border and background color change
- AND display the filename and file size
- WHEN user drops the file
- THEN the system SHALL parse it and display results

#### Scenario: Click-to-upload fallback

- GIVEN user is on a device that does not support drag events
- WHEN user clicks the drop zone
- THEN a file picker dialog SHALL open
- AND selected files are processed normally

### Requirement: Parsed Invoice Cards with Traffic-Light Semaphore

The system SHALL display each parsed invoice as a card with a prominent traffic-light status indicator.

- GIVEN one or more invoices have been parsed
- WHEN results are displayed
- THEN each invoice SHALL appear as a card showing: filename, parser name, validation state, and computed month/year
- AND the card SHALL feature a large semaphore indicator (circle, 48px minimum):
  - GREEN when `estado = validada` with no blocking warnings
  - YELLOW when `estado = corregida` or has non-blocking warnings
  - RED when any blocking warning is present
- AND the card background tint SHALL match the semaphore color (subtle)

#### Scenario: Card interaction

- GIVEN an invoice card is displayed
- WHEN user hovers over it
- THEN it SHALL show a subtle elevation/shadow effect
- AND display a "View details" affordance

### Requirement: Results Data Table

The system SHALL render a sortable, filterable, paginated table retaining all 15 columns.

- GIVEN results exist
- WHEN user views the table
- THEN all 15 columns SHALL be visible
- AND the table SHALL support:
  - Sort by any column (ascending/descending toggle)
  - Text filter across all fields
  - Pagination (25/50/100 rows per page)

### Requirement: Toast Notification System

The system SHALL provide non-blocking toast notifications for user actions.

- GIVEN user triggers an action (parse, export)
- WHEN the action completes
- THEN a toast SHALL appear with the result:
  - GREEN border for success
  - RED border for errors
  - BLUE border for informational messages
- AND toasts SHALL auto-dismiss after 4 seconds
- AND multiple toasts SHALL stack vertically

### Requirement: Invoice Detail Modal

The system SHALL display full invoice details in a modal overlay.

- GIVEN an invoice card or row is selected
- WHEN user clicks "View details"
- THEN a modal SHALL open showing all 20 invoice fields organized in sections:
  - Identification (cups, invoice number, date)
  - Period (start, end, computed month/year)
  - Energy (type, consumption kWh, price)
  - Financial (base amount, IVA, total)
  - Validation (estado, warnings array)
- AND the modal SHALL have a close button and ESC key dismissal
- AND clicking the overlay backdrop SHALL close the modal

### Requirement: Loading and Progress States

The system SHALL indicate processing activity during parsing operations.

- GIVEN user drops a file
- WHEN parsing is in progress
- THEN a progress indicator (spinner or progress bar) SHALL appear
- AND the upload zone SHALL be disabled
- AND the UI SHALL remain responsive

### Requirement: Responsive Layout

The system SHALL adapt its layout across device sizes.

- GIVEN viewport width changes
- WHEN width is 375px–639px (mobile)
- THEN cards SHALL stack vertically, table scrolls horizontally
- WHEN width is 640px–1023px (tablet)
- THEN cards appear in 2-column grid
- WHEN width is 1024px+ (laptop)
- THEN full layout with cards grid (3–4 columns) and table side-by-side is shown
