# PROMPTS_DESARROLLO.md

## 1. Propósito del documento

Este documento contiene prompts preparados para trabajar con OpenCode durante la implementación del MVP de la aplicación auxiliar SIGEE-AGE.

Los prompts están diseñados para ejecutar tareas de forma incremental, controlada y alineada con la documentación del proyecto.

Cada prompt debe usarse como instrucción de trabajo para OpenCode, adaptando únicamente los detalles concretos del estado del repositorio cuando sea necesario.

---

## 2. Reglas generales para usar estos prompts

Antes de lanzar un prompt a OpenCode:

1. Confirmar que la tarea anterior está completada.
2. Revisar si hay errores pendientes en el repositorio.
3. Asegurarse de que OpenCode tiene acceso a la documentación del proyecto.
4. Pedir cambios pequeños y verificables.
5. Evitar pedir varias fases completas a la vez.
6. Exigir que indique archivos modificados y pruebas realizadas.
7. No aceptar implementaciones fuera del alcance del MVP.

---

## 3. Prompt base para cualquier tarea

Usar este bloque como encabezado común cuando se pida cualquier desarrollo:

```txt
Estás trabajando en el proyecto SIGEE-AGE auxiliar.

Antes de implementar, revisa la documentación relevante en:

- docs/00_resumen_ejecutivo.md
- docs/01_contexto_y_objetivo.md
- docs/02_alcance_mvp.md
- docs/03_requisitos_funcionales.md
- docs/04_reglas_negocio.md
- docs/05_modelo_datos.md
- docs/06_arquitectura_tecnica.md
- docs/07_pantallas_y_flujos.md
- docs/08_parsers_facturas.md
- docs/09_validaciones_y_avisos.md
- docs/10_exportaciones.md
- opencode/CONTEXTO_PROYECTO.md
- opencode/TAREAS_IMPLEMENTACION.md
- opencode/CONVENCIONES_CODIGO.md

Respeta estas reglas generales:

- La aplicación es auxiliar y no debe integrarse automáticamente con SIGEE-AGE.
- No hagas scraping ni automatización de navegador.
- No implementes funcionalidades fuera del MVP.
- Mantén separación clara entre frontend, backend parser, base de datos y lógica de negocio.
- No dupliques reglas críticas.
- Usa tipos estrictos en TypeScript.
- Usa Pydantic y Decimal en Python cuando proceda.
- No uses float para importes ni consumos.
- Añade o actualiza tests si la tarea afecta a lógica crítica.
- Al terminar, resume archivos modificados, decisiones tomadas y pruebas ejecutadas.
```

---

## 4. Prompt de revisión inicial del repositorio

### Objetivo

Comprobar el estado real del repositorio antes de implementar.

### Prompt

```txt
Revisa el estado actual del repositorio del proyecto SIGEE-AGE auxiliar.

Tareas:

1. Identifica la estructura actual de carpetas.
2. Comprueba si existen las carpetas esperadas:
   - apps/web
   - apps/parser-api
   - packages/shared
   - docs
   - opencode
   - data/seed
   - examples/facturas
   - diagrams
3. Comprueba si existe README.md.
4. Comprueba si existen archivos .env.example.
5. No implementes todavía lógica funcional.
6. Propón los cambios mínimos necesarios para alinear el repositorio con la estructura prevista.

Entrega:

- diagnóstico breve;
- lista de archivos/carpetas ausentes;
- cambios propuestos;
- comandos que debería ejecutar para verificar el estado.
```

---

## 5. Prompt para preparar estructura base del repositorio

### Objetivo

Crear o ajustar la estructura inicial sin desarrollar todavía funcionalidades complejas.

### Prompt

```txt
Prepara la estructura base del repositorio para el proyecto SIGEE-AGE auxiliar.

Debes crear o ajustar la estructura mínima:

sigee-age-helper/
├── apps/
│   ├── web/
│   └── parser-api/
├── packages/
│   └── shared/
├── docs/
├── opencode/
├── data/
│   └── seed/
├── examples/
│   └── facturas/
├── diagrams/
└── README.md

Requisitos:

- No borres documentación existente.
- No muevas archivos sin justificarlo.
- Crea archivos placeholder solo cuando sean útiles.
- Añade README.md técnico inicial si no existe.
- Crea .env.example donde corresponda.
- No implementes todavía base de datos ni parsers.

Al terminar, indica:

- carpetas creadas;
- archivos creados o modificados;
- comandos de verificación.
```

---

## 6. Prompt para crear README técnico inicial

### Objetivo

Documentar cómo arrancar el proyecto y sus componentes.

### Prompt

```txt
Crea o actualiza README.md del proyecto SIGEE-AGE auxiliar.

Debe incluir:

1. Descripción breve del proyecto.
2. Advertencia clara de que no se integra automáticamente con SIGEE-AGE.
3. Stack previsto:
   - Next.js, React, TypeScript y Tailwind para frontend.
   - Supabase Auth y PostgreSQL.
   - FastAPI, Pydantic y PyMuPDF/pdfplumber para backend parser.
4. Estructura de carpetas.
5. Requisitos de entorno.
6. Variables de entorno necesarias.
7. Comandos de instalación.
8. Comandos de ejecución local.
9. Comandos de test.
10. Enlaces internos a docs/ y opencode/.

No inventes funcionalidades que no estén en la documentación.

Al terminar, resume los cambios realizados.
```

---

## 7. Prompt para variables de entorno

### Objetivo

Crear plantillas de configuración seguras.

### Prompt

```txt
Configura las plantillas de variables de entorno del proyecto.

Crea o actualiza:

- .env.example
- apps/web/.env.example
- apps/parser-api/.env.example

Variables mínimas para frontend:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
PARSER_API_URL=

Variables mínimas para backend parser:

APP_ENV=local
CORS_ALLOWED_ORIGINS=http://localhost:3000
MAX_UPLOAD_SIZE_MB=20

Requisitos:

- No incluyas secretos reales.
- Añade comentarios breves si ayudan.
- Si el código ya lee variables de entorno, asegúrate de que coincidan los nombres.
- Si falta validación de configuración crítica, propón una mejora mínima.

Al terminar, indica archivos modificados y cómo verificar que no se han subido secretos.
```

---

## 8. Prompt para migraciones de base de datos

### Objetivo

Crear el modelo relacional mínimo del MVP.

### Prompt

```txt
Implementa las migraciones iniciales de base de datos para el MVP SIGEE-AGE auxiliar.

Debes crear las tablas:

- energy_types
- buildings
- controlled_cups
- invoice_uploads
- invoices
- invoice_warnings
- audit_events

También debes crear una vista o consulta equivalente para monthly_totals, agregando únicamente facturas con estado validada o corregida.

Revisa antes:

- docs/05_modelo_datos.md
- docs/04_reglas_negocio.md
- docs/09_validaciones_y_avisos.md
- opencode/TAREAS_IMPLEMENTACION.md

Requisitos importantes:

- Usa numeric para importes y consumos, no float.
- controlled_cups debe impedir duplicados por cups_key + energy_type_code.
- invoice_warnings debe permitir avisos info, warning y error.
- invoices debe soportar estados documentados.
- Las tablas deben tener created_at y updated_at cuando proceda.
- No implementes todavía pantallas ni parsers.

Al terminar:

1. Lista migraciones creadas.
2. Explica restricciones relevantes.
3. Indica cómo aplicar y revertir migraciones.
4. Indica cómo comprobar que monthly_totals solo suma facturas validadas o corregidas.
```

---

## 9. Prompt para seed de tipos energéticos y edificios

### Objetivo

Precargar catálogos mínimos.

### Prompt

```txt
Crea el seed inicial para tipos energéticos y edificios del MVP.

Tipos energéticos:

- electricidad | Electricidad | enabled_in_mvp true | parser_focus true
- gas_natural | Gas natural | enabled_in_mvp true | parser_focus true
- gasoleo | Gasóleo | enabled_in_mvp true | parser_focus false

Edificios iniciales:

- FUENLABRADA | Viviendas Logísticas de Fuenlabrada
- VILLAVERDE | Viviendas Logísticas de Villaverde
- ZARZAQUEMADA | Acuartelamiento de Zarzaquemada-Leganés
- VALLEHERMOSO | Acuartelamiento Vallehermoso
- UPROSE | UPROSE

Requisitos:

- Los seeds deben ser idempotentes si es posible.
- No crees CUPS inventados.
- No uses datos no confirmados por pantallazo salvo que ya estén documentados expresamente.
- Mantén building_key estable.

Al terminar, indica:

- archivos creados o modificados;
- comando para ejecutar seed;
- consulta de verificación.
```

---

## 10. Prompt para seed de CUPS controlados

### Objetivo

Crear el seed de superficie de control inicial.

### Prompt

```txt
Crea el seed inicial de CUPS controlados para el MVP.

Revisa la documentación y los pantallazos disponibles. La fuente de verdad inicial son los CUPS visibles en los pantallazos de SIGEE-AGE aportados al proyecto.

No incluyas CUPS procedentes de CSV auxiliar si no están confirmados por pantallazo o decisión documentada.

Campos mínimos:

building_key,energy_type_code,cups_original,cups_key,description,supplier_name,tariff,control_from_year,control_from_month,control_to_year,control_to_month,status,source,notes

Reglas:

- Cada CUPS pertenece a un único edificio en el MVP.
- Cada CUPS debe tener cups_key normalizado.
- source debe indicar pantallazo_sigee u origen equivalente.
- status inicial será activo salvo que la documentación diga otra cosa.
- Si falta un dato no crítico, déjalo vacío y añade nota.

Al terminar:

1. Muestra los CUPS incluidos.
2. Muestra los CUPS descartados por no estar confirmados, si los hay.
3. Indica cómo cargar el seed.
4. Indica cómo comprobar duplicados por cups_key + energy_type_code.
```

---

## 11. Prompt para configurar Supabase Auth en frontend

### Objetivo

Implementar autenticación simple.

### Prompt

```txt
Implementa la autenticación básica del frontend con Supabase Auth.

Requisitos:

- Login con email y contraseña.
- Logout.
- Lectura de sesión actual.
- Protección de rutas privadas.
- Redirección al login cuando no haya sesión.
- No implementar roles avanzados.
- No implementar SSO.
- No exponer claves privadas.

Pantallas mínimas:

- /login
- layout privado de aplicación

Revisa:

- docs/02_alcance_mvp.md
- docs/03_requisitos_funcionales.md
- docs/06_arquitectura_tecnica.md
- docs/07_pantallas_y_flujos.md

Al terminar:

- lista archivos modificados;
- explica cómo probar login/logout;
- indica cualquier variable de entorno necesaria.
```

---

## 12. Prompt para layout y navegación principal

### Objetivo

Crear estructura navegable del MVP.

### Prompt

```txt
Crea el layout principal autenticado de la aplicación web.

Debe incluir navegación a:

- Dashboard
- Edificios
- CUPS controlados
- Facturas
- Revisión
- Totales mensuales
- Exportaciones

Requisitos:

- Debe estar protegido por sesión.
- Debe incluir acción visible para cerrar sesión.
- Debe tener diseño sencillo y claro.
- No implementes todavía funcionalidades completas en cada pantalla; pueden quedar como páginas base si no existen.
- Usa TypeScript y componentes mantenibles.

Al terminar:

- lista rutas creadas;
- lista componentes principales;
- explica cómo verificar navegación y protección de sesión.
```

---

## 13. Prompt para dashboard operativo básico

### Objetivo

Crear una pantalla inicial útil pero sencilla.

### Prompt

```txt
Implementa el Dashboard operativo básico del MVP.

Debe mostrar tarjetas o bloques para:

- facturas pendientes de validación;
- facturas con errores bloqueantes;
- facturas listas para validar;
- CUPS fuera de superficie detectados;
- meses incompletos;
- acceso rápido a subir PDFs.

Requisitos:

- No conviertas el dashboard en reporting avanzado.
- Usa consultas simples y mantenibles.
- Si aún no hay datos reales, muestra estados vacíos claros.
- Cada tarjeta debe enlazar a la pantalla operativa correspondiente.

Al terminar:

- indica consultas usadas;
- lista componentes modificados;
- explica cómo verificarlo con y sin datos.
```

---

## 14. Prompt para pantalla de edificios

### Objetivo

Consultar edificios de la superficie de control.

### Prompt

```txt
Implementa la pantalla de Edificios del MVP.

Debe mostrar los edificios de la tabla buildings.

Columnas recomendadas:

- nombre;
- código interno;
- municipio;
- provincia;
- fuentes energéticas asociadas;
- número de CUPS activos;
- estado.

Filtros mínimos:

- texto libre;
- estado;
- fuente energética si es sencillo con el modelo actual.

Acciones:

- ver detalle de edificio;
- ir a CUPS asociados;
- ir a totales filtrados por edificio si ya existe la ruta.

Requisitos:

- No crear edición avanzada de edificios salvo que ya esté prevista.
- Manejar estado vacío.
- Código tipado y mantenible.

Al terminar, indica rutas, componentes y consultas creadas.
```

---

## 15. Prompt para detalle de edificio

### Objetivo

Mostrar la relación entre edificio, fuentes y CUPS.

### Prompt

```txt
Implementa la pantalla de detalle de edificio.

Debe mostrar:

- datos generales del edificio;
- fuentes energéticas asociadas;
- CUPS agrupados por fuente energética;
- estado de cada CUPS;
- vigencias desde/hasta;
- descripción y observaciones si existen.

Requisitos:

- Los CUPS dados de baja deben seguir visibles como histórico.
- No ocultes información necesaria para trazabilidad.
- Incluye enlaces a edición/baja de CUPS si esas rutas ya existen; si no, deja acción preparada sin romper la pantalla.

Al terminar:

- indica ruta creada;
- explica cómo obtiene los CUPS asociados;
- indica cómo probar con edificios con y sin CUPS.
```

---

## 16. Prompt para pantalla de CUPS controlados

### Objetivo

Mantener la superficie de control.

### Prompt

```txt
Implementa la pantalla de CUPS controlados.

Debe listar controlled_cups con información de:

- edificio;
- fuente energética;
- CUPS original;
- CUPS normalizado;
- estado;
- primer mes controlado;
- último mes controlado;
- suministrador;
- tarifa;
- observaciones.

Filtros:

- edificio;
- fuente energética;
- estado;
- texto por CUPS.

Acciones previstas:

- alta de CUPS;
- edición limitada;
- baja lógica;
- consultar facturas asociadas si existe la ruta.

Requisitos:

- Distingue visualmente activo, baja y pendiente.
- No borres CUPS desde la interfaz.
- Código tipado y sin duplicar normalización.

Al terminar, indica componentes, consultas y rutas afectadas.
```

---

## 17. Prompt para normalización única de CUPS

### Objetivo

Implementar una regla crítica reutilizable y testeada.

### Prompt

```txt
Implementa la función única de normalización de CUPS.

Reglas:

- eliminar espacios;
- convertir a mayúsculas;
- conservar solo caracteres alfanuméricos;
- aplicar la regla de equivalencia necesaria para comparar CUPS con sufijos.

Ejemplos obligatorios:

- ES 0022 0000 0621 2876 CB -> ES0022000006212876CB
- ES0022000006290850YS1P -> ES0022000006290850YS

Ubicación recomendada:

- packages/shared/src/cups/normalizeCups.ts para frontend/shared.
- apps/parser-api/app/domain/cups.py para backend parser si hace falta en Python.

Requisitos:

- Añade tests unitarios.
- Reutiliza esta función en alta/edición de CUPS y en procesamiento de facturas.
- No dejes normalizaciones alternativas dispersas.

Al terminar:

- lista archivos modificados;
- muestra tests añadidos;
- indica comando para ejecutar tests.
```

---

## 18. Prompt para alta manual de CUPS

### Objetivo

Permitir incorporar nuevos CUPS controlados.

### Prompt

```txt
Implementa el alta manual de CUPS controlados.

Formulario mínimo:

- edificio;
- fuente energética;
- CUPS original;
- primer mes a controlar;
- estado;
- descripción;
- suministrador;
- tarifa;
- observaciones.

Comportamiento obligatorio:

- Calcular cups_key automáticamente usando la función única de normalización.
- Mostrar cups_key como dato de lectura.
- Impedir duplicados por cups_key + energy_type_code.
- Crear audit_event de alta.
- No permitir que el usuario edite manualmente cups_key.

Requisitos:

- Validar campos obligatorios.
- Mostrar errores claros.
- No romper la superficie de control existente.

Al terminar:

- indica ruta del formulario;
- lista validaciones implementadas;
- explica cómo probar duplicados.
```

---

## 19. Prompt para baja lógica de CUPS

### Objetivo

Gestionar bajas sin borrar histórico.

### Prompt

```txt
Implementa la baja lógica de CUPS controlados.

Debe permitir indicar:

- último año/mes a controlar;
- observación o motivo opcional.

Comportamiento:

- Actualizar control_to_year y control_to_month.
- Cambiar status a baja.
- Conservar el registro.
- No borrar facturas asociadas.
- Crear audit_event de baja.

Reglas:

- El CUPS deja de exigirse desde el mes posterior al último mes de control.
- Debe seguir visible como histórico.

Al terminar:

- indica componentes modificados;
- explica cómo verificar que el CUPS sigue visible;
- explica cómo afectará a completitud mensual.
```

---

## 20. Prompt para crear FastAPI parser base

### Objetivo

Crear la API de parseo independiente.

### Prompt

```txt
Crea la aplicación FastAPI base para el backend parser.

Ubicación:

apps/parser-api

Endpoints mínimos:

- GET /health
- POST /parse-invoice

Por ahora /parse-invoice puede devolver una respuesta controlada si todavía no están los parsers, pero debe quedar preparada la estructura.

Requisitos:

- Configurar CORS para el frontend local.
- Validar tamaño máximo de archivo según configuración.
- Aceptar solo PDF.
- Gestionar errores sin exponer trazas internas al usuario.
- Preparar estructura de carpetas para extractores, detectores y parsers.

Al terminar:

- indica cómo arrancar la API;
- muestra ejemplo de llamada a /health;
- lista archivos creados.
```

---

## 21. Prompt para modelos Pydantic del parser

### Objetivo

Crear el contrato común de salida de parsers.

### Prompt

```txt
Implementa los modelos Pydantic del backend parser.

Modelos requeridos:

- ParserWarning
- InvoiceParseResult

Enums o Literals requeridos:

- EnergyType: electricidad, gas_natural, gasoleo
- ParseSource: parser_especifico, parser_generico, manual
- WarningLevel: info, warning, error

InvoiceParseResult debe incluir:

- parser_name
- parser_version
- parse_source
- parse_confidence
- energy_type
- supplier_name
- invoice_number
- cups_original
- cups_key
- period_start
- period_end
- computed_year
- computed_month
- consumption_kwh
- total_amount_eur
- raw_candidates
- warnings

Requisitos:

- Usar date para fechas.
- Usar Decimal para importes y consumos.
- Validar parse_confidence entre 0 y 1.
- Validar computed_month entre 1 y 12.

Añade tests básicos de serialización si procede.

Al terminar, indica archivos y tests creados.
```

---

## 22. Prompt para extracción de texto PDF

### Objetivo

Leer PDFs legibles sin OCR avanzado.

### Prompt

```txt
Implementa el servicio de extracción de texto de PDF en apps/parser-api.

Requisitos:

- Usar PyMuPDF o pdfplumber.
- Extraer texto por páginas.
- Unir el texto de forma estable.
- Detectar PDF sin texto suficiente.
- Devolver un error controlado o aviso UNREADABLE_PDF.
- No implementar OCR avanzado en el MVP.

Debe funcionar con los PDFs de ejemplo ubicados en examples/facturas.

Añade tests o script de verificación que compruebe que se extrae texto de:

- ejemplo Iberdrola electricidad;
- ejemplo Naturgy regulada electricidad;
- ejemplo Energía XXI gas natural.

Al terminar:

- indica librería usada;
- explica cómo ejecutar la verificación;
- lista archivos modificados.
```

---

## 23. Prompt para detector de formato

### Objetivo

Decidir qué parser aplicar.

### Prompt

```txt
Implementa el detector de formato de factura.

Debe identificar estos formatos:

1. iberdrola_electricidad
2. naturgy_regulada_electricidad
3. energia_xxi_gas_natural
4. generic_invoice_parser si no reconoce formato específico

Marcadores Iberdrola:

- IBERDROLA CLIENTES, S.A.U.
- RESUMEN DE FACTURA
- PERIODO DE FACTURACIÓN
- Consumo total de esta factura

Marcadores Naturgy regulada:

- Comercializadora Regulada, Gas & Power
- DATOS DE LA FACTURA DE ELECTRICIDAD
- INFORMACIÓN DE CONSUMO ELÉCTRICO
- Código unificado de punto de suministro CUPS
- TOTAL IMPORTE FACTURA

Marcadores Energía XXI gas:

- Energía XXI
- DADES DE LA FACTURA
- INFORMACIÓ DEL CONSUM GAS
- Consum Total

Requisitos:

- El detector debe ser testeable.
- Debe devolver nombre de parser y confianza/datos de diagnóstico si procede.
- No debe parsear campos de factura; solo detectar formato.

Al terminar:

- añade tests con texto extraído de los PDFs de ejemplo;
- indica cómo ejecutar tests.
```

---

## 24. Prompt para utilidades de normalización de valores

### Objetivo

Centralizar conversiones de fechas, importes y consumos.

### Prompt

```txt
Implementa utilidades de normalización para el backend parser.

Necesitamos funciones para:

- convertir importes españoles con coma decimal a Decimal;
- convertir consumos con separador de miles y coma decimal a Decimal;
- interpretar fechas en español;
- interpretar fechas en catalán cuando aparezcan en Energía XXI;
- calcular computed_year y computed_month desde period_end;
- normalizar CUPS usando la misma regla documentada.

Casos obligatorios:

- 23,70 € -> Decimal("23.70")
- 7,80 € -> Decimal("7.80")
- 603,71 € -> Decimal("603.71")
- 8.650,000 kWh -> Decimal("8650.000")
- 31 de enero de 2025 -> date(2025, 1, 31)
- 03/03/2025 -> date(2025, 3, 3)

Requisitos:

- Añadir tests unitarios.
- No usar float.
- Gestionar errores de parseo de forma controlada.

Al terminar, lista funciones creadas y tests añadidos.
```

---

## 25. Prompt para parser Iberdrola electricidad

### Objetivo

Extraer datos críticos del ejemplo Iberdrola.

### Prompt

```txt
Implementa el parser específico iberdrola_electricidad.

Debe recibir texto extraído de PDF y devolver InvoiceParseResult.

Debe extraer:

- supplier_name
- invoice_number
- period_start
- period_end
- computed_year
- computed_month
- consumption_kwh
- total_amount_eur
- cups_original
- cups_key
- energy_type = electricidad

Datos esperados del PDF de ejemplo:

- supplier_name: Iberdrola Clientes, S.A.U.
- invoice_number: 21250131040000158
- period_start: 2024-12-10
- period_end: 2025-01-15
- computed_year: 2025
- computed_month: 1
- consumption_kwh: 88
- total_amount_eur: 23.70

Requisitos:

- Usar Decimal para importes y consumos.
- Usar date para fechas.
- Usar la función común de normalización de CUPS.
- Guardar candidatos relevantes en raw_candidates si hay ambigüedad.
- Añadir warnings si falta un campo o hay múltiples candidatos.
- Añadir test con el PDF real o texto extraído del PDF real.

Al terminar:

- muestra resultado del test;
- indica regex o estrategia usada;
- lista archivos modificados.
```

---

## 26. Prompt para parser Naturgy regulada electricidad

### Objetivo

Extraer datos críticos del ejemplo Naturgy / Comercializadora Regulada.

### Prompt

```txt
Implementa el parser específico naturgy_regulada_electricidad.

Debe recibir texto extraído de PDF y devolver InvoiceParseResult.

Debe extraer:

- supplier_name
- invoice_number
- period_start
- period_end
- computed_year
- computed_month
- consumption_kwh
- total_amount_eur
- cups_original
- cups_key
- energy_type = electricidad

Datos esperados del PDF de ejemplo:

- supplier_name: Comercializadora Regulada, Gas & Power, S.A.
- invoice_number: FE25137022313356
- period_start: 2025-08-20
- period_end: 2025-08-26
- computed_year: 2025
- computed_month: 8
- consumption_kwh: 22
- total_amount_eur: 7.80
- cups_original: ES0022000006290850YS1P
- cups_key: ES0022000006290850YS

Requisitos:

- Usar Decimal para importes y consumos.
- Usar date para fechas.
- Aplicar correctamente la regla de sufijo del CUPS.
- Añadir warnings si falta un campo o hay múltiples candidatos.
- Añadir test con el PDF real o texto extraído del PDF real.

Al terminar:

- muestra resultado del test;
- indica estrategia de extracción;
- lista archivos modificados.
```

---

## 27. Prompt para parser Energía XXI gas natural

### Objetivo

Extraer datos críticos del ejemplo Energía XXI gas natural.

### Prompt

```txt
Implementa el parser específico energia_xxi_gas_natural.

Debe recibir texto extraído de PDF y devolver InvoiceParseResult.

Debe extraer:

- supplier_name
- invoice_number
- period_start
- period_end
- computed_year
- computed_month
- consumption_kwh
- total_amount_eur
- cups_original
- cups_key
- energy_type = gas_natural

Datos esperados del PDF de ejemplo:

- supplier_name: Energía XXI Comercializadora de Referencia S.L.U.
- invoice_number: S25CON006941700
- period_start: 2024-12-23
- period_end: 2025-02-27
- computed_year: 2025
- computed_month: 2
- consumption_kwh: 8650.000
- total_amount_eur: 603.71

Requisitos:

- Debe interpretar texto en catalán.
- Debe convertir 8.650,000 kWh a Decimal("8650.000").
- Debe convertir 603,71 € a Decimal("603.71").
- Añadir warnings si falta un campo o hay múltiples candidatos.
- Añadir test con el PDF real o texto extraído del PDF real.

Al terminar:

- muestra resultado del test;
- indica estrategia de extracción;
- lista archivos modificados.
```

---

## 28. Prompt para parser genérico

### Objetivo

Tener una extracción básica para formatos desconocidos.

### Prompt

```txt
Implementa generic_invoice_parser para PDFs sin parser específico.

Debe intentar extraer candidatos para:

- CUPS;
- periodo de facturación;
- consumo kWh;
- importe total;
- número de factura;
- proveedor si es posible.

Requisitos:

- parse_source debe ser parser_generico.
- parse_confidence no debe superar 0.70.
- Debe añadir warning GENERIC_PARSER_USED.
- No debe permitir validación en bloque.
- Debe guardar candidatos en raw_candidates.
- No debe fallar si no encuentra campos.

Importante:

El parser genérico ayuda a revisar, pero no debe dar falsa seguridad.

Al terminar:

- añade tests con texto no reconocido;
- explica limitaciones;
- lista archivos modificados.
```

---

## 29. Prompt para endpoint POST /parse-invoice completo

### Objetivo

Conectar extracción, detector y parsers.

### Prompt

```txt
Completa el endpoint POST /parse-invoice del backend parser.

Flujo:

1. Recibir PDF.
2. Validar que es PDF.
3. Extraer texto.
4. Si no hay texto suficiente, devolver InvoiceParseResult con aviso UNREADABLE_PDF o error controlado.
5. Detectar formato.
6. Ejecutar parser específico o generic_invoice_parser.
7. Devolver InvoiceParseResult normalizado.

Requisitos:

- No escribir en base de datos desde el backend parser.
- No decidir si la factura entra en totales.
- Gestionar errores sin exponer trazas internas.
- Mantener contrato estable para frontend.

Al terminar:

- muestra ejemplo de respuesta para cada PDF de ejemplo;
- indica cómo probar con curl o cliente equivalente;
- lista archivos modificados.
```

---

## 30. Prompt para pantalla de subida de PDFs

### Objetivo

Permitir cargar facturas desde frontend.

### Prompt

```txt
Implementa la pantalla de subida de PDFs.

Debe permitir:

- subir un PDF individual;
- subir varios PDFs en una misma operación;
- validar extensión y tipo MIME;
- mostrar nombre, tamaño y estado de cada archivo;
- procesar cada archivo de forma independiente;
- mostrar resultado individual.

Requisitos:

- El fallo de un archivo no bloquea los demás.
- Mostrar errores claros si el archivo no es PDF.
- Preparar la integración con cálculo de hash y backend parser.
- No guardar PDFs públicamente.

Al terminar:

- indica ruta creada;
- lista componentes;
- explica cómo probar subida múltiple.
```

---

## 31. Prompt para cálculo de hash y duplicados

### Objetivo

Evitar procesar dos veces el mismo PDF.

### Prompt

```txt
Implementa cálculo de hash SHA-256 y detección de duplicados exactos.

Flujo:

1. Calcular hash SHA-256 del PDF antes de crear factura validable.
2. Consultar si existe un invoice_upload con el mismo file_hash_sha256.
3. Si existe, marcar o informar como duplicado.
4. No crear una nueva factura validable para el mismo PDF.
5. Generar aviso DUPLICATE_FILE cuando corresponda.

Requisitos:

- El hash debe quedar guardado en invoice_uploads.
- La detección debe ser por contenido, no solo por nombre de archivo.
- El usuario debe recibir mensaje comprensible.
- Añadir test o verificación manual documentada.

Al terminar:

- explica dónde se calcula el hash;
- indica cómo probar subiendo dos veces el mismo PDF;
- lista archivos modificados.
```

---

## 32. Prompt para crear registros de factura tras parseo

### Objetivo

Persistir datos extraídos y avisos.

### Prompt

```txt
Implementa la creación de registros tras procesar una factura PDF.

Tras recibir InvoiceParseResult del backend parser, la aplicación debe crear:

1. invoice_uploads
2. invoices
3. invoice_warnings

La capa de negocio debe:

- buscar controlled_cups por cups_key + energy_type_code;
- asociar controlled_cups_id si existe;
- asociar building_id desde el CUPS controlado;
- asignar estado inicial;
- generar avisos funcionales si procede.

Reglas de estado inicial:

- duplicada si el hash ya existe;
- error_parseo o requiere_carga_manual si faltan campos críticos;
- fuera_superficie_control si el CUPS no está controlado;
- pendiente_validacion si tiene datos suficientes;
- parser genérico siempre con warning y sin validación en bloque.

Requisitos:

- El parser no decide entrada en totales.
- La lógica de estado debe estar centralizada y ser testeable.
- Los avisos deben tener código, nivel, mensaje, campo e is_blocking.

Al terminar:

- lista servicios creados;
- muestra ejemplos de estados generados;
- indica pruebas realizadas.
```

---

## 33. Prompt para pantalla de revisión de facturas

### Objetivo

Revisar, filtrar y actuar sobre facturas procesadas.

### Prompt

```txt
Implementa la pantalla de revisión de facturas.

Debe mostrar una tabla con:

- semáforo;
- estado;
- proveedor;
- número de factura;
- edificio;
- fuente energética;
- CUPS;
- periodo;
- año/mes de cómputo;
- consumo kWh;
- importe total;
- avisos;
- acciones.

Filtros:

- estado;
- semáforo;
- edificio;
- fuente;
- mes/año;
- proveedor;
- texto libre.

Requisitos:

- Los avisos deben ser visibles y comprensibles.
- El usuario debe poder abrir el detalle de una factura.
- Debe manejar estados vacíos.
- No permitir acciones inválidas desde la tabla.

Al terminar:

- indica ruta y componentes;
- explica cómo se calcula o consulta el semáforo;
- lista pruebas manuales realizadas.
```

---

## 34. Prompt para semáforo operativo

### Objetivo

Estandarizar verde, amarillo y rojo.

### Prompt

```txt
Implementa el cálculo centralizado del semáforo operativo de factura.

Estados posibles:

- verde
- amarillo
- rojo

Reglas:

Verde:

- parser específico;
- campos críticos completos;
- CUPS normalizado;
- CUPS pertenece a superficie de control;
- fuente energética compatible;
- no duplicada;
- sin warnings relevantes;
- sin errores.

Amarillo:

- tiene datos suficientes para revisarse;
- no tiene errores bloqueantes;
- requiere revisión visual.

Rojo:

- falta algún campo crítico;
- existe error bloqueante;
- PDF ilegible;
- duplicado exacto;
- CUPS no controlado;
- no puede validarse sin corrección o descarte.

Requisitos:

- No basarse solo en colores: devolver también texto visible.
- Añadir tests para casos verde, amarillo y rojo.
- Reutilizar esta lógica en revisión, detalle y validación en bloque.

Al terminar:

- lista función o servicio creado;
- muestra casos de prueba;
- indica archivos modificados.
```

---

## 35. Prompt para detalle de factura

### Objetivo

Permitir revisar y corregir una factura concreta.

### Prompt

```txt
Implementa la pantalla de detalle de factura.

Debe mostrar:

- datos extraídos;
- datos finales editables si procede;
- estado;
- semáforo;
- avisos;
- proveedor;
- número de factura;
- CUPS original y normalizado;
- edificio asociado;
- fuente energética;
- periodo;
- mes de cómputo;
- consumo;
- importe;
- PDF si está disponible en storage privado o ruta temporal.

Acciones:

- guardar corrección;
- validar;
- descartar;
- volver a revisión.

Requisitos:

- No permitir validar si hay errores bloqueantes.
- Si se corrige CUPS, recalcular cups_key y edificio.
- Si se corrige period_end, recalcular computed_year y computed_month.
- Mostrar errores claros.

Al terminar:

- indica ruta;
- lista componentes y servicios usados;
- explica pruebas manuales realizadas.
```

---

## 36. Prompt para corrección manual de factura

### Objetivo

Permitir corregir datos críticos con reglas de negocio.

### Prompt

```txt
Implementa la corrección manual de factura.

Campos corregibles:

- CUPS original;
- fuente energética;
- fecha inicio;
- fecha fin;
- consumo kWh;
- importe total;
- número de factura.

Comportamiento obligatorio:

- Recalcular cups_key si cambia CUPS.
- Recalcular edificio si cambia CUPS.
- Recalcular computed_year y computed_month si cambia period_end.
- Regenerar avisos aplicables.
- Mantener trazabilidad de que hubo corrección.
- Crear audit_event de corrección.

Requisitos:

- No permitir incoherencias silenciosas.
- No permitir importes o consumos con float.
- Validar campos críticos antes de permitir validar.

Al terminar:

- lista reglas implementadas;
- añade tests si la lógica está en servicio;
- explica cómo probar corrección de CUPS y de fecha fin.
```

---

## 37. Prompt para validación individual

### Objetivo

Confirmar facturas para que entren en totales.

### Prompt

```txt
Implementa la validación individual de facturas.

Reglas:

- Solo se puede validar si no hay errores bloqueantes.
- Estado final validada si no hubo cambios manuales.
- Estado final corregida si hubo cambios manuales.
- Debe registrar validated_at.
- Debe registrar validated_by si está disponible.
- Debe crear audit_event.
- Al validarse, la factura entra en monthly_totals.

No deben validarse:

- duplicadas;
- descartadas;
- fuera_superficie_control;
- error_parseo;
- requiere_carga_manual incompleta;
- con avisos bloqueantes.

Al terminar:

- indica función o endpoint creado;
- muestra casos permitidos y bloqueados;
- explica cómo verificar que aparece en totales.
```

---

## 38. Prompt para descartar factura

### Objetivo

Excluir facturas del flujo sin borrarlas.

### Prompt

```txt
Implementa la acción de descartar factura.

Requisitos:

- Solicitar confirmación.
- Permitir motivo opcional.
- Cambiar estado a descartada.
- Crear audit_event.
- La factura descartada no debe entrar en totales.
- Debe seguir consultable para trazabilidad.

No borres físicamente la factura ni el registro de subida.

Al terminar:

- indica componentes modificados;
- explica cómo verificar que no entra en monthly_totals;
- muestra cómo queda trazada la acción.
```

---

## 39. Prompt para validación en bloque

### Objetivo

Validar facturas seguras de forma rápida.

### Prompt

```txt
Implementa validación en bloque de facturas.

Reglas:

- Solo incluir facturas con semáforo verde.
- No incluir facturas con warnings.
- No incluir parser genérico.
- No incluir facturas con errores.
- No incluir facturas fuera de superficie de control.
- No incluir duplicadas ni descartadas.

Interfaz:

- Mostrar cuántas facturas se van a validar.
- Pedir confirmación.
- Mostrar resultado de la operación.

Requisitos:

- La validación en bloque debe reutilizar la misma lógica que validación individual.
- Debe crear trazabilidad suficiente.
- No validar accidentalmente facturas amarillas o rojas.

Al terminar:

- indica filtros usados;
- muestra prueba con mezcla de facturas verdes, amarillas y rojas;
- lista archivos modificados.
```

---

## 40. Prompt para totales mensuales

### Objetivo

Mostrar consumos e importes consolidados.

### Prompt

```txt
Implementa la pantalla de totales mensuales.

Debe agregar por:

- edificio;
- fuente energética;
- año;
- mes.

Solo deben entrar facturas con estado:

- validada;
- corregida.

Columnas:

- edificio;
- fuente;
- año;
- mes;
- consumo total kWh;
- importe total €;
- número de facturas;
- estado de completitud;
- avisos.

Filtros:

- año;
- mes;
- edificio;
- fuente energética;
- completitud.

Requisitos:

- No sumar facturas pendientes, duplicadas, descartadas o con error.
- Varias facturas distintas para el mismo CUPS y mes deben sumarse.
- Usar precisión decimal.

Al terminar:

- indica consulta o vista usada;
- muestra cómo probar con facturas validadas y no validadas;
- lista archivos modificados.
```

---

## 41. Prompt para CUPS exigibles y completitud

### Objetivo

Detectar si faltan facturas esperadas.

### Prompt

```txt
Implementa el cálculo de CUPS exigibles y completitud mensual.

Para un edificio, fuente, año y mes:

1. Obtener CUPS controlados cuyo periodo de control incluya el mes.
2. Obtener CUPS con facturas validadas o corregidas en ese año/mes.
3. Comparar ambos conjuntos.
4. Devolver:
   - CUPS esperados;
   - CUPS cubiertos;
   - CUPS faltantes;
   - is_complete true/false.

Regla de vigencia:

control_from <= mes_consulta <= control_to

Si control_to está vacío, el CUPS sigue activo.

Requisitos:

- Los CUPS dados de baja no se exigen después del último mes controlado.
- Los CUPS de alta futura no se exigen antes del primer mes.
- Los totales incompletos se muestran igualmente con aviso.
- Añadir tests de lógica.

Al terminar:

- muestra casos de prueba;
- indica función o consulta creada;
- explica cómo se integra en totales.
```

---

## 42. Prompt para detalle de total mensual

### Objetivo

Justificar de dónde sale cada total.

### Prompt

```txt
Implementa el detalle de total mensual.

Debe mostrar, para un edificio, fuente, año y mes:

- consumo total;
- importe total;
- facturas incluidas;
- CUPS cubiertos;
- CUPS faltantes;
- avisos de completitud.

Cada factura incluida debe mostrar:

- proveedor;
- número de factura;
- CUPS;
- periodo;
- consumo;
- importe;
- enlace al detalle de factura.

Requisitos:

- El usuario debe poder justificar el total.
- Si faltan CUPS, deben verse claramente.
- No incluir facturas no validadas.

Al terminar:

- indica ruta creada;
- lista consultas usadas;
- explica prueba manual realizada.
```

---

## 43. Prompt para exportación CSV

### Objetivo

Descargar datos para apoyo a carga manual en SIGEE-AGE.

### Prompt

```txt
Implementa exportación CSV de totales mensuales.

Columnas mínimas:

- building_key
- building_name
- energy_type_code
- year
- month
- total_consumption_kwh
- total_amount_eur
- invoice_count
- is_complete
- missing_cups
- warnings

Requisitos:

- Exportar según filtros aplicados si existen.
- Indicar claramente si el total está completo o incompleto.
- No exportar facturas no validadas como parte de totales.
- Mantener formato compatible con Excel/LibreOffice.
- Registrar audit_event de exportación si audit_events ya existe.

Al terminar:

- muestra ejemplo de CSV generado;
- indica cómo probar descarga;
- lista archivos modificados.
```

---

## 44. Prompt para exportación Excel

### Objetivo

Generar Excel más completo para revisión y trabajo manual.

### Prompt

```txt
Implementa exportación Excel de resultados.

Hojas recomendadas:

1. Totales
2. Facturas incluidas
3. CUPS faltantes
4. Avisos

Requisitos:

- Los datos deben coincidir con la pantalla de totales.
- Distinguir totales completos e incompletos.
- Incluir filtros aplicados si procede.
- No incluir PDFs.
- No exportar facturas no validadas como parte de totales.
- Registrar audit_event de exportación si audit_events ya existe.

Columnas mínimas en Totales:

- building_key
- building_name
- energy_type_code
- year
- month
- total_consumption_kwh
- total_amount_eur
- invoice_count
- is_complete

Al terminar:

- indica librería usada;
- muestra estructura del Excel;
- explica cómo verificar que los datos coinciden con pantalla.
```

---

## 45. Prompt para tests de lógica crítica

### Objetivo

Asegurar reglas de negocio fundamentales.

### Prompt

```txt
Añade tests automatizados para la lógica crítica del MVP.

Cobertura mínima:

1. Normalización de CUPS.
2. Conversión de importes y consumos.
3. Parseo de fechas españolas y catalanas.
4. Cálculo de computed_year y computed_month.
5. Detección de duplicados por hash.
6. Asignación de estado inicial de factura.
7. Cálculo de semáforo.
8. CUPS exigibles por mes.
9. Completitud mensual.
10. Agregación de totales solo con facturas validadas o corregidas.

Requisitos:

- No usar datos externos no controlados.
- Usar fixtures claras.
- Los tests deben ejecutarse con un comando documentado.
- Si hay frontend y backend, separa tests por entorno.

Al terminar:

- lista tests añadidos;
- muestra comando de ejecución;
- muestra resultado de tests.
```

---

## 46. Prompt para revisión de seguridad básica

### Objetivo

Comprobar que el MVP no expone datos ni secretos.

### Prompt

```txt
Realiza una revisión de seguridad básica del MVP.

Comprueba:

- rutas privadas protegidas;
- login/logout correcto;
- no hay secretos reales en el repositorio;
- no se exponen claves privadas en frontend;
- PDFs no públicos por defecto;
- validación de tipo de archivo PDF;
- validación de tamaño máximo de subida;
- errores técnicos sin trazas sensibles en interfaz;
- uso correcto de RLS o controles equivalentes si se accede a Supabase desde frontend;
- CORS limitado al origen configurado.

No implementes soluciones complejas fuera del MVP.

Entrega:

- hallazgos;
- cambios mínimos realizados;
- riesgos pendientes si existen;
- recomendaciones para fase posterior.
```

---

## 47. Prompt para revisión de alcance

### Objetivo

Evitar desviaciones antes de cerrar MVP.

### Prompt

```txt
Revisa el proyecto para comprobar que el MVP no se ha desviado del alcance.

Confirma que NO se ha implementado:

- integración automática con SIGEE-AGE;
- scraping;
- automatización de navegador;
- SSO corporativo;
- roles complejos;
- permisos por edificio;
- aprobación por doble usuario;
- OCR avanzado;
- parser automático de gasóleo;
- prorrateo entre meses;
- reporting avanzado innecesario;
- almacenamiento permanente obligatorio de PDFs.

Confirma que SÍ está implementado o preparado:

- login email/contraseña;
- edificios;
- CUPS controlados;
- subida de PDFs;
- parsers iniciales;
- revisión;
- validación;
- totales;
- completitud;
- exportación CSV/Excel.

Entrega:

- checklist de cumplimiento;
- desviaciones detectadas;
- propuesta de corrección si hay algo fuera de alcance.
```

---

## 48. Prompt para validación funcional final

### Objetivo

Verificar el flujo completo del MVP.

### Prompt

```txt
Ejecuta una validación funcional final del MVP.

Comprueba el flujo completo:

1. Iniciar sesión.
2. Consultar edificios.
3. Consultar CUPS controlados.
4. Subir PDF Iberdrola.
5. Subir PDF Naturgy regulada.
6. Subir PDF Energía XXI gas.
7. Ver resultados de parseo.
8. Detectar duplicado subiendo dos veces el mismo PDF.
9. Revisar factura.
10. Corregir una factura.
11. Validar factura individual.
12. Validar en bloque solo facturas verdes.
13. Consultar totales mensuales.
14. Ver CUPS faltantes si el mes está incompleto.
15. Exportar CSV.
16. Exportar Excel.

Entrega:

- resultado paso a paso;
- errores encontrados;
- datos de ejemplo usados;
- capturas o logs si procede;
- tareas pendientes antes de dar el MVP por terminado.
```

---

## 49. Prompt para preparar una entrega limpia

### Objetivo

Dejar el repositorio listo para revisión humana.

### Prompt

```txt
Prepara una entrega limpia del MVP para revisión.

Tareas:

1. Ejecuta formateo y lint.
2. Ejecuta tests.
3. Revisa errores TypeScript.
4. Revisa errores Python.
5. Comprueba migraciones y seeds.
6. Comprueba README.
7. Comprueba .env.example.
8. Comprueba que no hay secretos reales.
9. Comprueba que los PDFs de ejemplo están en la carpeta correcta si forman parte del repo local.
10. Resume estado final.

No implementes nuevas funcionalidades salvo correcciones menores necesarias.

Entrega:

- comandos ejecutados;
- resultado de cada comando;
- archivos modificados;
- incidencias pendientes;
- recomendación final: listo/no listo para revisión.
```

---

## 50. Prompt para corregir errores sin ampliar alcance

### Objetivo

Resolver fallos de forma controlada.

### Prompt

```txt
Corrige los errores detectados sin ampliar el alcance del MVP.

Errores detectados:

[PEGAR AQUÍ ERRORES, LOGS O COMPORTAMIENTO OBSERVADO]

Reglas:

- No implementes funcionalidades nuevas.
- No cambies arquitectura salvo necesidad justificada.
- Corrige la causa raíz si es posible.
- Añade test si el error afecta a lógica crítica.
- Mantén compatibilidad con la documentación del proyecto.

Entrega:

- causa probable;
- solución aplicada;
- archivos modificados;
- pruebas ejecutadas;
- riesgos pendientes.
```

---

## 51. Prompt para documentar una decisión técnica

### Objetivo

Registrar decisiones relevantes.

### Prompt

```txt
Documenta la siguiente decisión técnica del proyecto.

Decisión:

[DESCRIBIR DECISIÓN]

Contexto:

[EXPLICAR POR QUÉ SURGE]

Opciones consideradas:

1. [OPCIÓN A]
2. [OPCIÓN B]
3. [OPCIÓN C]

Criterio de decisión:

- simplicidad;
- cumplimiento de reglas de negocio;
- mantenibilidad;
- seguridad;
- adecuación al MVP.

Resultado esperado:

- Crear o actualizar docs/decisiones/decisiones_proyecto.md.
- Añadir fecha.
- Añadir impacto funcional y técnico.
- Añadir consecuencias y límites.

No modifiques código salvo que se pida expresamente.
```

---

## 52. Prompt para pedir explicación de cambios realizados

### Objetivo

Obtener una explicación clara después de una implementación.

### Prompt

```txt
Explícame los cambios que acabas de realizar.

Quiero una respuesta estructurada con:

1. Objetivo de la tarea.
2. Archivos modificados.
3. Cambios principales por archivo.
4. Reglas de negocio aplicadas.
5. Pruebas realizadas.
6. Comandos ejecutados.
7. Riesgos o limitaciones pendientes.
8. Siguiente tarea recomendada.

No hagas nuevos cambios en el código en esta respuesta.
```

---

## 53. Prompt para pedir revisión de código

### Objetivo

Detectar problemas de mantenibilidad, seguridad o alcance.

### Prompt

```txt
Revisa el código implementado para esta parte del MVP.

Foco de revisión:

- cumplimiento de documentación;
- reglas de negocio;
- separación de responsabilidades;
- tipado;
- seguridad básica;
- errores de precisión decimal;
- duplicación de lógica;
- casos borde;
- tests insuficientes;
- funcionalidades fuera de alcance.

No hagas cambios todavía. Primero entrega:

1. Hallazgos críticos.
2. Hallazgos importantes.
3. Mejoras recomendadas.
4. Partes correctas que conviene mantener.
5. Plan de corrección en pasos pequeños.
```

---

## 54. Prompt para implementar correcciones tras revisión

### Objetivo

Aplicar mejoras detectadas de forma ordenada.

### Prompt

```txt
Implementa las correcciones derivadas de la revisión anterior.

Prioriza:

1. Errores críticos.
2. Incumplimientos de reglas de negocio.
3. Problemas de seguridad.
4. Fallos de precisión decimal.
5. Tests faltantes en lógica crítica.
6. Refactorizaciones pequeñas que reduzcan duplicación.

No añadas funcionalidades nuevas.

Al terminar:

- lista correcciones aplicadas;
- archivos modificados;
- tests añadidos o actualizados;
- comandos ejecutados;
- incidencias pendientes.
```

---

## 55. Uso recomendado de los prompts por orden

Orden sugerido:

1. Revisión inicial del repositorio.
2. Estructura base.
3. README y entorno.
4. Migraciones.
5. Seeds.
6. Auth.
7. Layout.
8. Edificios.
9. CUPS.
10. Normalización CUPS.
11. FastAPI base.
12. Modelos Pydantic.
13. Extracción PDF.
14. Detector de formato.
15. Utilidades de normalización.
16. Parsers específicos.
17. Endpoint completo.
18. Subida PDF.
19. Hash y duplicados.
20. Persistencia de facturas.
21. Revisión.
22. Corrección.
23. Validación.
24. Totales.
25. Completitud.
26. Exportaciones.
27. Tests críticos.
28. Seguridad.
29. Revisión de alcance.
30. Validación final.
31. Entrega limpia.

---

## 56. Criterio final

Si OpenCode propone una solución que contradice la documentación, debe prevalecer la documentación del proyecto.

Si hay una duda funcional, no debe inventar comportamiento. Debe dejar la decisión documentada como pendiente o pedir confirmación.

Si hay una duda técnica menor, debe elegir la solución más simple, mantenible y alineada con el MVP.
