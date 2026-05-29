# Contexto y objetivo

## 1. Propósito del documento

Este documento define el contexto funcional del proyecto SIGEE-AGE auxiliar y el objetivo concreto de la prueba de concepto.

Su finalidad es dejar claro por qué se plantea la aplicación, qué problema operativo pretende resolver, qué límites tiene y cómo debe entenderse su relación con SIGEE-AGE.

Este documento sirve como referencia para:

* responsables funcionales;
* jefatura técnica;
* equipo de desarrollo;
* OpenCode;
* validación del alcance del MVP.

## 2. Contexto general

SIGEE-AGE es la plataforma en la que se registran consumos energéticos de edificios administrativos. Para cada edificio y fuente energética se deben introducir datos agregados por año y mes.

En el caso trabajado, los datos principales que necesita preparar el usuario gestor son:

* edificio;
* fuente energética;
* año;
* mes;
* consumo energético;
* gasto económico con IVA incluido.

La introducción final en SIGEE-AGE seguirá siendo manual en el MVP. La aplicación propuesta no sustituye a SIGEE-AGE ni automatiza la carga en dicha plataforma.

## 3. Situación actual

El usuario gestor recibe o descarga facturas energéticas en PDF procedentes de distintas comercializadoras.

Estas facturas pueden corresponder a:

* electricidad;
* gas natural;
* gasóleo u otras fuentes energéticas previstas para fases posteriores.

Cada factura contiene datos útiles, pero no siempre con la misma estructura ni con la misma denominación de campos. Además, un mismo edificio puede tener varios CUPS asociados, por lo que para obtener el total mensual de un edificio puede ser necesario localizar varias facturas, comprobar sus periodos, sumar consumos e importes y verificar que no falta ninguna.

## 4. Problema operativo

El proceso manual actual presenta varios riesgos:

* inversión elevada de tiempo en revisar PDFs;
* errores de transcripción;
* errores al identificar el edificio asociado a una factura;
* dificultad para saber si faltan facturas de algún CUPS;
* cálculos manuales repetitivos;
* falta de trazabilidad clara entre facturas y totales mensuales;
* tratamiento heterogéneo de facturas de distintas comercializadoras;
* dificultad para revisar meses incompletos antes de introducir datos en SIGEE-AGE.

El problema no está solo en extraer datos de una factura individual, sino en consolidar correctamente todos los CUPS exigibles de cada edificio, fuente energética y mes.

## 5. Objetivo principal

El objetivo principal del proyecto es construir una aplicación web auxiliar que ayude al usuario gestor a preparar los datos energéticos antes de introducirlos manualmente en SIGEE-AGE.

La aplicación debe permitir:

1. Subir facturas energéticas en PDF.
2. Extraer automáticamente los datos principales.
3. Normalizar el CUPS detectado.
4. Asociar la factura al edificio correspondiente mediante la superficie de CUPS controlados.
5. Calcular el mes de cómputo según la fecha de cierre del periodo facturado.
6. Permitir revisión visual y corrección manual cuando sea necesario.
7. Validar facturas individualmente o en bloque si no presentan incidencias.
8. Calcular totales por edificio, fuente energética, año y mes.
9. Avisar de facturas faltantes, CUPS no controlados, duplicados y otras incidencias.
10. Exportar los resultados a CSV o Excel.

## 6. Objetivos secundarios

Además del objetivo principal, el proyecto busca:

* reducir el tiempo dedicado a revisión manual;
* reducir errores de suma y transcripción;
* mejorar la trazabilidad de los datos usados en SIGEE-AGE;
* separar claramente datos extraídos y datos validados;
* disponer de una base técnica ampliable a nuevos formatos de factura;
* documentar las reglas de negocio para que puedan implementarse de forma consistente;
* facilitar el trabajo del equipo de desarrollo y de OpenCode mediante documentación estructurada.

## 7. Principio de herramienta auxiliar

La aplicación debe entenderse siempre como una herramienta auxiliar.

No debe:

* sustituir a SIGEE-AGE;
* modificar datos directamente en SIGEE-AGE;
* realizar automatización de navegador;
* hacer scraping;
* custodiar documentación oficial como sistema documental;
* eliminar la responsabilidad de revisión del usuario gestor.

Sí debe:

* preparar los datos;
* ordenarlos;
* detectar incidencias;
* facilitar la revisión;
* calcular totales;
* exportar información utilizable;
* dejar trazabilidad básica del proceso.

## 8. Alcance energético inicial

El MVP se centra en electricidad y gas natural.

### 8.1 Electricidad

La electricidad es una fuente principal del MVP. Se contempla la extracción automática de facturas PDF mediante parsers específicos y parser genérico.

Formatos iniciales previstos:

* Iberdrola electricidad;
* Naturgy / Comercializadora Regulada Gas & Power electricidad.

### 8.2 Gas natural

El gas natural también entra en el MVP. Se contempla la extracción automática de facturas PDF y su consolidación por edificio, fuente energética, año y mes.

Formato inicial previsto:

* Energía XXI gas natural.

### 8.3 Gasóleo

El gasóleo queda previsto en el modelo de datos, pero no será foco inicial de parseo automático.

En el caso actual se contempla de forma inicial vinculado a UPROSE y con posible tratamiento posterior mediante carga manual o parser específico.

## 9. Superficie de control

La aplicación no debe considerar automáticamente cualquier CUPS que aparezca en una factura.

La superficie de control inicial está formada únicamente por los CUPS confirmados mediante los pantallazos aportados de SIGEE-AGE.

La relación funcional es:

```txt
Edificio -> Fuente energética -> CUPS controlados
```

Cuando se sube una factura, el edificio no se elige manualmente. Debe derivarse del CUPS normalizado y de la superficie de control.

Si el CUPS no pertenece a la superficie de control, la factura queda fuera de los totales hasta que el usuario decida descartarla o dar de alta el CUPS si procede.

## 10. Regla temporal principal

El mes y año de cómputo de una factura se determinan por la fecha de cierre del periodo de facturación.

```txt
computed_year = año(period_end)
computed_month = mes(period_end)
```

No se realizará prorrateo por días entre meses.

Ejemplos:

| Periodo facturado       | Fecha cierre | Cómputo      |
| ----------------------- | ------------ | ------------ |
| 10/12/2024 - 15/01/2025 | 15/01/2025   | enero 2025   |
| 20/08/2025 - 26/08/2025 | 26/08/2025   | agosto 2025  |
| 23/12/2024 - 27/02/2025 | 27/02/2025   | febrero 2025 |

## 11. Resultado esperado para el usuario

El usuario debe poder partir de un conjunto de facturas PDF y obtener una tabla final preparada para revisión y carga manual en SIGEE-AGE.

La tabla final debe mostrar, como mínimo:

* edificio;
* fuente energética;
* año;
* mes;
* consumo total;
* gasto total con IVA;
* estado de completitud;
* avisos relevantes.

El sistema debe permitir consultar el detalle que justifica cada total, especialmente las facturas y CUPS que lo componen.

## 12. Criterio de éxito funcional

La prueba de concepto se considerará válida si permite:

* procesar correctamente los ejemplos reales disponibles;
* extraer CUPS, fechas, consumo e importe total con IVA;
* asociar facturas a edificios mediante CUPS normalizado;
* detectar CUPS fuera de superficie de control;
* calcular totales mensuales por edificio y fuente energética;
* detectar meses incompletos;
* exportar resultados útiles;
* reducir claramente el esfuerzo manual frente al proceso actual.

## 13. Criterio de éxito técnico

Desde el punto de vista técnico, el MVP será satisfactorio si:

* separa interfaz web, lógica de negocio y parsers;
* permite añadir nuevos parsers sin rehacer la arquitectura;
* mantiene una función única de normalización de CUPS;
* conserva trazabilidad mínima de datos extraídos y validados;
* evita conservar PDFs de forma permanente si no es necesario;
* ofrece una base de datos sencilla y mantenible;
* dispone de tests con facturas de ejemplo y JSON esperado.

## 14. Relación con otros documentos

Este documento se complementa con:

* `00_resumen_ejecutivo.md`, visión general del proyecto;
* `02_alcance_mvp.md`, definición detallada de funcionalidades incluidas y excluidas;
* `04_reglas_negocio.md`, reglas que deben cumplir cálculos, validaciones y estados;
* `05_modelo_datos.md`, estructura de datos propuesta;
* `08_parsers_facturas.md`, diseño de extracción automática de facturas;
* `09_validaciones_y_avisos.md`, criterios de semáforos, bloqueos y revisión visual;
* `10_exportaciones.md`, salidas CSV/Excel previstas.

## 15. Pendientes

TODO: Confirmar denominaciones finales de edificios.

TODO: Completar listado definitivo de CUPS controlados.

TODO: Decidir si los PDFs de ejemplo se versionarán en repositorio o quedarán fuera por privacidad.

TODO: Confirmar si gasóleo se tratará en MVP solo como fuente prevista o con carga manual inicial.

TODO: Validar con el usuario gestor la tabla final exacta que copiará o trasladará a SIGEE-AGE.
