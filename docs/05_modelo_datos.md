# Modelo de datos

## 1. Propósito del documento

Este documento define el modelo de datos propuesto para el MVP de la aplicación auxiliar de preparación de consumos energéticos para SIGEE-AGE.

El modelo debe permitir:

* mantener edificios;
* mantener CUPS controlados;
* gestionar altas y bajas de CUPS mediante vigencias;
* registrar facturas procesadas;
* conservar datos extraídos y datos finales validados;
* calcular totales por edificio, fuente energética, año y mes;
* detectar completitud e incidencias;
* generar exportaciones;
* soportar tests de parsers con ejemplos reales.

## 2. Principios del modelo

### 2.1 Simplicidad

El MVP debe usar un modelo suficientemente completo, pero sin sobredimensionar.

No se modelarán todos los datos administrativos de SIGEE-AGE ni de las facturas energéticas. Solo se guardará lo necesario para cumplir el objetivo del prototipo.

### 2.2 CUPS como eje de asociación

La asociación de una factura con un edificio se realiza mediante el CUPS normalizado.

La relación principal es:

```txt
Factura -> CUPS controlado -> Edificio
```

### 2.3 Totales calculados

Los totales por edificio, fuente energética, año y mes pueden calcularse a partir de facturas validadas.

No obstante, el sistema puede materializarlos en una vista o tabla derivada si facilita rendimiento o exportación.

### 2.4 Vigencias

Los CUPS no se eliminan físicamente si han tenido uso. Se gestionan mediante:

* primer mes a controlar;
* último mes a controlar;
* estado.

### 2.5 Trazabilidad mínima

Aunque los PDFs puedan borrarse, deben conservarse los datos estructurados extraídos, los datos corregidos y el origen del parseo.

## 3. Entidades principales

Entidades del MVP:

| Entidad            | Finalidad                                             |
| ------------------ | ----------------------------------------------------- |
| `users`            | Usuario gestor, normalmente delegado en Supabase Auth |
| `energy_types`     | Catálogo de fuentes energéticas                       |
| `buildings`        | Edificios gestionados                                 |
| `controlled_cups`  | CUPS controlados por edificio y fuente                |
| `invoice_uploads`  | Registro técnico de subida/procesamiento de PDF       |
| `invoices`         | Datos extraídos/finales de cada factura               |
| `invoice_warnings` | Avisos e incidencias asociados a facturas             |
| `monthly_totals`   | Vista o tabla de totales mensuales calculados         |
| `audit_events`     | Trazabilidad mínima de acciones relevantes            |

## 4. Tipos y convenciones

### 4.1 Fechas

Las fechas se almacenan en formato `date`.

Ejemplo:

```txt
2025-01-15
```

### 4.2 Meses de control

Los meses de control se pueden almacenar como:

* `control_from_year` + `control_from_month`;
* `control_to_year` + `control_to_month`;

O como un campo tipo `YYYY-MM` si se prefiere simplificar en capa de aplicación.

Recomendación para PostgreSQL:

```txt
control_from_year integer
control_from_month integer
control_to_year integer nullable
control_to_month integer nullable
```

Esto evita ambigüedad y facilita consultas.

### 4.3 Decimales

Consumos e importes deben almacenarse como `numeric`, no como `float`.

Recomendación:

```txt
consumption_kwh numeric(14,3)
total_amount_eur numeric(14,2)
```

### 4.4 Enumeraciones

Para facilitar validaciones, se recomienda usar enums en aplicación y, si procede, checks en base de datos.

Valores principales:

```txt
energy_type: electricidad | gas_natural | gasoleo
invoice_status: pendiente_validacion | validada | corregida | fuera_superficie_control | error_parseo | requiere_carga_manual | duplicada | descartada
parse_source: parser_especifico | parser_generico | manual
warning_level: info | warning | error
```

## 5. Tabla `energy_types`

Catálogo de fuentes energéticas.

### 5.1 Campos

| Campo            | Tipo        | Obligatorio | Descripción                                              |
| ---------------- | ----------- | ----------: | -------------------------------------------------------- |
| `id`             | uuid        |          Sí | Identificador interno                                    |
| `code`           | text        |          Sí | Código estable: `electricidad`, `gas_natural`, `gasoleo` |
| `label`          | text        |          Sí | Nombre visible                                           |
| `enabled_in_mvp` | boolean     |          Sí | Indica si aparece en el MVP                              |
| `parser_focus`   | boolean     |          Sí | Indica si tiene parser automático prioritario            |
| `notes`          | text        |          No | Observaciones                                            |
| `created_at`     | timestamptz |          Sí | Fecha de creación                                        |
| `updated_at`     | timestamptz |          Sí | Fecha de actualización                                   |

### 5.2 Datos iniciales

| code           | label        | enabled_in_mvp | parser_focus |
| -------------- | ------------ | -------------: | -----------: |
| `electricidad` | Electricidad |           true |         true |
| `gas_natural`  | Gas natural  |           true |         true |
| `gasoleo`      | Gasóleo      |           true |        false |

## 6. Tabla `buildings`

Representa los edificios o ubicaciones gestionadas.

### 6.1 Campos

| Campo             | Tipo        | Obligatorio | Descripción                               |
| ----------------- | ----------- | ----------: | ----------------------------------------- |
| `id`              | uuid        |          Sí | Identificador interno                     |
| `building_key`    | text        |          Sí | Código estable interno                    |
| `name`            | text        |          Sí | Nombre visible del edificio               |
| `short_name`      | text        |          No | Nombre corto para tablas                  |
| `address`         | text        |          No | Dirección si se conoce                    |
| `municipality`    | text        |          No | Municipio                                 |
| `province`        | text        |          No | Provincia                                 |
| `sigee_reference` | text        |          No | Referencia SIGEE-AGE si se decide guardar |
| `notes`           | text        |          No | Observaciones                             |
| `is_active`       | boolean     |          Sí | Estado activo                             |
| `created_at`      | timestamptz |          Sí | Fecha de creación                         |
| `updated_at`      | timestamptz |          Sí | Fecha de actualización                    |

### 6.2 Edificios iniciales

| building_key   | Nombre inicial                          |
| -------------- | --------------------------------------- |
| `FUENLABRADA`  | Viviendas Logísticas de Fuenlabrada     |
| `VILLAVERDE`   | Viviendas Logísticas de Villaverde      |
| `ZARZAQUEMADA` | Acuartelamiento de Zarzaquemada-Leganés |
| `VALLEHERMOSO` | Acuartelamiento Vallehermoso            |
| `UPROSE`       | UPROSE                                  |

## 7. Tabla `controlled_cups`

Contiene los CUPS incluidos en la superficie de control.

### 7.1 Función

Permite saber qué CUPS pertenecen a cada edificio, qué fuente energética tienen y desde cuándo se exige factura para calcular completitud.

### 7.2 Campos

| Campo                | Tipo        | Obligatorio | Descripción                                    |
| -------------------- | ----------- | ----------: | ---------------------------------------------- |
| `id`                 | uuid        |          Sí | Identificador interno                          |
| `building_id`        | uuid        |          Sí | Edificio asociado                              |
| `energy_type_code`   | text        |          Sí | Fuente energética                              |
| `cups_original`      | text        |          Sí | CUPS como se introdujo o consta en pantalla    |
| `cups_key`           | text        |          Sí | CUPS normalizado para comparación              |
| `description`        | text        |          No | Descripción o ubicación del CUPS               |
| `supplier_name`      | text        |          No | Comercializadora/suministrador si se conoce    |
| `tariff`             | text        |          No | Tarifa/peaje si se conoce                      |
| `control_from_year`  | integer     |          Sí | Año desde el que se controla                   |
| `control_from_month` | integer     |          Sí | Mes desde el que se controla                   |
| `control_to_year`    | integer     |          No | Año hasta el que se controla                   |
| `control_to_month`   | integer     |          No | Mes hasta el que se controla                   |
| `status`             | text        |          Sí | `activo`, `baja`, `pendiente`                  |
| `source`             | text        |          No | Origen: pantallazo, alta manual, factura, etc. |
| `notes`              | text        |          No | Observaciones                                  |
| `created_at`         | timestamptz |          Sí | Fecha de creación                              |
| `updated_at`         | timestamptz |          Sí | Fecha de actualización                         |

### 7.3 Restricciones recomendadas

* `cups_key` debe estar normalizado.
* `energy_type_code` debe existir en `energy_types`.
* `building_id` debe existir en `buildings`.
* La combinación `cups_key + energy_type_code` debería ser única si se mantiene la regla de que un CUPS pertenece a un único edificio.

### 7.4 Estados

| Estado      | Significado                                   |
| ----------- | --------------------------------------------- |
| `activo`    | CUPS actualmente controlado                   |
| `baja`      | CUPS ya no exigible desde cierto mes          |
| `pendiente` | CUPS introducido, pero pendiente de confirmar |

En el seed inicial solo deben cargarse como activos los CUPS confirmados por pantallazos.

## 8. Tabla `invoice_uploads`

Registro técnico de cada archivo subido.

### 8.1 Función

Permite detectar duplicados por hash, conservar metadatos técnicos y gestionar borrado de PDF.

### 8.2 Campos

| Campo               | Tipo        | Obligatorio | Descripción                      |
| ------------------- | ----------- | ----------: | -------------------------------- |
| `id`                | uuid        |          Sí | Identificador interno            |
| `original_filename` | text        |          Sí | Nombre original del archivo      |
| `file_hash_sha256`  | text        |          Sí | Hash del contenido del PDF       |
| `file_size_bytes`   | integer     |          No | Tamaño del archivo               |
| `mime_type`         | text        |          No | Tipo MIME                        |
| `storage_path`      | text        |          No | Ruta temporal si se guarda       |
| `pdf_deleted_at`    | timestamptz |          No | Fecha de borrado del PDF         |
| `upload_status`     | text        |          Sí | Estado técnico de subida/proceso |
| `uploaded_by`       | uuid        |          No | Usuario que subió el archivo     |
| `created_at`        | timestamptz |          Sí | Fecha de subida                  |
| `updated_at`        | timestamptz |          Sí | Fecha de actualización           |

### 8.3 Estados técnicos

| Estado       | Significado          |
| ------------ | -------------------- |
| `uploaded`   | Archivo subido       |
| `processing` | En proceso de parseo |
| `processed`  | Procesado            |
| `duplicate`  | Hash ya existente    |
| `failed`     | Error técnico        |
| `deleted`    | PDF borrado          |

### 8.4 Borrado de PDFs

Cuando se borre el PDF, se debe mantener el registro `invoice_uploads` y la factura asociada. Solo se elimina el fichero.

## 9. Tabla `invoices`

Entidad central de factura procesada.

### 9.1 Función

Guarda los datos extraídos, corregidos y usados para cálculo.

### 9.2 Campos principales

| Campo                     | Tipo          | Obligatorio | Descripción                                           |
| ------------------------- | ------------- | ----------: | ----------------------------------------------------- |
| `id`                      | uuid          |          Sí | Identificador interno                                 |
| `upload_id`               | uuid          |          No | Referencia a `invoice_uploads`                        |
| `controlled_cups_id`      | uuid          |          No | CUPS controlado asociado                              |
| `building_id`             | uuid          |          No | Edificio derivado del CUPS                            |
| `energy_type_code`        | text          |          Sí | Fuente energética                                     |
| `supplier_name`           | text          |          No | Comercializadora detectada/final                      |
| `invoice_number`          | text          |          No | Número de factura                                     |
| `cups_original`           | text          |          No | CUPS detectado en factura                             |
| `cups_key`                | text          |          No | CUPS normalizado                                      |
| `period_start`            | date          |          No | Inicio del periodo facturado                          |
| `period_end`              | date          |          No | Cierre del periodo facturado                          |
| `computed_year`           | integer       |          No | Año de cómputo                                        |
| `computed_month`          | integer       |          No | Mes de cómputo                                        |
| `consumption_kwh`         | numeric(14,3) |          No | Consumo final validado                                |
| `total_amount_eur`        | numeric(14,2) |          No | Importe final validado con IVA                        |
| `status`                  | text          |          Sí | Estado de factura                                     |
| `parse_source`            | text          |          Sí | Origen del dato: parser específico, genérico o manual |
| `parser_name`             | text          |          No | Nombre del parser usado                               |
| `parser_version`          | text          |          No | Versión del parser                                    |
| `parse_confidence`        | numeric(5,4)  |          No | Confianza de extracción                               |
| `requires_visual_review`  | boolean       |          Sí | Indica si exige revisión visual                       |
| `is_duplicate`            | boolean       |          Sí | Marca de duplicado                                    |
| `duplicate_of_invoice_id` | uuid          |          No | Factura de la que es duplicado                        |
| `validated_at`            | timestamptz   |          No | Fecha de validación                                   |
| `validated_by`            | uuid          |          No | Usuario validador                                     |
| `created_at`              | timestamptz   |          Sí | Fecha de creación                                     |
| `updated_at`              | timestamptz   |          Sí | Fecha de actualización                                |

### 9.3 Campos para valores extraídos originales

Para trazabilidad mínima, conviene guardar valores extraídos antes de corrección:

| Campo                        | Tipo          | Descripción                |
| ---------------------------- | ------------- | -------------------------- |
| `extracted_supplier_name`    | text          | Comercializadora extraída  |
| `extracted_invoice_number`   | text          | Número de factura extraído |
| `extracted_cups_original`    | text          | CUPS extraído              |
| `extracted_cups_key`         | text          | CUPS normalizado extraído  |
| `extracted_period_start`     | date          | Inicio extraído            |
| `extracted_period_end`       | date          | Fin extraído               |
| `extracted_consumption_kwh`  | numeric(14,3) | Consumo extraído           |
| `extracted_total_amount_eur` | numeric(14,2) | Importe extraído           |

Los campos principales representan los valores finales usados para cálculo.

### 9.4 Estados de factura

| Estado                     | Entra en totales | Descripción             |
| -------------------------- | ---------------: | ----------------------- |
| `pendiente_validacion`     |               No | Pendiente de confirmar  |
| `validada`                 |               Sí | Confirmada sin cambios  |
| `corregida`                |               Sí | Corregida y confirmada  |
| `fuera_superficie_control` |               No | CUPS no controlado      |
| `error_parseo`             |               No | Error de extracción     |
| `requiere_carga_manual`    |               No | Faltan datos críticos   |
| `duplicada`                |               No | No debe procesarse      |
| `descartada`               |               No | Excluida por el usuario |

### 9.5 Origen de datos

| Valor               | Significado                             |
| ------------------- | --------------------------------------- |
| `parser_especifico` | Parser creado para formato concreto     |
| `parser_generico`   | Extracción basada en patrones generales |
| `manual`            | Introducción o corrección manual        |

## 10. Tabla `invoice_warnings`

Avisos o incidencias detectadas en una factura.

### 10.1 Campos

| Campo         | Tipo        | Obligatorio | Descripción                  |
| ------------- | ----------- | ----------: | ---------------------------- |
| `id`          | uuid        |          Sí | Identificador interno        |
| `invoice_id`  | uuid        |          Sí | Factura asociada             |
| `level`       | text        |          Sí | `info`, `warning`, `error`   |
| `code`        | text        |          Sí | Código estable del aviso     |
| `message`     | text        |          Sí | Mensaje visible              |
| `field_name`  | text        |          No | Campo afectado               |
| `is_blocking` | boolean     |          Sí | Indica si bloquea validación |
| `created_at`  | timestamptz |          Sí | Fecha de creación            |

### 10.2 Códigos de aviso recomendados

| Código                            | Nivel   | Bloqueante | Descripción                           |
| --------------------------------- | ------- | ---------: | ------------------------------------- |
| `CUPS_NORMALIZED`                 | info    |         No | CUPS normalizado automáticamente      |
| `GENERIC_PARSER_USED`             | warning |         No | Parser genérico usado                 |
| `LOW_CONFIDENCE`                  | warning |         No | Confianza baja/media                  |
| `MULTIPLE_AMOUNT_CANDIDATES`      | warning |         No | Varios importes posibles              |
| `MULTIPLE_CONSUMPTION_CANDIDATES` | warning |         No | Varios consumos posibles              |
| `ATYPICAL_PERIOD`                 | warning |         No | Periodo de facturación atípico        |
| `ZERO_CONSUMPTION`                | warning |         No | Consumo cero                          |
| `ZERO_OR_NEGATIVE_AMOUNT`         | warning |         No | Importe cero o negativo               |
| `POSSIBLE_RECTIFICATION`          | warning |         No | Posible rectificativa/ajuste          |
| `UNKNOWN_CUPS`                    | error   |         Sí | CUPS no detectado                     |
| `UNCONTROLLED_CUPS`               | error   |         Sí | CUPS fuera de superficie              |
| `MISSING_PERIOD_END`              | error   |         Sí | Falta fecha de cierre                 |
| `MISSING_CONSUMPTION`             | error   |         Sí | Falta consumo                         |
| `MISSING_TOTAL_AMOUNT`            | error   |         Sí | Falta importe total                   |
| `ENERGY_TYPE_MISMATCH`            | error   |         Sí | Energía incompatible con CUPS maestro |
| `DUPLICATE_INVOICE`               | error   |         Sí | Factura duplicada exacta              |
| `UNREADABLE_PDF`                  | error   |         Sí | PDF sin texto legible                 |

## 11. Tabla o vista `monthly_totals`

### 11.1 Naturaleza

Puede implementarse como:

* vista SQL calculada;
* endpoint que calcula en backend;
* tabla materializada actualizada tras validación;
* vista materializada si hiciera falta rendimiento.

Para el MVP se recomienda empezar con cálculo bajo demanda o vista SQL.

### 11.2 Nivel de agregación

```txt
Edificio + Fuente energética + Año + Mes
```

### 11.3 Campos calculados

| Campo                   | Tipo          | Descripción                           |
| ----------------------- | ------------- | ------------------------------------- |
| `building_id`           | uuid          | Edificio                              |
| `building_name`         | text          | Nombre visible                        |
| `energy_type_code`      | text          | Fuente energética                     |
| `computed_year`         | integer       | Año                                   |
| `computed_month`        | integer       | Mes                                   |
| `total_consumption_kwh` | numeric(14,3) | Suma de consumos                      |
| `total_amount_eur`      | numeric(14,2) | Suma de importes                      |
| `required_cups_count`   | integer       | CUPS exigibles                        |
| `covered_cups_count`    | integer       | CUPS con factura válida               |
| `missing_cups_count`    | integer       | CUPS faltantes                        |
| `status`                | text          | `completo`, `incompleto`, `sin_datos` |
| `warnings`              | text/json     | Avisos agregados                      |

### 11.4 Regla de cálculo

Una factura entra en el cálculo solo si:

```txt
invoice.status IN ('validada', 'corregida')
```

### 11.5 Estado

| Estado       | Regla                                                                |
| ------------ | -------------------------------------------------------------------- |
| `completo`   | Todos los CUPS exigibles tienen al menos una factura válida          |
| `incompleto` | Hay al menos un CUPS exigible sin factura válida                     |
| `sin_datos`  | No hay facturas válidas para el periodo, pero existen CUPS exigibles |

## 12. Tabla `audit_events`

Trazabilidad mínima de acciones relevantes.

### 12.1 Campos

| Campo         | Tipo        | Obligatorio | Descripción           |
| ------------- | ----------- | ----------: | --------------------- |
| `id`          | uuid        |          Sí | Identificador interno |
| `event_type`  | text        |          Sí | Tipo de evento        |
| `entity_type` | text        |          Sí | Entidad afectada      |
| `entity_id`   | uuid        |          No | ID afectado           |
| `user_id`     | uuid        |          No | Usuario               |
| `payload`     | jsonb       |          No | Datos relevantes      |
| `created_at`  | timestamptz |          Sí | Fecha del evento      |

### 12.2 Eventos recomendados

| Evento              | Descripción          |
| ------------------- | -------------------- |
| `invoice_uploaded`  | PDF subido           |
| `invoice_parsed`    | Factura parseada     |
| `invoice_validated` | Factura validada     |
| `invoice_corrected` | Factura corregida    |
| `invoice_discarded` | Factura descartada   |
| `pdf_deleted`       | PDF eliminado        |
| `cups_created`      | CUPS dado de alta    |
| `cups_deactivated`  | CUPS dado de baja    |
| `export_generated`  | Exportación generada |

## 13. Modelo relacional simplificado

```txt
energy_types 1---N controlled_cups
energy_types 1---N invoices

buildings 1---N controlled_cups
buildings 1---N invoices

controlled_cups 1---N invoices
invoice_uploads 1---0..1 invoices
invoices 1---N invoice_warnings
```

## 14. Borrado y conservación

### 14.1 PDFs

Los PDFs pueden borrarse tras la validación.

Se conserva:

* registro de subida;
* hash;
* metadatos;
* datos extraídos;
* datos finales validados.

### 14.2 Facturas

Las facturas no deberían borrarse físicamente si han sido validadas o usadas en totales.

Se pueden marcar como:

* descartada;
* duplicada;
* anulada si se añade este estado en el futuro.

### 14.3 CUPS

Los CUPS no deberían borrarse si tienen facturas asociadas.

Se dan de baja mediante vigencias.

## 15. Propuesta SQL inicial

> Nota: SQL orientativo para Supabase/PostgreSQL. Deberá revisarse durante la implementación.

```sql
create table energy_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  enabled_in_mvp boolean not null default true,
  parser_focus boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table buildings (
  id uuid primary key default gen_random_uuid(),
  building_key text not null unique,
  name text not null,
  short_name text,
  address text,
  municipality text,
  province text,
  sigee_reference text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table controlled_cups (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id),
  energy_type_code text not null references energy_types(code),
  cups_original text not null,
  cups_key text not null,
  description text,
  supplier_name text,
  tariff text,
  control_from_year integer not null,
  control_from_month integer not null check (control_from_month between 1 and 12),
  control_to_year integer,
  control_to_month integer check (control_to_month between 1 and 12),
  status text not null default 'activo',
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint controlled_cups_status_chk check (status in ('activo', 'baja', 'pendiente')),
  constraint controlled_cups_unique_key unique (cups_key, energy_type_code)
);

create table invoice_uploads (
  id uuid primary key default gen_random_uuid(),
  original_filename text not null,
  file_hash_sha256 text not null unique,
  file_size_bytes integer,
  mime_type text,
  storage_path text,
  pdf_deleted_at timestamptz,
  upload_status text not null default 'uploaded',
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_uploads_status_chk check (
    upload_status in ('uploaded', 'processing', 'processed', 'duplicate', 'failed', 'deleted')
  )
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid references invoice_uploads(id),
  controlled_cups_id uuid references controlled_cups(id),
  building_id uuid references buildings(id),
  energy_type_code text not null references energy_types(code),

  supplier_name text,
  invoice_number text,
  cups_original text,
  cups_key text,
  period_start date,
  period_end date,
  computed_year integer,
  computed_month integer check (computed_month between 1 and 12),
  consumption_kwh numeric(14,3),
  total_amount_eur numeric(14,2),

  extracted_supplier_name text,
  extracted_invoice_number text,
  extracted_cups_original text,
  extracted_cups_key text,
  extracted_period_start date,
  extracted_period_end date,
  extracted_consumption_kwh numeric(14,3),
  extracted_total_amount_eur numeric(14,2),

  status text not null default 'pendiente_validacion',
  parse_source text not null default 'parser_especifico',
  parser_name text,
  parser_version text,
  parse_confidence numeric(5,4),
  requires_visual_review boolean not null default true,
  is_duplicate boolean not null default false,
  duplicate_of_invoice_id uuid references invoices(id),

  validated_at timestamptz,
  validated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint invoices_status_chk check (
    status in (
      'pendiente_validacion',
      'validada',
      'corregida',
      'fuera_superficie_control',
      'error_parseo',
      'requiere_carga_manual',
      'duplicada',
      'descartada'
    )
  ),
  constraint invoices_parse_source_chk check (
    parse_source in ('parser_especifico', 'parser_generico', 'manual')
  )
);

create table invoice_warnings (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  level text not null,
  code text not null,
  message text not null,
  field_name text,
  is_blocking boolean not null default false,
  created_at timestamptz not null default now(),
  constraint invoice_warnings_level_chk check (level in ('info', 'warning', 'error'))
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  user_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
```

## 16. Vista orientativa de totales mensuales

> Vista orientativa. La implementación final puede resolverse en SQL o backend.

```sql
create view valid_invoice_lines as
select
  i.id as invoice_id,
  i.controlled_cups_id,
  i.building_id,
  i.energy_type_code,
  i.computed_year,
  i.computed_month,
  i.consumption_kwh,
  i.total_amount_eur
from invoices i
where i.status in ('validada', 'corregida');
```

La vista de completitud requerirá generar el conjunto de CUPS exigibles por mes consultado y cruzarlo con las facturas validadas.

Para el MVP puede implementarse esta lógica en backend para mayor claridad.

## 17. Seeds iniciales

### 17.1 `energy_types`

Debe inicializarse con:

```csv
energy_type,label,enabled_in_mvp,parser_focus,notes
electricidad,Electricidad,true,true,Parseo PDF incluido en MVP
gas_natural,Gas natural,true,true,Parseo PDF incluido en MVP
gasoleo,Gasóleo,true,false,Previsto en modelo; sin foco inicial de parseo
```

### 17.2 `buildings`

Debe inicializarse con los edificios confirmados:

```csv
building_key,building_name,notes
FUENLABRADA,Viviendas Logísticas de Fuenlabrada,Confirmar denominación final
VILLAVERDE,Viviendas Logísticas de Villaverde,Confirmar denominación final
ZARZAQUEMADA,Acuartelamiento de Zarzaquemada-Leganés,Confirmar denominación final
VALLEHERMOSO,Acuartelamiento Vallehermoso,Confirmar denominación final
UPROSE,UPROSE,Confirmar denominación final
```

### 17.3 `controlled_cups`

Debe inicializarse únicamente con CUPS confirmados por pantallazos.

TODO: Completar listado definitivo de CUPS eléctricos y gas natural confirmados.

## 18. JSON esperado para tests de parsers

Los ejemplos de facturas deben acompañarse de JSON esperado.

Formato recomendado:

```json
{
  "status": "TODO_REVIEW",
  "source_pdf": "nombre_del_pdf.pdf",
  "expected": {
    "energy_type": "electricidad",
    "supplier": "iberdrola",
    "invoice_number": "21250131040000158",
    "cups_original": "ES 0022 0000 0621 2876 CB",
    "cups_key": "ES0022000006212876CB",
    "period_start": "2024-12-10",
    "period_end": "2025-01-15",
    "computed_year": 2025,
    "computed_month": 1,
    "consumption_kwh": 88,
    "total_amount_eur": 23.70
  }
}
```

## 19. Consultas funcionales necesarias

La aplicación necesitará resolver estas consultas:

### 19.1 Buscar CUPS controlado

Entrada:

```txt
cups_key + energy_type_code
```

Salida:

```txt
controlled_cups + building
```

### 19.2 Facturas validadas por edificio/fuente/mes

Entrada:

```txt
building_id + energy_type_code + computed_year + computed_month
```

Salida:

```txt
facturas validadas/corregidas
```

### 19.3 CUPS faltantes

Entrada:

```txt
building_id + energy_type_code + year + month
```

Salida:

```txt
CUPS exigibles sin factura válida
```

### 19.4 Duplicado exacto

Entrada:

```txt
file_hash_sha256 o invoice_number + supplier_name
```

Salida:

```txt
factura existente o null
```

### 19.5 Exportación resumen

Entrada:

```txt
rango de meses, edificio opcional, fuente opcional
```

Salida:

```txt
totales por edificio/fuente/año/mes con estado
```

## 20. Consideraciones de seguridad de datos

Aunque el MVP no tendrá seguridad avanzada, el modelo debe evitar exposiciones innecesarias:

* no guardar más datos personales de los necesarios;
* no conservar PDFs si no hace falta;
* no exponer rutas públicas de PDFs;
* no guardar secretos en base de datos;
* evitar logs con contenido completo de facturas.

## 21. Decisiones pendientes

TODO: Completar listado final de CUPS controlados.

TODO: Decidir si `monthly_totals` será vista, endpoint o tabla materializada.

TODO: Definir si `validated_by` se enlaza a `auth.users` de Supabase desde el inicio.

TODO: Definir política RLS mínima en Supabase para usuario único.

TODO: Definir si se guardará `raw_text` completo del PDF o solo campos extraídos. Recomendación inicial: no guardar texto completo salvo en modo debug/desarrollo.
