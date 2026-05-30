# Proposal: CUPS Controlados Persistence

## Intent

The POC at `poc/parser-local/index.html` loads `controlledCups` from a static JSON file at startup with no persistence across sessions. Users need to **add and remove CUPS entries** during testing sessions without editing the JSON file manually, and have those changes survive page reloads.

## Scope

### In Scope
- View all controlled CUPS in a modal/panel (read-only table)
- Add new CUPS entries (cups_key, building_key, building_name, energy_type, supplier)
- Remove existing CUPS entries by cups_key
- Persist changes to `localStorage`; load from `localStorage` on startup
- Static JSON file remains as initial seed when `localStorage` is empty
- Re-run validation on existing results when CUPS list changes

### Out of Scope
- Edit existing CUPS entries (add with correct key, remove and re-add)
- Export/import of CUPS list
- Multi-user or server-side persistence
- Any backend API changes

## Capabilities

### New Capabilities
- `cups-crud-ui`: Browser-based UI (modal) for viewing, adding, and removing controlled CUPS entries with localStorage persistence

### Modified Capabilities
- None

## Approach

1. **Storage layer**: On init, check `localStorage.getItem('controlledCups')`. If present, parse and use it; otherwise fetch `./sample-data/controlled-cups.json` as seed.
2. **Save on change**: After every add/remove, `localStorage.setItem('controlledCups', JSON.stringify(controlledCups))`.
3. **Modal UI**: Add a "CUPS" button in the toolbar that opens a modal with:
   - Read-only table of all entries (cups_key, building_name, energy_type, supplier)
   - "Añadir" form: 5 inputs (cups_key, building_key, building_name, energy_type, supplier) + submit button
   - Per-row "Eliminar" button
4. **Re-validation**: After any CUPS change, iterate `results` array and call `buildWarnings()` for each; re-render the table.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `poc/parser-local/index.html` | Modified | Add modal HTML, CSS, JS for CUPS CRUD; update `init()` for localStorage |
| `poc/parser-local/sample-data/controlled-cups.json` | No change | Seed data unchanged |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| localStorage quota exceeded | Low | CUPS entries are small; 23 entries ≪ 5MB limit |
| Corrupt localStorage data | Low | Try/catch on parse; fallback to JSON seed on error |
| Results table not re-validated after CUPS change | Medium | Explicitly call `buildWarnings()` and `renderResults()` post-change |

## Rollback Plan

Revert `poc/parser-local/index.html` to the previous commit. Clear localStorage via browser DevTools if needed. The JSON seed file is untouched and always works as fallback.

## Dependencies

- None (pure client-side, no external libraries)

## Success Criteria

- [ ] Can open CUPS modal and see all 23 seeded entries on first load
- [ ] Can add a new CUPS entry and see it appear in the modal immediately
- [ ] Can remove a CUPS entry and see it disappear from the modal immediately
- [ ] After add/remove, closing and reopening the modal shows the updated list
- [ ] After add/remove, page reload shows the updated list (persistence works)
- [ ] Existing results in the table re-validate and update their CUPS status badge after a CUPS change
- [ ] No console errors during normal operation
