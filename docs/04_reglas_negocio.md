# Reglas de negocio

## 1. Propósito del documento

Este documento recoge las reglas de negocio que debe cumplir el MVP de la aplicación auxiliar para preparar datos energéticos destinados a carga manual en SIGEE-AGE.

Estas reglas son fuente de verdad para:

* diseño funcional;
* implementación técnica;
* parsers de facturas;
* validaciones;
* cálculo de totales;
* exportaciones;
* pruebas funcionales.

Cualquier desarrollo debe respetar estas reglas salvo decisión posterior documentada.

## 2. Principios generales

### 2.1 Herramienta auxiliar

La aplicación es una herramienta auxiliar. No sustituye a SIGEE-AGE y no introduce datos automáticamente en SIGEE-AGE.

Su función es preparar, ordenar, revisar y consolidar información procedente de facturas.

### 2.2 Usuario responsable

El usuario gestor mantiene la responsabilidad final sobre los datos que se usarán en SIGEE-AGE.

La aplicación ayuda a reducir errores, pero no elimina la necesidad de validación humana.

### 2.3 Simplicidad del MVP

El MVP debe resolver el caso práctico principal sin sobredimensionar:

* no se hará prorrateo;
* no se hará integración automática;
* no se conservarán PDFs de forma permanente;
* no se modelarán procedimientos administrativos complejos;
* no se reconstruirá contabilidad energética con granularidad superior a la que permite SIGEE-AGE.

## 3. Superficie de control

### 3.1 Definición

La superficie de control es el conjunto de edificios, fuentes energéticas y CUPS que la aplicación debe controlar para detectar facturas faltantes y calcular totales.

La estructura lógica es:

```txt
Edificio -> Fuente energética -> CUPS controlados
```

### 3.2 Fuente de verdad inicial

La fuente de verdad inicial son los CUPS visibles en los pantallazos de SIGEE-AGE aportados al proyecto.

El CSV auxiliar no es fuente de verdad cuando contiene CUPS no confirmados por pantallazo.

### 3.3 CUPS no controlados

Si se sube una factura con un CUPS que no pertenece a la superficie de control:

* la factura no entra en totales automáticamente;
* se genera aviso de CUPS no controlado;
* el usuario puede descartar la factura;
* el usuario puede dar de alta el CUPS si procede.

### 3.4 CUPS exigibles

Un CUPS es exigible para un edificio, fuente energética y mes cuando:

* pertenece a la superficie de control;
* está asociado a ese edificio;
* pertenece a esa fuente energética;
* su periodo de control incluye el mes consultado.

Regla:

```txt
control_from_month <= mes_consulta <= control_to_month
```

Si `control_to_month` está vacío, se entiende que el CUPS sigue activo.

## 4. Edificio y CUPS

### 4.1 Relación edificio-CUPS

Un CUPS controlado pertenece a un único edificio en el MVP.

Un edificio puede tener varios CUPS.

### 4.2 Asociación automática

El edificio de una factura se determina siempre a partir del CUPS normalizado.

El usuario no debe editar directamente el edificio de una factura. Si se corrige el CUPS, el edificio debe recalcularse automáticamente.

### 4.3 Alta de CUPS

Un nuevo CUPS puede darse de alta manualmente indicando:

* CUPS;
* edificio;
* fuente energética;
* primer mes a controlar;
* estado;
* observaciones opcionales.

Desde el primer mes a controlar, el CUPS debe exigirse en los cálculos de completitud.

### 4.4 Baja de CUPS

Un CUPS no se borra si tiene histórico o facturas asociadas.

La baja se gestiona indicando el último mes a controlar.

Desde el mes posterior al último mes a controlar, ese CUPS deja de exigirse.

### 4.5 Factura posterior a una baja

Si llega una factura de un CUPS dado de baja y el mes de cómputo es posterior al último mes de control:

* se genera aviso;
* la factura no debe entrar automáticamente sin revisión;
* el usuario puede ampliar la vigencia o tratarla como ajuste puntual si se implementa esta opción.

## 5. Normalización de CUPS

### 5.1 CUPS original

`cups_original` es el CUPS tal como aparece en la factura o documento.

Debe conservarse para trazabilidad.

### 5.2 CUPS normalizado

`cups_key` es el valor usado para comparar contra el maestro de CUPS controlados.

La normalización debe:

* eliminar espacios;
* convertir a mayúsculas;
* conservar solo caracteres alfanuméricos;
* aplicar la regla de equivalencia necesaria para comparar CUPS con sufijos.

### 5.3 Ejemplos de normalización

| CUPS original               | CUPS normalizado       |
| --------------------------- | ---------------------- |
| `ES 0022 0000 0621 2876 CB` | `ES0022000006212876CB` |
| `ES0022000006290850YS1P`    | `ES0022000006290850YS` |

### 5.4 Función única

La normalización debe implementarse en una única función reutilizable.

No deben existir normalizaciones duplicadas en distintos puntos del código.

## 6. Fuentes energéticas

### 6.1 Valores previstos

El modelo debe contemplar al menos:

* `electricidad`;
* `gas_natural`;
* `gasoleo`.

### 6.2 Electricidad

La electricidad entra en el MVP con parseo automático de facturas PDF.

### 6.3 Gas natural

El gas natural entra en el MVP con parseo automático de facturas PDF.

### 6.4 Gasóleo

El gasóleo queda previsto, pero sin parser automático en el MVP inicial.

En el caso actual:

* se asocia inicialmente a UPROSE;
* no sigue necesariamente una periodicidad mensual;
* puede responder a cargas puntuales cuando hace falta;
* se tratará más adelante mediante carga manual o parser específico.

## 7. Datos obligatorios de factura

Para que una factura pueda entrar en totales debe disponer de:

* CUPS normalizado reconocible;
* fuente energética;
* fecha de inicio del periodo;
* fecha de cierre del periodo;
* consumo en kWh;
* importe total con IVA incluido;
* estado validado o corregido y validado.

El número de factura es muy recomendable, pero si no está disponible puede procesarse con aviso siempre que haya mecanismos suficientes para evitar duplicados.

## 8. Regla de imputación mensual

### 8.1 Regla principal

El mes y año de cómputo de una factura se determinan por la fecha de cierre del periodo de facturación.

```txt
computed_year = año(period_end)
computed_month = mes(period_end)
```

### 8.2 Sin prorrateo

No se realizará prorrateo por días entre meses.

Aunque una factura cubra días de varios meses, todo su consumo e importe se imputan al mes de la fecha de cierre.

### 8.3 Ejemplos

| Periodo                 | Fecha cierre | Cómputo      |
| ----------------------- | -----------: | ------------ |
| 10/12/2024 - 15/01/2025 |   15/01/2025 | enero 2025   |
| 20/08/2025 - 26/08/2025 |   26/08/2025 | agosto 2025  |
| 23/12/2024 - 27/02/2025 |   27/02/2025 | febrero 2025 |

## 9. Consumo

### 9.1 Unidad

El consumo se guardará en kWh.

### 9.2 Formato interno

Internamente se debe almacenar como número decimal normalizado.

Ejemplos:

| Texto factura   | Valor interno |
| --------------- | ------------: |
| `45 kWh`        |          `45` |
| `1.234,56 kWh`  |     `1234.56` |
| `8.650,000 kWh` |        `8650` |

### 9.3 Formato en pantalla

En pantalla puede mostrarse con formato español.

Ejemplo:

```txt
1.234,56
```

### 9.4 Consumo cero

Un consumo cero puede ser válido, pero debe generar aviso de revisión visual salvo que se decida lo contrario.

## 10. Importe

### 10.1 Importe válido

El importe que debe utilizarse es siempre el total de factura con IVA incluido.

No deben utilizarse:

* subtotal de energía;
* subtotal de potencia;
* base imponible;
* impuestos separados;
* términos parciales.

### 10.2 Formato interno

Los importes deben almacenarse como decimal.

Ejemplos:

| Texto factura | Valor interno |
| ------------- | ------------: |
| `7,80 €`      |        `7.80` |
| `23,70€`      |       `23.70` |
| `603,71 €`    |      `603.71` |

### 10.3 Importes negativos o cero

Los importes cero o negativos pueden corresponder a abonos, rectificativas o ajustes.

Deben requerir revisión visual antes de validarse.

## 11. Parseo de facturas

### 11.1 Orden de procesamiento

Cuando se sube un PDF, el sistema debe intentar:

```txt
1. Extraer texto legible.
2. Identificar comercializadora/formato.
3. Aplicar parser específico.
4. Si no hay parser específico, aplicar parser genérico.
5. Si faltan datos críticos, permitir carga manual asistida.
```

### 11.2 Parser específico

Un parser específico se diseña para una comercializadora/formato concreto.

Puede generar facturas validables en bloque si no hay avisos.

### 11.3 Parser genérico

El parser genérico intenta localizar patrones comunes:

* CUPS;
* fechas;
* consumo kWh;
* importe total;
* tipo de energía;
* número de factura.

Una factura procesada con parser genérico nunca debe validarse en bloque.

### 11.4 Carga manual asistida

Si el parser no extrae datos suficientes, el usuario podrá completar manualmente los campos obligatorios usando el PDF como referencia.

La factura quedará marcada como origen manual.

## 12. Estados de factura

Estados mínimos:

| Estado                     | Significado                                    |
| -------------------------- | ---------------------------------------------- |
| `pendiente_validacion`     | Datos extraídos, pendiente de confirmación     |
| `validada`                 | Datos confirmados sin cambios                  |
| `corregida`                | Datos modificados por el usuario y confirmados |
| `fuera_superficie_control` | CUPS no controlado                             |
| `error_parseo`             | No se han podido extraer datos suficientes     |
| `requiere_carga_manual`    | Necesita introducción manual de datos          |
| `duplicada`                | Ya existe factura equivalente                  |
| `descartada`               | El usuario decide no usarla                    |

Solo deben entrar en totales:

* `validada`;
* `corregida`.

## 13. Duplicados

### 13.1 Duplicado exacto

Si una factura ya existe, no se procesa.

Criterios recomendados:

* mismo hash de PDF;
* mismo número de factura y mismo suministrador;
* combinación equivalente inequívoca.

### 13.2 Misma factura subida dos veces

Debe bloquearse y mostrarse aviso:

```txt
Factura duplicada. Ya existe en el sistema y no se procesará de nuevo.
```

### 13.3 Mismo CUPS y mismo mes con distinta factura

Se permite.

Regla:

```txt
Si son facturas distintas, sus consumos e importes se suman en el CUPS/mes.
```

Esto cubre:

* rectificativas;
* ajustes;
* facturación partida;
* refacturaciones válidas.

### 13.4 Mismo CUPS, mismo periodo, distinta factura

Se permite con aviso informativo, no bloqueo automático.

El usuario debe poder validarlo si entiende que corresponde a ajuste o rectificativa.

## 14. Rectificativas y ajustes

### 14.1 Criterio simplificado

Las rectificativas se tratan como facturas válidas si el usuario las valida.

### 14.2 Mes de imputación

Se imputan al mes determinado por la fecha de cierre de la propia factura o documento.

No se redistribuyen a meses anteriores aunque económicamente ajusten periodos previos.

### 14.3 Suma

Si caen en el mismo edificio, fuente, CUPS y mes, se suman con el resto de facturas válidas.

## 15. Completitud mensual

### 15.1 Nivel de cálculo

La completitud se calcula por:

```txt
Edificio + Fuente energética + Año + Mes
```

### 15.2 Regla de completitud

Un mes está completo cuando todos los CUPS exigibles para ese edificio y fuente tienen al menos una factura válida imputada a ese mes.

### 15.3 Mes incompleto

Si falta una o más facturas:

* el total se muestra igualmente;
* el estado queda como incompleto;
* se informa qué CUPS faltan;
* el usuario puede exportar si lo desea, pero con aviso.

### 15.4 Totales parciales

Los totales parciales deben calcularse con las facturas validadas existentes.

No deben ocultarse por estar incompletos.

## 16. Cálculo de totales

### 16.1 Total por CUPS/mes

Para cada CUPS, año y mes:

```txt
consumo_cups_mes = suma(consumo_kwh de facturas válidas)
importe_cups_mes = suma(total_amount_eur de facturas válidas)
```

### 16.2 Total por edificio/fuente/mes

Para cada edificio, fuente, año y mes:

```txt
consumo_total = suma(consumo_cups_mes de todos los CUPS exigibles con factura válida)
importe_total = suma(importe_cups_mes de todos los CUPS exigibles con factura válida)
```

### 16.3 Exclusiones

No deben entrar en totales:

* facturas descartadas;
* facturas duplicadas;
* facturas pendientes de validación;
* facturas con CUPS fuera de superficie no dado de alta;
* facturas con error de parseo no corregidas.

## 17. Validación en bloque

### 17.1 Permitida

Una factura es validable en bloque cuando:

* parser específico reconocido;
* CUPS extraído y normalizado;
* CUPS controlado;
* fuente energética compatible;
* fechas detectadas;
* consumo numérico;
* importe con IVA numérico;
* no duplicada;
* sin avisos amarillos o rojos.

### 17.2 No permitida

No se permite validación en bloque si:

* parser genérico;
* carga manual;
* CUPS no controlado;
* datos críticos dudosos;
* varios candidatos de consumo o importe;
* importes negativos o cero;
* consumo cero;
* factura potencialmente rectificativa;
* discrepancia relevante con maestro.

## 18. Avisos

### 18.1 Semáforo verde

Factura lista para validación en bloque.

Mensaje tipo:

```txt
Sin incidencias. Factura lista para validación en bloque.
```

### 18.2 Semáforo amarillo

Factura que requiere revisión visual.

Causas posibles:

* parser genérico;
* baja confianza;
* varios consumos candidatos;
* varios importes candidatos;
* periodo atípico;
* consumo cero;
* importe cero o negativo;
* posible rectificativa;
* formato no habitual.

Mensaje tipo:

```txt
Requiere revisión visual antes de validar. Abre el PDF y confirma los datos extraídos.
```

### 18.3 Semáforo rojo

Factura bloqueada hasta corregir o descartar.

Causas posibles:

* no se detecta CUPS;
* no se detecta fecha de cierre;
* no se detecta consumo;
* no se detecta importe;
* CUPS no controlado;
* tipo de energía incompatible;
* PDF ilegible;
* duplicado exacto.

Mensaje tipo:

```txt
No se puede validar. Corrige los datos, sustituye el PDF o descarta la factura.
```

## 19. Revisión visual

### 19.1 Pantalla de revisión

Debe existir una pantalla que permita ver:

* tabla con facturas procesadas;
* estado y avisos;
* datos extraídos;
* PDF de la factura seleccionada, si está disponible;
* acciones de validar, corregir o descartar.

### 19.2 Edición permitida

Campos editables:

* CUPS original;
* tipo de energía;
* fecha inicio;
* fecha cierre;
* consumo kWh;
* importe total con IVA;
* número de factura;
* comercializadora.

Campos calculados automáticamente:

* CUPS normalizado;
* edificio;
* mes de cómputo;
* año de cómputo;
* estado de superficie de control.

## 20. Exportación

### 20.1 Exportación resumen

Debe exportar totales por:

* edificio;
* fuente energética;
* año;
* mes;
* consumo total;
* importe total con IVA;
* estado de completitud;
* avisos.

### 20.2 Exportación detalle

Debe poder exportar detalle por factura o CUPS, al menos para revisión interna.

Campos recomendados:

* edificio;
* fuente;
* CUPS;
* factura;
* periodo;
* mes de cómputo;
* consumo;
* importe;
* estado.

## 21. Conservación de PDFs

Los PDFs pueden borrarse tras parseo y validación.

El sistema debe conservar al menos:

* datos estructurados extraídos;
* datos corregidos si los hubiera;
* origen de datos: parser específico, parser genérico o manual;
* estado de validación;
* fecha de carga/validación.

No se exige custodia documental de los PDFs en el MVP.

## 22. Trazabilidad mínima

Para cada factura debe conservarse:

* quién la validó, si el sistema soporta usuario único igualmente;
* fecha de validación;
* si fue corregida;
* valores originales extraídos;
* valores finales usados para cálculo;
* parser utilizado;
* avisos generados.

## 23. Reglas para tests

Los tests funcionales deberán comprobar:

* normalización correcta de CUPS;
* cómputo por fecha de cierre;
* extracción correcta de ejemplos conocidos;
* bloqueo de duplicado exacto;
* suma de varias facturas distintas en mismo CUPS/mes;
* exclusión de facturas no validadas;
* detección de incompletitud;
* exportación de totales incompletos con aviso.

## 24. Decisiones abiertas o a completar

TODO: Definir lista final de CUPS controlados en seed.

TODO: Definir umbral numérico de confianza de parser.

TODO: Definir criterio técnico exacto de hash y duplicado.

TODO: Definir si se permite validar factura posterior a baja como ajuste puntual en MVP o fase posterior.

TODO: Definir presentación final de meses en interfaz y exportación.
