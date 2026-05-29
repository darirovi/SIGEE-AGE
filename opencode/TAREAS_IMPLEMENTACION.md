# TAREAS_IMPLEMENTACION.md

## 1. Propósito del documento

Este documento organiza las tareas de implementación del MVP de la aplicación auxiliar SIGEE-AGE para OpenCode.

Su objetivo es convertir la documentación funcional y técnica del proyecto en una secuencia de trabajo clara, incremental y verificable.

Cada bloque debe implementarse de forma mantenible, con pruebas cuando corresponda y respetando las reglas de negocio ya documentadas.

---

## 2. Principios de ejecución

OpenCode debe seguir estos principios durante toda la implementación:

1. Implementar primero lo imprescindible para que el flujo completo funcione.
2. Evitar funcionalidades fuera de alcance del MVP.
3. Mantener separadas las responsabilidades entre frontend, base de datos, lógica de negocio y parsers.
4. No duplicar reglas críticas, especialmente normalización de CUPS, estados de factura y cálculo de mes de cómputo.
5. Usar tipos estrictos en TypeScript y modelos Pydantic en Python.
6. Usar `Decimal` o tipos numéricos exactos para importes y consumos.
7. No usar `float` para importes o consumos energéticos.
8. Mantener el código preparado para añadir nuevos parsers.
9. Añadir pruebas en las funciones críticas.
10. Documentar decisiones técnicas relevantes si afectan al alcance o al comportamiento funcional.

---

## 3. Orden recomendado de implementación

La implementación se divide en fases:

| Fase | Bloque                       | Resultado esperado                                       |
| ---- | ---------------------------- | -------------------------------------------------------- |
| 0    | Preparación del repositorio  | Proyecto organizado y ejecutable                         |
| 1    | Base de datos y seed inicial | Modelo mínimo disponible                                 |
| 2    | Autenticación y layout       | Acceso protegido y navegación base                       |
| 3    | Edificios y CUPS             | Superficie de control consultable y mantenible           |
| 4    | Backend parser               | API capaz de procesar PDFs y devolver datos normalizados |
| 5    | Parsers específicos          | Extracción de datos de facturas reales de ejemplo        |
| 6    | Carga de facturas            | Subida, hash, duplicados y creación de registros         |
| 7    | Revisión y validación        | Corrección, avisos, semáforo y estados                   |
| 8    | Totales mensuales            | Agregación por edificio, fuente, año y mes               |
| 9    | Exportaciones                | CSV y Excel descargables                                 |
| 10   | Validación final             | Checklist funcional y técnico del MVP                    |

---

## 4. Fase 0. Preparación del repositorio

### T-000. Revisar estructura inicial del proyecto

**Prioridad:** Alta
**Tipo:** Técnica
**Depende de:** Ninguna

Comprobar que existe una estructura similar a:

```txt
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
```

**Criterios de aceptación:**

* El repositorio puede abrirse y ejecutarse localmente.
* Hay separación clara entre frontend y backend parser.
* La documentación está ubicada en `docs/` y `opencode/`.
* Los ejemplos de facturas están disponibles en `examples/facturas/`.

---

### T-001. Crear README técnico inicial

**Prioridad:** Media
**Tipo:** Documentación técnica
**Depende de:** T-000

Crear o completar `README.md` con:

* descripción breve del proyecto;
* stack tecnológico;
* estructura del repositorio;
* requisitos de entorno;
* comandos de instalación;
* comandos de ejecución;
* comandos de test;
* advertencia de que la aplicación no se integra automáticamente con SIGEE-AGE.

**Criterios de aceptación:**

* Un desarrollador puede arrancar el proyecto siguiendo el README.
* El README no contradice la documentación funcional.

---

### T-002. Configurar variables de entorno

**Prioridad:** Alta
**Tipo:** Técnica / Seguridad
**Depende de:** T-000

Crear plantillas de entorno:

```txt
.env.example
apps/web/.env.example
apps/parser-api/.env.example
```

Variables esperadas para frontend:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
PARSER_API_URL=
```

Variables esperadas para backend parser:

```txt
APP_ENV=local
CORS_ALLOWED_ORIGINS=http://localhost:3000
MAX_UPLOAD_SIZE_MB=20
```

**Criterios de aceptación:**

* No se suben secretos reales al repositorio.
* Las variables necesarias están documentadas.
* La aplicación falla de forma clara si falta configuración crítica.

---

## 5. Fase 1. Base de datos y seed inicial

### T-010. Crear migraciones de catálogos básicos

**Prioridad:** Alta
**Tipo:** Base de datos
**Depende de:** T-000

Crear tabla `energy_types`.

Campos mínimos:

```txt
id uuid primary key
code text unique not null
label text not null
enabled_in_mvp boolean not null
parser_focus boolean not null
notes text null
created_at timestamptz not null
updated_at timestamptz not null
```

Seed inicial:

| code           | label        | enabled_in_mvp | parser_focus |
| -------------- | ------------ | -------------: | -----------: |
| `electricidad` | Electricidad |           true |         true |
| `gas_natural`  | Gas natural  |           true |         true |
| `gasoleo`      | Gasóleo      |           true |        false |

**Criterios de aceptación:**

* La tabla existe.
* Los tres tipos energéticos están precargados.
* `code` es único.

---

### T-011. Crear tabla de edificios

**Prioridad:** Alta
**Tipo:** Base de datos
**Depende de:** T-010

Crear tabla `buildings`.

Campos mínimos:

```txt
id uuid primary key
building_key text unique not null
name text not null
short_name text null
address text null
municipality text null
province text null
sigee_reference text null
notes text null
is_active boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

Seed inicial:

| building_key   | name                                    |
| -------------- | --------------------------------------- |
| `FUENLABRADA`  | Viviendas Logísticas de Fuenlabrada     |
| `VILLAVERDE`   | Viviendas Logísticas de Villaverde      |
| `ZARZAQUEMADA` | Acuartelamiento de Zarzaquemada-Leganés |
| `VALLEHERMOSO` | Acuartelamiento Vallehermoso            |
| `UPROSE`       | UPROSE                                  |

**Criterios de aceptación:**

* La tabla existe.
* Los edificios iniciales están precargados.
* `building_key` es estable y único.

---

### T-012. Crear tabla de CUPS controlados

**Prioridad:** Alta
**Tipo:** Base de datos
**Depende de:** T-011

Crear tabla `controlled_cups`.

Campos mínimos:

```txt
id uuid primary key
building_id uuid not null references buildings(id)
energy_type_code text not null references energy_types(code)
cups_original text not null
cups_key text not null
description text null
supplier_name text null
tariff text null
control_from_year integer not null
control_from_month integer not null
control_to_year integer null
control_to_month integer null
status text not null
source text null
notes text null
created_at timestamptz not null
updated_at timestamptz not null
```

Restricciones recomendadas:

```txt
unique(cups_key, energy_type_code)
check(control_from_month between 1 and 12)
check(control_to_month is null or control_to_month between 1 and 12)
check(status in ('activo', 'baja', 'pendiente'))
```

**Criterios de aceptación:**

* La tabla existe.
* No permite duplicar `cups_key + energy_type_code`.
* Permite gestionar vigencias.
* Permite conservar CUPS dados de baja.

---

### T-013. Crear seed de CUPS controlados

**Prioridad:** Alta
**Tipo:** Datos iniciales
**Depende de:** T-012

Crear `data/seed/cups_controlados.csv` o equivalente SQL/TypeScript.

El seed debe cargarse solo con CUPS confirmados por los pantallazos de SIGEE-AGE aportados.

Campos recomendados del CSV:

```csv
building_key,energy_type_code,cups_original,cups_key,description,supplier_name,tariff,control_from_year,control_from_month,control_to_year,control_to_month,status,source,notes
```

**Criterios de aceptación:**

* El seed no incluye CUPS no confirmados salvo decisión expresa.
* Cada CUPS queda asociado a un único edificio.
* El campo `source` indica el origen, por ejemplo `pantallazo_sigee`.

---

### T-014. Crear tablas de facturas y subidas

**Prioridad:** Alta
**Tipo:** Base de datos
**Depende de:** T-012

Crear tabla `invoice_uploads`.

Campos mínimos:

```txt
id uuid primary key
original_filename text not null
file_hash_sha256 text not null
file_size_bytes bigint not null
mime_type text not null
storage_path text null
technical_status text not null
uploaded_by uuid null
uploaded_at timestamptz not null
pdf_deleted_at timestamptz null
created_at timestamptz not null
updated_at timestamptz not null
```

Crear tabla `invoices`.

Campos mínimos:

```txt
id uuid primary key
upload_id uuid not null references invoice_uploads(id)
controlled_cups_id uuid null references controlled_cups(id)
building_id uuid null references buildings(id)
energy_type_code text null references energy_types(code)
status text not null
parser_name text not null
parser_version text not null
parse_source text not null
parse_confidence numeric(5,4) not null
supplier_name text null
invoice_number text null
cups_original text null
cups_key text null
period_start date null
period_end date null
computed_year integer null
computed_month integer null
consumption_kwh numeric(14,3) null
total_amount_eur numeric(14,2) null
raw_candidates jsonb not null default '{}'
validated_at timestamptz null
validated_by uuid null
created_at timestamptz not null
updated_at timestamptz not null
```

**Criterios de aceptación:**

* Se conserva el registro técnico de subida aunque el PDF se borre.
* Las facturas pueden existir en estado pendiente, validado, corregido o error.
* Los importes y consumos no usan float.

---

### T-015. Crear tabla de avisos de factura

**Prioridad:** Alta
**Tipo:** Base de datos
**Depende de:** T-014

Crear tabla `invoice_warnings`.

Campos mínimos:

```txt
id uuid primary key
invoice_id uuid not null references invoices(id) on delete cascade
level text not null
code text not null
message text not null
field_name text null
is_blocking boolean not null default false
created_at timestamptz not null
```

Restricciones recomendadas:

```txt
check(level in ('info', 'warning', 'error'))
```

**Criterios de aceptación:**

* Una factura puede tener varios avisos.
* Cada aviso tiene código estable.
* Puede distinguirse entre aviso bloqueante y no bloqueante.

---

### T-016. Crear vista o consulta de totales mensuales

**Prioridad:** Alta
**Tipo:** Base de datos / Negocio
**Depende de:** T-014

Crear una vista `monthly_totals` o una consulta equivalente que agregue solo facturas con estado:

```txt
validada
corregida
```

Agrupación:

```txt
building_id
energy_type_code
computed_year
computed_month
```

Campos calculados:

```txt
total_consumption_kwh
total_amount_eur
invoice_count
```

**Criterios de aceptación:**

* No entran facturas pendientes, duplicadas, descartadas o con errores.
* Varias facturas distintas para el mismo CUPS y mes se suman.
* Los importes se suman con precisión decimal.

---

### T-017. Crear tabla mínima de auditoría

**Prioridad:** Media
**Tipo:** Base de datos
**Depende de:** T-014

Crear tabla `audit_events` para acciones relevantes.

Campos mínimos:

```txt
id uuid primary key
actor_user_id uuid null
event_type text not null
entity_type text not null
entity_id uuid null
payload jsonb not null default '{}'
created_at timestamptz not null
```

Eventos mínimos:

* alta de CUPS;
* baja de CUPS;
* corrección de factura;
* validación de factura;
* descarte de factura;
* exportación.

**Criterios de aceptación:**

* Las acciones críticas pueden trazarse.
* No se implementa auditoría avanzada fuera de alcance.

---

## 6. Fase 2. Autenticación y layout

### T-020. Configurar Supabase Auth en frontend

**Prioridad:** Alta
**Tipo:** Frontend / Seguridad
**Depende de:** T-002

Implementar cliente Supabase en `apps/web`.

Debe incluir:

* inicialización segura del cliente;
* lectura de sesión;
* login con email y contraseña;
* logout;
* protección de rutas privadas.

**Criterios de aceptación:**

* El usuario puede iniciar sesión.
* El usuario puede cerrar sesión.
* Las pantallas internas no son accesibles sin sesión.
* No se exponen claves privadas.

---

### T-021. Crear layout principal

**Prioridad:** Alta
**Tipo:** Frontend
**Depende de:** T-020

Crear layout de aplicación con navegación a:

* Dashboard;
* Edificios;
* CUPS controlados;
* Facturas;
* Revisión;
* Totales mensuales;
* Exportaciones.

**Criterios de aceptación:**

* La navegación es clara.
* El usuario autenticado puede moverse entre pantallas.
* El layout muestra una acción visible para cerrar sesión.

---

### T-022. Crear dashboard operativo básico

**Prioridad:** Media
**Tipo:** Frontend
**Depende de:** T-021

Crear pantalla Dashboard con tarjetas simples:

* facturas pendientes;
* facturas con errores;
* facturas listas para validar;
* CUPS fuera de superficie;
* meses incompletos;
* acceso rápido a subir PDFs.

**Criterios de aceptación:**

* El dashboard no intenta ser un módulo analítico avanzado.
* Cada tarjeta enlaza a la pantalla operativa correspondiente.

---

## 7. Fase 3. Edificios y CUPS

### T-030. Pantalla de edificios

**Prioridad:** Alta
**Tipo:** Frontend
**Depende de:** T-011, T-021

Crear pantalla de consulta de edificios.

Columnas recomendadas:

* nombre;
* código interno;
* municipio;
* provincia;
* fuentes energéticas;
* número de CUPS activos;
* estado.

Filtros mínimos:

* texto libre;
* estado;
* fuente energética si procede.

**Criterios de aceptación:**

* Se ven los edificios iniciales.
* Se puede acceder al detalle de un edificio.

---

### T-031. Detalle de edificio

**Prioridad:** Alta
**Tipo:** Frontend
**Depende de:** T-030

Crear pantalla de detalle de edificio.

Debe mostrar:

* datos generales;
* CUPS agrupados por fuente energética;
* estado de cada CUPS;
* vigencias;
* enlaces a facturas o totales filtrados.

**Criterios de aceptación:**

* Los CUPS del edificio se muestran agrupados.
* Los CUPS dados de baja siguen visibles como histórico.

---

### T-032. Pantalla de CUPS controlados

**Prioridad:** Alta
**Tipo:** Frontend
**Depende de:** T-012, T-021

Crear pantalla de mantenimiento de superficie de control.

Columnas:

* edificio;
* fuente;
* CUPS original;
* CUPS normalizado;
* estado;
* primer mes controlado;
* último mes controlado;
* suministrador;
* tarifa;
* observaciones.

Filtros:

* edificio;
* fuente energética;
* estado;
* texto por CUPS.

**Criterios de aceptación:**

* Se puede consultar la superficie de control completa.
* Se distingue CUPS activo, dado de baja o pendiente.

---

### T-033. Implementar función única de normalización de CUPS

**Prioridad:** Alta
**Tipo:** Shared / Negocio
**Depende de:** T-000

Crear función reutilizable para normalizar CUPS.

Ubicación recomendada:

```txt
packages/shared/src/cups/normalizeCups.ts
apps/parser-api/app/domain/cups.py
```

Debe existir equivalencia funcional entre TypeScript y Python si se necesita en ambos entornos.

Reglas:

* eliminar espacios;
* pasar a mayúsculas;
* conservar solo caracteres alfanuméricos;
* aplicar regla de sufijos definida en reglas de negocio.

Tests mínimos:

| Entrada                     | Salida esperada        |
| --------------------------- | ---------------------- |
| `ES 0022 0000 0621 2876 CB` | `ES0022000006212876CB` |
| `ES0022000006290850YS1P`    | `ES0022000006290850YS` |

**Criterios de aceptación:**

* La función tiene pruebas.
* No hay otras normalizaciones alternativas dispersas.
* Alta/edición de CUPS y parseo usan la misma lógica.

---

### T-034. Alta manual de CUPS

**Prioridad:** Alta
**Tipo:** Frontend / Negocio
**Depende de:** T-032, T-033

Crear formulario de alta de CUPS.

Campos mínimos:

* edificio;
* fuente energética;
* CUPS original;
* primer mes a controlar;
* estado;
* descripción;
* suministrador;
* tarifa;
* observaciones.

Comportamiento:

* calcular `cups_key` automáticamente;
* mostrar `cups_key` al usuario como lectura;
* impedir duplicados por `cups_key + energy_type_code`;
* crear evento de auditoría.

**Criterios de aceptación:**

* El usuario no introduce manualmente el CUPS normalizado.
* No se permite duplicado funcional.
* El nuevo CUPS empieza a exigirse desde el mes indicado.

---

### T-035. Baja lógica de CUPS

**Prioridad:** Alta
**Tipo:** Frontend / Negocio
**Depende de:** T-032

Permitir dar de baja un CUPS sin eliminarlo.

Campos:

* último mes a controlar;
* observación o motivo opcional.

Comportamiento:

* actualizar `control_to_year` y `control_to_month`;
* cambiar estado a `baja`;
* conservar histórico;
* crear evento de auditoría.

**Criterios de aceptación:**

* El CUPS sigue visible.
* No se exige en meses posteriores a la baja.
* No se borran facturas asociadas.

---

### T-036. Edición limitada de CUPS

**Prioridad:** Media
**Tipo:** Frontend / Negocio
**Depende de:** T-032

Permitir editar campos no destructivos:

* descripción;
* suministrador;
* tarifa;
* observaciones;
* vigencia si no contradice datos existentes.

Campos sensibles:

* edificio;
* fuente energética;
* CUPS original.

Si se permite editar CUPS original, debe recalcularse `cups_key` y comprobar duplicados.

**Criterios de aceptación:**

* No se crean incoherencias con facturas validadas sin aviso.
* Las modificaciones quedan auditadas.

---

## 8. Fase 4. Backend parser FastAPI

### T-040. Crear aplicación FastAPI base

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-000

Crear API en `apps/parser-api`.

Endpoints mínimos:

```txt
GET /health
POST /parse-invoice
```

**Criterios de aceptación:**

* `/health` devuelve estado OK.
* La API se puede ejecutar localmente.
* CORS está configurado para el frontend local.

---

### T-041. Crear modelos Pydantic del parser

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-040

Crear modelos:

* `ParserWarning`;
* `InvoiceParseResult`;
* enums de energía, fuente de parseo y nivel de aviso.

Campos de `InvoiceParseResult`:

```txt
parser_name
parser_version
parse_source
parse_confidence
energy_type
supplier_name
invoice_number
cups_original
cups_key
period_start
period_end
computed_year
computed_month
consumption_kwh
total_amount_eur
raw_candidates
warnings
```

**Criterios de aceptación:**

* El contrato coincide con la documentación de parsers.
* Los importes y consumos usan `Decimal`.
* Las fechas usan `date`.

---

### T-042. Implementar extracción de texto PDF

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-040

Implementar servicio de extracción con PyMuPDF o pdfplumber.

Debe:

* recibir PDF;
* extraer texto por páginas;
* unir texto de forma estable;
* detectar si el texto es insuficiente;
* devolver error controlado si el PDF no es legible.

**Criterios de aceptación:**

* Extrae texto de las facturas de ejemplo.
* Si no hay texto suficiente, devuelve aviso `UNREADABLE_PDF`.
* No usa OCR avanzado en MVP.

---

### T-043. Implementar detector de formato

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-042

Crear detector de formato por marcadores.

Formatos iniciales:

#### Iberdrola electricidad

Marcadores posibles:

* `IBERDROLA CLIENTES, S.A.U.`;
* `RESUMEN DE FACTURA`;
* `PERIODO DE FACTURACIÓN`;
* `Consumo total de esta factura`.

#### Naturgy regulada electricidad

Marcadores posibles:

* `Comercializadora Regulada, Gas & Power`;
* `DATOS DE LA FACTURA DE ELECTRICIDAD`;
* `INFORMACIÓN DE CONSUMO ELÉCTRICO`;
* `Código unificado de punto de suministro CUPS`;
* `TOTAL IMPORTE FACTURA`.

#### Energía XXI gas natural

Marcadores posibles:

* `Energía XXI`;
* `DADES DE LA FACTURA`;
* `INFORMACIÓ DEL CONSUM GAS`;
* `Consum Total`.

**Criterios de aceptación:**

* Las facturas de ejemplo se clasifican correctamente.
* Los formatos no reconocidos van al parser genérico.

---

### T-044. Implementar utilidades de normalización de valores

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-041

Crear utilidades para:

* fechas españolas;
* fechas catalanas si aparecen en Energía XXI;
* importes con coma decimal;
* consumos con separador de miles;
* cálculo de `computed_year` y `computed_month` desde `period_end`;
* normalización de CUPS.

**Criterios de aceptación:**

* `23,70 €` se convierte en Decimal `23.70`.
* `8.650,000 kWh` se convierte en Decimal `8650.000`.
* `31 de enero de 2025` se interpreta correctamente.
* El mes de cómputo se calcula desde la fecha final del periodo.

---

## 9. Fase 5. Parsers específicos

### T-050. Parser Iberdrola electricidad

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-041, T-042, T-043, T-044

Implementar `iberdrola_electricidad`.

Debe extraer:

* `supplier_name`;
* `invoice_number`;
* `period_start`;
* `period_end`;
* `consumption_kwh`;
* `total_amount_eur`;
* `cups_original`;
* `cups_key`;
* `energy_type = electricidad`.

Datos esperados del ejemplo:

```json
{
  "parser_name": "iberdrola_electricidad",
  "energy_type": "electricidad",
  "supplier_name": "Iberdrola Clientes, S.A.U.",
  "invoice_number": "21250131040000158",
  "period_start": "2024-12-10",
  "period_end": "2025-01-15",
  "computed_year": 2025,
  "computed_month": 1,
  "consumption_kwh": "88",
  "total_amount_eur": "23.70"
}
```

**Criterios de aceptación:**

* El parser obtiene los campos críticos del PDF de ejemplo.
* La confianza es alta si no hay ambigüedad.
* Las pruebas unitarias pasan.

---

### T-051. Parser Naturgy regulada electricidad

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-041, T-042, T-043, T-044

Implementar `naturgy_regulada_electricidad`.

Debe extraer:

* `supplier_name`;
* `invoice_number`;
* `period_start`;
* `period_end`;
* `consumption_kwh`;
* `total_amount_eur`;
* `cups_original`;
* `cups_key`;
* `energy_type = electricidad`.

Datos esperados del ejemplo:

```json
{
  "parser_name": "naturgy_regulada_electricidad",
  "energy_type": "electricidad",
  "supplier_name": "Comercializadora Regulada, Gas & Power, S.A.",
  "invoice_number": "FE25137022313356",
  "period_start": "2025-08-20",
  "period_end": "2025-08-26",
  "computed_year": 2025,
  "computed_month": 8,
  "consumption_kwh": "22",
  "total_amount_eur": "7.80",
  "cups_original": "ES0022000006290850YS1P",
  "cups_key": "ES0022000006290850YS"
}
```

**Criterios de aceptación:**

* El parser obtiene los campos críticos del PDF de ejemplo.
* Aplica correctamente la regla de sufijo del CUPS.
* Las pruebas unitarias pasan.

---

### T-052. Parser Energía XXI gas natural

**Prioridad:** Alta
**Tipo:** Backend parser
**Depende de:** T-041, T-042, T-043, T-044

Implementar `energia_xxi_gas_natural`.

Debe extraer:

* `supplier_name`;
* `invoice_number`;
* `period_start`;
* `period_end`;
* `consumption_kwh`;
* `total_amount_eur`;
* `cups_original`;
* `cups_key`;
* `energy_type = gas_natural`.

Datos esperados del ejemplo:

```json
{
  "parser_name": "energia_xxi_gas_natural",
  "energy_type": "gas_natural",
  "supplier_name": "Energía XXI Comercializadora de Referencia S.L.U.",
  "invoice_number": "S25CON006941700",
  "period_start": "2024-12-23",
  "period_end": "2025-02-27",
  "computed_year": 2025,
  "computed_month": 2,
  "consumption_kwh": "8650.000",
  "total_amount_eur": "603.71"
}
```

**Criterios de aceptación:**

* El parser obtiene los campos críticos del PDF de ejemplo.
* Interpreta correctamente texto en catalán.
* Las pruebas unitarias pasan.

---

### T-053. Parser genérico

**Prioridad:** Media
**Tipo:** Backend parser
**Depende de:** T-041, T-042, T-044

Implementar `generic_invoice_parser`.

Debe intentar extraer:

* posible CUPS;
* posible periodo;
* posible consumo;
* posible importe total;
* posible número de factura.

Debe devolver:

```txt
parse_source = parser_generico
parse_confidence <= 0.70
warning GENERIC_PARSER_USED
```

**Criterios de aceptación:**

* No falla ante formatos desconocidos.
* Nunca marca el resultado como validable en bloque.
* Devuelve candidatos en `raw_candidates`.

---

### T-054. Tests de parsers con PDFs reales

**Prioridad:** Alta
**Tipo:** Backend parser / Testing
**Depende de:** T-050, T-051, T-052

Crear tests con los PDFs de ejemplo.

Casos mínimos:

* Iberdrola electricidad;
* Naturgy regulada electricidad;
* Energía XXI gas natural;
* PDF no reconocido si se dispone de ejemplo.

**Criterios de aceptación:**

* Los tests comprueban todos los campos críticos.
* Los tests verifican `computed_year` y `computed_month`.
* Los tests verifican normalización de CUPS.

---

## 10. Fase 6. Carga de facturas

### T-060. Pantalla de subida de PDFs

**Prioridad:** Alta
**Tipo:** Frontend
**Depende de:** T-021

Crear pantalla para subida individual y múltiple de PDFs.

Debe permitir:

* seleccionar uno o varios PDFs;
* validar extensión y tipo MIME;
* mostrar lista de archivos seleccionados;
* iniciar procesamiento;
* mostrar resultado por archivo.

**Criterios de aceptación:**

* El fallo de un archivo no bloquea los demás.
* Los archivos no PDF muestran error claro.

---

### T-061. Calcular hash SHA-256

**Prioridad:** Alta
**Tipo:** Frontend / Backend
**Depende de:** T-060

Implementar cálculo de hash SHA-256 antes de procesar o guardar definitivamente.

Puede hacerse en frontend o backend, pero debe ser consistente.

**Criterios de aceptación:**

* Cada subida tiene hash.
* El hash se usa para detectar duplicado exacto.
* El hash queda registrado en `invoice_uploads`.

---

### T-062. Detectar duplicado exacto por hash

**Prioridad:** Alta
**Tipo:** Negocio / Base de datos
**Depende de:** T-014, T-061

Antes de parsear una factura, comprobar si ya existe un `file_hash_sha256` igual.

Si existe:

* registrar la subida como duplicada o informar al usuario;
* no crear factura validable nueva;
* generar aviso `DUPLICATE_FILE`.

**Criterios de aceptación:**

* El mismo PDF no se procesa dos veces como factura válida.
* El usuario recibe aviso comprensible.

---

### T-063. Integrar frontend con backend parser

**Prioridad:** Alta
**Tipo:** Integración
**Depende de:** T-040, T-060

Desde el frontend, enviar PDF al endpoint `POST /parse-invoice`.

Debe manejar:

* respuesta correcta;
* error de PDF ilegible;
* error de formato;
* error técnico del backend.

**Criterios de aceptación:**

* El usuario ve el resultado del procesamiento.
* Los errores técnicos no rompen la interfaz.
* La respuesta conserva el contrato normalizado.

---

### T-064. Crear registros de subida y factura

**Prioridad:** Alta
**Tipo:** Negocio / Base de datos
**Depende de:** T-014, T-015, T-063

Tras parsear, crear:

1. `invoice_uploads`;
2. `invoices`;
3. `invoice_warnings`.

La capa de negocio debe:

* buscar `controlled_cups` por `cups_key + energy_type_code`;
* asociar `building_id` si encuentra CUPS controlado;
* asignar estado inicial;
* añadir avisos funcionales.

**Criterios de aceptación:**

* Cada PDF procesado tiene registro técnico.
* Cada factura tiene datos extraídos.
* Las incidencias quedan registradas como avisos.

---

### T-065. Asignar estado inicial de factura

**Prioridad:** Alta
**Tipo:** Negocio
**Depende de:** T-064

Implementar función centralizada para asignar estado inicial.

Reglas mínimas:

* si PDF duplicado: `duplicada`;
* si faltan campos críticos: `error_parseo` o `requiere_carga_manual`;
* si CUPS no está controlado: `fuera_superficie_control`;
* si hay datos suficientes: `pendiente_validacion`;
* si parser genérico: `pendiente_validacion` con warning y sin validación en bloque.

**Criterios de aceptación:**

* El estado no se decide en el parser.
* La lógica es testeable.
* Los estados coinciden con la documentación.

---

## 11. Fase 7. Revisión y validación

### T-070. Pantalla de revisión de facturas

**Prioridad:** Alta
**Tipo:** Frontend
**Depende de:** T-064

Crear pantalla de revisión con tabla de facturas.

Columnas recomendadas:

* semáforo;
* estado;
* proveedor;
* número factura;
* edificio;
* fuente;
* CUPS;
* periodo;
* mes de cómputo;
* consumo;
* importe;
* avisos;
* acciones.

Filtros:

* estado;
* semáforo;
* edificio;
* fuente;
* mes/año;
* proveedor;
* texto libre.

**Criterios de aceptación:**

* El usuario puede localizar facturas pendientes o con error.
* Los avisos se ven de forma clara.

---

### T-071. Calcular semáforo operativo

**Prioridad:** Alta
**Tipo:** Negocio / Frontend
**Depende de:** T-065

Implementar cálculo de semáforo:

```txt
verde
amarillo
rojo
```

Reglas:

* Verde: sin errores ni warnings relevantes, parser específico, campos completos, CUPS controlado.
* Amarillo: requiere revisión visual, sin bloqueo.
* Rojo: tiene error bloqueante o faltan campos críticos.

**Criterios de aceptación:**

* El semáforo se calcula de forma consistente.
* No se basa solo en colores; debe tener texto asociado.

---

### T-072. Detalle de factura

**Prioridad:** Alta
**Tipo:** Frontend
**Depende de:** T-070

Crear pantalla de detalle.

Debe mostrar:

* datos extraídos;
* datos finales editables si procede;
* avisos;
* estado;
* semáforo;
* PDF si está disponible;
* acciones: validar, guardar corrección, descartar.

**Criterios de aceptación:**

* El usuario puede revisar una factura completa.
* Los campos críticos son visibles.
* Las correcciones quedan diferenciadas de los datos extraídos si se implementa esta separación.

---

### T-073. Corrección manual de factura

**Prioridad:** Alta
**Tipo:** Frontend / Negocio
**Depende de:** T-072

Permitir corregir campos críticos:

* CUPS original;
* fuente energética;
* fecha inicio;
* fecha fin;
* consumo kWh;
* importe total;
* número de factura si procede.

Comportamiento:

* recalcular `cups_key` si cambia CUPS;
* recalcular edificio si cambia CUPS;
* recalcular `computed_year` y `computed_month` si cambia `period_end`;
* regenerar avisos aplicables;
* marcar como corregida al validar.

**Criterios de aceptación:**

* La corrección no permite incoherencias silenciosas.
* Las reglas críticas se recalculan automáticamente.
* Queda evento de auditoría.

---

### T-074. Validación individual

**Prioridad:** Alta
**Tipo:** Negocio / Frontend
**Depende de:** T-072, T-073

Permitir validar una factura individual si no tiene errores bloqueantes.

Estados finales:

* `validada` si no hubo cambios manuales;
* `corregida` si el usuario modificó datos antes de validar.

**Criterios de aceptación:**

* Una factura validada entra en totales.
* Una factura con error bloqueante no puede validarse.
* Se registra `validated_at` y `validated_by` si está disponible.

---

### T-075. Descartar factura

**Prioridad:** Alta
**Tipo:** Negocio / Frontend
**Depende de:** T-072

Permitir descartar una factura.

Debe solicitar confirmación y motivo opcional.

**Criterios de aceptación:**

* La factura descartada no entra en totales.
* La acción queda auditada.
* El usuario puede distinguir descartadas de errores técnicos.

---

### T-076. Validación en bloque

**Prioridad:** Media
**Tipo:** Negocio / Frontend
**Depende de:** T-070, T-071, T-074

Permitir validar en bloque solo facturas en verde.

Reglas:

* no incluir facturas con warnings;
* no incluir parser genérico;
* no incluir facturas con errores;
* no incluir facturas fuera de superficie.

**Criterios de aceptación:**

* La interfaz muestra cuántas facturas se validarán.
* No se validan accidentalmente facturas amarillas o rojas.

---

## 12. Fase 8. Totales mensuales y completitud

### T-080. Consulta de totales mensuales

**Prioridad:** Alta
**Tipo:** Frontend / Base de datos
**Depende de:** T-016, T-074

Crear pantalla de totales mensuales.

Filtros:

* año;
* mes;
* edificio;
* fuente energética;
* estado de completitud.

Columnas:

* edificio;
* fuente;
* año;
* mes;
* consumo total kWh;
* importe total €;
* número de facturas;
* estado de completitud;
* avisos.

**Criterios de aceptación:**

* Solo suma facturas validadas o corregidas.
* Los totales cambian al validar/corregir facturas.

---

### T-081. Calcular CUPS exigibles por mes

**Prioridad:** Alta
**Tipo:** Negocio / Base de datos
**Depende de:** T-012

Implementar función o consulta para obtener CUPS exigibles por:

```txt
building_id
energy_type_code
year
month
```

Regla:

```txt
control_from <= mes_consulta <= control_to
```

Si `control_to` está vacío, el CUPS sigue activo.

**Criterios de aceptación:**

* Los CUPS dados de baja no se exigen después de su último mes de control.
* Los CUPS de alta futura no se exigen antes de su primer mes.

---

### T-082. Detectar completitud mensual

**Prioridad:** Alta
**Tipo:** Negocio
**Depende de:** T-080, T-081

Un total mensual está completo si existen facturas validadas o corregidas para todos los CUPS exigibles de ese edificio, fuente y mes.

Debe detectar:

* CUPS esperados;
* CUPS con factura válida;
* CUPS faltantes;
* total completo o incompleto.

**Criterios de aceptación:**

* Los totales incompletos se muestran igualmente con aviso.
* El detalle permite ver qué CUPS faltan.

---

### T-083. Detalle de total mensual

**Prioridad:** Media
**Tipo:** Frontend
**Depende de:** T-082

Crear vista de detalle de un total mensual.

Debe mostrar:

* facturas incluidas;
* CUPS cubiertos;
* CUPS faltantes;
* consumo total;
* importe total;
* avisos de completitud.

**Criterios de aceptación:**

* El usuario puede justificar de dónde sale cada total.
* El usuario puede ir desde una factura al detalle y volver.

---

## 13. Fase 9. Exportaciones

### T-090. Exportación CSV

**Prioridad:** Alta
**Tipo:** Frontend / Exportador
**Depende de:** T-080, T-082

Implementar exportación CSV de totales mensuales.

Columnas mínimas:

```txt
building_key
building_name
energy_type_code
year
month
total_consumption_kwh
total_amount_eur
invoice_count
is_complete
missing_cups
warnings
```

**Criterios de aceptación:**

* El CSV se descarga correctamente.
* Los importes y consumos mantienen formato usable.
* Se indica si el total está completo.

---

### T-091. Exportación Excel

**Prioridad:** Alta
**Tipo:** Frontend / Exportador
**Depende de:** T-090

Implementar exportación Excel.

Hojas recomendadas:

1. `Totales`;
2. `Facturas incluidas`;
3. `CUPS faltantes`;
4. `Avisos`.

**Criterios de aceptación:**

* El Excel se abre correctamente.
* Los datos coinciden con pantalla.
* Se distinguen totales completos e incompletos.

---

### T-092. Registrar eventos de exportación

**Prioridad:** Media
**Tipo:** Auditoría
**Depende de:** T-017, T-090, T-091

Registrar evento cuando el usuario exporte.

Payload recomendado:

```json
{
  "format": "xlsx",
  "filters": {
    "year": 2025,
    "month": 1,
    "building_id": null,
    "energy_type_code": null
  }
}
```

**Criterios de aceptación:**

* La exportación queda trazada.
* No se guarda el archivo exportado si no es necesario.

---

## 14. Fase 10. Validación final del MVP

### T-100. Ejecutar checklist funcional

**Prioridad:** Alta
**Tipo:** QA
**Depende de:** Todas las fases anteriores

Validar manualmente el flujo completo:

1. Login.
2. Consulta de edificios.
3. Consulta de CUPS.
4. Subida de PDFs de ejemplo.
5. Parseo correcto.
6. Detección de duplicado exacto.
7. Revisión de factura.
8. Corrección manual.
9. Validación individual.
10. Validación en bloque.
11. Consulta de totales.
12. Detección de CUPS faltantes.
13. Exportación CSV.
14. Exportación Excel.

**Criterios de aceptación:**

* El flujo principal se completa sin errores críticos.
* Los datos finales son coherentes con las facturas de ejemplo.

---

### T-101. Ejecutar tests automatizados

**Prioridad:** Alta
**Tipo:** QA / Testing
**Depende de:** T-054, T-033, T-065, T-082

Tests mínimos:

* normalización de CUPS;
* parseo de facturas;
* cálculo de mes de cómputo;
* detección de duplicados;
* asignación de estados;
* cálculo de CUPS exigibles;
* cálculo de completitud;
* agregación de totales.

**Criterios de aceptación:**

* Los tests pasan en local.
* Los tests pueden ejecutarse con un único comando documentado.

---

### T-102. Revisión de seguridad básica

**Prioridad:** Alta
**Tipo:** Seguridad
**Depende de:** Todas las fases anteriores

Comprobar:

* rutas privadas protegidas;
* no hay secretos en cliente;
* no hay PDFs públicos por defecto;
* validación de tipo y tamaño de archivo;
* errores técnicos no exponen trazas sensibles al usuario;
* RLS o controles equivalentes si se usa Supabase directamente desde frontend.

**Criterios de aceptación:**

* No se detectan exposiciones evidentes.
* Las restricciones de acceso son coherentes con el MVP.

---

### T-103. Revisión de alcance

**Prioridad:** Alta
**Tipo:** Producto / QA
**Depende de:** Todas las fases anteriores

Confirmar que no se ha implementado fuera de alcance:

* integración automática con SIGEE-AGE;
* scraping;
* automatización de navegador;
* SSO corporativo;
* roles complejos;
* prorrateo mensual;
* OCR avanzado;
* parser automático de gasóleo;
* auditoría avanzada innecesaria.

**Criterios de aceptación:**

* El MVP sigue siendo simple y centrado.
* Las desviaciones están documentadas como decisiones si existen.

---

## 15. Orden mínimo para obtener un MVP navegable

Si se necesita avanzar de forma muy incremental, seguir este orden reducido:

1. Base de datos: `energy_types`, `buildings`, `controlled_cups`.
2. Auth y layout.
3. Pantallas de edificios y CUPS.
4. FastAPI parser base.
5. Parser Iberdrola.
6. Parser Naturgy.
7. Parser Energía XXI.
8. Subida PDF + hash + duplicado.
9. Creación de factura y avisos.
10. Revisión y validación individual.
11. Totales mensuales.
12. Exportación CSV.
13. Exportación Excel.
14. Validación final.

---

## 16. Tareas que no deben hacerse en el MVP

No implementar salvo instrucción expresa posterior:

* conexión directa con SIGEE-AGE;
* carga automática en SIGEE-AGE;
* automatización de navegador;
* scraping;
* SSO;
* multirol avanzado;
* permisos por edificio;
* aprobación por doble usuario;
* OCR avanzado;
* parser de gasóleo;
* conservación permanente obligatoria de PDFs;
* reporting avanzado;
* prorrateo entre meses;
* motor complejo de workflow administrativo.

---

## 17. Definición de terminado por bloque

Un bloque se considera terminado cuando:

1. La funcionalidad está implementada.
2. Los criterios de aceptación se cumplen.
3. No contradice reglas de negocio.
4. Los errores principales están gestionados.
5. Hay pruebas si afecta a lógica crítica.
6. El código es mantenible y tipado.
7. No introduce funcionalidades fuera de alcance.
8. Está listo para integrarse con el flujo completo.

---

## 18. Definición de terminado del MVP

El MVP se considera terminado cuando el usuario gestor puede:

1. Iniciar sesión.
2. Consultar edificios y CUPS controlados.
3. Subir las facturas PDF de ejemplo.
4. Obtener datos extraídos de los tres formatos iniciales.
5. Detectar duplicados.
6. Detectar CUPS no controlados.
7. Revisar y corregir datos.
8. Validar facturas.
9. Calcular totales mensuales.
10. Ver si un mes está completo o incompleto.
11. Exportar CSV y Excel.
12. Usar esos datos como apoyo para carga manual posterior en SIGEE-AGE.

La aplicación no debe interactuar automáticamente con SIGEE-AGE.
