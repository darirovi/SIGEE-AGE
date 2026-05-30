# AGENTS.md — SIGEE-AGE

## Start here

**Documentation-first repo.** All specs, models, and task plans exist in prose — no implemented code yet.

Read `docs/opencode/CONTEXTO_PROYECTO.md` before any implementation task. It covers the app purpose, business rules, and what is/isn't in scope.

Key planning docs (moved from `opencode/` → `docs/opencode/`):

| Area | Doc |
|------|-----|
| Entry point | `docs/opencode/CONTEXTO_PROYECTO.md` |
| Parser design, patterns, contract | `docs/08_parsers_facturas.md` |
| Invoice states, warnings, validation | `docs/09_validaciones_y_avisos.md` |
| Data model (tables, fields, constraints) | `docs/05_modelo_datos.md` |
| Tech stack, folder structure, API | `docs/06_arquitectura_tecnica.md` |
| Implementation task list | `docs/opencode/TAREAS_IMPLEMENTACION.md` |
| Dev prompts by block | `docs/opencode/PROMPTS_DESARROLLO.md` |
| Code conventions | `docs/opencode/CONVENCIONES_CODIGO.md` |

## Critical business rules

- **computed_month/year** comes from `period_end`, never `period_start`. A bill covering Dec 2024–Jan 2025 imputs to **January 2025**.
- **Total with IVA, always.** Parser extracts the final total — not base imponible, subtotals, or pre-tax amounts.
- **CUPS normalization is centralized** — one function in `packages/shared/` (TypeScript) and `apps/parser-api/services/` (Python). Never normalize CUPS inline in a parser.
- **Decimal, not float** — for consumption (kWh) and amounts (EUR). Use `Decimal` in Python, `numeric` in PostgreSQL.
- **Invoice enters totals only if** state is `validada` or `corregida` + no blocking warnings.

CUPS normalization examples:

| Input | Output |
|-------|--------|
| `ES 0022 0000 0621 2876 CB` | `ES0022000006212876CB` |
| `ES0022000006290850YS1P` | `ES0022000006290850YS` (suffix stripped) |

## Stack

- **Frontend**: Next.js + TypeScript + Tailwind + Supabase client
- **Backend parser**: Python + FastAPI + Pydantic + PyMuPDF/pdfplumber
- **DB/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **No**: direct SIGEE-AGE integration, browser automation, scraping, SSO

## Parsers (5 specific + 1 generic)

| Parser | Energy | Source doc |
|--------|--------|------------|
| `iberdrola_electricidad` | Electricity | `docs/08_parsers_facturas.md` §15 |
| `curenergia_electricidad_pvpc` | Electricity | `docs/08_parsers_facturas.md` §16 |
| `naturgy_regulada_electricidad` | Electricity | `docs/08_parsers_facturas.md` §17 |
| `energia_xxi_gas_natural` | Gas natural | `docs/08_parsers_facturas.md` §18 |
| `naturgy_regulada_gas_natural` | Gas natural | `docs/08_parsers_facturas.md` §19 |
| `generic_invoice_parser` | Any | `docs/08_parsers_facturas.md` §20 |

## Seed data locations

- CUPS controlados: `data/seed/cups_controlados.csv`
- Buildings: `data/seed/edificios.csv`
- Energy types: `data/seed/energia_tipos.csv`
- Parser expected outputs: `examples/parser_expected/*.json`
- Example PDFs: `examples/facturas/*.pdf`

## SDD workflow

This project uses SDD (Spec-Driven Development). For any non-trivial change (new parser, new screen, new business rule), run SDD rather than implementing ad-hoc.

Relevant skills: `sdd-init`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`.

## GitNexus

This repo is indexed by GitNexus. **MUST run `gitnexus_impact` before editing any function, class, or method.** Run `gitnexus_detect_changes()` before committing.

- When exploring unfamiliar code: use `gitnexus_query` instead of grep — returns process-grouped execution flows.
- When you need full context on a symbol: use `gitnexus_context`.
- When planning changes: use `gitnexus_impact` and report blast radius to the user.
- **NEVER** use find-and-replace to rename symbols — use `gitnexus_rename` which understands the call graph.
- If the index is stale, run `npx gitnexus analyze` first.

Skill references (read before using GitNexus tools):

| Task | Skill |
|------|-------|
| Architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |

## Out of scope for MVP

SIGEE-AGE integration, scraping, browser automation, SSO, multi-role, per-building permissions, gasoil parser, prorrateo, permanent PDF storage, advanced OCR, advanced reporting.

## Environment

- Pre-implementation: no `pyproject.toml` or `package.json` yet
- Env vars template: `.env.example`
- No CI workflows exist yet
- Playwright config exists at `playwright.config.ts`
