# Exportaciones

## 1. Propósito del documento

Este documento define las exportaciones previstas para el MVP de la aplicación auxiliar SIGEE-AGE.

Su objetivo es establecer qué información debe poder descargar el usuario gestor, con qué estructura, qué filtros aplican y qué reglas deben respetarse para que los datos exportados puedan utilizarse como apoyo a la carga manual en SIGEE-AGE.

Este documento debe servir como referencia para:

* diseño funcional;
* implementación frontend;
* implementación backend;
* generación de CSV y Excel;
* pruebas de aceptación;
* validación de resultados mensuales.

## 2. Principios generales

### 2.1 Exportación como apoyo a carga manual

Las exportaciones no sustituyen a SIGEE-AGE ni implican integración automática.

Su finalidad es entregar al usuario una tabla clara, revisable y trazable con los datos consolidados que posteriormente se introducirán manualmente en SIGEE-AGE.

### 2.2 Datos validados

Las exportaciones de resultados deben basarse exclusivamente en facturas que entren en totales.

Solo se exportarán como datos consolidados las facturas con estado:

* `validada`;
* `corregida`.

No deben alimentar los totales exportados:

* facturas pendientes de validación;
* facturas duplicadas;
* facturas descartadas;
* facturas fuera de superficie de control;
* facturas con error de parseo;
* facturas que requieren carga manual y no han sido completadas;
* facturas con avisos bloqueantes pendientes.

### 2.3 Trazabilidad

La exportación principal debe permitir al usuario saber qué se debe introducir en SIGEE-AGE.

Además, debe existir una exportación de detalle que permita justificar cada total mensual mediante sus facturas y CUPS asociados.

### 2.4 Formatos previstos

El MVP debe contemplar, como mínimo:

* CSV;
* Excel `.xlsx`.

El CSV será útil para tratamiento simple o importación en otras herramientas.

El Excel será el formato más cómodo para revisión funcional por parte del usuario gestor.

## 3. Tipos de exportación

El MVP debe contemplar tres exportaciones principales:

| Código  | Exportación         | Finalidad                                                                         |
| ------- | ------------------- | --------------------------------------------------------------------------------- |
| EXP-001 | Resumen mensual     | Datos consolidados por edificio, fuente energética, año y mes                     |
| EXP-002 | Detalle de facturas | Facturas que alimentan los totales o están relacionadas con el periodo consultado |
| EXP-003 | CUPS faltantes      | CUPS exigibles sin factura válida para un mes concreto                            |

Como evolución posterior se podrán añadir exportaciones administrativas o analíticas, pero no son necesarias para la primera versión.

## 4. EXP-001 Resumen mensual

### 4.1 Objetivo

Exportar la tabla principal que el usuario necesita para preparar la carga manual en SIGEE-AGE.

El nivel de agregación será:

```txt
Edificio + Fuente energética + Año + Mes
```

### 4.2 Datos incluidos

Columnas recomendadas:

| Columna                 | Descripción                            |
| ----------------------- | -------------------------------------- |
| `building_key`          | Código interno del edificio            |
| `building_name`         | Nombre visible del edificio            |
| `energy_type_code`      | Código de fuente energética            |
| `energy_type_label`     | Nombre visible de la fuente energética |
| `year`                  | Año de cómputo                         |
| `month`                 | Mes de cómputo                         |
| `month_label`           | Mes en formato legible                 |
| `total_consumption_kwh` | Suma de consumo validado en kWh        |
| `total_amount_eur`      | Suma de importes con IVA incluido      |
| `expected_cups_count`   | Número de CUPS exigibles               |
| `covered_cups_count`    | Número de CUPS con factura válida      |
| `missing_cups_count`    | Número de CUPS faltantes               |
| `invoice_count`         | Número de facturas válidas incluidas   |
| `completeness_status`   | Estado de completitud                  |
| `has_warnings`          | Indica si existen avisos relevantes    |
| `warnings_summary`      | Resumen breve de avisos                |

### 4.3 Estados de completitud

Valores recomendados:

| Estado               | Significado                                                    |
| -------------------- | -------------------------------------------------------------- |
| `completo`           | Todos los CUPS exigibles tienen al menos una factura válida    |
| `incompleto`         | Falta al menos un CUPS exigible                                |
| `sin_cups_exigibles` | No hay CUPS controlados exigibles para ese edificio/fuente/mes |
| `sin_facturas`       | Hay CUPS exigibles pero no hay ninguna factura válida          |

### 4.4 Reglas de cálculo

El consumo total se calculará como:

```txt
SUM(consumption_kwh) de facturas validadas/corregidas
```

El gasto total se calculará como:

```txt
SUM(total_amount_eur) de facturas validadas/corregidas
```

El mes de cómputo ya viene determinado por la fecha de cierre del periodo de facturación.

No se realizará prorrateo.

### 4.5 Tratamiento de varias facturas del mismo CUPS y mes

Si existen varias facturas válidas para el mismo CUPS y mes, deben sumarse.

Esto cubre:

* rectificativas;
* ajustes;
* facturación partida;
* refacturaciones válidas.

En el resumen mensual debe aparecer el total agregado, no una fila separada por cada factura.

### 4.6 Tratamiento de meses incompletos

Un mes incompleto debe exportarse igualmente.

El objetivo es que el usuario pueda ver el avance real y detectar qué falta.

En estos casos:

* `completeness_status` será `incompleto` o `sin_facturas`;
* `missing_cups_count` será mayor que cero;
* `warnings_summary` indicará que faltan facturas;
* el detalle de CUPS faltantes estará disponible en EXP-003.

## 5. EXP-002 Detalle de facturas

### 5.1 Objetivo

Exportar las facturas que justifican los totales mensuales.

Esta exportación permite revisar trazabilidad, detectar errores y explicar por qué un total mensual tiene un determinado consumo o importe.

### 5.2 Alcance

Debe poder exportar:

* facturas validadas y corregidas incluidas en totales;
* opcionalmente, facturas pendientes o con incidencias si el usuario activa un filtro específico;
* facturas de un edificio, fuente energética, año y mes concretos;
* facturas de un rango de meses.

### 5.3 Columnas recomendadas

| Columna                  | Descripción                         |
| ------------------------ | ----------------------------------- |
| `invoice_id`             | Identificador interno de factura    |
| `upload_filename`        | Nombre original del archivo subido  |
| `invoice_number`         | Número de factura si existe         |
| `supplier_name`          | Comercializadora o suministrador    |
| `building_key`           | Código interno del edificio         |
| `building_name`          | Nombre visible del edificio         |
| `energy_type_code`       | Fuente energética                   |
| `cups_original`          | CUPS tal como aparece en factura    |
| `cups_key`               | CUPS normalizado                    |
| `period_start`           | Fecha de inicio del periodo         |
| `period_end`             | Fecha de cierre del periodo         |
| `computed_year`          | Año de cómputo                      |
| `computed_month`         | Mes de cómputo                      |
| `consumption_kwh`        | Consumo validado                    |
| `total_amount_eur`       | Total con IVA incluido              |
| `status`                 | Estado de factura                   |
| `parse_source`           | Origen del dato                     |
| `parser_name`            | Parser utilizado                    |
| `requires_visual_review` | Indica si requirió revisión visual  |
| `validated_at`           | Fecha de validación                 |
| `warnings_count`         | Número de avisos asociados          |
| `warnings_codes`         | Códigos de aviso separados por coma |

### 5.4 Uso esperado

El usuario podrá utilizar esta exportación para:

* revisar las facturas que componen cada total;
* comprobar si una rectificativa fue sumada;
* localizar facturas con importes o consumos anómalos;
* justificar la trazabilidad ante una revisión posterior.

## 6. EXP-003 CUPS faltantes

### 6.1 Objetivo

Exportar la lista de CUPS exigibles que no tienen factura válida para un edificio, fuente energética, año y mes.

Es una exportación clave para detectar meses incompletos antes de introducir datos en SIGEE-AGE.

### 6.2 Columnas recomendadas

| Columna              | Descripción                             |
| -------------------- | --------------------------------------- |
| `building_key`       | Código interno del edificio             |
| `building_name`      | Nombre visible del edificio             |
| `energy_type_code`   | Fuente energética                       |
| `year`               | Año consultado                          |
| `month`              | Mes consultado                          |
| `cups_original`      | CUPS visible                            |
| `cups_key`           | CUPS normalizado                        |
| `description`        | Descripción o ubicación del CUPS        |
| `supplier_name`      | Suministrador si se conoce              |
| `tariff`             | Tarifa si se conoce                     |
| `control_from_month` | Primer mes controlado                   |
| `control_to_month`   | Último mes controlado si existe         |
| `status`             | Estado del CUPS                         |
| `missing_reason`     | Motivo por el que aparece como faltante |

### 6.3 Motivos recomendados

Valores posibles para `missing_reason`:

| Motivo                        | Significado                                                |
| ----------------------------- | ---------------------------------------------------------- |
| `no_valid_invoice`            | No existe factura validada o corregida para ese CUPS y mes |
| `only_pending_invoices`       | Hay facturas, pero siguen pendientes de validación         |
| `only_blocked_invoices`       | Hay facturas, pero están bloqueadas por incidencias        |
| `only_discarded_or_duplicate` | Solo existen facturas descartadas o duplicadas             |

### 6.4 Reglas

Un CUPS aparece como faltante cuando:

* es exigible para el mes consultado;
* pertenece al edificio y fuente energética consultados;
* no tiene al menos una factura válida imputada a ese mes.

## 7. Filtros de exportación

### 7.1 Filtros mínimos

Las pantallas de exportación deben permitir filtrar por:

* año;
* mes;
* edificio;
* fuente energética;
* estado de completitud;
* estado de factura, en exportaciones de detalle.

### 7.2 Rangos temporales

Para el MVP es suficiente permitir:

* año completo;
* mes concreto;
* rango de meses dentro de un año;
* rango simple entre dos meses/años si se implementa sin complejidad adicional.

### 7.3 Comportamiento por defecto

La exportación debe respetar los filtros visibles en pantalla.

Si el usuario está viendo totales filtrados por edificio, fuente y mes, la exportación debe descargar exactamente esa misma selección.

## 8. Formato CSV

### 8.1 Codificación

El CSV debe generarse en UTF-8.

Para máxima compatibilidad con Excel en entorno español, se recomienda incluir BOM UTF-8 si se detecta que facilita apertura directa.

### 8.2 Separador

Se recomienda usar punto y coma `;` como separador por defecto.

Motivo: en configuración regional española, la coma se usa como separador decimal y Excel suele interpretar mejor CSV con punto y coma.

### 8.3 Decimales

Opciones válidas:

| Contexto                             | Formato recomendado     |
| ------------------------------------ | ----------------------- |
| Valor interno exportado para máquina | Punto decimal `1234.56` |
| CSV orientado a Excel español        | Coma decimal `1234,56`  |

Para el MVP se recomienda priorizar compatibilidad con usuario final en España:

* separador `;`;
* coma decimal;
* fechas en `dd/mm/yyyy`;
* importes con dos decimales;
* consumos con hasta tres decimales si procede.

### 8.4 Cabeceras

Las cabeceras deben ser claras y estables.

Se recomienda usar nombres técnicos o semitécnicos sin espacios para facilitar tratamiento posterior.

Ejemplo:

```csv
building_key;building_name;energy_type_code;year;month;total_consumption_kwh;total_amount_eur;completeness_status
```

## 9. Formato Excel

### 9.1 Estructura del archivo

El Excel `.xlsx` puede contener varias hojas.

Estructura recomendada:

| Hoja               | Contenido                               |
| ------------------ | --------------------------------------- |
| `Resumen mensual`  | Totales por edificio, fuente, año y mes |
| `Detalle facturas` | Facturas incluidas o relacionadas       |
| `CUPS faltantes`   | CUPS exigibles sin factura válida       |
| `Parámetros`       | Filtros aplicados y fecha de generación |

### 9.2 Formato visual recomendado

El Excel debe facilitar revisión rápida:

* fila de cabecera congelada;
* filtros activados;
* anchura de columnas ajustada;
* formato numérico para consumos e importes;
* formato de fecha para periodos;
* hoja `Resumen mensual` como primera hoja;
* estados de completitud visibles de forma clara.

### 9.3 No sobredimensionar

No es necesario implementar macros, fórmulas complejas ni gráficos en el MVP.

El Excel debe ser una salida limpia y útil, no un sistema de reporting avanzado.

## 10. Pantalla de exportaciones

### 10.1 Objetivo

Permitir al usuario generar descargas de datos filtradas.

### 10.2 Elementos mínimos

La pantalla debe incluir:

* selector de tipo de exportación;
* filtros de año y mes;
* filtro de edificio;
* filtro de fuente energética;
* formato de salida: CSV o Excel;
* botón de generar exportación;
* mensaje de resultado o error.

### 10.3 Acciones recomendadas

| Acción                   | Resultado                                  |
| ------------------------ | ------------------------------------------ |
| Descargar resumen CSV    | Genera EXP-001 en CSV                      |
| Descargar resumen Excel  | Genera EXP-001 y hojas auxiliares en Excel |
| Descargar detalle        | Genera EXP-002                             |
| Descargar CUPS faltantes | Genera EXP-003                             |

### 10.4 Reglas de interfaz

* si no hay datos para los filtros seleccionados, debe mostrarse mensaje claro;
* si existen meses incompletos, debe advertirse antes de descargar o indicarse en la exportación;
* el botón de exportación debe evitar dobles clics durante la generación;
* las descargas deben tener nombres de archivo claros.

## 11. Nombres de archivo

### 11.1 Convención general

Los nombres de archivo deben ser descriptivos y estables.

Patrón recomendado:

```txt
sigee_age_<tipo_exportacion>_<filtros>_<fecha_generacion>.<ext>
```

### 11.2 Ejemplos

```txt
sigee_age_resumen_mensual_2025_01_20260528.xlsx
sigee_age_detalle_facturas_vallehermoso_2025_01_20260528.csv
sigee_age_cups_faltantes_2025_01_20260528.xlsx
```

### 11.3 Normalización de nombres

Los nombres de archivo deben:

* usar minúsculas;
* evitar tildes;
* sustituir espacios por guiones bajos;
* evitar caracteres especiales incompatibles con sistemas de archivos.

## 12. Seguridad y privacidad

### 12.1 Control de acceso

Solo usuarios autenticados deben poder generar exportaciones.

La exportación debe respetar los permisos del usuario si en fases posteriores se introducen permisos por edificio u organismo.

### 12.2 Datos incluidos

El MVP debe exportar solo datos necesarios para la preparación energética.

No debe incluir datos sensibles innecesarios ni información del PDF completo.

### 12.3 URLs temporales

Si se incluyese enlace a PDF en alguna exportación de detalle, deberá ser privado o temporal.

Para el MVP se recomienda no incluir enlaces directos a PDFs en exportaciones, salvo decisión expresa.

## 13. Auditoría mínima

Cada exportación generada puede registrar un evento básico si se implementa `audit_events`.

Datos recomendados:

* usuario;
* tipo de exportación;
* formato;
* filtros aplicados;
* fecha y hora;
* número de filas exportadas.

Esto no debe bloquear el MVP si supone complejidad, pero es recomendable para trazabilidad.

## 14. Criterios de aceptación

### CA-EXP-001 Resumen mensual

* Dado un conjunto de facturas validadas, cuando el usuario exporta el resumen mensual, entonces el archivo contiene una fila por edificio, fuente energética, año y mes.
* El consumo total coincide con la suma de consumos de facturas válidas.
* El gasto total coincide con la suma de importes con IVA incluido de facturas válidas.
* Los meses incompletos aparecen marcados como incompletos.

### CA-EXP-002 Detalle de facturas

* Dado un total mensual, cuando el usuario exporta el detalle, entonces aparecen las facturas que alimentan ese total.
* Las facturas descartadas, duplicadas o con error no aparecen salvo que el usuario active un filtro específico.
* Los datos de factura incluyen CUPS, periodo, consumo, importe, estado y parser.

### CA-EXP-003 CUPS faltantes

* Dado un mes incompleto, cuando el usuario exporta CUPS faltantes, entonces aparecen los CUPS exigibles sin factura válida.
* Cada CUPS faltante incluye edificio, fuente, CUPS normalizado y motivo de falta.

### CA-EXP-004 CSV

* El CSV se descarga correctamente.
* El archivo usa codificación compatible con Excel.
* Los separadores y decimales se interpretan correctamente en entorno español.

### CA-EXP-005 Excel

* El Excel se descarga correctamente.
* La primera hoja contiene el resumen mensual.
* Las hojas auxiliares contienen detalle y CUPS faltantes cuando proceda.
* Las columnas principales tienen formato legible.

## 15. Fuera de alcance inicial

Quedan fuera del MVP:

* exportación directa a SIGEE-AGE;
* integración automática con APIs externas;
* macros Excel;
* plantillas complejas con fórmulas avanzadas;
* informes gráficos;
* cuadros de mando analíticos;
* exportaciones programadas;
* envío automático por correo;
* firma o sellado documental;
* conservación de PDFs dentro del archivo exportado.

## 16. Evoluciones posteriores

Posibles mejoras futuras:

* plantillas Excel específicas para procedimientos internos;
* exportación por comandancia u organismo si se amplía el alcance;
* comparativas intermensuales;
* indicadores de desviación de consumo;
* exportación de auditoría completa;
* exportación de datos para BI;
* generación automática de informes PDF;
* integración futura si SIGEE-AGE ofreciera mecanismo oficial de carga.
