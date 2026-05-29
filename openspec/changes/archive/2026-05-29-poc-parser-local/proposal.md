# Proposal: poc-parser-local

## Intent

Crear una PoC local de parseo de facturas PDF en navegador, sin backend, que demuestre extracción de texto real con pdf.js y procesamiento con parsers JavaScript replicando los patrones documentados. Validará contra los 6 JSON esperados existentes antes de invertir en la implementación definitiva con Next.js/FastAPI.

## Scope

### In Scope
- `poc/parser-local/index.html` — app HTML/CSS/JS vanilla, 100% offline
- `poc/parser-local/vendor/pdf.min.js` + `pdf.worker.min.js` — pdf.js embebido (estructura preparada)
- `poc/parser-local/sample-data/controlled-cups.json` — CUPS controlados embebidos
- 6 parsers JS: `iberdrola_electricidad`, `curenergia_electricidad_pvpc`, `naturgy_regulada_electricidad`, `energia_xxi_gas_natural`, `naturgy_regulada_gas_natural`, `generic_invoice_parser`
- Utilidades: `normalizeCups`, `parseSpanishNumber`, `parseSpanishDate`, `parseDateWithDots`, `computePeriodMonth`, `detectParser`, `extractPdfText`, `associateControlledCups`, `buildWarnings`, `exportJson`, `exportCsv`
- UI: selector múltiple PDFs, tabla resultados, panel debug JSON+texto, descarga JSON/CSV
- Comparación visual vs `examples/parser_expected/*.json`
- `poc/parser-local/README.md` — instrucciones de uso y cómo añadir parsers

### Out of Scope
- Implementación Next.js, Supabase, FastAPI
- Persistencia en base de datos
- Autenticación
- Integración con SIGEE-AGE
- CI/CD

## Capabilities

### New Capabilities
- `browser-pdf-parsing`: PoC browser-only que extrae texto de PDFs con pdf.js y aplica parsers JS específicos por comercializadora

## Approach

- Abrir `index.html` directamente en navegador (file://)
- `pdf.js` cargado desde `vendor/` local — sin CDN ni internet
- Parsers basados en regex JS replicando patrones de `docs/08_parsers_facturas.md`
- Cada parser es una función pura que recibe texto y devuelve JSON normalizado
- Normalización CUPS centralizada en `normalizeCups()` — una sola función
- CUPS controladaos leídos desde `sample-data/controlled-cups.json` embebido
- Selección múltiple de PDFs con `FileReader` + `pdfjsLib.getDocument()`
- Resultados en tabla + panel debug expandable
- Exportación via `Blob` + `URL.createObjectURL`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `poc/parser-local/` | New | Directorio con la PoC completa |
| `examples/parser_expected/` | Read-only | JSONs esperados como reference |
| `data/seed/cups_controlados.csv` | Read-only | Fuente de CUPS para el JSON embebido |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Drift de formato en facturas reales | Medium | La PoC es validada contra 6 casos reales |
| pdf.js sin internet (estructura vendor) | Low | Documentar en README dónde colocar los archivos |
| CUPS embebido desactualizado | Low | Regenerar desde `cups_controlados.csv` |

## Rollback Plan

Eliminar el directorio `poc/parser-local/` — no tiene dependencias con el resto del proyecto.

## Dependencies

- `examples/facturas/*.pdf` — PDFs de ejemplo
- `examples/parser_expected/*.json` — JSON esperados para validación
- `data/seed/cups_controlados.csv` — CUPS para embebido
- `docs/08_parsers_facturas.md` — patrones de parsers

## Success Criteria

- [ ] `index.html` abre directamente en navegador sin servidor
- [ ] Selecciona y procesa 6 PDFs de ejemplo sin errores
- [ ] Los 6 parsers específicos producen output que coincide con JSON esperados en campos clave
- [ ] Parser genérico se usa como fallback para formato no reconocido
- [ ] CUPS se normaliza y se asocia a edificio correctamente
- [ ] Warnings se generan según reglas de `docs/09_validaciones_y_avisos.md`
- [ ] Exportación JSON y CSV funciona
- [ ] Panel debug muestra texto extraído y JSON completo
- [ ] Sin llamadas externas a internet
- [ ] README documenta cómo usar y cómo extender
