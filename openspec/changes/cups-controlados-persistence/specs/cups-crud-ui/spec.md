# CUPS Controlados UI Specification

## Purpose

Provide a browser-based modal UI for viewing, adding, and removing controlled CUPS entries in the POC, with localStorage persistence and automatic re-validation of existing results on any CUPS change.

---

## Data Model

### controlledCups Schema

```typescript
type EnergyType = 'electricidad' | 'gas_natural';

interface ControlledCup {
  building_key: string;
  building_name: string;
  energy_type: EnergyType;
  supplier: string;
}

type ControlledCupsMap = Record<string, ControlledCup>;
```

### Storage

| Key | Value |
|-----|-------|
| `localStorage` key | `'sigee-controlled-cups'` |
| Seed fallback | `./sample-data/controlled-cups.json` (fetched when localStorage is absent or empty) |

---

## Requirements

### Requirement: Initial Load

The system MUST load `controlledCups` on POC startup by checking `localStorage.getItem('sigee-controlled-cups')` first. If the key exists and parses successfully, use it. Otherwise, fetch `./sample-data/controlled-cups.json` as the initial seed.

#### Scenario: First load with no localStorage

- GIVEN the POC is opened with no prior localStorage entry
- WHEN `init()` runs
- THEN `controlledCups` is populated from `./sample-data/controlled-cups.json`
- AND the seed contains exactly 23 entries

#### Scenario: Subsequent load with localStorage

- GIVEN a previous session saved CUPS entries to localStorage
- WHEN `init()` runs
- THEN `controlledCups` is populated from localStorage
- AND the JSON seed is NOT fetched

#### Scenario: localStorage parse failure

- GIVEN localStorage contains corrupt data for `'sigee-controlled-cups'`
- WHEN `init()` attempts to parse it
- THEN the system MUST log a warning to console
- AND fall back to loading from `./sample-data/controlled-cups.json`

---

### Requirement: CUPS Modal Toolbar Button

The system MUST provide a "Gestionar CUPS" button in the POC toolbar. Clicking it MUST open the CUPS modal overlay.

#### Scenario: Open modal

- GIVEN the POC page is loaded
- WHEN the user clicks "Gestionar CUPS"
- THEN a centered modal overlay appears with title "CUPS Controlados"
- AND the modal contains a table of all controlled CUPS entries

---

### Requirement: CUPS Modal Table Display

The modal MUST display all controlled CUPS entries in a table with columns: CUPS | Edificio | Nombre | Tipo | Distribuidora | Acciones.

#### Scenario: Display all entries

- GIVEN the modal is open
- WHEN it renders
- THEN each row shows: cups_key, building_key, building_name, energy_type (as label), supplier
- AND each row has a per-row "Eliminar" button

---

### Requirement: Add CUPS Entry

The system MUST allow adding a new CUPS entry via an inline form inside the modal containing 5 fields: cups_key, building_key, building_name, energy_type (dropdown), supplier, plus an "Añadir" button.

#### Scenario: Add valid entry

- GIVEN the modal is open with the add form visible
- WHEN the user fills all 5 fields with valid values
- AND clicks "Añadir"
- THEN the entry is added to `controlledCups`
- AND localStorage is updated with the new entry
- AND the modal table refreshes to show the new row

#### Scenario: CUPS auto-normalization on blur

- GIVEN the user has typed a CUPS value in the cups_key field
- WHEN the field loses focus (blur event)
- THEN the value MUST be passed through `normalizeCups()` before being stored

#### Scenario: Duplicate CUPS rejected

- GIVEN the modal is open with the add form visible
- WHEN the user enters a cups_key that already exists in `controlledCups`
- AND clicks "Añadir"
- THEN an inline error message MUST appear below the form: "Este CUPS ya existe"
- AND the entry is NOT added

#### Scenario: Missing required field

- GIVEN the modal is open with the add form visible
- WHEN the user leaves any required field empty
- AND clicks "Añadir"
- THEN an inline validation error MUST be shown for the empty field(s)
- AND the entry is NOT added

---

### Requirement: Remove CUPS Entry

The system MUST allow removing a CUPS entry via a per-row "Eliminar" button in the modal table. No confirmation is required for the POC.

#### Scenario: Remove existing entry

- GIVEN the modal is open and the table shows at least one CUPS entry
- WHEN the user clicks "Eliminar" on a specific row
- THEN that entry is removed from `controlledCups`
- AND localStorage is updated without that entry
- AND the modal table refreshes to remove the row

---

### Requirement: Modal Close

The system MUST allow closing the modal via a close button (X) or by clicking the overlay backdrop.

#### Scenario: Close modal

- GIVEN the modal is open
- WHEN the user clicks the X button or clicks outside the modal
- THEN the modal closes
- AND all displayed results on the page remain visible and unchanged

---

### Requirement: Re-validation on CUPS Change

The system MUST re-run `buildWarnings()` for all processed results after any add or remove operation, then re-render the results table.

#### Scenario: Re-validate after add

- GIVEN results are displayed in the results table
- WHEN the user adds a new CUPS entry
- THEN `buildWarnings()` MUST be called for each result in the results array
- AND the results table MUST re-render reflecting any changed CUPS status badges

#### Scenario: Re-validate after remove

- GIVEN results are displayed in the results table
- WHEN the user removes a CUPS entry
- THEN `buildWarnings()` MUST be called for each result in the results array
- AND the results table MUST re-render reflecting any changed CUPS status badges

---

### Requirement: localStorage Unavailable

If `localStorage` is not available (private browsing with strict settings), the system MUST warn in console and continue functioning with the JSON seed as read-only.

#### Scenario: localStorage unavailable

- GIVEN `localStorage.getItem` throws an exception
- WHEN the system attempts to save
- THEN a warning MUST be logged to console
- AND the application continues working without persistence
- AND add/remove operations work in-memory only for that session
