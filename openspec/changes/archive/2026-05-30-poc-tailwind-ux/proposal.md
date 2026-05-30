# Proposal: poc-tailwind-ux — UX/UI Refactor del Parser-Local PoC

## Intent

El PoC actual (`poc/parser-local`) funciona bien pero su UI es primitiva: tabla plana sin jerarquía visual, colores Bootstrap-hardcoded, ningún feedback visual de estado, y-zero diseño responsive. El objetivo es transformar la experiencia en algo profesional e intuitivo — semaforización real, drag&drop con preview, cards con detalle en modal, toast notifications — sin perder ninguna funcionalidad existente y manteniendo el requisito de cero build step (doble click en `index.html`).

## Scope

### In Scope
1. Añadir Tailwind CSS via Play CDN (`<script src="https://cdn.tailwindcss.com"></script>`, zero build)
2. Rediseño visual: paleta semafórica real (verde/amarillo/rojo), tipografía clara, espaciado consistente Tailwind
3. Upload drag & drop con zona de drop + preview visual del archivo
4. Cards de resultado en vez de tabla cruda — cada factura en su propio card con semaforo grande
5. Tabla con sorting/filtering/pagination (Tailwind + vanilla JS, retaining all 15 columns)
6. Semaforo grande y claro en cada card (valida/corrige/requiere-atencion)
7. Toast notifications para feedback (éxito, error, info)
8. Modal de detalle completo con toda la info de la factura
9. Responsive layout (mobile→tablet→laptop) via Tailwind breakpoints
10. Estados de loading con progress indicators durante parsing
11. Mantener toda la logica de parsing existente (5 parsers + generic, normalizeCups, warnings, CSV export)

### Out of Scope
- Auth / backend / persistencia en base de datos
- Cambios en la logica de parsing o las funciones de normalizacion
- Creacion de nuevos parsers
- Totales mensuales o agregaciones
- Guardar estado entre sesiones (ya existe localStorage, no se toca)

## Capabilities

> Este es un refactor de UI pura — no hay cambios en requisitos de negocio ni en capacidades existentes.
> Los specs de parser (`parser-iberdrola-electricidad`, `browser-pdf-parsing`, etc.) NO se tocan.

### New Capabilities
- `poc-parser-local-ui`: Interface de usuario del PoC con diseño profesional, cards, drag&drop, toasts, modal, sorting/filtering/pagination. (Nuevo spec en `openspec/specs/poc-parser-local-ui/spec.md`)

### Modified Capabilities
- Ninguna — todas las capacidades de parsing existentes siguen con los mismos requisitos.

## Approach

- **Tailwind via CDN**: `<script src="https://cdn.tailwindcss.com"></script>` en `index.html` + config inline para fuentes/paleta. No hay npm, no hay build.
- **Progressive refactor**: Se trabaja en paralelo sobre CSS (reemplazar `styles.css` con Tailwind utilities) y HTML (rediseñar estructura del DOM en `index.html`). Los JS modules (`render.js`, `app.js`, `export.js`) se modifican solo para cambiar la renderizacion de tabla→cards, sin tocar logica de negocio.
- **Drag & drop**: File API + `dragover`/`drop` events en `app.js`. Preview del nombre/peso del archivo.
- **Toast system**: Tiny vanilla JS toast manager en `js/toast.js` — 3 niveles (success/error/info), auto-dismiss 4s.
- **Cards + sorting**: `render.js` se refactoriza para generar cards en vez de `<tr>`. Sorting/filtering/pagination en vanilla JS sobre `window.results`.
- **Modal**: Expandir el modal de cups (`cups-modal.js`) para reutilizar su estructura como modal de detalle de factura.
- **Semaforo**: Logica en `render.js` — `validada`→verde, `corregida`→amarillo, cualquier blocking warning→rojo.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `poc/parser-local/index.html` | Modified | Nueva estructura DOM, Tailwind CDN, zona drop, cards container, modal markup |
| `poc/parser-local/css/styles.css` | Replaced | Reemplazado por Tailwind utilities (CDN) — archivo permanece por compat |
| `poc/parser-local/js/app.js` | Modified | Drag&drop handlers, toast calls, rewire de eventos a nuevos IDs |
| `poc/parser-local/js/render.js` | Modified | Renderiza cards en vez de filas de tabla; semaforo visual; sorting/filtering |
| `poc/parser-local/js/export.js` | Modified | Toast feedback post-export |
| `poc/parser-local/js/toast.js` | New | Sistema de toast notifications (nuevo modulo) |
| `poc/parser-local/js/cups-modal.js` | Modified | Reutilizado como base del modal de detalle |
| `openspec/specs/poc-parser-local-ui/` | New | Spec para la nueva capability de UI |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tailwind Play CDN no funciona offline | Low | Usar version pinned + fallback comment: el PoC funciona sin CDN si el browser tiene cache |
| Cambios en render.js rompen sorting/filtering | Low | Mantener la misma estructura de `window.results`; solo cambia el output HTML |
| Tailwind sobrescribe estilos existants | Medium | Limpiar `styles.css` progresivamente; revisar con `!important` como ultimo recurso |
| Browser antiguo no soporta Tailwind v4 | Low | Play CDN usa moderne CSS; target: Chrome/Firefox/Safari recientes |

## Rollback Plan

1. Git: `git checkout HEAD -- poc/parser-local/index.html poc/parser-local/css/styles.css poc/parser-local/js/render.js poc/parser-local/js/app.js poc/parser-local/js/export.js poc/parser-local/js/cups-modal.js poc/parser-local/js/toast.js`
2. Eliminar el script Tag de Tailwind de `index.html`
3. Si se creo `js/toast.js`, eliminarlo
4. Resultado: UI anterior restaurada en <2 min

## Dependencies

- Tailwind CSS Play CDN: `https://cdn.tailwindcss.com` — CDN externo, no hay version local

## Success Criteria

- [ ] Doble click en `index.html` abre la interfaz sin errores en consola
- [ ] Drag & drop de un PDF muestra preview y procesa correctamente
- [ ] Cada resultado se muestra como card con semaforo visible (verde/amarillo/rojo)
- [ ] Sorting por columna y filtro por texto funcionan en la tabla de resultados
- [ ] Toast de exito aparece tras exportar CSV/JSON
- [ ] Modal de detalle muestra todos los 20 campos de la factura
- [ ] Layout es usable en viewport 375px (mobile) y 1440px (laptop)
- [ ] Los 5 parsers + generic siguen funcionando exactamente igual — ninguna regression en parsing
- [ ] `normalizeCups()` produce el mismo output que antes del cambio
- [ ] Exportacion CSV genera el mismo formato de columnas que antes
