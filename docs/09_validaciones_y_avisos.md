# Validaciones y avisos

## 1. Propósito del documento

Este documento define el sistema de validaciones, avisos, bloqueos y semáforos del MVP de la aplicación auxiliar para la preparación de datos energéticos destinados a carga manual en SIGEE-AGE.

Su objetivo es establecer criterios claros para decidir:

* cuándo una factura puede validarse;
* cuándo requiere revisión visual;
* cuándo debe bloquearse;
* qué avisos debe mostrar la aplicación;
* qué facturas pueden validarse en bloque;
* qué datos entran en los totales;
* cómo se informa al usuario de incidencias.

Este documento debe servir como referencia para:

* implementación frontend;
* implementación backend;
* parsers de facturas;
* reglas de negocio;
* pruebas funcionales;
* criterios de aceptación.

## 2. Principios generales

### 2.1 Validación humana final

La aplicación ayuda a detectar errores y reducir trabajo manual, pero el usuario gestor mantiene la responsabilidad final sobre los datos que se usarán en SIGEE-AGE.

### 2.2 Validación antes de sumar

Solo las facturas con estado final `validada` o `corregida` deben entrar en totales.

No deben entrar en totales:

* facturas pendientes;
* facturas duplicadas;
* facturas descartadas;
* facturas con error de parseo;
* facturas fuera de superficie de control;
* facturas que requieren carga manual y no han sido completadas;
* facturas con avisos bloqueantes no corregidos.

### 2.3 Avisos comprensibles

Cada aviso debe tener:

* código estable;
* nivel;
* mensaje visible;
* campo afectado si procede;
* marca de bloqueante o no bloqueante.

### 2.4 Semáforo operativo

El usuario debe poder identificar rápidamente el estado de cada factura mediante un semáforo:

| Color    | Significado              | Acción esperada                                |
| -------- | ------------------------ | ---------------------------------------------- |
| Verde    | Lista para validar       | Validar individualmente o en bloque            |
| Amarillo | Requiere revisión visual | Revisar PDF y confirmar o corregir             |
| Rojo     | Bloqueada                | Corregir, completar, sustituir PDF o descartar |

## 3. Niveles de aviso

### 3.1 `info`

Aviso informativo. No bloquea validación ni exige revisión visual por sí solo.

Ejemplos:

* CUPS normalizado automáticamente;
* periodo de facturación cruza meses, pero se imputa por fecha de cierre;
* existen varias facturas distintas para el mismo CUPS y mes.

### 3.2 `warning`

Aviso de revisión visual. No bloquea necesariamente la validación individual, pero impide validación en bloque.

Ejemplos:

* parser genérico usado;
* confianza media o baja;
* varios importes candidatos;
* varios consumos candidatos;
* consumo cero;
* importe cero o negativo;
* posible rectificativa.

### 3.3 `error`

Aviso bloqueante. Impide validar la factura hasta que se corrija la incidencia o se descarte.

Ejemplos:

* CUPS no detectado;
* CUPS no controlado;
* falta fecha de cierre;
* falta consumo;
* falta importe total;
* factura duplicada exacta;
* PDF sin texto legible.

## 4. Contrato de aviso

Estructura recomendada:

```json
{
  "level": "warning",
  "code": "MULTIPLE_AMOUNT_CANDIDATES",
  "message": "Se han detectado varios importes posibles. Revisa el total con IVA incluido antes de validar.",
  "field_name": "total_amount_eur",
  "is_blocking": false
}
```

Campos:

| Campo         | Obligatorio | Descripción                   |
| ------------- | ----------- | ----------------------------- |
| `level`       | Sí          | `info`, `warning` o `error`   |
| `code`        | Sí          | Código estable del aviso      |
| `message`     | Sí          | Texto visible para el usuario |
| `field_name`  | No          | Campo afectado                |
| `is_blocking` | Sí          | Indica si impide validación   |

## 5. Estados de factura y validación

| Estado                     | Entra en totales | Puede validarse                   | Observaciones                        |
| -------------------------- | ---------------- | --------------------------------- | ------------------------------------ |
| `pendiente_validacion`     | No               | Sí, si no hay errores bloqueantes | Estado normal tras parseo correcto   |
| `validada`                 | Sí               | Ya validada                       | Datos aceptados sin cambios          |
| `corregida`                | Sí               | Ya validada                       | Datos modificados y confirmados      |
| `fuera_superficie_control` | No               | No                                | CUPS no controlado                   |
| `error_parseo`             | No               | No                                | Faltan datos críticos o PDF ilegible |
| `requiere_carga_manual`    | No               | No hasta completar datos          | Necesita intervención manual         |
| `duplicada`                | No               | No                                | Ya existe factura equivalente        |
| `descartada`               | No               | No                                | Excluida por decisión del usuario    |

## 6. Cálculo del semáforo de factura

### 6.1 Semáforo verde

Una factura queda en verde cuando:

* procede de parser específico;
* tiene todos los campos críticos completos;
* el CUPS está normalizado;
* el CUPS pertenece a la superficie de control;
* la fuente energética coincide con el CUPS controlado;
* no es duplicada;
* no tiene avisos `warning`;
* no tiene avisos `error`;
* no requiere revisión visual.

Mensaje recomendado:

```txt
Sin incidencias. Factura lista para validación.
```

### 6.2 Semáforo amarillo

Una factura queda en amarillo cuando:

* tiene datos suficientes para revisarse;
* no tiene errores bloqueantes;
* requiere confirmación visual del usuario.

Causas habituales:

* parser genérico;
* baja confianza de parseo;
* varios candidatos de consumo;
* varios candidatos de importe;
* periodo atípico;
* consumo cero;
* importe cero o negativo;
* posible rectificativa;
* formato no habitual;
* factura posterior a baja de CUPS, si se permite revisión.

Mensaje recomendado:

```txt
Requiere revisión visual antes de validar. Abre el PDF y confirma los datos extraídos.
```

### 6.3 Semáforo rojo

Una factura queda en rojo cuando:

* falta algún dato crítico;
* existe un error bloqueante;
* no puede entrar en validación sin corrección;
* debe completarse manualmente, sustituirse o descartarse.

Causas habituales:

* no se detecta CUPS;
* CUPS no controlado;
* falta fecha de cierre;
* falta consumo;
* falta importe;
* tipo de energía incompatible;
* PDF sin texto legible;
* duplicado exacto.

Mensaje recomendado:

```txt
No se puede validar. Corrige los datos, sustituye el PDF o descarta la factura.
```

## 7. Campos críticos

Una factura no puede validarse ni entrar en totales si falta cualquiera de estos campos:

| Campo              | Motivo                                         |
| ------------------ | ---------------------------------------------- |
| `cups_key`         | Necesario para asociar factura a edificio      |
| `energy_type`      | Necesario para clasificar la fuente energética |
| `period_start`     | Necesario para trazabilidad del periodo        |
| `period_end`       | Necesario para calcular año y mes de cómputo   |
| `computed_year`    | Necesario para agregación mensual              |
| `computed_month`   | Necesario para agregación mensual              |
| `consumption_kwh`  | Necesario para consumo total                   |
| `total_amount_eur` | Necesario para gasto total con IVA             |

El número de factura es muy recomendable, pero no siempre bloquea si el resto de datos permiten trazabilidad suficiente.

## 8. Validaciones de CUPS

### 8.1 CUPS detectado

Regla:

```txt
Debe existir un CUPS original o corregido por el usuario.
```

Si no existe:

| Código         | Nivel | Bloquea |
| -------------- | ----- | ------- |
| `UNKNOWN_CUPS` | error | Sí      |

Mensaje:

```txt
No se ha detectado el CUPS de la factura.
```

### 8.2 Normalización de CUPS

Regla:

```txt
El CUPS debe normalizarse antes de compararse con la superficie de control.
```

Si el CUPS original cambia al normalizarse:

| Código            | Nivel | Bloquea |
| ----------------- | ----- | ------- |
| `CUPS_NORMALIZED` | info  | No      |

Mensaje:

```txt
CUPS normalizado automáticamente para comparación.
```

### 8.3 CUPS controlado

Regla:

```txt
El CUPS normalizado debe existir en controlled_cups para la fuente energética correspondiente.
```

Si no existe:

| Código              | Nivel | Bloquea |
| ------------------- | ----- | ------- |
| `UNCONTROLLED_CUPS` | error | Sí      |

Mensaje:

```txt
El CUPS de esta factura no pertenece a la superficie de control. La factura no entrará en totales salvo que des de alta el CUPS.
```

### 8.4 CUPS dado de baja

Regla:

```txt
Si el mes de cómputo es posterior al último mes controlado, la factura requiere revisión.
```

Código recomendado:

| Código                    | Nivel   | Bloquea                      |
| ------------------------- | ------- | ---------------------------- |
| `CUPS_AFTER_DEACTIVATION` | warning | No, salvo decisión posterior |

Mensaje:

```txt
La factura corresponde a un mes posterior a la baja del CUPS. Revisa si procede ampliar la vigencia o tratarla como ajuste puntual.
```

## 9. Validaciones de fuente energética

### 9.1 Fuente detectada

Regla:

```txt
La factura debe tener una fuente energética identificada.
```

Si no se detecta:

| Código                | Nivel | Bloquea |
| --------------------- | ----- | ------- |
| `UNKNOWN_ENERGY_TYPE` | error | Sí      |

Mensaje:

```txt
No se ha podido identificar la fuente energética de la factura.
```

### 9.2 Compatibilidad con CUPS maestro

Regla:

```txt
energy_type de la factura debe coincidir con energy_type_code del CUPS controlado.
```

Si no coincide:

| Código                 | Nivel | Bloquea |
| ---------------------- | ----- | ------- |
| `ENERGY_TYPE_MISMATCH` | error | Sí      |

Mensaje:

```txt
La fuente energética detectada no coincide con la fuente asociada al CUPS controlado.
```

## 10. Validaciones de fechas

### 10.1 Fecha de inicio

Regla:

```txt
period_start debe existir y ser una fecha válida.
```

Si falta:

| Código                 | Nivel | Bloquea |
| ---------------------- | ----- | ------- |
| `MISSING_PERIOD_START` | error | Sí      |

Mensaje:

```txt
No se ha detectado la fecha de inicio del periodo facturado.
```

### 10.2 Fecha de cierre

Regla:

```txt
period_end debe existir y ser una fecha válida.
```

Si falta:

| Código               | Nivel | Bloquea |
| -------------------- | ----- | ------- |
| `MISSING_PERIOD_END` | error | Sí      |

Mensaje:

```txt
No se ha detectado la fecha de cierre del periodo facturado.
```

### 10.3 Coherencia de periodo

Regla:

```txt
period_start <= period_end
```

Si no se cumple:

| Código                 | Nivel | Bloquea |
| ---------------------- | ----- | ------- |
| `INVALID_PERIOD_RANGE` | error | Sí      |

Mensaje:

```txt
La fecha de inicio del periodo no puede ser posterior a la fecha de cierre.
```

### 10.4 Periodo que cruza meses

Regla:

```txt
Si el periodo cruza meses, se informa pero no se bloquea. La imputación se hace por fecha de cierre.
```

| Código                  | Nivel | Bloquea |
| ----------------------- | ----- | ------- |
| `PERIOD_CROSSES_MONTHS` | info  | No      |

Mensaje:

```txt
El periodo de facturación cruza varios meses. Se imputará completo al mes de la fecha de cierre.
```

### 10.5 Periodo atípico

Regla inicial recomendada:

```txt
Si el periodo facturado es inferior a 5 días o superior a 70 días, requiere revisión visual.
```

Este umbral podrá ajustarse tras probar más ejemplos.

| Código            | Nivel   | Bloquea |
| ----------------- | ------- | ------- |
| `ATYPICAL_PERIOD` | warning | No      |

Mensaje:

```txt
El periodo de facturación tiene una duración poco habitual. Revisa visualmente la factura.
```

## 11. Validaciones de consumo

### 11.1 Consumo detectado

Regla:

```txt
consumption_kwh debe existir.
```

Si falta:

| Código                | Nivel | Bloquea |
| --------------------- | ----- | ------- |
| `MISSING_CONSUMPTION` | error | Sí      |

Mensaje:

```txt
No se ha detectado el consumo en kWh.
```

### 11.2 Consumo numérico

Regla:

```txt
consumption_kwh debe ser decimal válido.
```

Si no lo es:

| Código                | Nivel | Bloquea |
| --------------------- | ----- | ------- |
| `INVALID_CONSUMPTION` | error | Sí      |

Mensaje:

```txt
El consumo detectado no tiene un formato numérico válido.
```

### 11.3 Consumo cero

Regla:

```txt
El consumo cero puede ser válido, pero requiere revisión visual.
```

| Código             | Nivel   | Bloquea |
| ------------------ | ------- | ------- |
| `ZERO_CONSUMPTION` | warning | No      |

Mensaje:

```txt
El consumo detectado es cero. Revisa visualmente la factura antes de validar.
```

### 11.4 Consumo negativo

Regla:

```txt
El consumo negativo no debe aceptarse automáticamente.
```

| Código                 | Nivel   | Bloquea                      |
| ---------------------- | ------- | ---------------------------- |
| `NEGATIVE_CONSUMPTION` | warning | No, salvo decisión posterior |

Mensaje:

```txt
El consumo detectado es negativo. Revisa si se trata de una regularización o error de extracción.
```

### 11.5 Varios consumos candidatos

Regla:

```txt
Si hay varios consumos posibles y no hay selección segura, requiere revisión visual.
```

| Código                            | Nivel   | Bloquea |
| --------------------------------- | ------- | ------- |
| `MULTIPLE_CONSUMPTION_CANDIDATES` | warning | No      |

Mensaje:

```txt
Se han detectado varios consumos posibles. Revisa cuál corresponde al consumo total en kWh.
```

## 12. Validaciones de importe

### 12.1 Importe detectado

Regla:

```txt
total_amount_eur debe existir y corresponder al total de factura con IVA incluido.
```

Si falta:

| Código                 | Nivel | Bloquea |
| ---------------------- | ----- | ------- |
| `MISSING_TOTAL_AMOUNT` | error | Sí      |

Mensaje:

```txt
No se ha detectado el importe total con IVA incluido.
```

### 12.2 Importe numérico

Regla:

```txt
total_amount_eur debe ser decimal válido.
```

Si no lo es:

| Código                 | Nivel | Bloquea |
| ---------------------- | ----- | ------- |
| `INVALID_TOTAL_AMOUNT` | error | Sí      |

Mensaje:

```txt
El importe detectado no tiene un formato numérico válido.
```

### 12.3 Importe cero o negativo

Regla:

```txt
Los importes cero o negativos pueden corresponder a abonos, rectificativas o ajustes, pero requieren revisión visual.
```

| Código                    | Nivel   | Bloquea |
| ------------------------- | ------- | ------- |
| `ZERO_OR_NEGATIVE_AMOUNT` | warning | No      |

Mensaje:

```txt
El importe total es cero o negativo. Revisa si se trata de un abono, rectificativa o ajuste.
```

### 12.4 Varios importes candidatos

Regla:

```txt
Si hay varios importes posibles y el parser no puede elegir con seguridad, requiere revisión visual.
```

| Código                       | Nivel   | Bloquea |
| ---------------------------- | ------- | ------- |
| `MULTIPLE_AMOUNT_CANDIDATES` | warning | No      |

Mensaje:

```txt
Se han detectado varios importes posibles. Revisa el total con IVA incluido antes de validar.
```

### 12.5 Subtotal confundido con total

Regla:

```txt
El parser debe evitar seleccionar bases imponibles o subtotales sin IVA.
```

Si se sospecha confusión:

| Código                       | Nivel   | Bloquea |
| ---------------------------- | ------- | ------- |
| `POSSIBLE_SUBTOTAL_SELECTED` | warning | No      |

Mensaje:

```txt
El importe detectado podría no ser el total con IVA incluido. Revisa el importe final de la factura.
```

## 13. Validaciones de número de factura

### 13.1 Número de factura ausente

Regla:

```txt
invoice_number es recomendable, pero no siempre bloqueante.
```

| Código                   | Nivel   | Bloquea |
| ------------------------ | ------- | ------- |
| `MISSING_INVOICE_NUMBER` | warning | No      |

Mensaje:

```txt
No se ha detectado el número de factura. Revisa si los datos restantes permiten suficiente trazabilidad.
```

### 13.2 Número de factura duplicado

Regla:

```txt
Si existe mismo número de factura y mismo suministrador, debe considerarse duplicado salvo revisión excepcional.
```

| Código                     | Nivel | Bloquea |
| -------------------------- | ----- | ------- |
| `DUPLICATE_INVOICE_NUMBER` | error | Sí      |

Mensaje:

```txt
Ya existe una factura con el mismo número y suministrador.
```

## 14. Validaciones de duplicado

### 14.1 Duplicado por hash

Regla:

```txt
Si el hash SHA-256 del PDF ya existe, no se reprocesa.
```

| Código                | Nivel | Bloquea |
| --------------------- | ----- | ------- |
| `DUPLICATE_FILE_HASH` | error | Sí      |

Mensaje:

```txt
Factura duplicada. Ya existe en el sistema y no se procesará de nuevo.
```

### 14.2 Duplicado equivalente

Regla:

```txt
Mismo número de factura + mismo suministrador se considera duplicado equivalente.
```

| Código              | Nivel | Bloquea |
| ------------------- | ----- | ------- |
| `DUPLICATE_INVOICE` | error | Sí      |

Mensaje:

```txt
Factura duplicada. Ya existe una factura equivalente en el sistema.
```

### 14.3 Mismo CUPS y mismo mes

Regla:

```txt
Mismo CUPS y mismo mes no implica duplicado si son facturas distintas.
```

| Código                              | Nivel | Bloquea |
| ----------------------------------- | ----- | ------- |
| `SAME_CUPS_MONTH_MULTIPLE_INVOICES` | info  | No      |

Mensaje:

```txt
Existen varias facturas distintas para este CUPS y mes. Si se validan, sus consumos e importes se sumarán.
```

## 15. Validaciones de parser

### 15.1 Parser específico

Regla:

```txt
Las facturas con parser específico pueden ser candidatas a validación en bloque si no tienen incidencias.
```

No genera aviso por sí mismo.

### 15.2 Parser genérico

Regla:

```txt
Las facturas procesadas con parser genérico requieren revisión visual y no pueden validarse en bloque.
```

| Código                | Nivel   | Bloquea |
| --------------------- | ------- | ------- |
| `GENERIC_PARSER_USED` | warning | No      |

Mensaje:

```txt
Se ha usado un parser genérico. Revisa visualmente la factura antes de validar.
```

### 15.3 Confianza baja

Regla:

```txt
Si parse_confidence < umbral definido, requiere revisión visual.
```

Umbral orientativo inicial:

```txt
parse_confidence < 0.95
```

| Código           | Nivel   | Bloquea |
| ---------------- | ------- | ------- |
| `LOW_CONFIDENCE` | warning | No      |

Mensaje:

```txt
La confianza del parseo no es suficiente para validación en bloque. Revisa visualmente la factura.
```

### 15.4 PDF sin texto legible

Regla:

```txt
Si no se puede extraer texto suficiente del PDF, no se permite parseo automático.
```

| Código           | Nivel | Bloquea |
| ---------------- | ----- | ------- |
| `UNREADABLE_PDF` | error | Sí      |

Mensaje:

```txt
El PDF no contiene texto legible suficiente. Completa los datos manualmente o descarta la factura.
```

## 16. Validaciones de rectificativas y ajustes

### 16.1 Posible rectificativa

Regla:

```txt
Si la factura contiene marcadores de abono, rectificativa, regularización o ajuste, requiere revisión visual.
```

| Código                   | Nivel   | Bloquea |
| ------------------------ | ------- | ------- |
| `POSSIBLE_RECTIFICATION` | warning | No      |

Mensaje:

```txt
La factura podría ser una rectificativa, abono o ajuste. Revisa los datos antes de validar.
```

### 16.2 Tratamiento de rectificativas

Si el usuario valida la factura:

* entra en totales;
* se imputa al mes de la fecha de cierre del propio documento;
* se suma con el resto de facturas válidas del mismo CUPS y mes.

## 17. Validación individual

Una factura puede validarse individualmente si:

* no tiene avisos bloqueantes;
* tiene todos los campos críticos completos;
* el CUPS pertenece a la superficie de control;
* la fuente energética coincide con el CUPS controlado;
* no es duplicada;
* el usuario confirma los datos.

Resultado:

| Caso                 | Estado final |
| -------------------- | ------------ |
| Sin cambios manuales | `validada`   |
| Con datos corregidos | `corregida`  |

## 18. Validación en bloque

### 18.1 Reglas

Solo se permite validación en bloque cuando la factura cumple todas estas condiciones:

* parser específico reconocido;
* confianza alta;
* CUPS extraído y normalizado;
* CUPS controlado;
* fuente energética compatible;
* fechas detectadas;
* consumo numérico válido;
* importe con IVA numérico válido;
* no duplicada;
* sin avisos `warning`;
* sin avisos `error`;
* no procede de carga manual;
* no procede de parser genérico.

### 18.2 Exclusiones

No se permite validación en bloque si:

* hay parser genérico;
* hay carga manual;
* CUPS no controlado;
* datos críticos dudosos;
* varios candidatos de consumo o importe;
* importes negativos o cero;
* consumo cero;
* posible rectificativa;
* discrepancia con maestro;
* factura posterior a baja de CUPS.

## 19. Reglas para entrar en totales

Una factura entra en totales si y solo si:

```txt
status IN ('validada', 'corregida')
```

Además debe tener:

* edificio asociado;
* CUPS controlado asociado;
* fuente energética;
* año y mes de cómputo;
* consumo kWh;
* importe total con IVA.

## 20. Validaciones de completitud mensual

### 20.1 CUPS exigibles

Regla:

```txt
Un CUPS es exigible si pertenece al edificio/fuente y su vigencia incluye el mes consultado.
```

### 20.2 Periodo completo

Regla:

```txt
Un edificio + fuente + año + mes está completo si todos los CUPS exigibles tienen al menos una factura válida.
```

### 20.3 Periodo incompleto

Si falta uno o más CUPS:

| Código             | Nivel   | Bloquea exportación |
| ------------------ | ------- | ------------------- |
| `MONTH_INCOMPLETE` | warning | No                  |

Mensaje:

```txt
El periodo tiene CUPS exigibles sin factura válida. El total se muestra como parcial.
```

### 20.4 Sin datos

Si existen CUPS exigibles pero no hay ninguna factura válida:

| Código               | Nivel   | Bloquea exportación |
| -------------------- | ------- | ------------------- |
| `MONTH_WITHOUT_DATA` | warning | No                  |

Mensaje:

```txt
No hay facturas válidas para este edificio, fuente y mes.
```

## 21. Códigos de aviso

### 21.1 Informativos

| Código                              | Campo        | Descripción                                        |
| ----------------------------------- | ------------ | -------------------------------------------------- |
| `CUPS_NORMALIZED`                   | `cups_key`   | CUPS normalizado automáticamente                   |
| `PERIOD_CROSSES_MONTHS`             | `period_end` | Periodo cruza varios meses                         |
| `SAME_CUPS_MONTH_MULTIPLE_INVOICES` | `cups_key`   | Varias facturas distintas para el mismo CUPS y mes |

### 21.2 Revisión visual

| Código                            | Campo                     | Descripción                      |
| --------------------------------- | ------------------------- | -------------------------------- |
| `GENERIC_PARSER_USED`             | `parser_name`             | Se ha usado parser genérico      |
| `LOW_CONFIDENCE`                  | `parse_confidence`        | Confianza inferior al umbral     |
| `MULTIPLE_AMOUNT_CANDIDATES`      | `total_amount_eur`        | Varios importes posibles         |
| `MULTIPLE_CONSUMPTION_CANDIDATES` | `consumption_kwh`         | Varios consumos posibles         |
| `ATYPICAL_PERIOD`                 | `period_start/period_end` | Periodo inusual                  |
| `ZERO_CONSUMPTION`                | `consumption_kwh`         | Consumo cero                     |
| `NEGATIVE_CONSUMPTION`            | `consumption_kwh`         | Consumo negativo                 |
| `ZERO_OR_NEGATIVE_AMOUNT`         | `total_amount_eur`        | Importe cero o negativo          |
| `POSSIBLE_RECTIFICATION`          | `invoice_number`          | Posible rectificativa o ajuste   |
| `POSSIBLE_SUBTOTAL_SELECTED`      | `total_amount_eur`        | Posible subtotal seleccionado    |
| `MISSING_INVOICE_NUMBER`          | `invoice_number`          | Número de factura ausente        |
| `CUPS_AFTER_DEACTIVATION`         | `cups_key`                | Factura posterior a baja de CUPS |
| `MONTH_INCOMPLETE`                | null                      | Periodo incompleto               |
| `MONTH_WITHOUT_DATA`              | null                      | Sin facturas válidas             |

### 21.3 Bloqueantes

| Código                     | Campo                     | Descripción                           |
| -------------------------- | ------------------------- | ------------------------------------- |
| `UNKNOWN_CUPS`             | `cups_original`           | CUPS no detectado                     |
| `UNCONTROLLED_CUPS`        | `cups_key`                | CUPS fuera de superficie              |
| `UNKNOWN_ENERGY_TYPE`      | `energy_type`             | Fuente energética no detectada        |
| `ENERGY_TYPE_MISMATCH`     | `energy_type`             | Energía incompatible con CUPS maestro |
| `MISSING_PERIOD_START`     | `period_start`            | Falta fecha inicio                    |
| `MISSING_PERIOD_END`       | `period_end`              | Falta fecha cierre                    |
| `INVALID_PERIOD_RANGE`     | `period_start/period_end` | Rango de fechas incoherente           |
| `MISSING_CONSUMPTION`      | `consumption_kwh`         | Falta consumo                         |
| `INVALID_CONSUMPTION`      | `consumption_kwh`         | Consumo no numérico                   |
| `MISSING_TOTAL_AMOUNT`     | `total_amount_eur`        | Falta importe total                   |
| `INVALID_TOTAL_AMOUNT`     | `total_amount_eur`        | Importe no numérico                   |
| `DUPLICATE_FILE_HASH`      | `file_hash_sha256`        | PDF duplicado                         |
| `DUPLICATE_INVOICE`        | `invoice_number`          | Factura duplicada equivalente         |
| `DUPLICATE_INVOICE_NUMBER` | `invoice_number`          | Mismo número y suministrador          |
| `UNREADABLE_PDF`           | `upload_id`               | PDF sin texto legible                 |

## 22. Mensajes estándar

### 22.1 Factura lista

```txt
Sin incidencias. Factura lista para validación.
```

### 22.2 Revisión visual

```txt
Requiere revisión visual antes de validar. Abre el PDF y confirma los datos extraídos.
```

### 22.3 Factura bloqueada

```txt
No se puede validar. Corrige los datos, sustituye el PDF o descarta la factura.
```

### 22.4 CUPS no controlado

```txt
El CUPS de esta factura no pertenece a la superficie de control. La factura no entrará en totales salvo que des de alta el CUPS.
```

### 22.5 Factura duplicada

```txt
Factura duplicada. Ya existe en el sistema y no se procesará de nuevo.
```

### 22.6 Mes incompleto

```txt
El periodo tiene CUPS exigibles sin factura válida. El total se muestra como parcial.
```

## 23. Ubicación de validaciones por capa

| Validación             | Parser              | Capa negocio        | Frontend          |
| ---------------------- | ------------------- | ------------------- | ----------------- |
| PDF legible            | Sí                  | No                  | Muestra resultado |
| Detección de formato   | Sí                  | No                  | Muestra parser    |
| Extracción de campos   | Sí                  | No                  | Muestra datos     |
| Normalización de CUPS  | Servicio compartido | Servicio compartido | No manual         |
| Superficie de control  | No                  | Sí                  | Muestra aviso     |
| Compatibilidad energía | No                  | Sí                  | Muestra aviso     |
| Duplicado por hash     | Puede calcular hash | Sí                  | Muestra aviso     |
| Duplicado por factura  | No                  | Sí                  | Muestra aviso     |
| Campos críticos        | Sí inicial          | Sí final            | Muestra errores   |
| Validación individual  | No                  | Sí                  | Acción usuario    |
| Validación en bloque   | No                  | Sí                  | Acción usuario    |
| Completitud mensual    | No                  | Sí                  | Muestra estado    |

## 24. Casos de prueba mínimos

### 24.1 Factura correcta Iberdrola

Resultado esperado:

* parser específico;
* semáforo verde si CUPS está controlado;
* validable en bloque;
* consumo 88 kWh;
* importe 23,70 €;
* cómputo enero 2025.

### 24.2 Factura correcta Naturgy regulada

Resultado esperado:

* parser específico;
* CUPS normalizado por sufijo;
* aviso informativo `CUPS_NORMALIZED` si aplica;
* consumo 22 kWh;
* importe 7,80 €;
* cómputo agosto 2025.

### 24.3 Factura correcta Energía XXI gas natural

Resultado esperado:

* parser específico;
* fuente `gas_natural`;
* consumo 8.650 kWh;
* importe 603,71 €;
* cómputo febrero 2025;
* no seleccionar consumo en m³ ni subtotal sin IVA.

### 24.4 CUPS no controlado

Resultado esperado:

* estado `fuera_superficie_control`;
* aviso `UNCONTROLLED_CUPS`;
* semáforo rojo;
* no entra en totales.

### 24.5 PDF duplicado

Resultado esperado:

* aviso `DUPLICATE_FILE_HASH`;
* estado `duplicada`;
* no se reprocesa;
* no entra en totales.

### 24.6 Parser genérico con datos completos

Resultado esperado:

* estado `pendiente_validacion`;
* aviso `GENERIC_PARSER_USED`;
* semáforo amarillo;
* no validable en bloque.

### 24.7 Falta importe

Resultado esperado:

* aviso `MISSING_TOTAL_AMOUNT`;
* semáforo rojo;
* requiere corrección manual;
* no entra en totales.

### 24.8 Mes incompleto

Resultado esperado:

* total parcial visible;
* estado `incompleto`;
* listado de CUPS faltantes;
* exportable con aviso.

## 25. Criterios de aceptación

El sistema de validaciones y avisos se considera correcto si:

1. Cada factura procesada recibe un estado inicial coherente.
2. Las facturas verdes pueden validarse individualmente o en bloque.
3. Las facturas amarillas requieren revisión visual y no se validan en bloque.
4. Las facturas rojas no pueden validarse sin corrección.
5. Los CUPS no controlados no entran en totales.
6. Los duplicados exactos no se reprocesan.
7. Los campos críticos ausentes bloquean validación.
8. Solo `validada` y `corregida` entran en totales.
9. Los meses incompletos se muestran y se exportan con aviso.
10. Los mensajes son comprensibles para el usuario gestor.
11. Los avisos tienen códigos estables para tests y depuración.
12. Las validaciones son coherentes con reglas de negocio, parsers, modelo de datos y pantallas.

## 26. Relación con otros documentos

Este documento se apoya especialmente en:

* `02_alcance_mvp.md`;
* `03_requisitos_funcionales.md`;
* `04_reglas_negocio.md`;
* `05_modelo_datos.md`;
* `07_pantallas_y_flujos.md`;
* `08_parsers_facturas.md`;
* `10_exportaciones.md`;
* `11_plan_implementacion_opencode.md`.

## 27. Pendientes

TODO: Confirmar umbral definitivo de `parse_confidence` para validación en bloque.

TODO: Confirmar umbral definitivo de periodo atípico.

TODO: Confirmar si el consumo negativo debe bloquear siempre o quedar como revisión visual.

TODO: Confirmar tratamiento definitivo de facturas posteriores a baja de CUPS.

TODO: Validar textos finales de avisos con el usuario gestor.

TODO: Definir si los avisos agregados de completitud se guardarán en base de datos o se calcularán bajo demanda.
