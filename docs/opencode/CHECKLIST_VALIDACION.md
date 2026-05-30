# CHECKLIST_VALIDACION.md

## 1. Propósito del documento

Este documento define la checklist de validación del MVP de la aplicación auxiliar SIGEE-AGE.

Debe usarse antes de considerar terminado cualquier bloque importante y, especialmente, antes de dar por cerrado el MVP.

La checklist cubre:

* validación funcional;
* validación de reglas de negocio;
* validación técnica;
* validación de parsers;
* validación de datos;
* validación de seguridad básica;
* validación de exportaciones;
* validación de alcance.

---

## 2. Criterio general de aceptación

El MVP se considera aceptable si permite al usuario gestor:

1. Iniciar sesión.
2. Consultar edificios.
3. Consultar y mantener CUPS controlados.
4. Subir facturas PDF.
5. Procesar facturas de los formatos iniciales.
6. Revisar datos extraídos.
7. Corregir datos cuando sea necesario.
8. Validar o descartar facturas.
9. Detectar duplicados y CUPS no controlados.
10. Calcular totales mensuales por edificio y fuente energética.
11. Detectar meses incompletos.
12. Exportar CSV y Excel.
13. Mantener trazabilidad mínima.
14. No interactuar automáticamente con SIGEE-AGE.

---

## 3. Estados de validación

Usar estos estados en la revisión:

| Estado      | Significado                           |
| ----------- | ------------------------------------- |
| `OK`        | Cumple completamente                  |
| `KO`        | No cumple                             |
| `PARCIAL`   | Cumple parcialmente o requiere ajuste |
| `N/A`       | No aplica en esta fase                |
| `PENDIENTE` | No revisado todavía                   |

Formato recomendado para registrar resultados:

```txt
[OK] RF-001 Login funciona correctamente.
[KO] Parser Energía XXI no extrae CUPS.
[PARCIAL] Exportación Excel genera Totales, pero falta hoja de Avisos.
```

---

## 4. Checklist de alcance

### 4.1 Funcionalidades que deben existir

| ID      | Comprobación                                    | Estado    | Observaciones |
| ------- | ----------------------------------------------- | --------- | ------------- |
| ALC-001 | Existe login con email y contraseña             | PENDIENTE |               |
| ALC-002 | Existe cierre de sesión                         | PENDIENTE |               |
| ALC-003 | Existe navegación principal autenticada         | PENDIENTE |               |
| ALC-004 | Existe consulta de edificios                    | PENDIENTE |               |
| ALC-005 | Existe detalle de edificio                      | PENDIENTE |               |
| ALC-006 | Existe consulta de CUPS controlados             | PENDIENTE |               |
| ALC-007 | Existe alta manual de CUPS                      | PENDIENTE |               |
| ALC-008 | Existe baja lógica de CUPS                      | PENDIENTE |               |
| ALC-009 | Existe edición limitada de CUPS                 | PENDIENTE |               |
| ALC-010 | Existe subida individual de PDF                 | PENDIENTE |               |
| ALC-011 | Existe subida múltiple de PDFs                  | PENDIENTE |               |
| ALC-012 | Existe procesamiento automático de PDFs         | PENDIENTE |               |
| ALC-013 | Existe revisión de facturas                     | PENDIENTE |               |
| ALC-014 | Existe detalle de factura                       | PENDIENTE |               |
| ALC-015 | Existe corrección manual de factura             | PENDIENTE |               |
| ALC-016 | Existe validación individual                    | PENDIENTE |               |
| ALC-017 | Existe validación en bloque para facturas aptas | PENDIENTE |               |
| ALC-018 | Existe descarte de facturas                     | PENDIENTE |               |
| ALC-019 | Existe cálculo de totales mensuales             | PENDIENTE |               |
| ALC-020 | Existe detección de completitud mensual         | PENDIENTE |               |
| ALC-021 | Existe exportación CSV                          | PENDIENTE |               |
| ALC-022 | Existe exportación Excel                        | PENDIENTE |               |

### 4.2 Funcionalidades que no deben existir en el MVP

| ID      | Comprobación                                            | Estado    | Observaciones |
| ------- | ------------------------------------------------------- | --------- | ------------- |
| ALC-030 | No existe integración automática con SIGEE-AGE          | PENDIENTE |               |
| ALC-031 | No existe carga automática en SIGEE-AGE                 | PENDIENTE |               |
| ALC-032 | No existe scraping                                      | PENDIENTE |               |
| ALC-033 | No existe automatización de navegador                   | PENDIENTE |               |
| ALC-034 | No existe SSO corporativo                               | PENDIENTE |               |
| ALC-035 | No existen roles complejos                              | PENDIENTE |               |
| ALC-036 | No existen permisos por edificio                        | PENDIENTE |               |
| ALC-037 | No existe aprobación por doble usuario                  | PENDIENTE |               |
| ALC-038 | No existe OCR avanzado obligatorio                      | PENDIENTE |               |
| ALC-039 | No existe parser automático de gasóleo                  | PENDIENTE |               |
| ALC-040 | No existe prorrateo entre meses                         | PENDIENTE |               |
| ALC-041 | No existe reporting avanzado fuera de alcance           | PENDIENTE |               |
| ALC-042 | No existe almacenamiento permanente obligatorio de PDFs | PENDIENTE |               |

---

## 5. Checklist de autenticación y acceso

| ID       | Comprobación                                                  | Estado    | Observaciones |
| -------- | ------------------------------------------------------------- | --------- | ------------- |
| AUTH-001 | El usuario puede iniciar sesión con credenciales válidas      | PENDIENTE |               |
| AUTH-002 | El usuario no puede iniciar sesión con credenciales inválidas | PENDIENTE |               |
| AUTH-003 | El usuario puede cerrar sesión                                | PENDIENTE |               |
| AUTH-004 | Las rutas privadas redirigen a login sin sesión               | PENDIENTE |               |
| AUTH-005 | Tras cerrar sesión no quedan pantallas internas accesibles    | PENDIENTE |               |
| AUTH-006 | No se muestran opciones de roles avanzados                    | PENDIENTE |               |
| AUTH-007 | No se expone ninguna clave privada en el cliente              | PENDIENTE |               |
| AUTH-008 | La expiración de sesión se gestiona de forma clara            | PENDIENTE |               |

---

## 6. Checklist de navegación y pantallas

| ID     | Comprobación                                             | Estado    | Observaciones |
| ------ | -------------------------------------------------------- | --------- | ------------- |
| UI-001 | Existe layout principal autenticado                      | PENDIENTE |               |
| UI-002 | La navegación incluye Dashboard                          | PENDIENTE |               |
| UI-003 | La navegación incluye Edificios                          | PENDIENTE |               |
| UI-004 | La navegación incluye CUPS controlados                   | PENDIENTE |               |
| UI-005 | La navegación incluye Facturas/Subida                    | PENDIENTE |               |
| UI-006 | La navegación incluye Revisión                           | PENDIENTE |               |
| UI-007 | La navegación incluye Totales mensuales                  | PENDIENTE |               |
| UI-008 | La navegación incluye Exportaciones                      | PENDIENTE |               |
| UI-009 | Las pantallas tienen estados vacíos comprensibles        | PENDIENTE |               |
| UI-010 | Los errores se muestran de forma comprensible            | PENDIENTE |               |
| UI-011 | No se basa información crítica solo en colores           | PENDIENTE |               |
| UI-012 | Las acciones destructivas o sensibles piden confirmación | PENDIENTE |               |

---

## 7. Checklist de edificios

| ID      | Comprobación                                                             | Estado    | Observaciones |
| ------- | ------------------------------------------------------------------------ | --------- | ------------- |
| EDF-001 | Se muestran los edificios iniciales                                      | PENDIENTE |               |
| EDF-002 | FUENLABRADA existe con nombre correcto                                   | PENDIENTE |               |
| EDF-003 | VILLAVERDE existe con nombre correcto                                    | PENDIENTE |               |
| EDF-004 | ZARZAQUEMADA existe con nombre correcto                                  | PENDIENTE |               |
| EDF-005 | VALLEHERMOSO existe con nombre correcto                                  | PENDIENTE |               |
| EDF-006 | UPROSE existe con nombre correcto                                        | PENDIENTE |               |
| EDF-007 | Se puede abrir el detalle de edificio                                    | PENDIENTE |               |
| EDF-008 | El detalle muestra CUPS agrupados por fuente energética                  | PENDIENTE |               |
| EDF-009 | Los edificios inactivos no se usan para cálculos activos salvo histórico | PENDIENTE |               |
| EDF-010 | El edificio no se edita directamente desde una factura                   | PENDIENTE |               |

---

## 8. Checklist de CUPS controlados

### 8.1 Consulta de CUPS

| ID       | Comprobación                                          | Estado    | Observaciones |
| -------- | ----------------------------------------------------- | --------- | ------------- |
| CUPS-001 | Se muestra la lista de CUPS controlados               | PENDIENTE |               |
| CUPS-002 | Cada CUPS muestra edificio asociado                   | PENDIENTE |               |
| CUPS-003 | Cada CUPS muestra fuente energética                   | PENDIENTE |               |
| CUPS-004 | Cada CUPS muestra CUPS original                       | PENDIENTE |               |
| CUPS-005 | Cada CUPS muestra CUPS normalizado                    | PENDIENTE |               |
| CUPS-006 | Cada CUPS muestra estado                              | PENDIENTE |               |
| CUPS-007 | Cada CUPS muestra primer mes controlado               | PENDIENTE |               |
| CUPS-008 | Cada CUPS muestra último mes controlado si existe     | PENDIENTE |               |
| CUPS-009 | Se puede filtrar por edificio                         | PENDIENTE |               |
| CUPS-010 | Se puede filtrar por fuente energética                | PENDIENTE |               |
| CUPS-011 | Se puede filtrar por estado                           | PENDIENTE |               |
| CUPS-012 | Se puede buscar por texto de CUPS                     | PENDIENTE |               |
| CUPS-013 | Los CUPS dados de baja siguen visibles como histórico | PENDIENTE |               |

### 8.2 Alta de CUPS

| ID       | Comprobación                                               | Estado    | Observaciones |
| -------- | ---------------------------------------------------------- | --------- | ------------- |
| CUPS-020 | Se puede dar de alta un CUPS                               | PENDIENTE |               |
| CUPS-021 | El formulario exige edificio                               | PENDIENTE |               |
| CUPS-022 | El formulario exige fuente energética                      | PENDIENTE |               |
| CUPS-023 | El formulario exige CUPS original                          | PENDIENTE |               |
| CUPS-024 | El formulario exige primer mes a controlar                 | PENDIENTE |               |
| CUPS-025 | El sistema calcula cups_key automáticamente                | PENDIENTE |               |
| CUPS-026 | El usuario no edita manualmente cups_key                   | PENDIENTE |               |
| CUPS-027 | No se permite duplicado por cups_key + energy_type_code    | PENDIENTE |               |
| CUPS-028 | El CUPS se exige desde el primer mes indicado              | PENDIENTE |               |
| CUPS-029 | El alta queda registrada en auditoría si está implementada | PENDIENTE |               |

### 8.3 Baja de CUPS

| ID       | Comprobación                                               | Estado    | Observaciones |
| -------- | ---------------------------------------------------------- | --------- | ------------- |
| CUPS-040 | Se puede dar de baja lógica un CUPS                        | PENDIENTE |               |
| CUPS-041 | La baja exige último mes a controlar                       | PENDIENTE |               |
| CUPS-042 | La baja no borra el registro                               | PENDIENTE |               |
| CUPS-043 | La baja no borra facturas asociadas                        | PENDIENTE |               |
| CUPS-044 | El CUPS deja de exigirse desde el mes posterior            | PENDIENTE |               |
| CUPS-045 | El CUPS sigue visible como histórico                       | PENDIENTE |               |
| CUPS-046 | La baja queda registrada en auditoría si está implementada | PENDIENTE |               |

---

## 9. Checklist de normalización de CUPS

| ID        | Comprobación                                                   | Estado    | Observaciones |
| --------- | -------------------------------------------------------------- | --------- | ------------- |
| NCUPS-001 | Existe función única de normalización                          | PENDIENTE |               |
| NCUPS-002 | Elimina espacios                                               | PENDIENTE |               |
| NCUPS-003 | Convierte a mayúsculas                                         | PENDIENTE |               |
| NCUPS-004 | Conserva solo caracteres alfanuméricos                         | PENDIENTE |               |
| NCUPS-005 | Aplica regla de equivalencia de sufijos                        | PENDIENTE |               |
| NCUPS-006 | `ES 0022 0000 0621 2876 CB` normaliza a `ES0022000006212876CB` | PENDIENTE |               |
| NCUPS-007 | `ES0022000006290850YS1P` normaliza a `ES0022000006290850YS`    | PENDIENTE |               |
| NCUPS-008 | Alta de CUPS usa la función común                              | PENDIENTE |               |
| NCUPS-009 | Edición de CUPS usa la función común                           | PENDIENTE |               |
| NCUPS-010 | Procesamiento de facturas usa la función común                 | PENDIENTE |               |
| NCUPS-011 | Existen tests unitarios de normalización                       | PENDIENTE |               |
| NCUPS-012 | No hay normalizaciones alternativas dispersas                  | PENDIENTE |               |

---

## 10. Checklist de base de datos

### 10.1 Tablas principales

| ID     | Comprobación                                                  | Estado    | Observaciones |
| ------ | ------------------------------------------------------------- | --------- | ------------- |
| DB-001 | Existe tabla `energy_types`                                   | PENDIENTE |               |
| DB-002 | Existe tabla `buildings`                                      | PENDIENTE |               |
| DB-003 | Existe tabla `controlled_cups`                                | PENDIENTE |               |
| DB-004 | Existe tabla `invoice_uploads`                                | PENDIENTE |               |
| DB-005 | Existe tabla `invoices`                                       | PENDIENTE |               |
| DB-006 | Existe tabla `invoice_warnings`                               | PENDIENTE |               |
| DB-007 | Existe tabla o vista `monthly_totals` o consulta equivalente  | PENDIENTE |               |
| DB-008 | Existe tabla `audit_events` si se implementa auditoría mínima | PENDIENTE |               |

### 10.2 Restricciones y tipos

| ID     | Comprobación                                                      | Estado    | Observaciones |
| ------ | ----------------------------------------------------------------- | --------- | ------------- |
| DB-020 | `energy_types.code` es único                                      | PENDIENTE |               |
| DB-021 | `buildings.building_key` es único                                 | PENDIENTE |               |
| DB-022 | `controlled_cups` impide duplicados `cups_key + energy_type_code` | PENDIENTE |               |
| DB-023 | `controlled_cups.energy_type_code` referencia `energy_types`      | PENDIENTE |               |
| DB-024 | `controlled_cups.building_id` referencia `buildings`              | PENDIENTE |               |
| DB-025 | `control_from_month` está limitado a 1-12                         | PENDIENTE |               |
| DB-026 | `control_to_month` está limitado a 1-12 o nulo                    | PENDIENTE |               |
| DB-027 | Los estados de CUPS están controlados                             | PENDIENTE |               |
| DB-028 | Los estados de factura están controlados                          | PENDIENTE |               |
| DB-029 | Los niveles de aviso están controlados                            | PENDIENTE |               |
| DB-030 | Consumos se guardan como `numeric` o equivalente exacto           | PENDIENTE |               |
| DB-031 | Importes se guardan como `numeric` o equivalente exacto           | PENDIENTE |               |
| DB-032 | No se usa `float` para consumos                                   | PENDIENTE |               |
| DB-033 | No se usa `float` para importes                                   | PENDIENTE |               |
| DB-034 | Las tablas relevantes tienen `created_at`                         | PENDIENTE |               |
| DB-035 | Las tablas relevantes tienen `updated_at`                         | PENDIENTE |               |

### 10.3 Seeds

| ID     | Comprobación                            | Estado    | Observaciones |
| ------ | --------------------------------------- | --------- | ------------- |
| DB-050 | Seed de `electricidad` existe           | PENDIENTE |               |
| DB-051 | Seed de `gas_natural` existe            | PENDIENTE |               |
| DB-052 | Seed de `gasoleo` existe                | PENDIENTE |               |
| DB-053 | Seed de edificios iniciales existe      | PENDIENTE |               |
| DB-054 | Seed de CUPS usa solo datos confirmados | PENDIENTE |               |
| DB-055 | Seeds son idempotentes si procede       | PENDIENTE |               |
| DB-056 | No hay CUPS inventados                  | PENDIENTE |               |

---

## 11. Checklist de backend parser

### 11.1 API base

| ID      | Comprobación                                               | Estado    | Observaciones |
| ------- | ---------------------------------------------------------- | --------- | ------------- |
| API-001 | Existe aplicación FastAPI                                  | PENDIENTE |               |
| API-002 | Existe endpoint `GET /health`                              | PENDIENTE |               |
| API-003 | Existe endpoint `POST /parse-invoice`                      | PENDIENTE |               |
| API-004 | CORS está limitado a orígenes configurados                 | PENDIENTE |               |
| API-005 | Se valida que el archivo sea PDF                           | PENDIENTE |               |
| API-006 | Se valida tamaño máximo de subida                          | PENDIENTE |               |
| API-007 | Los errores no exponen trazas internas al usuario          | PENDIENTE |               |
| API-008 | El backend parser no escribe directamente en base de datos | PENDIENTE |               |
| API-009 | El backend parser no decide entrada en totales             | PENDIENTE |               |

### 11.2 Modelos Pydantic

| ID      | Comprobación                                  | Estado    | Observaciones |
| ------- | --------------------------------------------- | --------- | ------------- |
| PYD-001 | Existe `ParserWarning`                        | PENDIENTE |               |
| PYD-002 | Existe `InvoiceParseResult`                   | PENDIENTE |               |
| PYD-003 | `parse_confidence` se valida entre 0 y 1      | PENDIENTE |               |
| PYD-004 | `computed_month` se valida entre 1 y 12       | PENDIENTE |               |
| PYD-005 | Fechas usan `date`                            | PENDIENTE |               |
| PYD-006 | Importes usan `Decimal`                       | PENDIENTE |               |
| PYD-007 | Consumos usan `Decimal`                       | PENDIENTE |               |
| PYD-008 | `warnings` usa lista de `ParserWarning`       | PENDIENTE |               |
| PYD-009 | `raw_candidates` permite trazabilidad técnica | PENDIENTE |               |

### 11.3 Extracción de texto

| ID      | Comprobación                          | Estado    | Observaciones |
| ------- | ------------------------------------- | --------- | ------------- |
| TXT-001 | Extrae texto de PDF Iberdrola         | PENDIENTE |               |
| TXT-002 | Extrae texto de PDF Naturgy regulada  | PENDIENTE |               |
| TXT-003 | Extrae texto de PDF Energía XXI       | PENDIENTE |               |
| TXT-004 | Detecta PDF sin texto suficiente      | PENDIENTE |               |
| TXT-005 | Genera aviso o error `UNREADABLE_PDF` | PENDIENTE |               |
| TXT-006 | No usa OCR avanzado en el MVP         | PENDIENTE |               |

---

## 12. Checklist de detección de formato

| ID      | Comprobación                                  | Estado    | Observaciones |
| ------- | --------------------------------------------- | --------- | ------------- |
| DET-001 | Detecta Iberdrola electricidad                | PENDIENTE |               |
| DET-002 | Detecta Naturgy regulada electricidad         | PENDIENTE |               |
| DET-003 | Detecta Energía XXI gas natural               | PENDIENTE |               |
| DET-004 | Usa parser genérico si no reconoce formato    | PENDIENTE |               |
| DET-005 | El detector no extrae campos de factura       | PENDIENTE |               |
| DET-006 | Existen tests del detector                    | PENDIENTE |               |
| DET-007 | Los marcadores de Iberdrola están cubiertos   | PENDIENTE |               |
| DET-008 | Los marcadores de Naturgy están cubiertos     | PENDIENTE |               |
| DET-009 | Los marcadores de Energía XXI están cubiertos | PENDIENTE |               |

---

## 13. Checklist de parsers específicos

### 13.1 Parser Iberdrola electricidad

Datos esperados del ejemplo:

```txt
parser_name: iberdrola_electricidad
energy_type: electricidad
supplier_name: Iberdrola Clientes, S.A.U.
invoice_number: 21250131040000158
period_start: 2024-12-10
period_end: 2025-01-15
computed_year: 2025
computed_month: 1
consumption_kwh: 88
total_amount_eur: 23.70
```

| ID      | Comprobación                                  | Estado    | Observaciones |
| ------- | --------------------------------------------- | --------- | ------------- |
| PIB-001 | Detecta proveedor                             | PENDIENTE |               |
| PIB-002 | Extrae número de factura                      | PENDIENTE |               |
| PIB-003 | Extrae fecha inicio                           | PENDIENTE |               |
| PIB-004 | Extrae fecha fin                              | PENDIENTE |               |
| PIB-005 | Calcula año de cómputo                        | PENDIENTE |               |
| PIB-006 | Calcula mes de cómputo                        | PENDIENTE |               |
| PIB-007 | Extrae consumo kWh                            | PENDIENTE |               |
| PIB-008 | Extrae importe total con IVA                  | PENDIENTE |               |
| PIB-009 | Extrae CUPS si aparece en el PDF              | PENDIENTE |               |
| PIB-010 | Normaliza CUPS                                | PENDIENTE |               |
| PIB-011 | Devuelve `parse_source = parser_especifico`   | PENDIENTE |               |
| PIB-012 | Tiene test con PDF real o texto real extraído | PENDIENTE |               |

### 13.2 Parser Naturgy regulada electricidad

Datos esperados del ejemplo:

```txt
parser_name: naturgy_regulada_electricidad
energy_type: electricidad
supplier_name: Comercializadora Regulada, Gas & Power, S.A.
invoice_number: FE25137022313356
period_start: 2025-08-20
period_end: 2025-08-26
computed_year: 2025
computed_month: 8
consumption_kwh: 22
total_amount_eur: 7.80
cups_original: ES0022000006290850YS1P
cups_key: ES0022000006290850YS
```

| ID      | Comprobación                                  | Estado    | Observaciones |
| ------- | --------------------------------------------- | --------- | ------------- |
| PNA-001 | Detecta proveedor                             | PENDIENTE |               |
| PNA-002 | Extrae número de factura                      | PENDIENTE |               |
| PNA-003 | Extrae fecha inicio                           | PENDIENTE |               |
| PNA-004 | Extrae fecha fin                              | PENDIENTE |               |
| PNA-005 | Calcula año de cómputo                        | PENDIENTE |               |
| PNA-006 | Calcula mes de cómputo                        | PENDIENTE |               |
| PNA-007 | Extrae consumo kWh                            | PENDIENTE |               |
| PNA-008 | Extrae importe total con IVA                  | PENDIENTE |               |
| PNA-009 | Extrae CUPS original                          | PENDIENTE |               |
| PNA-010 | Normaliza CUPS con regla de sufijo            | PENDIENTE |               |
| PNA-011 | Devuelve `parse_source = parser_especifico`   | PENDIENTE |               |
| PNA-012 | Tiene test con PDF real o texto real extraído | PENDIENTE |               |

### 13.3 Parser Energía XXI gas natural

Datos esperados del ejemplo:

```txt
parser_name: energia_xxi_gas_natural
energy_type: gas_natural
supplier_name: Energía XXI Comercializadora de Referencia S.L.U.
invoice_number: S25CON006941700
period_start: 2024-12-23
period_end: 2025-02-27
computed_year: 2025
computed_month: 2
consumption_kwh: 8650.000
total_amount_eur: 603.71
```

| ID      | Comprobación                                  | Estado    | Observaciones |
| ------- | --------------------------------------------- | --------- | ------------- |
| PEX-001 | Detecta proveedor                             | PENDIENTE |               |
| PEX-002 | Extrae número de factura                      | PENDIENTE |               |
| PEX-003 | Extrae fecha inicio                           | PENDIENTE |               |
| PEX-004 | Extrae fecha fin                              | PENDIENTE |               |
| PEX-005 | Calcula año de cómputo                        | PENDIENTE |               |
| PEX-006 | Calcula mes de cómputo                        | PENDIENTE |               |
| PEX-007 | Extrae consumo kWh                            | PENDIENTE |               |
| PEX-008 | Convierte `8.650,000 kWh` a `8650.000`        | PENDIENTE |               |
| PEX-009 | Extrae importe total con IVA                  | PENDIENTE |               |
| PEX-010 | Convierte `603,71 €` a `603.71`               | PENDIENTE |               |
| PEX-011 | Interpreta texto en catalán                   | PENDIENTE |               |
| PEX-012 | Extrae CUPS si aparece en el PDF              | PENDIENTE |               |
| PEX-013 | Devuelve `parse_source = parser_especifico`   | PENDIENTE |               |
| PEX-014 | Tiene test con PDF real o texto real extraído | PENDIENTE |               |

### 13.4 Parser genérico

| ID      | Comprobación                              | Estado    | Observaciones |
| ------- | ----------------------------------------- | --------- | ------------- |
| PGE-001 | Se ejecuta si no hay parser específico    | PENDIENTE |               |
| PGE-002 | Devuelve `parse_source = parser_generico` | PENDIENTE |               |
| PGE-003 | `parse_confidence` no supera 0.70         | PENDIENTE |               |
| PGE-004 | Añade warning `GENERIC_PARSER_USED`       | PENDIENTE |               |
| PGE-005 | Guarda candidatos en `raw_candidates`     | PENDIENTE |               |
| PGE-006 | No permite validación en bloque           | PENDIENTE |               |
| PGE-007 | No falla si no encuentra campos           | PENDIENTE |               |

---

## 14. Checklist de carga de facturas

| ID     | Comprobación                                         | Estado    | Observaciones |
| ------ | ---------------------------------------------------- | --------- | ------------- |
| UP-001 | Se puede subir un PDF individual                     | PENDIENTE |               |
| UP-002 | Se pueden subir varios PDFs                          | PENDIENTE |               |
| UP-003 | Cada PDF se procesa de forma independiente           | PENDIENTE |               |
| UP-004 | Un fallo no bloquea el resto de archivos             | PENDIENTE |               |
| UP-005 | Se rechazan archivos no PDF                          | PENDIENTE |               |
| UP-006 | Se valida tamaño máximo                              | PENDIENTE |               |
| UP-007 | Se calcula hash SHA-256                              | PENDIENTE |               |
| UP-008 | Se registra nombre original                          | PENDIENTE |               |
| UP-009 | Se registra tamaño                                   | PENDIENTE |               |
| UP-010 | Se registra MIME type                                | PENDIENTE |               |
| UP-011 | Se crea registro `invoice_uploads`                   | PENDIENTE |               |
| UP-012 | Se crea registro `invoices` si procede               | PENDIENTE |               |
| UP-013 | Se crean `invoice_warnings` si procede               | PENDIENTE |               |
| UP-014 | No se guarda PDF en ubicación pública                | PENDIENTE |               |
| UP-015 | Si el PDF se borra, se conservan datos estructurados | PENDIENTE |               |

---

## 15. Checklist de duplicados

| ID      | Comprobación                                                                    | Estado    | Observaciones |
| ------- | ------------------------------------------------------------------------------- | --------- | ------------- |
| DUP-001 | El duplicado se detecta por hash SHA-256                                        | PENDIENTE |               |
| DUP-002 | El mismo PDF subido dos veces se marca como duplicado                           | PENDIENTE |               |
| DUP-003 | El duplicado no crea factura validable nueva                                    | PENDIENTE |               |
| DUP-004 | Se genera aviso `DUPLICATE_FILE`                                                | PENDIENTE |               |
| DUP-005 | El usuario recibe mensaje claro                                                 | PENDIENTE |               |
| DUP-006 | La detección no depende solo del nombre de archivo                              | PENDIENTE |               |
| DUP-007 | PDFs distintos del mismo CUPS y mes pueden coexistir si no son duplicado exacto | PENDIENTE |               |

---

## 16. Checklist de estados de factura

| ID      | Comprobación                                           | Estado    | Observaciones |
| ------- | ------------------------------------------------------ | --------- | ------------- |
| EST-001 | Existe estado `pendiente_validacion`                   | PENDIENTE |               |
| EST-002 | Existe estado `validada`                               | PENDIENTE |               |
| EST-003 | Existe estado `corregida`                              | PENDIENTE |               |
| EST-004 | Existe estado `fuera_superficie_control`               | PENDIENTE |               |
| EST-005 | Existe estado `error_parseo`                           | PENDIENTE |               |
| EST-006 | Existe estado `requiere_carga_manual`                  | PENDIENTE |               |
| EST-007 | Existe estado `duplicada`                              | PENDIENTE |               |
| EST-008 | Existe estado `descartada`                             | PENDIENTE |               |
| EST-009 | Solo `validada` entra en totales                       | PENDIENTE |               |
| EST-010 | Solo `corregida` entra en totales                      | PENDIENTE |               |
| EST-011 | `pendiente_validacion` no entra en totales             | PENDIENTE |               |
| EST-012 | `duplicada` no entra en totales                        | PENDIENTE |               |
| EST-013 | `descartada` no entra en totales                       | PENDIENTE |               |
| EST-014 | `fuera_superficie_control` no entra en totales         | PENDIENTE |               |
| EST-015 | `error_parseo` no entra en totales                     | PENDIENTE |               |
| EST-016 | `requiere_carga_manual` incompleta no entra en totales | PENDIENTE |               |

---

## 17. Checklist de avisos y semáforos

### 17.1 Avisos

| ID      | Comprobación                              | Estado    | Observaciones |
| ------- | ----------------------------------------- | --------- | ------------- |
| AVI-001 | Cada aviso tiene `level`                  | PENDIENTE |               |
| AVI-002 | Cada aviso tiene `code`                   | PENDIENTE |               |
| AVI-003 | Cada aviso tiene `message`                | PENDIENTE |               |
| AVI-004 | Cada aviso puede tener `field_name`       | PENDIENTE |               |
| AVI-005 | Cada aviso tiene `is_blocking`            | PENDIENTE |               |
| AVI-006 | Existen avisos `info`                     | PENDIENTE |               |
| AVI-007 | Existen avisos `warning`                  | PENDIENTE |               |
| AVI-008 | Existen avisos `error`                    | PENDIENTE |               |
| AVI-009 | Los avisos bloqueantes impiden validación | PENDIENTE |               |
| AVI-010 | Los warnings impiden validación en bloque | PENDIENTE |               |

### 17.2 Códigos mínimos de aviso

| ID      | Código                            | Comprobación                              | Estado    |
| ------- | --------------------------------- | ----------------------------------------- | --------- |
| COD-001 | `CUPS_NORMALIZED`                 | Se genera cuando procede                  | PENDIENTE |
| COD-002 | `UNKNOWN_CUPS`                    | Se genera si no se detecta CUPS           | PENDIENTE |
| COD-003 | `UNCONTROLLED_CUPS`               | Se genera si CUPS no está en superficie   | PENDIENTE |
| COD-004 | `CUPS_AFTER_DEACTIVATION`         | Se genera si factura posterior a baja     | PENDIENTE |
| COD-005 | `UNREADABLE_PDF`                  | Se genera si PDF no tiene texto legible   | PENDIENTE |
| COD-006 | `DUPLICATE_FILE`                  | Se genera si hash duplicado               | PENDIENTE |
| COD-007 | `GENERIC_PARSER_USED`             | Se genera con parser genérico             | PENDIENTE |
| COD-008 | `MISSING_REQUIRED_FIELD`          | Se genera si falta campo crítico          | PENDIENTE |
| COD-009 | `MULTIPLE_AMOUNT_CANDIDATES`      | Se genera si hay varios importes posibles | PENDIENTE |
| COD-010 | `MULTIPLE_CONSUMPTION_CANDIDATES` | Se genera si hay varios consumos posibles | PENDIENTE |

### 17.3 Semáforo

| ID      | Comprobación                                           | Estado    | Observaciones |
| ------- | ------------------------------------------------------ | --------- | ------------- |
| SEM-001 | Factura sin incidencias queda verde                    | PENDIENTE |               |
| SEM-002 | Factura con warning no bloqueante queda amarilla       | PENDIENTE |               |
| SEM-003 | Factura con error bloqueante queda roja                | PENDIENTE |               |
| SEM-004 | Factura con parser genérico queda amarilla como mínimo | PENDIENTE |               |
| SEM-005 | Factura duplicada queda roja o bloqueada               | PENDIENTE |               |
| SEM-006 | Factura con CUPS no controlado queda roja o bloqueada  | PENDIENTE |               |
| SEM-007 | El semáforo devuelve texto además de color             | PENDIENTE |               |
| SEM-008 | La lógica de semáforo está centralizada                | PENDIENTE |               |
| SEM-009 | Existen tests de semáforo                              | PENDIENTE |               |

---

## 18. Checklist de revisión y corrección de facturas

| ID      | Comprobación                                           | Estado    | Observaciones |
| ------- | ------------------------------------------------------ | --------- | ------------- |
| REV-001 | Se listan facturas procesadas                          | PENDIENTE |               |
| REV-002 | Se puede filtrar por estado                            | PENDIENTE |               |
| REV-003 | Se puede filtrar por semáforo                          | PENDIENTE |               |
| REV-004 | Se puede filtrar por edificio                          | PENDIENTE |               |
| REV-005 | Se puede filtrar por fuente energética                 | PENDIENTE |               |
| REV-006 | Se puede filtrar por año/mes                           | PENDIENTE |               |
| REV-007 | Se puede abrir detalle de factura                      | PENDIENTE |               |
| REV-008 | El detalle muestra datos extraídos                     | PENDIENTE |               |
| REV-009 | El detalle muestra datos finales/corregidos si existen | PENDIENTE |               |
| REV-010 | El detalle muestra avisos                              | PENDIENTE |               |
| REV-011 | El detalle muestra semáforo                            | PENDIENTE |               |
| REV-012 | El detalle muestra PDF si está disponible              | PENDIENTE |               |
| REV-013 | Se puede corregir CUPS                                 | PENDIENTE |               |
| REV-014 | Al corregir CUPS se recalcula cups_key                 | PENDIENTE |               |
| REV-015 | Al corregir CUPS se recalcula edificio                 | PENDIENTE |               |
| REV-016 | Se puede corregir fuente energética                    | PENDIENTE |               |
| REV-017 | Se puede corregir fecha inicio                         | PENDIENTE |               |
| REV-018 | Se puede corregir fecha fin                            | PENDIENTE |               |
| REV-019 | Al corregir fecha fin se recalcula año/mes de cómputo  | PENDIENTE |               |
| REV-020 | Se puede corregir consumo                              | PENDIENTE |               |
| REV-021 | Se puede corregir importe                              | PENDIENTE |               |
| REV-022 | Se puede corregir número de factura                    | PENDIENTE |               |
| REV-023 | La corrección queda auditada si está implementada      | PENDIENTE |               |

---

## 19. Checklist de validación y descarte

### 19.1 Validación individual

| ID      | Comprobación                                      | Estado    | Observaciones |
| ------- | ------------------------------------------------- | --------- | ------------- |
| VAL-001 | Se puede validar factura sin errores bloqueantes  | PENDIENTE |               |
| VAL-002 | No se puede validar factura con error bloqueante  | PENDIENTE |               |
| VAL-003 | Si no hubo cambios, queda `validada`              | PENDIENTE |               |
| VAL-004 | Si hubo cambios, queda `corregida`                | PENDIENTE |               |
| VAL-005 | Se registra `validated_at`                        | PENDIENTE |               |
| VAL-006 | Se registra `validated_by` si procede             | PENDIENTE |               |
| VAL-007 | La validación queda auditada si está implementada | PENDIENTE |               |
| VAL-008 | La factura validada entra en totales              | PENDIENTE |               |
| VAL-009 | La factura corregida entra en totales             | PENDIENTE |               |

### 19.2 Validación en bloque

| ID      | Comprobación                              | Estado    | Observaciones |
| ------- | ----------------------------------------- | --------- | ------------- |
| VBL-001 | Solo permite facturas verdes              | PENDIENTE |               |
| VBL-002 | Excluye facturas amarillas                | PENDIENTE |               |
| VBL-003 | Excluye facturas rojas                    | PENDIENTE |               |
| VBL-004 | Excluye parser genérico                   | PENDIENTE |               |
| VBL-005 | Excluye facturas con warnings             | PENDIENTE |               |
| VBL-006 | Excluye facturas con errores              | PENDIENTE |               |
| VBL-007 | Pide confirmación antes de validar        | PENDIENTE |               |
| VBL-008 | Muestra número de facturas a validar      | PENDIENTE |               |
| VBL-009 | Reutiliza lógica de validación individual | PENDIENTE |               |

### 19.3 Descarte

| ID      | Comprobación                                    | Estado    | Observaciones |
| ------- | ----------------------------------------------- | --------- | ------------- |
| DES-001 | Se puede descartar una factura                  | PENDIENTE |               |
| DES-002 | El descarte pide confirmación                   | PENDIENTE |               |
| DES-003 | El descarte permite motivo opcional             | PENDIENTE |               |
| DES-004 | La factura pasa a estado `descartada`           | PENDIENTE |               |
| DES-005 | La factura descartada no entra en totales       | PENDIENTE |               |
| DES-006 | La factura descartada sigue consultable         | PENDIENTE |               |
| DES-007 | El descarte queda auditado si está implementado | PENDIENTE |               |

---

## 20. Checklist de regla de imputación mensual

| ID      | Comprobación                                            | Estado    | Observaciones |
| ------- | ------------------------------------------------------- | --------- | ------------- |
| IMP-001 | El año de cómputo sale de `period_end`                  | PENDIENTE |               |
| IMP-002 | El mes de cómputo sale de `period_end`                  | PENDIENTE |               |
| IMP-003 | No se hace prorrateo entre meses                        | PENDIENTE |               |
| IMP-004 | Periodo `10/12/2024 - 15/01/2025` imputa a enero 2025   | PENDIENTE |               |
| IMP-005 | Periodo `23/12/2024 - 27/02/2025` imputa a febrero 2025 | PENDIENTE |               |
| IMP-006 | Si se corrige `period_end`, se recalcula cómputo        | PENDIENTE |               |
| IMP-007 | Existen tests de cálculo de cómputo                     | PENDIENTE |               |

---

## 21. Checklist de totales mensuales

| ID      | Comprobación                                                        | Estado    | Observaciones |
| ------- | ------------------------------------------------------------------- | --------- | ------------- |
| TOT-001 | Los totales agrupan por edificio                                    | PENDIENTE |               |
| TOT-002 | Los totales agrupan por fuente energética                           | PENDIENTE |               |
| TOT-003 | Los totales agrupan por año                                         | PENDIENTE |               |
| TOT-004 | Los totales agrupan por mes                                         | PENDIENTE |               |
| TOT-005 | Suman consumo kWh                                                   | PENDIENTE |               |
| TOT-006 | Suman importe total con IVA                                         | PENDIENTE |               |
| TOT-007 | Cuentan facturas incluidas                                          | PENDIENTE |               |
| TOT-008 | Solo suman facturas `validada`                                      | PENDIENTE |               |
| TOT-009 | Solo suman facturas `corregida`                                     | PENDIENTE |               |
| TOT-010 | No suman facturas pendientes                                        | PENDIENTE |               |
| TOT-011 | No suman facturas duplicadas                                        | PENDIENTE |               |
| TOT-012 | No suman facturas descartadas                                       | PENDIENTE |               |
| TOT-013 | No suman facturas fuera de superficie                               | PENDIENTE |               |
| TOT-014 | No suman facturas con error de parseo                               | PENDIENTE |               |
| TOT-015 | Varias facturas distintas del mismo CUPS y mes se suman             | PENDIENTE |               |
| TOT-016 | Los importes mantienen precisión decimal                            | PENDIENTE |               |
| TOT-017 | Los consumos mantienen precisión decimal                            | PENDIENTE |               |
| TOT-018 | Los totales cambian al validar una factura                          | PENDIENTE |               |
| TOT-019 | Los totales cambian al descartar una factura validada si se permite | PENDIENTE |               |

---

## 22. Checklist de completitud mensual

| ID      | Comprobación                                               | Estado    | Observaciones |
| ------- | ---------------------------------------------------------- | --------- | ------------- |
| COM-001 | Se calculan CUPS exigibles por edificio, fuente, año y mes | PENDIENTE |               |
| COM-002 | Se respeta `control_from_year/month`                       | PENDIENTE |               |
| COM-003 | Se respeta `control_to_year/month`                         | PENDIENTE |               |
| COM-004 | CUPS sin `control_to` se considera activo                  | PENDIENTE |               |
| COM-005 | CUPS dado de baja no se exige después del último mes       | PENDIENTE |               |
| COM-006 | CUPS de alta futura no se exige antes del primer mes       | PENDIENTE |               |
| COM-007 | Se detectan CUPS con factura válida                        | PENDIENTE |               |
| COM-008 | Se detectan CUPS faltantes                                 | PENDIENTE |               |
| COM-009 | Un mes con todos los CUPS cubiertos queda completo         | PENDIENTE |               |
| COM-010 | Un mes con CUPS faltantes queda incompleto                 | PENDIENTE |               |
| COM-011 | Los totales incompletos se muestran igualmente             | PENDIENTE |               |
| COM-012 | Los totales incompletos muestran aviso                     | PENDIENTE |               |
| COM-013 | El detalle de total mensual muestra CUPS faltantes         | PENDIENTE |               |
| COM-014 | Existen tests de completitud                               | PENDIENTE |               |

---

## 23. Checklist de exportación CSV

| ID      | Comprobación                                | Estado    | Observaciones |
| ------- | ------------------------------------------- | --------- | ------------- |
| CSV-001 | Se puede descargar CSV                      | PENDIENTE |               |
| CSV-002 | Respeta filtros aplicados                   | PENDIENTE |               |
| CSV-003 | Incluye `building_key`                      | PENDIENTE |               |
| CSV-004 | Incluye `building_name`                     | PENDIENTE |               |
| CSV-005 | Incluye `energy_type_code`                  | PENDIENTE |               |
| CSV-006 | Incluye `year`                              | PENDIENTE |               |
| CSV-007 | Incluye `month`                             | PENDIENTE |               |
| CSV-008 | Incluye `total_consumption_kwh`             | PENDIENTE |               |
| CSV-009 | Incluye `total_amount_eur`                  | PENDIENTE |               |
| CSV-010 | Incluye `invoice_count`                     | PENDIENTE |               |
| CSV-011 | Incluye `is_complete`                       | PENDIENTE |               |
| CSV-012 | Incluye `missing_cups`                      | PENDIENTE |               |
| CSV-013 | Incluye `warnings`                          | PENDIENTE |               |
| CSV-014 | No incluye facturas no validadas en totales | PENDIENTE |               |
| CSV-015 | Es compatible con Excel/LibreOffice         | PENDIENTE |               |
| CSV-016 | Registra evento de exportación si procede   | PENDIENTE |               |

---

## 24. Checklist de exportación Excel

| ID      | Comprobación                                | Estado    | Observaciones |
| ------- | ------------------------------------------- | --------- | ------------- |
| XLS-001 | Se puede descargar Excel                    | PENDIENTE |               |
| XLS-002 | El Excel se abre correctamente              | PENDIENTE |               |
| XLS-003 | Incluye hoja `Totales`                      | PENDIENTE |               |
| XLS-004 | Incluye hoja `Facturas incluidas`           | PENDIENTE |               |
| XLS-005 | Incluye hoja `CUPS faltantes`               | PENDIENTE |               |
| XLS-006 | Incluye hoja `Avisos`                       | PENDIENTE |               |
| XLS-007 | Los datos coinciden con pantalla            | PENDIENTE |               |
| XLS-008 | Distingue totales completos e incompletos   | PENDIENTE |               |
| XLS-009 | Respeta filtros aplicados                   | PENDIENTE |               |
| XLS-010 | No incluye PDFs                             | PENDIENTE |               |
| XLS-011 | No incluye facturas no validadas en totales | PENDIENTE |               |
| XLS-012 | Registra evento de exportación si procede   | PENDIENTE |               |

---

## 25. Checklist de auditoría mínima

| ID      | Comprobación                                          | Estado    | Observaciones |
| ------- | ----------------------------------------------------- | --------- | ------------- |
| AUD-001 | Se registra alta de CUPS                              | PENDIENTE |               |
| AUD-002 | Se registra baja de CUPS                              | PENDIENTE |               |
| AUD-003 | Se registra corrección de factura                     | PENDIENTE |               |
| AUD-004 | Se registra validación de factura                     | PENDIENTE |               |
| AUD-005 | Se registra descarte de factura                       | PENDIENTE |               |
| AUD-006 | Se registra exportación                               | PENDIENTE |               |
| AUD-007 | La auditoría no almacena datos innecesarios           | PENDIENTE |               |
| AUD-008 | La auditoría no se ha convertido en workflow complejo | PENDIENTE |               |

---

## 26. Checklist de seguridad básica

| ID      | Comprobación                                                    | Estado    | Observaciones |
| ------- | --------------------------------------------------------------- | --------- | ------------- |
| SEG-001 | No hay secretos reales en el repositorio                        | PENDIENTE |               |
| SEG-002 | `.env.example` no contiene credenciales reales                  | PENDIENTE |               |
| SEG-003 | El frontend no usa claves privadas                              | PENDIENTE |               |
| SEG-004 | Las rutas privadas requieren sesión                             | PENDIENTE |               |
| SEG-005 | Supabase RLS o control equivalente está considerado             | PENDIENTE |               |
| SEG-006 | PDFs no son públicos por defecto                                | PENDIENTE |               |
| SEG-007 | Subida valida MIME/extensión PDF                                | PENDIENTE |               |
| SEG-008 | Subida valida tamaño máximo                                     | PENDIENTE |               |
| SEG-009 | Errores técnicos no exponen trazas sensibles                    | PENDIENTE |               |
| SEG-010 | CORS está limitado por configuración                            | PENDIENTE |               |
| SEG-011 | No se permite acceso a datos sin sesión                         | PENDIENTE |               |
| SEG-012 | No se conservan PDFs permanentemente salvo decisión expresa     | PENDIENTE |               |
| SEG-013 | Si se borran PDFs, se conservan metadatos y datos estructurados | PENDIENTE |               |

---

## 27. Checklist de pruebas automatizadas

| ID       | Comprobación                                            | Estado    | Observaciones |
| -------- | ------------------------------------------------------- | --------- | ------------- |
| TEST-001 | Tests de normalización de CUPS                          | PENDIENTE |               |
| TEST-002 | Tests de conversión de importes                         | PENDIENTE |               |
| TEST-003 | Tests de conversión de consumos                         | PENDIENTE |               |
| TEST-004 | Tests de parseo de fechas españolas                     | PENDIENTE |               |
| TEST-005 | Tests de parseo de fechas catalanas                     | PENDIENTE |               |
| TEST-006 | Tests de cálculo de año/mes de cómputo                  | PENDIENTE |               |
| TEST-007 | Tests de detector de formato                            | PENDIENTE |               |
| TEST-008 | Tests de parser Iberdrola                               | PENDIENTE |               |
| TEST-009 | Tests de parser Naturgy                                 | PENDIENTE |               |
| TEST-010 | Tests de parser Energía XXI                             | PENDIENTE |               |
| TEST-011 | Tests de parser genérico                                | PENDIENTE |               |
| TEST-012 | Tests de duplicados por hash                            | PENDIENTE |               |
| TEST-013 | Tests de asignación de estado inicial                   | PENDIENTE |               |
| TEST-014 | Tests de semáforo                                       | PENDIENTE |               |
| TEST-015 | Tests de validación individual                          | PENDIENTE |               |
| TEST-016 | Tests de CUPS exigibles                                 | PENDIENTE |               |
| TEST-017 | Tests de completitud mensual                            | PENDIENTE |               |
| TEST-018 | Tests de agregación de totales                          | PENDIENTE |               |
| TEST-019 | Existe comando documentado para ejecutar tests frontend | PENDIENTE |               |
| TEST-020 | Existe comando documentado para ejecutar tests backend  | PENDIENTE |               |

---

## 28. Checklist de calidad de código

| ID       | Comprobación                                      | Estado    | Observaciones |
| -------- | ------------------------------------------------- | --------- | ------------- |
| CODQ-001 | TypeScript usa tipos estrictos                    | PENDIENTE |               |
| CODQ-002 | No hay `any` innecesarios                         | PENDIENTE |               |
| CODQ-003 | Python usa modelos Pydantic donde procede         | PENDIENTE |               |
| CODQ-004 | Python usa `Decimal` en importes y consumos       | PENDIENTE |               |
| CODQ-005 | La lógica crítica está en servicios reutilizables | PENDIENTE |               |
| CODQ-006 | No hay duplicación de reglas de negocio           | PENDIENTE |               |
| CODQ-007 | No hay normalización de CUPS duplicada            | PENDIENTE |               |
| CODQ-008 | Los parsers están desacoplados                    | PENDIENTE |               |
| CODQ-009 | El frontend no parsea PDFs                        | PENDIENTE |               |
| CODQ-010 | El parser no decide reglas de negocio de totales  | PENDIENTE |               |
| CODQ-011 | Los errores están gestionados                     | PENDIENTE |               |
| CODQ-012 | El lint pasa                                      | PENDIENTE |               |
| CODQ-013 | El formateo pasa                                  | PENDIENTE |               |
| CODQ-014 | No hay código muerto relevante                    | PENDIENTE |               |
| CODQ-015 | No hay logs sensibles                             | PENDIENTE |               |

---

## 29. Checklist de documentación técnica

| ID      | Comprobación                                                  | Estado    | Observaciones |
| ------- | ------------------------------------------------------------- | --------- | ------------- |
| DOC-001 | README existe                                                 | PENDIENTE |               |
| DOC-002 | README explica propósito del proyecto                         | PENDIENTE |               |
| DOC-003 | README advierte que no se integra con SIGEE-AGE               | PENDIENTE |               |
| DOC-004 | README incluye stack                                          | PENDIENTE |               |
| DOC-005 | README incluye estructura de carpetas                         | PENDIENTE |               |
| DOC-006 | README incluye variables de entorno                           | PENDIENTE |               |
| DOC-007 | README incluye comandos de instalación                        | PENDIENTE |               |
| DOC-008 | README incluye comandos de ejecución                          | PENDIENTE |               |
| DOC-009 | README incluye comandos de test                               | PENDIENTE |               |
| DOC-010 | Existen `.env.example` necesarios                             | PENDIENTE |               |
| DOC-011 | Las decisiones técnicas relevantes están documentadas         | PENDIENTE |               |
| DOC-012 | La documentación no contradice el comportamiento implementado | PENDIENTE |               |

---

## 30. Validación funcional paso a paso

Usar este guion para la prueba final del MVP.

### 30.1 Preparación

| Paso   | Acción                  | Resultado esperado             | Estado    |
| ------ | ----------------------- | ------------------------------ | --------- |
| VF-001 | Arrancar frontend       | La aplicación carga sin error  | PENDIENTE |
| VF-002 | Arrancar backend parser | `/health` responde OK          | PENDIENTE |
| VF-003 | Aplicar migraciones     | Base de datos creada           | PENDIENTE |
| VF-004 | Ejecutar seeds          | Catálogos y edificios cargados | PENDIENTE |
| VF-005 | Crear usuario gestor    | Usuario puede autenticarse     | PENDIENTE |

### 30.2 Flujo principal

| Paso   | Acción                             | Resultado esperado                | Estado    |
| ------ | ---------------------------------- | --------------------------------- | --------- |
| VF-010 | Iniciar sesión                     | Redirige a Dashboard              | PENDIENTE |
| VF-011 | Abrir Edificios                    | Muestra edificios iniciales       | PENDIENTE |
| VF-012 | Abrir detalle de un edificio       | Muestra CUPS asociados            | PENDIENTE |
| VF-013 | Abrir CUPS controlados             | Muestra superficie de control     | PENDIENTE |
| VF-014 | Subir PDF Iberdrola                | Se procesa y extrae datos         | PENDIENTE |
| VF-015 | Subir PDF Naturgy                  | Se procesa y extrae datos         | PENDIENTE |
| VF-016 | Subir PDF Energía XXI              | Se procesa y extrae datos         | PENDIENTE |
| VF-017 | Subir de nuevo el mismo PDF        | Se detecta duplicado              | PENDIENTE |
| VF-018 | Abrir Revisión                     | Se ven facturas procesadas        | PENDIENTE |
| VF-019 | Abrir detalle de factura           | Se ven datos, avisos y acciones   | PENDIENTE |
| VF-020 | Corregir un dato de factura        | Se recalculan reglas dependientes | PENDIENTE |
| VF-021 | Validar factura individual         | Pasa a validada/corregida         | PENDIENTE |
| VF-022 | Intentar validar factura con error | El sistema lo impide              | PENDIENTE |
| VF-023 | Validar en bloque facturas verdes  | Solo se validan facturas aptas    | PENDIENTE |
| VF-024 | Abrir Totales mensuales            | Se ven totales agregados          | PENDIENTE |
| VF-025 | Abrir detalle de total             | Se ven facturas y CUPS faltantes  | PENDIENTE |
| VF-026 | Exportar CSV                       | Se descarga archivo válido        | PENDIENTE |
| VF-027 | Exportar Excel                     | Se descarga archivo válido        | PENDIENTE |
| VF-028 | Cerrar sesión                      | Vuelve a login                    | PENDIENTE |

---

## 31. Validación de ejemplos reales

### 31.1 Ejemplo Iberdrola electricidad

| Campo       | Valor esperado               | Estado    | Observaciones |
| ----------- | ---------------------------- | --------- | ------------- |
| Parser      | `iberdrola_electricidad`     | PENDIENTE |               |
| Energía     | `electricidad`               | PENDIENTE |               |
| Proveedor   | `Iberdrola Clientes, S.A.U.` | PENDIENTE |               |
| Factura     | `21250131040000158`          | PENDIENTE |               |
| Inicio      | `2024-12-10`                 | PENDIENTE |               |
| Fin         | `2025-01-15`                 | PENDIENTE |               |
| Año cómputo | `2025`                       | PENDIENTE |               |
| Mes cómputo | `1`                          | PENDIENTE |               |
| Consumo     | `88`                         | PENDIENTE |               |
| Importe     | `23.70`                      | PENDIENTE |               |

### 31.2 Ejemplo Naturgy regulada electricidad

| Campo            | Valor esperado                                 | Estado    | Observaciones |
| ---------------- | ---------------------------------------------- | --------- | ------------- |
| Parser           | `naturgy_regulada_electricidad`                | PENDIENTE |               |
| Energía          | `electricidad`                                 | PENDIENTE |               |
| Proveedor        | `Comercializadora Regulada, Gas & Power, S.A.` | PENDIENTE |               |
| Factura          | `FE25137022313356`                             | PENDIENTE |               |
| Inicio           | `2025-08-20`                                   | PENDIENTE |               |
| Fin              | `2025-08-26`                                   | PENDIENTE |               |
| Año cómputo      | `2025`                                         | PENDIENTE |               |
| Mes cómputo      | `8`                                            | PENDIENTE |               |
| Consumo          | `22`                                           | PENDIENTE |               |
| Importe          | `7.80`                                         | PENDIENTE |               |
| CUPS original    | `ES0022000006290850YS1P`                       | PENDIENTE |               |
| CUPS normalizado | `ES0022000006290850YS`                         | PENDIENTE |               |

### 31.3 Ejemplo Energía XXI gas natural

| Campo       | Valor esperado                                      | Estado    | Observaciones |
| ----------- | --------------------------------------------------- | --------- | ------------- |
| Parser      | `energia_xxi_gas_natural`                           | PENDIENTE |               |
| Energía     | `gas_natural`                                       | PENDIENTE |               |
| Proveedor   | `Energía XXI Comercializadora de Referencia S.L.U.` | PENDIENTE |               |
| Factura     | `S25CON006941700`                                   | PENDIENTE |               |
| Inicio      | `2024-12-23`                                        | PENDIENTE |               |
| Fin         | `2025-02-27`                                        | PENDIENTE |               |
| Año cómputo | `2025`                                              | PENDIENTE |               |
| Mes cómputo | `2`                                                 | PENDIENTE |               |
| Consumo     | `8650.000`                                          | PENDIENTE |               |
| Importe     | `603.71`                                            | PENDIENTE |               |

---

## 32. Comandos de validación recomendados

Adaptar al stack final del repositorio.

```bash
# Instalar dependencias
npm install

# Ejecutar frontend
npm run dev --workspace apps/web

# Lint frontend
npm run lint --workspace apps/web

# Tests frontend/shared
npm run test --workspace apps/web
npm run test --workspace packages/shared

# Backend parser
cd apps/parser-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Tests backend parser
pytest
```

Si el proyecto usa otros comandos, actualizar esta sección.

---

## 33. Registro de incidencias

Usar esta tabla para registrar errores detectados durante la validación.

| ID incidencia | Fecha | Bloque | Descripción | Severidad | Estado | Responsable | Observaciones |
| ------------- | ----- | ------ | ----------- | --------- | ------ | ----------- | ------------- |
| INC-001       |       |        |             |           |        |             |               |
| INC-002       |       |        |             |           |        |             |               |
| INC-003       |       |        |             |           |        |             |               |

Severidades recomendadas:

| Severidad | Significado                                        |
| --------- | -------------------------------------------------- |
| Crítica   | Bloquea flujo principal o genera datos incorrectos |
| Alta      | Afecta a funcionalidad importante                  |
| Media     | Afecta a uso o claridad, pero tiene alternativa    |
| Baja      | Mejora menor o ajuste visual                       |

---

## 34. Criterio de bloqueo de entrega

El MVP no debe darse por terminado si existe cualquiera de estas situaciones:

* No funciona login.
* Las rutas privadas son accesibles sin sesión.
* No se pueden subir PDFs.
* No se procesa al menos uno de los formatos principales.
* Los parsers devuelven importes o consumos erróneos en ejemplos reales.
* Se usa `float` para importes o consumos.
* No se detectan duplicados exactos.
* Se permite validar una factura con error bloqueante.
* Facturas pendientes o descartadas entran en totales.
* El mes de cómputo no se calcula desde `period_end`.
* Se hace prorrateo entre meses.
* No se pueden exportar resultados.
* Hay secretos reales en el repositorio.
* La aplicación interactúa automáticamente con SIGEE-AGE.

---

## 35. Criterio de cierre del MVP

El MVP puede considerarse cerrado cuando:

1. Todas las comprobaciones críticas están en `OK`.
2. No hay incidencias críticas ni altas abiertas.
3. Los ejemplos reales se procesan correctamente o sus limitaciones están documentadas.
4. Los totales solo usan facturas validadas o corregidas.
5. La completitud mensual identifica CUPS faltantes.
6. Las exportaciones CSV y Excel funcionan.
7. La seguridad básica está revisada.
8. La documentación técnica permite arrancar y probar el proyecto.
9. No se ha implementado funcionalidad fuera de alcance.
10. El usuario gestor puede usar la herramienta como apoyo para carga manual en SIGEE-AGE.

---

## 36. Resultado final de validación

Completar al final de la revisión.

```txt
Fecha de validación:
Responsable:
Versión/revisión del repositorio:

Resultado general:
[ ] Apto para revisión funcional
[ ] Apto para prueba de usuario
[ ] Apto para cierre MVP
[ ] No apto

Resumen:

Incidencias críticas abiertas:

Incidencias altas abiertas:

Limitaciones conocidas:

Siguiente acción recomendada:
```
