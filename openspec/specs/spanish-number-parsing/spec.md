# Spanish Number Parsing — Specification

## Purpose

Centralized utility function `parseSpanishNumber(input)` that transforms Spanish-formatted number strings into JavaScript `Number` values. Spanish formatting uses comma (`,`) as decimal separator and period (`.`) as thousands separator, the inverse of English formatting.

## Requirements

### Requirement: Comma as Decimal Separator

The function SHALL treat the rightmost comma in the input as the decimal separator.

Pattern: `.` = thousands grouping, `,` = decimal separator

#### Scenario: Simple decimal with comma

- GIVEN input string `"23,70"`
- WHEN `parseSpanishNumber("23,70")` is called
- THEN the result SHALL be `23.70`

#### Scenario: Thousands with period separator

- GIVEN input string `"1.234,56"`
- WHEN `parseSpanishNumber("1.234,56")` is called
- THEN the result SHALL be `1234.56`

#### Scenario: Spanish number with trailing zeros

- GIVEN input string `"8.650,000"`
- WHEN `parseSpanishNumber("8.650,000")` is called
- THEN the result SHALL be `8650` (trailing zeros in decimal part are dropped)

### Requirement: Strip Non-Numeric Characters

The function SHALL strip currency symbols (€), unit labels (kWh, m³), and whitespace before parsing.

#### Scenario: Number with currency symbol

- GIVEN input string `"23,70€"`
- WHEN `parseSpanishNumber("23,70€")` is called
- THEN the result SHALL be `23.70`

#### Scenario: Number with unit label

- GIVEN input string `"88 kWh"`
- WHEN `parseSpanishNumber("88 kWh")` is called
- THEN the result SHALL be `88`

#### Scenario: Number with currency and spaces

- GIVEN input string `"603,71 €"`
- WHEN `parseSpanishNumber("603,71 €")` is called
- THEN the result SHALL be `603.71`

### Requirement: Integer Fallback

If no comma is present, the function SHALL parse the input as an integer.

#### Scenario: Integer string

- GIVEN input string `"88"`
- WHEN `parseSpanishNumber("88")` is called
- THEN the result SHALL be `88`

### Requirement: Return Type

The function SHALL return a JavaScript `Number`. If the input cannot be parsed, it SHALL return `NaN`.

## Function Signature

```javascript
/**
 * @param {string} input - Spanish-formatted number string (e.g., "23,70€", "1.234,56")
 * @returns {number} - Parsed number, or NaN if unparseable
 */
function parseSpanishNumber(input) { ... }
```

## Examples

| Input | Output |
|-------|--------|
| `"23,70"` | `23.70` |
| `"23,70€"` | `23.70` |
| `"1.234,56"` | `1234.56` |
| `"8.650,000"` | `8650` |
| `"88 kWh"` | `88` |
| `"603,71 €"` | `603.71` |
| `"88"` | `88` |
| `"0"` | `0` |
