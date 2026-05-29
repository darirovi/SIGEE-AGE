# AGENTS.md — SIGEE-AGE

## Repo state

This is a **documentation-first repo**. There is no implemented code yet — all specs, models, and task plans exist only in prose. Before writing any code, read the planning docs.

## Start here: `opencode/CONTEXTO_PROYECTO.md`

This is the single entry point. It explains:
- What the app does (prepares energy consumption data for manual entry into SIGEE-AGE)
- Why it exists (reduce transcription errors and time)
- What's in scope / out of scope
- Key business rules (CUPS normalization, monthly computation, invoice states)

Read it before any implementation task.

## Key docs to consult by area

| Area | Doc |
|------|-----|
| Parser design, patterns, contract | `docs/08_parsers_facturas.md` |
| Invoice states, warnings, validation | `docs/09_validaciones_y_avisos.md` |
| Data model (tables, fields, constraints) | `docs/05_modelo_datos.md` |
| Tech stack, folder structure, API | `docs/06_arquitectura_tecnica.md` |
| Implementation task list | `opencode/TAREAS_IMPLEMENTACION.md` |

## Critical business rules (would be wrong without this help)

- **Computed month/year** comes from `period_end`, never from `period_start`. A bill covering Dec 2024–Jan 2025 imputs to **January 2025**.
- **Total with IVA, always.** Parser must extract the final total, not base imponible, subtotals, or pre-tax amounts.
- **CUPS normalization is centralized** — one function, used by every parser and the business layer. Never normalize CUPS inline in a parser.
- **Decimal, not float** — for consumption (kWh) and amounts (EUR). Use `Decimal` in Python, `numeric` in PostgreSQL.
- **Invoice enters totals only if** state is `validada` or `corregida` + no blocking warnings.

## Stack (as defined in docs)

- **Frontend**: Next.js + TypeScript + Tailwind + Supabase client
- **Backend parser**: Python + FastAPI + Pydantic + PyMuPDF/pdfplumber
- **DB/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **No**: direct SIGEE-AGE integration, browser automation, scraping, SSO

## Parsers (5 specific + 1 generic)

| Parser | Energy | Source |
|--------|--------|--------|
| `iberdrola_electricidad` | Electricity | `docs/08_parsers_facturas.md` §15 |
| `curenergia_electricidad_pvpc` | Electricity | `docs/08_parsers_facturas.md` §16 |
| `naturgy_regulada_electricidad` | Electricity | `docs/08_parsers_facturas.md` §17 |
| `energia_xxi_gas_natural` | Gas natural | `docs/08_parsers_facturas.md` §18 |
| `naturgy_regulada_gas_natural` | Gas natural | `docs/08_parsers_facturas.md` §19 |
| `generic_invoice_parser` | Any | `docs/08_parsers_facturas.md` §20 |

CUPS normalization rules and test fixtures are in `examples/parser_expected/`.

## CUPS normalization (single function, two examples)

| Input | Output |
|-------|--------|
| `ES 0022 0000 0621 2876 CB` | `ES0022000006212876CB` |
| `ES0022000006290850YS1P` | `ES0022000006290850YS` (suffix stripped) |

Implementation: create once in `packages/shared/` (TypeScript) and `apps/parser-api/services/` (Python). Both must behave identically.

## Seed data locations

- CUPS controlados: `data/seed/cups_controlados.csv`
- Buildings: `data/seed/edificios.csv`
- Energy types: `data/seed/energia_tipos.csv`
- Test fixtures: `examples/parser_expected/*.json`
- Example PDFs: `examples/facturas/*.pdf`

## SDD workflow

This project uses SDD (Spec-Driven Development). Relevant skills:
- `sdd-init`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`

For any non-trivial change (new parser, new screen, new business rule), run SDD rather than implementing ad-hoc.

## GitNexus

This repo is indexed in GitNexus. Use `gitnexus-query`, `gitnexus-context`, `gitnexus-impact` before changing parser logic or shared utilities to understand what would break.

## What's out of scope for MVP

SIGEE-AGE integration, scraping, browser automation, SSO, multi-role, per-building permissions, gasoil parser, prorrateo, permanent PDF storage, advanced OCR, advanced reporting.

## Environment

- No `pyproject.toml` or `package.json` exists yet — this is pre-implementation.
- Env vars template: `.env.example`
- No CI workflows exist yet.
