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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **SIGEE-AGE** (2569 symbols, 2757 relationships, 19 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/SIGEE-AGE/context` | Codebase overview, check index freshness |
| `gitnexus://repo/SIGEE-AGE/clusters` | All functional areas |
| `gitnexus://repo/SIGEE-AGE/processes` | All execution flows |
| `gitnexus://repo/SIGEE-AGE/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
