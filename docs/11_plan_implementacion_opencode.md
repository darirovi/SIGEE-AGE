# Plan de implementación para OpenCode

## 1. Propósito del documento

Este documento define el plan de implementación recomendado para construir el MVP de la aplicación auxiliar SIGEE-AGE con apoyo de OpenCode.

Su finalidad es transformar la documentación funcional y técnica del proyecto en una secuencia clara de trabajo, organizada por fases, módulos, entregables y criterios de validación.

Este documento debe servir como guía para:

* iniciar el repositorio;
* preparar la estructura técnica;
* implementar el backend de parsers;
* implementar el frontend web;
* crear base de datos, seed y políticas básicas;
* desarrollar pruebas automatizadas;
* validar el MVP con facturas reales;
* evitar desviaciones de alcance.

## 2. Principios de implementación

### 2.1 Desarrollo incremental

El MVP debe construirse por incrementos funcionales pequeños y verificables.

Cada fase debe dejar algo ejecutable, probado o revisable.

No se debe intentar implementar toda la aplicación de una sola vez.

### 2.2 Prioridad del flujo principal

El desarrollo debe priorizar el caso práctico principal:

```txt
Subir factura PDF -> extraer datos -> asociar por CUPS -> revisar -> validar -> calcular total mensual -> exportar
```

Todo lo que no aporte directamente a este flujo debe quedar para fases posteriores.

### 2.3 Separación de responsabilidades

La implementación debe respetar la arquitectura definida:

* frontend Next.js para interfaz;
* Supabase para autenticación, base de datos y almacenamiento temporal;
* backend FastAPI para extracción y parseo de PDFs;
* parsers desacoplados de la base de datos;
* reglas de negocio centralizadas y reutilizables.

### 2.4 Trazabilidad mínima

Aunque el MVP sea simple, debe conservar:

* datos extraídos;
* datos finales validados;
* estado de factura;
* avisos;
* parser utilizado;
* CUPS normalizado;
* asociación con edificio;
* fecha de validación.

### 2.5 No sobredimensionar

Queda fuera del primer desarrollo:

* integración automática con SIGEE-AGE;
* automatización de navegador;
* multirol avanzado;
* auditoría compleja;
* reporting avanzado;
* conservación documental permanente;
* parser automático de gasóleo;
* analítica energética avanzada.

## 3. Documentación fuente

OpenCode debe tomar como referencia principal los documentos del proyecto:

| Documento                      | Uso principal                             |
| ------------------------------ | ----------------------------------------- |
| `00_resumen_ejecutivo.md`      | Visión general                            |
| `01_contexto_y_objetivo.md`    | Problema y objetivo funcional             |
| `02_alcance_mvp.md`            | Qué entra y qué queda fuera               |
| `03_requisitos_funcionales.md` | Funcionalidades y criterios de aceptación |
| `04_reglas_negocio.md`         | Reglas obligatorias del sistema           |
| `05_modelo_datos.md`           | Tablas, campos y relaciones               |
| `06_arquitectura_tecnica.md`   | Stack, módulos y responsabilidades        |
| `07_pantallas_y_flujos.md`     | Pantallas y navegación                    |
| `08_parsers_facturas.md`       | Diseño de parsers                         |
| `09_validaciones_y_avisos.md`  | Semáforos, avisos y bloqueos              |
| `10_exportaciones.md`          | CSV, Excel y estructura de salida         |
| `12_glosario.md`               | Terminología común                        |

Regla: si hay conflicto entre documentos, prevalecen primero las reglas de negocio y después los requisitos funcionales.

## 4. Estructura inicial del repositorio

La estructura recomendada será:

```txt
sigee-age-aux/
├── README.md
├── docs/
├── frontend/
├── backend/
├── supabase/
├── data/
├── examples/
├── diagrams/
└── opencode/
```

### 4.1 Carpetas principales

| Carpeta                   | Finalidad                                           |
| ------------------------- | --------------------------------------------------- |
| `docs/`                   | Documentación funcional y técnica                   |
| `frontend/`               | Aplicación Next.js                                  |
| `backend/`                | API FastAPI y parsers                               |
| `supabase/`               | Migraciones, seed y políticas                       |
| `data/seed/`              | CSV iniciales de edificios, CUPS y tipos de energía |
| `examples/facturas/`      | Facturas reales de prueba                           |
| `examples/expected_json/` | Salidas esperadas de parsers                        |
| `diagrams/`               | Diagramas Mermaid o imágenes generadas              |
| `opencode/`               | Instrucciones y tareas específicas para OpenCode    |

## 5. Fases de implementación

Plan recomendado:

| Fase   | Nombre                       | Resultado esperado                                       |
| ------ | ---------------------------- | -------------------------------------------------------- |
| Fase 0 | Preparación                  | Repositorio, documentación y entorno base                |
| Fase 1 | Base de datos y seed         | Modelo mínimo operativo en Supabase                      |
| Fase 2 | Backend parser               | API capaz de parsear facturas de ejemplo                 |
| Fase 3 | Frontend base                | Login, navegación y pantallas principales vacías         |
| Fase 4 | CUPS y edificios             | Consulta y mantenimiento básico de superficie de control |
| Fase 5 | Carga y revisión de facturas | Flujo de subida, parseo, avisos y corrección             |
| Fase 6 | Validación y totales         | Validación, cálculo mensual y completitud                |
| Fase 7 | Exportaciones                | CSV y Excel funcionales                                  |
| Fase 8 | Pruebas y cierre MVP         | Validación completa con ejemplos reales                  |

## 6. Fase 0. Preparación

### 6.1 Objetivo

Dejar preparado el repositorio, estructura de carpetas, documentación y configuración base.

### 6.2 Tareas

* Crear repositorio Git.
* Crear estructura de carpetas.
* Añadir documentación en `docs/`.
* Añadir facturas de ejemplo en `examples/facturas/`.
* Añadir salidas esperadas en `examples/expected_json/`.
* Crear `.gitignore` para Node, Python, entornos virtuales, variables de entorno y archivos temporales.
* Crear `README.md` inicial.
* Crear archivos `.env.example` para frontend y backend.

### 6.3 Entregables

* Repositorio inicial versionado.
* Documentación cargada.
* Estructura preparada para frontend, backend y Supabase.

### 6.4 Criterio de aceptación

El repositorio debe poder clonarse y entenderse sin depender de información externa a la documentación incluida.

## 7. Fase 1. Base de datos y seed

### 7.1 Objetivo

Crear el modelo mínimo de datos necesario para soportar edificios, CUPS, facturas, avisos y totales.

### 7.2 Tareas

* Crear migraciones SQL iniciales.
* Crear tabla o catálogo `energy_types`.
* Crear tabla `buildings`.
* Crear tabla `controlled_cups`.
* Crear tabla `invoice_uploads`.
* Crear tabla `invoices`.
* Crear tabla `invoice_warnings`.
* Crear tabla `audit_events` si se implementa desde el inicio.
* Crear índices principales.
* Crear restricciones básicas.
* Crear seed de tipos de energía.
* Crear seed de edificios.
* Crear seed de CUPS controlados confirmados por pantallazos.

### 7.3 Tablas mínimas

Imprescindibles para el MVP:

* `energy_types`;
* `buildings`;
* `controlled_cups`;
* `invoice_uploads`;
* `invoices`;
* `invoice_warnings`.

### 7.4 Reglas críticas

* `cups_key` debe almacenarse normalizado.
* `energy_type_code` debe ser uno de los valores admitidos.
* Una factura solo entra en totales si su estado es `validada` o `corregida`.
* Los CUPS no se eliminan si tienen histórico.

### 7.5 Entregables

* Migraciones Supabase.
* Scripts seed.
* Datos iniciales cargables.

### 7.6 Criterios de aceptación

* La base de datos se puede crear desde cero con migraciones.
* Los edificios iniciales aparecen en seed.
* Los CUPS controlados se cargan con edificio, fuente energética y vigencia.
* Las restricciones evitan duplicados básicos de CUPS por fuente energética.

## 8. Fase 2. Backend parser

### 8.1 Objetivo

Crear una API FastAPI capaz de recibir PDFs legibles, extraer texto, detectar formato y devolver datos normalizados.

### 8.2 Estructura recomendada

```txt
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── health.py
│   │   └── parse_invoice.py
│   ├── parsers/
│   │   ├── base.py
│   │   ├── detector.py
│   │   ├── generic.py
│   │   ├── iberdrola_electricidad.py
│   │   ├── naturgy_regulada_electricidad.py
│   │   └── energia_xxi_gas_natural.py
│   ├── services/
│   │   ├── pdf_text_extractor.py
│   │   ├── cups_normalizer.py
│   │   ├── number_parser.py
│   │   ├── date_parser.py
│   │   └── hashing.py
│   └── schemas/
│       └── invoices.py
└── tests/
```

### 8.3 Tareas

* Crear proyecto FastAPI.
* Crear endpoint `GET /health`.
* Crear endpoint `POST /parse-invoice`.
* Implementar extracción de texto con PyMuPDF o pdfplumber.
* Implementar contrato Pydantic `InvoiceParseResult`.
* Implementar `ParserWarning`.
* Implementar normalizador único de CUPS.
* Implementar parser de números en formato español.
* Implementar parser de fechas en formatos numéricos, español y catalán/valenciano.
* Implementar detector de formato.
* Implementar parser Iberdrola electricidad.
* Implementar parser Naturgy regulada electricidad.
* Implementar parser Energía XXI gas natural.
* Implementar parser genérico.
* Crear tests unitarios.

### 8.4 Parsers específicos iniciales

| Parser                          | Factura de ejemplo            | Resultado esperado                              |
| ------------------------------- | ----------------------------- | ----------------------------------------------- |
| `iberdrola_electricidad`        | Iberdrola electricidad        | CUPS, periodo, consumo 88 kWh, total 23,70 €    |
| `naturgy_regulada_electricidad` | Naturgy regulada electricidad | CUPS, periodo, consumo 22 kWh, total 7,80 €     |
| `energia_xxi_gas_natural`       | Energía XXI gas natural       | CUPS, periodo, consumo 8650 kWh, total 603,71 € |

### 8.5 Servicios comunes obligatorios

#### `cups_normalizer`

Debe existir una única función reutilizable:

```python
def normalize_cups(cups_original: str) -> str:
    ...
```

Reglas:

* eliminar espacios;
* convertir a mayúsculas;
* conservar solo caracteres alfanuméricos;
* aplicar equivalencia definida para sufijos.

#### `number_parser`

Debe convertir valores como:

| Entrada     | Salida                |
| ----------- | --------------------- |
| `7,80`      | `Decimal("7.80")`     |
| `1.234,56`  | `Decimal("1234.56")`  |
| `8.650,000` | `Decimal("8650.000")` |

#### `date_parser`

Debe soportar:

* `15/01/2025`;
* `10/12/2024 - 15/01/2025`;
* `20 de agosto de 2025 a 26 de agosto de 2025`;
* `del 23/12/2024 al 27/02/2025`.

### 8.6 Entregables

* Backend ejecutable localmente.
* API de parseo funcional.
* Tests unitarios de servicios comunes.
* Tests unitarios de cada parser específico.
* JSON esperado para cada factura real de ejemplo.

### 8.7 Criterios de aceptación

* Cada factura de ejemplo devuelve el parser esperado.
* Los campos críticos se extraen correctamente.
* El consumo se devuelve en kWh.
* El importe corresponde al total con IVA incluido.
* El mes de cómputo se calcula desde `period_end`.
* El parser genérico marca revisión visual.

## 9. Fase 3. Frontend base

### 9.1 Objetivo

Crear la aplicación Next.js con autenticación, layout principal y navegación.

### 9.2 Tareas

* Crear proyecto Next.js con TypeScript.
* Configurar Tailwind CSS.
* Configurar cliente Supabase.
* Crear pantalla de login.
* Crear protección de rutas.
* Crear layout interno.
* Crear navegación principal.
* Crear dashboard básico.
* Crear estructura de carpetas por features.

### 9.3 Pantallas iniciales

* Login.
* Dashboard.
* Edificios.
* CUPS controlados.
* Facturas.
* Revisión.
* Totales.
* Exportaciones.

### 9.4 Entregables

* Frontend ejecutable localmente.
* Login funcional.
* Rutas protegidas.
* Navegación base.

### 9.5 Criterios de aceptación

* Un usuario no autenticado no accede a pantallas internas.
* El usuario autenticado entra al dashboard.
* El layout permite navegar entre módulos.

## 10. Fase 4. CUPS y edificios

### 10.1 Objetivo

Implementar la consulta y mantenimiento básico de edificios y CUPS controlados.

### 10.2 Tareas

* Crear listado de edificios.
* Crear detalle de edificio.
* Mostrar CUPS agrupados por fuente energética.
* Crear listado de CUPS controlados.
* Añadir filtros por edificio, fuente, estado y texto.
* Implementar alta manual de CUPS.
* Implementar edición limitada.
* Implementar baja mediante último mes controlado.
* Recalcular `cups_key` al introducir CUPS.

### 10.3 Reglas

* El usuario no introduce manualmente `cups_key`.
* No se permite duplicar `cups_key + energy_type_code`.
* Un CUPS con histórico no se elimina físicamente.
* La baja se gestiona mediante vigencia.

### 10.4 Entregables

* Pantalla de edificios.
* Pantalla de CUPS controlados.
* Formularios de alta y baja.

### 10.5 Criterios de aceptación

* Se visualizan los edificios iniciales.
* Se visualizan CUPS por edificio y fuente.
* Un CUPS nuevo se normaliza automáticamente.
* Un CUPS dado de baja deja de ser exigible desde el mes posterior.

## 11. Fase 5. Carga y revisión de facturas

### 11.1 Objetivo

Implementar el flujo principal de subida, parseo, almacenamiento de resultado, avisos, revisión y corrección.

### 11.2 Tareas

* Crear pantalla de subida de PDFs.
* Permitir subida individual.
* Permitir subida múltiple.
* Validar tipo de archivo PDF.
* Calcular hash SHA-256.
* Detectar duplicado por hash.
* Enviar PDF al backend parser.
* Recibir `InvoiceParseResult`.
* Asociar CUPS contra `controlled_cups`.
* Crear `invoice_upload`.
* Crear `invoice`.
* Crear `invoice_warnings`.
* Calcular estado inicial.
* Calcular semáforo.
* Crear pantalla de revisión de facturas.
* Crear detalle de factura.
* Permitir corrección manual.
* Recalcular CUPS, edificio, año y mes al corregir.
* Permitir descarte.

### 11.3 Estados iniciales esperados

| Caso                                                             | Estado                                     |
| ---------------------------------------------------------------- | ------------------------------------------ |
| Parser específico, campos completos, CUPS controlado, sin avisos | `pendiente_validacion`                     |
| Parser genérico con datos suficientes                            | `pendiente_validacion` con revisión visual |
| CUPS no controlado                                               | `fuera_superficie_control`                 |
| Faltan campos críticos                                           | `requiere_carga_manual` o `error_parseo`   |
| Hash duplicado                                                   | `duplicada`                                |

### 11.4 Semáforo

* Verde: lista para validar.
* Amarillo: requiere revisión visual.
* Rojo: bloqueada.

### 11.5 Entregables

* Subida y procesamiento de PDFs.
* Persistencia de facturas procesadas.
* Pantalla de revisión.
* Corrección manual.
* Avisos visibles.

### 11.6 Criterios de aceptación

* Las tres facturas de ejemplo se procesan correctamente.
* El sistema detecta duplicado por hash.
* Una factura con CUPS no controlado no entra en totales.
* Una factura con parser genérico no se puede validar en bloque.
* La corrección de CUPS recalcula edificio y avisos.

## 12. Fase 6. Validación y totales

### 12.1 Objetivo

Permitir validar facturas y calcular totales mensuales por edificio, fuente energética, año y mes.

### 12.2 Tareas

* Implementar validación individual.
* Implementar validación en bloque solo para facturas verdes.
* Registrar `validated_at` y usuario validador.
* Cambiar estado a `validada` o `corregida`.
* Crear consulta o vista de totales mensuales.
* Calcular CUPS exigibles por mes.
* Calcular CUPS cubiertos.
* Detectar CUPS faltantes.
* Mostrar estado de completitud.
* Crear detalle de total mensual.

### 12.3 Reglas

* Solo `validada` y `corregida` entran en totales.
* La fecha de cierre del periodo determina el mes de cómputo.
* No hay prorrateo.
* Varias facturas para el mismo CUPS y mes se suman si son distintas y válidas.
* Un mes incompleto se muestra igualmente, con aviso.

### 12.4 Entregables

* Validación individual.
* Validación en bloque.
* Pantalla de totales mensuales.
* Detalle con facturas asociadas y CUPS faltantes.

### 12.5 Criterios de aceptación

* Una factura validada aparece en los totales.
* Una factura pendiente no aparece en los totales.
* Dos facturas distintas del mismo CUPS y mes se suman.
* Un mes sin todos los CUPS exigibles aparece como incompleto.

## 13. Fase 7. Exportaciones

### 13.1 Objetivo

Implementar exportaciones CSV y Excel para resumen mensual, detalle de facturas y CUPS faltantes.

### 13.2 Tareas

* Crear servicio de exportación.
* Exportar resumen mensual a CSV.
* Exportar resumen mensual a Excel.
* Exportar detalle de facturas.
* Exportar CUPS faltantes.
* Aplicar filtros visibles en pantalla.
* Crear nombres de archivo normalizados.
* Aplicar formato español en CSV orientado a Excel.
* Crear hojas recomendadas en Excel.

### 13.3 Reglas

* El resumen exportado se basa en facturas validadas o corregidas.
* Los meses incompletos deben aparecer marcados.
* El Excel no necesita macros, fórmulas complejas ni gráficos.
* El CSV debe ser compatible con entorno español.

### 13.4 Entregables

* Exportación CSV.
* Exportación Excel.
* Pantalla de exportaciones.

### 13.5 Criterios de aceptación

* El CSV se abre correctamente en Excel.
* El Excel contiene hoja de resumen mensual.
* El detalle de facturas justifica los totales.
* Los CUPS faltantes se exportan correctamente.

## 14. Fase 8. Pruebas y cierre MVP

### 14.1 Objetivo

Validar que el MVP cumple el flujo principal y los criterios de aceptación funcionales.

### 14.2 Tareas

* Ejecutar tests unitarios de backend.
* Ejecutar tests de normalización de CUPS.
* Ejecutar tests de parseo de números y fechas.
* Ejecutar tests de parsers específicos.
* Ejecutar pruebas manuales de subida de PDFs.
* Ejecutar pruebas de validación y corrección.
* Ejecutar pruebas de totales y completitud.
* Ejecutar pruebas de exportación.
* Revisar mensajes de aviso.
* Documentar limitaciones conocidas.

### 14.3 Casos mínimos de prueba

| Caso                           | Resultado esperado                            |
| ------------------------------ | --------------------------------------------- |
| Factura Iberdrola electricidad | Extrae CUPS, 88 kWh, 23,70 €, enero 2025      |
| Factura Naturgy electricidad   | Extrae CUPS, 22 kWh, 7,80 €, agosto 2025      |
| Factura Energía XXI gas        | Extrae CUPS, 8650 kWh, 603,71 €, febrero 2025 |
| PDF duplicado                  | Se bloquea por hash                           |
| CUPS no controlado             | No entra en totales                           |
| Parser genérico                | Requiere revisión visual                      |
| Mes incompleto                 | Muestra CUPS faltantes                        |
| Factura corregida y validada   | Entra en totales como corregida               |
| Exportación resumen            | Suma solo facturas válidas                    |

### 14.4 Entregables

* MVP ejecutable.
* Tests principales en verde.
* Exportaciones comprobadas.
* README actualizado.
* Lista de limitaciones y siguientes pasos.

### 14.5 Criterio de cierre

El MVP se considerará cerrado cuando pueda procesar los ejemplos reales, permitir validación, calcular totales mensuales y exportar resultados útiles para la carga manual en SIGEE-AGE.

## 15. Orden recomendado de prompts para OpenCode

### 15.1 Prompt 1. Preparar estructura

Objetivo:

```txt
Crear estructura del repositorio, archivos base, README, .gitignore, .env.example y carpetas principales según la documentación.
```

Resultado esperado:

* estructura creada;
* proyecto preparado para frontend, backend y Supabase;
* documentación organizada.

### 15.2 Prompt 2. Crear backend parser base

Objetivo:

```txt
Crear aplicación FastAPI con endpoint health, endpoint parse-invoice, schemas Pydantic y servicios base de extracción, normalización, fechas y números.
```

Resultado esperado:

* backend ejecutable;
* tests de servicios comunes.

### 15.3 Prompt 3. Implementar parsers específicos

Objetivo:

```txt
Implementar detector de formato y parsers específicos para Iberdrola electricidad, Naturgy regulada electricidad y Energía XXI gas natural usando las facturas de ejemplo.
```

Resultado esperado:

* parsers funcionando;
* tests contra JSON esperado.

### 15.4 Prompt 4. Crear migraciones Supabase

Objetivo:

```txt
Crear migraciones SQL para tablas energy_types, buildings, controlled_cups, invoice_uploads, invoices e invoice_warnings, con restricciones e índices básicos.
```

Resultado esperado:

* base de datos reproducible;
* seed inicial cargable.

### 15.5 Prompt 5. Crear frontend base

Objetivo:

```txt
Crear frontend Next.js con TypeScript, Tailwind, Supabase Auth, login, rutas protegidas, layout y navegación principal.
```

Resultado esperado:

* aplicación web navegable;
* login funcional.

### 15.6 Prompt 6. Implementar edificios y CUPS

Objetivo:

```txt
Implementar pantallas de edificios y CUPS controlados, con listado, filtros, alta, edición limitada y baja por vigencia.
```

Resultado esperado:

* superficie de control mantenible desde interfaz.

### 15.7 Prompt 7. Implementar carga y revisión de facturas

Objetivo:

```txt
Implementar subida múltiple de PDFs, cálculo de hash, llamada al backend parser, creación de registros de factura, avisos, semáforo y pantalla de revisión/corrección.
```

Resultado esperado:

* flujo de facturas operativo.

### 15.8 Prompt 8. Implementar validación y totales

Objetivo:

```txt
Implementar validación individual y en bloque, cálculo de totales mensuales, completitud y detalle de CUPS faltantes.
```

Resultado esperado:

* resumen mensual funcional.

### 15.9 Prompt 9. Implementar exportaciones

Objetivo:

```txt
Implementar exportación CSV y Excel de resumen mensual, detalle de facturas y CUPS faltantes, respetando filtros y formatos definidos.
```

Resultado esperado:

* descargas funcionales.

### 15.10 Prompt 10. Pruebas finales y endurecimiento

Objetivo:

```txt
Añadir pruebas, revisar estados, avisos, errores, exportaciones, README y documentación de ejecución local.
```

Resultado esperado:

* MVP validado y listo para revisión funcional.

## 16. Convenciones de código

### 16.1 General

* Código claro y mantenible.
* Funciones pequeñas y reutilizables.
* Nombres descriptivos.
* Separación por módulos funcionales.
* Tipado estricto cuando sea posible.
* Evitar duplicar reglas de negocio.

### 16.2 Python

* Usar Pydantic para contratos.
* Usar `Decimal` para importes y consumos.
* Usar `date` para fechas.
* Tests con `pytest`.
* Parsers desacoplados entre sí.
* Normalización de CUPS centralizada.

### 16.3 TypeScript

* Usar tipos explícitos para entidades principales.
* Separar componentes UI, servicios y lógica de negocio.
* Evitar lógica compleja dentro de componentes visuales.
* Centralizar formateadores de fechas, números e importes.

### 16.4 SQL

* Usar migraciones versionadas.
* Definir índices para campos de búsqueda habituales.
* Evitar consultas duplicadas complejas en frontend.
* Mantener restricciones básicas de integridad.

## 17. Riesgos principales

| Riesgo                                   | Mitigación                                        |
| ---------------------------------------- | ------------------------------------------------- |
| Cambios en formato de facturas           | Parsers desacoplados y tests por ejemplo          |
| CUPS mal normalizado                     | Función única y tests específicos                 |
| Totales incorrectos por estados          | Regla estricta: solo `validada` y `corregida`     |
| Confusión entre subtotal e importe final | Tests de parsers y avisos de candidatos múltiples |
| Exceso de alcance                        | Respetar fases y dejar evoluciones fuera          |
| Dependencia de PDFs almacenados          | Conservar datos estructurados y permitir borrado  |
| CSV mal interpretado por Excel           | Usar separador `;` y formato español              |

## 18. Definición de MVP terminado

El MVP estará terminado cuando cumpla estas condiciones:

* existe login básico;
* se muestran edificios y CUPS controlados;
* se pueden subir facturas PDF;
* se parsean correctamente las tres facturas reales de ejemplo;
* se generan avisos y semáforos;
* se pueden corregir datos;
* se pueden validar facturas;
* se calculan totales por edificio, fuente, año y mes;
* se detectan meses incompletos;
* se exportan CSV y Excel;
* existe documentación mínima de ejecución local;
* los tests principales están en verde.

## 19. Siguientes pasos tras el MVP

Una vez validado el MVP, se podrá decidir si evolucionar hacia:

* más formatos de facturas;
* parser o carga manual específica para gasóleo;
* roles y permisos;
* auditoría avanzada;
* conservación documental controlada;
* informes comparativos;
* alertas de consumo anómalo;
* integración futura si existiera mecanismo oficial de carga.
