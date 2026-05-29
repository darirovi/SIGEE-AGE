# CUPS Normalization — Specification

## Purpose

Centralized utility function `normalizeCups(input)` that transforms a raw CUPS string from any parser into the canonical internal form. This function MUST be used by every parser — no parser SHALL implement its own CUPS normalization logic.

## Requirements

### Requirement: Canonical Form

The function SHALL return the canonical CUPS form: uppercase letters, no spaces, no separators, only alphanumeric characters retained.

#### Scenario: CUPS with spaces normalized

- GIVEN `cups_original` is `"ES 0022 0000 0621 2876 CB"`
- WHEN `normalizeCups("ES 0022 0000 0621 2876 CB")` is called
- THEN the result SHALL be `"ES0022000006212876CB"`

#### Scenario: CUPS already clean

- GIVEN `cups_original` is `"ES0234150035789683GC"`
- WHEN `normalizeCups("ES0234150035789683GC")` is called
- THEN the result SHALL be `"ES0234150035789683GC"` unchanged

### Requirement: Suffix Stripping

For CUPS containing a 2-character alphanumeric suffix (commonly `YS`, `CB`, `FT`, etc.), the function SHALL strip the suffix before returning the canonical form. This is required because the controlled-CUPS register stores CUPS without these suffixes.

The suffix is the last 2 characters when the CUPS is 22 characters long (ES + 20 alphanumeric + 2 suffix = 22 total after removing spaces).

Pattern: If `CUPS.length === 22` and last 2 chars match `[A-Z0-9]{2}`, strip them.

#### Scenario: CUPS with YS suffix stripped

- GIVEN `cups_original` is `"ES0022000006290850YS1P"` (22 chars with `YS` + `1P`)
- WHEN `normalizeCups()` is applied
- THEN the result SHALL be `"ES0022000006290850YS"` (suffix `1P` stripped, then `YS` stripped per rule)

#### Scenario: CUPS with CB suffix stripped

- GIVEN `cups_original` is `"ES 0022 0000 0621 2876 CB"` (with spaces)
- WHEN `normalizeCups()` is applied
- THEN spaces are removed first → `"ES0022000006212876CB"` (20 chars, no suffix stripped)

#### Scenario: CUPS with FT suffix stripped

- GIVEN `cups_original` is `"ES0217020101041874FT"`
- WHEN `normalizeCups()` is applied
- THEN the result SHALL be `"ES0217020101041874FT"` (20 chars, no suffix; FT is part of the base CUPS)

### Requirement: Comparison Form

The returned value SHALL be usable for direct comparison against the controlled-CUPS register.

### Requirement: No Parser Inline Normalization

No parser module SHALL contain its own CUPS normalization logic. All parsers SHALL call `normalizeCups()` from the shared utility.

## Function Signature

```javascript
/**
 * @param {string} cupsRaw - Raw CUPS string as it appears in the invoice
 * @returns {string} - Normalized CUPS suitable for comparison with controlled-CUPS register
 */
function normalizeCups(cupsRaw) { ... }
```

## Examples

| Input | Output | Notes |
|-------|--------|-------|
| `ES 0022 0000 0621 2876 CB` | `ES0022000006212876CB` | Spaces removed, uppercase |
| `ES0022000006290850YS1P` | `ES0022000006290850YS` | Suffix `1P` stripped |
| `ES0234150035789683GC` | `ES0234150035789683GC` | No change needed |
| `es0022000006212876cb` | `ES0022000006212876CB` | Lowercase → uppercase |
