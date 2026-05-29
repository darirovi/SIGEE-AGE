# Parsers de facturas

## 1. Propósito del documento

Este documento define el diseño funcional y técnico de los parsers de facturas para el MVP de la aplicación auxiliar SIGEE-AGE.

Su objetivo es establecer:

* qué datos debe extraer cada parser;
* cómo deben normalizarse los valores;
* qué parsers específicos se implementarán inicialmente;
* cómo debe funcionar el parser genérico;
* cómo se gestionan formatos no reconocidos;
* qué salida debe producir cualquier parser;
* cómo se validarán los parsers con ejemplos reales.

Este documento debe servir como referencia directa para OpenCode durante la implementación.

## 2. Concepto general

Un parser de factura es un componente que recibe un PDF legible y devuelve una estructura normalizada con los datos necesarios para alimentar el flujo de revisión, validación y cálculo de totales.

La aplicación no debe depender de un único formato de factura. Cada comercializadora puede tener una estructura distinta, por lo que se propone una arquitectura de parsers independientes por formato.

## 3. Alcance inicial de parsers

### 3.1 Parsers específicos del MVP

Los parsers específicos iniciales serán:

| Parser                              | Fuente       | Comercializadora/Formato               | Estado |
| ----------------------------------- | ------------ | -------------------------------------- | ------ |
| `iberdrola_electricidad`             | Electricidad | Iberdrola Clientes                     | MVP    |
| `curenergia_electricidad_pvpc`       | Electricidad | Curenergía (tarifa PVPC)               | MVP    |
| `naturgy_regulada_electricidad`      | Electricidad | Comercializadora Regulada, Gas & Power | MVP    |
| `energia_xxi_gas_natural`           | Gas natural  | Energía XXI                            | MVP    |
| `naturgy_regulada_gas_natural`       | Gas natural  | Comercializadora Regulada, Gas & Power | MVP    |

### 3.2 Parser genérico

También se implementará un parser genérico:

| Parser                   | Finalidad                                                    |
| ------------------------ | ------------------------------------------------------------ |
| `generic_invoice_parser` | Intentar extraer datos básicos de PDFs sin parser específico |

El parser genérico no habilita validación en bloque. Sus resultados deben revisarse visualmente.

### 3.3 Fuera del foco inicial

No se implementará parser específico para gasóleo/gasoil en la primera fase.

El modelo debe contemplar `gasoleo` como fuente energética, pero su carga podrá resolverse más adelante mediante entrada manual o parser futuro.

## 4. Flujo de procesamiento

El procesamiento de un PDF seguirá este orden:

```txt
1. Recibir PDF.
2. Calcular hash del archivo.
3. Comprobar duplicado exacto por hash.
4. Extraer texto del PDF.
5. Detectar si el PDF tiene texto legible.
6. Identificar comercializadora/formato.
7. Ejecutar parser específico si existe.
8. Si no existe parser específico, ejecutar parser genérico.
9. Validar campos críticos extraídos.
10. Normalizar CUPS, fechas, consumo e importe.
11. Asociar CUPS normalizado con superficie de control.
12. Crear factura en estado correspondiente.
13. Generar avisos.
```

## 5. Librerías recomendadas

Para el backend Python se recomiendan:

* `pymupdf` o `fitz` para extracción rápida de texto;
* `pdfplumber` para extracción más controlada cuando sea necesario;
* `pydantic` para contratos de entrada/salida;
* `python-dateutil` o funciones propias para fechas;
* `decimal.Decimal` para importes;
* `re` para expresiones regulares;
* `pytest` para tests de parsers.

Se debe evitar OCR en el MVP salvo decisión posterior. Los PDFs de entrada se consideran legibles.

## 6. Contrato común de parser

Todo parser debe devolver el mismo contrato normalizado, aunque algunos campos estén vacíos si no se han podido extraer.

### 6.1 Estructura recomendada

```json
{
  "parser_name": "iberdrola_electricidad",
  "parser_version": "1.0.0",
  "parse_source": "parser_especifico",
  "parse_confidence": 0.98,
  "energy_type": "electricidad",
  "supplier_name": "Iberdrola Clientes, S.A.U.",
  "invoice_number": "21250131040000158",
  "cups_original": "ES 0022 0000 0621 2876 CB",
  "cups_key": "ES0022000006212876CB",
  "period_start": "2024-12-10",
  "period_end": "2025-01-15",
  "computed_year": 2025,
  "computed_month": 1,
  "consumption_kwh": 88,
  "total_amount_eur": 23.70,
  "raw_candidates": {},
  "warnings": []
}
```

### 6.2 Campos obligatorios si el parseo es correcto

| Campo              | Obligatorio | Descripción                                       |
| ------------------ | ----------: | ------------------------------------------------- |
| `parser_name`      |          Sí | Nombre técnico del parser usado                   |
| `parser_version`   |          Sí | Versión del parser                                |
| `parse_source`     |          Sí | `parser_especifico`, `parser_generico` o `manual` |
| `parse_confidence` |          Sí | Confianza numérica entre 0 y 1                    |
| `energy_type`      |          Sí | `electricidad`, `gas_natural` o `gasoleo`         |
| `supplier_name`    | Recomendado | Comercializadora detectada                        |
| `invoice_number`   | Recomendado | Número de factura                                 |
| `cups_original`    |          Sí | CUPS tal como aparece                             |
| `cups_key`         |          Sí | CUPS normalizado                                  |
| `period_start`     |          Sí | Fecha inicio periodo                              |
| `period_end`       |          Sí | Fecha cierre periodo                              |
| `computed_year`    |          Sí | Año calculado desde fecha cierre                  |
| `computed_month`   |          Sí | Mes calculado desde fecha cierre                  |
| `consumption_kwh`  |          Sí | Consumo en kWh                                    |
| `total_amount_eur` |          Sí | Total factura con IVA incluido                    |
| `warnings`         |          Sí | Lista de avisos                                   |

## 7. Modelo Pydantic recomendado

```python
from datetime import date
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, Field


EnergyType = Literal["electricidad", "gas_natural", "gasoleo"]
ParseSource = Literal["parser_especifico", "parser_generico", "manual"]
WarningLevel = Literal["info", "warning", "error"]


class ParserWarning(BaseModel):
    level: WarningLevel
    code: str
    message: str
    field_name: str | None = None
    is_blocking: bool = False


class InvoiceParseResult(BaseModel):
    parser_name: str
    parser_version: str
    parse_source: ParseSource
    parse_confidence: float = Field(ge=0, le=1)

    energy_type: EnergyType | None = None
    supplier_name: str | None = None
    invoice_number: str | None = None

    cups_original: str | None = None
    cups_key: str | None = None

    period_start: date | None = None
    period_end: date | None = None
    computed_year: int | None = None
    computed_month: int | None = Field(default=None, ge=1, le=12)

    consumption_kwh: Decimal | None = None
    total_amount_eur: Decimal | None = None

    raw_candidates: dict[str, Any] = Field(default_factory=dict)
    warnings: list[ParserWarning] = Field(default_factory=list)
```

## 8. Campos críticos

Una factura no puede entrar en totales si falta cualquiera de estos campos:

* CUPS normalizado;
* tipo de energía;
* fecha de inicio del periodo;
* fecha de cierre del periodo;
* consumo kWh;
* total factura con IVA incluido.

El número de factura es altamente recomendable, pero no siempre debe bloquear si el resto de datos permiten trazabilidad suficiente.

## 9. Extracción de texto

### 9.1 Regla general

El sistema debe intentar extraer texto completo del PDF antes de identificar parser.

### 9.2 PDF sin texto

Si no se extrae texto suficiente:

* estado técnico: `error_parseo` o `requiere_carga_manual`;
* aviso: `UNREADABLE_PDF`;
* no se permite validación en bloque;
* el usuario podrá introducir datos manualmente si procede.

### 9.3 Texto bruto

En desarrollo puede ser útil guardar texto bruto temporalmente para depurar parsers.

En MVP operativo se recomienda no conservar el texto bruto completo salvo necesidad técnica, para evitar almacenar información innecesaria.

## 10. Detección de formato

Antes de ejecutar un parser específico, se deben buscar marcadores en el texto.

### 10.1 Iberdrola electricidad

Marcadores posibles:

* `IBERDROLA CLIENTES, S.A.U.`;
* `RESUMEN DE FACTURA`;
* `PERIODO DE FACTURACIÓN`;
* `Identificación punto de suministro (CUPS)`;
* `Consumo total de esta factura`.

### 10.2 Curenergía electricidad PVPC

Marcadores posibles:

* `CURENERGÍA`;
* `tarifa PVPC`;
* `Consumo energía activa`;
* `CUPS:`;
* `Importe total`.

### 10.3 Naturgy / Comercializadora Regulada electricidad

Marcadores posibles:

* `Comercializadora Regulada, Gas & Power`;
* `DATOS DE LA FACTURA DE ELECTRICIDAD`;
* `INFORMACIÓN DE CONSUMO ELÉCTRICO`;
* `Código unificado de punto de suministro CUPS`;
* `TOTAL IMPORTE FACTURA`.

### 10.4 Energía XXI gas natural

Marcadores posibles:

* `Energía XXI`;
* `INFORMACIÓ DEL CONSUM GAS`;
* `GAS NATURAL`;
* `Tipus de gas: Gas natural`;
* `CUPS:`;
* `TOTAL IMPORT FACTURA`.

### 10.5 Naturgy / Comercializadora Regulada gas natural

Marcadores posibles:

* `Comercializadora Regulada, Gas & Power`;
* `aquí tienes tu factura de gas`;
* `Tus datos de suministro de gas`;
* `Total a pagar`;
* `Consumo kWh`;
* `Código CUPS:`.

### 10.6 Sin formato reconocido

Si no se reconocen marcadores suficientes, se usará `generic_invoice_parser`.

## 11. Normalización de CUPS

### 11.1 Función única

La normalización de CUPS debe estar centralizada.

Ningún parser debe implementar su propia normalización independiente.

### 11.2 Proceso recomendado

```txt
1. Tomar CUPS original.
2. Convertir a mayúsculas.
3. Eliminar espacios y separadores.
4. Conservar solo caracteres alfanuméricos.
5. Aplicar equivalencia/truncado definida para CUPS con sufijos.
```

### 11.3 Ejemplos

| CUPS original               | CUPS normalizado       |
| --------------------------- | ---------------------- |
| `ES 0022 0000 0621 2876 CB` | `ES0022000006212876CB` |
| `ES0022000006290850YS1P`    | `ES0022000006290850YS` |
| `ES0234150035789683GC`      | `ES0234150035789683GC` |

### 11.4 Aviso informativo

Si el CUPS original difiere del normalizado, pero el resultado coincide con un CUPS controlado, debe generarse aviso informativo:

```txt
CUPS normalizado automáticamente.
```

Este aviso no bloquea validación en bloque si todo lo demás es correcto.

## 12. Normalización de fechas

### 12.1 Formato interno

Todas las fechas deben devolverse en ISO:

```txt
YYYY-MM-DD
```

### 12.2 Formatos de entrada esperados

El parser debe soportar formatos como:

| Formato                   | Ejemplo                                       |
| ------------------------- | --------------------------------------------- |
| `dd/mm/yyyy`              | `15/01/2025`                                  |
| `dd/mm/yyyy - dd/mm/yyyy` | `10/12/2024 - 15/01/2025`                    |
| `dd.mm.yyyy`              | `10.09.2022`                                  |
| Texto español             | `20 de agosto de 2025 a 26 de agosto de 2025` |
| Texto catalán/valenciano  | `del 23/12/2024 al 27/02/2025`                |

### 12.3 Cómputo mensual

Tras obtener `period_end`:

```txt
computed_year = year(period_end)
computed_month = month(period_end)
```

No se realiza prorrateo.

## 13. Normalización de consumos

### 13.1 Unidad

El consumo debe expresarse en kWh.

### 13.2 Conversión numérica

El parser debe transformar números con formato español a decimal interno.

| Texto           |     Valor |
| --------------- | --------: |
| `88 kWh`        |      `88` |
| `22 kWh`        |      `22` |
| `8.650,000 kWh` |    `8650` |
| `1.234,56 kWh`  | `1234.56` |

### 13.3 Consumos por periodos

En electricidad pueden aparecer consumos por periodos punta, llano y valle.

El parser debe extraer el total, no cada periodo, salvo que sea necesario para comprobar suma.

Ejemplo:

```txt
Punta: 19 kWh
Llano: 19 kWh
Valle: 50 kWh
Total: 88 kWh
```

Resultado:

```txt
consumption_kwh = 88
```

### 13.4 Gas natural

En gas natural puede aparecer consumo en m³ y conversión a kWh.

El valor que debe extraerse es el consumo final en kWh.

Ejemplo:

```txt
Consum 819,00 m³
Factor de conversión PCS 10,561 kWh/m³
Consum 8.650,00 kWh
```

Resultado:

```txt
consumption_kwh = 8650
```

## 14. Normalización de importes

### 14.1 Importe objetivo

El parser debe extraer el total final con IVA incluido.

No debe extraer:

* subtotal de energía;
* base imponible;
* IVA aislado;
* subtotal de potencia;
* importe total antes de impuestos.

### 14.2 Etiquetas esperadas

Etiquetas posibles:

* `TOTAL IMPORTE FACTURA`;
* `TOTAL IMPORT FACTURA`;
* `TOTAL`;
* `Importe factura`;
* `IMPORT FACTURA`;
* `Total a pagar`.

### 14.3 Conversión numérica

| Texto      |    Valor |
| ---------- | -------: |
| `7,80 €`   |   `7.80` |
| `23,70€`   |  `23.70` |
| `603,71 €` | `603.71` |

### 14.4 Varios importes candidatos

Si se detectan varios importes posibles y el parser no puede elegir con seguridad:

* debe seleccionar el candidato más probable si es razonable;
* debe incluir todos los candidatos en `raw_candidates`;
* debe generar aviso `MULTIPLE_AMOUNT_CANDIDATES`;
* la factura no será validable en bloque.

## 15. Parser Iberdrola electricidad

### 15.1 Nombre técnico

```txt
iberdrola_electricidad
```

### 15.2 Datos esperados del ejemplo

```json
{
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
```

### 15.3 Patrones recomendados

Número de factura:

```txt
Nº FACTURA:
21250131040000158
```

Periodo:

```txt
PERIODO DE FACTURACIÓN:
10/12/2024 - 15/01/2025
```

Consumo:

```txt
Consumo total de esta factura.
88 kWh
```

O también:

```txt
Total: 88 kWh
```

Importe:

```txt
TOTAL 23,70€
```

O:

```txt
TOTAL IMPORTE FACTURA 23,70 €
```

CUPS:

```txt
Identificación punto de suministro (CUPS): ES 0022 0000 0621 2876 CB
```

### 15.4 Validaciones específicas

* Debe identificar electricidad.
* Debe preferir el total de consumo de factura frente a consumos parciales.
* Debe preferir el total final de factura frente a subtotal `IMPORTE TOTAL 19,59` sin IVA.

## 16. Parser Curenergía electricidad PVPC

### 16.1 Nombre técnico

```txt
curenergia_electricidad_pvpc
```

### 16.2 Datos esperados del ejemplo

```json
{
  "energy_type": "electricidad",
  "supplier": "curenergia",
  "invoice_number": "FACTURA_DUMMY_2023_04",
  "cups_original": "ES0031234567890AB",
  "cups_key": "ES0031234567890AB",
  "period_start": "2023-04-01",
  "period_end": "2023-04-30",
  "computed_year": 2023,
  "computed_month": 4,
  "consumption_kwh": 150,
  "total_amount_eur": 25.00
}
```

### 16.3 Patrones recomendados

Número de factura:

```txt
Nº de factura: FACTURA_DUMMY_2023_04
```

Periodo:

```txt
Período: 01/04/2023 - 30/04/2023
```

Consumo:

```txt
Consumo energía activa: 150 kWh
```

O:

```txt
Consumo total: 150 kWh
```

Importe:

```txt
Importe total: 25,00 €
```

CUPS:

```txt
CUPS: ES0031234567890AB
```

### 16.4 Validaciones específicas

* Debe identificar electricidad.
* Debe extraer consumo en kWh de la tarifa PVPC.
* Debe soportar formato de consumo por tramos horarios si existe.

## 17. Parser Naturgy / Comercializadora Regulada electricidad

### 17.1 Nombre técnico

```txt
naturgy_regulada_electricidad
```

### 17.2 Datos esperados del ejemplo

```json
{
  "energy_type": "electricidad",
  "supplier": "naturgy_regulada_gas_power",
  "invoice_number": "FE25137022313356",
  "cups_original": "ES0022000006290850YS1P",
  "cups_key": "ES0022000006290850YS",
  "period_start": "2025-08-20",
  "period_end": "2025-08-26",
  "computed_year": 2025,
  "computed_month": 8,
  "consumption_kwh": 22,
  "total_amount_eur": 7.80
}
```

### 17.3 Patrones recomendados

Número de factura:

```txt
Nº factura: FE25137022313356
```

Periodo:

```txt
Periodo de consumo
20 de agosto de 2025 a 26 de agosto de 2025
```

Consumo:

```txt
Su consumo en el periodo facturado ha sido 22 kWh.
```

Importe:

```txt
TOTAL IMPORTE FACTURA: 7,80 €
```

CUPS:

```txt
Código unificado de punto de suministro CUPS: ES0022000006290850YS1P
```

### 17.4 Validaciones específicas

* Debe detectar electricidad mediante `DATOS DE LA FACTURA DE ELECTRICIDAD` o `INFORMACIÓN DE CONSUMO ELÉCTRICO`.
* Debe normalizar el CUPS con sufijo para enlazarlo al maestro.
* El aviso de normalización de CUPS será informativo si enlaza con CUPS controlado.

## 18. Parser Energía XXI gas natural

### 18.1 Nombre técnico

```txt
energia_xxi_gas_natural
```

### 18.2 Datos esperados del ejemplo

```json
{
  "energy_type": "gas_natural",
  "supplier": "energia_xxi",
  "invoice_number": "S25CON006941700",
  "cups_original": "ES0234150035789683GC",
  "cups_key": "ES0234150035789683GC",
  "period_start": "2024-12-23",
  "period_end": "2025-02-27",
  "computed_year": 2025,
  "computed_month": 2,
  "consumption_kwh": 8650,
  "total_amount_eur": 603.71
}
```

### 18.3 Patrones recomendados

Número de factura:

```txt
Núm. de factura: S25CON006941700
```

Periodo:

```txt
Període facturació: del 23/12/2024 al 27/02/2025
```

Consumo:

```txt
Consum Total 8.650,000 kWh
```

O:

```txt
Consum 8.650,00 kWh
```

Importe:

```txt
TOTAL IMPORT FACTURA 603,71 €
```

CUPS:

```txt
CUPS: ES0234150035789683GC
```

Tipo de energía:

```txt
Tipus de gas: Gas natural
```

### 18.4 Validaciones específicas

* Debe identificar gas natural.
* Debe extraer consumo en kWh, no m³.
* Debe soportar textos en catalán/valenciano presentes en la factura.
* Debe elegir el total con IVA, no el `Import total 498,93` previo al IVA.

## 19. Parser Naturgy / Comercializadora Regulada gas natural

### 19.1 Nombre técnico

```txt
naturgy_regulada_gas_natural
```

### 19.2 Datos esperados del ejemplo

```json
{
  "energy_type": "gas_natural",
  "supplier": "naturgy_regulada_gas_power",
  "invoice_number": "FE22137025647128",
  "cups_original": "ES0217020101041874FT",
  "cups_key": "ES0217020101041874FT",
  "period_start": "2022-09-10",
  "period_end": "2022-11-07",
  "computed_year": 2022,
  "computed_month": 11,
  "consumption_kwh": 317,
  "total_amount_eur": 63.61
}
```

### 19.3 Patrones recomendados

Número de factura:

```txt
Nº factura: FE22137025647128
```

Periodo:

```txt
Gas: Del 10.09.2022 al 07.11.2022
```

Consumo:

```txt
Consumo kWh: 30 m³ x 10,567 kWh* 317 kWh
```

O también:

```txt
Consumo gas
Período de 10.09.2022 a 30.09.2022 113 kWh
Período de 01.10.2022 a 07.11.2022 204 kWh
```

Importe:

```txt
Total a pagar 63,61€
```

CUPS:

```txt
Código CUPS: ES0217020101041874FT
```

Tipo de energía:

```txt
aquí tienes tu factura de gas
```

O:

```txt
Tus datos de suministro de gas
```

### 19.4 Validaciones específicas

* Debe identificar gas natural.
* Debe extraer el consumo final en kWh.
* Si detecta consumos parciales, puede comprobar que su suma coincide con el consumo total.
* Debe elegir `Total a pagar`, no `Total gas` ni `Base imponible`.
* Debe soportar periodo en formato con puntos: `10.09.2022`.
* Debe distinguir esta factura de las facturas eléctricas de la misma comercializadora.

## 20. Parser genérico

### 20.1 Nombre técnico

```txt
generic_invoice_parser
```

### 20.2 Uso

Se usa cuando no se reconoce un parser específico.

### 20.3 Estrategia

Debe intentar extraer:

* CUPS mediante patrón `ES...`;
* fechas del periodo;
* consumo en kWh;
* importe total con IVA;
* número de factura;
* tipo de energía por palabras clave.

### 20.4 Limitaciones

El parser genérico puede equivocarse más que un parser específico.

Por tanto:

* `parse_source = parser_generico`;
* `requires_visual_review = true`;
* no permite validación en bloque;
* genera aviso `GENERIC_PARSER_USED`.

### 20.5 Resultado con datos suficientes

Si extrae todos los campos críticos:

* estado inicial: `pendiente_validacion`;
* aviso amarillo;
* requiere revisión visual.

### 20.6 Resultado con datos insuficientes

Si faltan campos críticos:

* estado: `requiere_carga_manual` o `error_parseo`;
* avisos bloqueantes por cada campo faltante;
* el usuario puede completar manualmente.

## 21. Carga manual asistida

### 21.1 Cuándo se usa

Se utiliza cuando:

* no hay parser específico;
* el parser genérico no extrae todos los campos críticos;
* el PDF no contiene texto legible;
* el usuario decide corregir datos críticos.

### 21.2 Campos manuales

El usuario deberá introducir o corregir:

* CUPS;
* tipo de energía;
* fecha inicio;
* fecha cierre;
* consumo kWh;
* importe con IVA;
* número de factura, si se conoce;
* comercializadora, si se conoce.

### 21.3 Reglas

Aunque sea manual:

* se normaliza el CUPS;
* se comprueba superficie de control;
* se calcula mes/año desde fecha cierre;
* se comprueba duplicado;
* se generan avisos si procede.

## 22. Confianza de parseo

### 22.1 Rango

`parse_confidence` debe estar entre 0 y 1.

### 22.2 Criterio orientativo

| Confianza   | Interpretación |
| -----------: | -------------- |
| `>= 0.95`   | Alta           |
| `0.80-0.94` | Media          |
| `< 0.80`    | Baja           |

### 22.3 Validación en bloque

Solo podrán validarse en bloque facturas de parser específico con confianza alta y sin avisos amarillos/rojos.

### 22.4 Cálculo práctico

El cálculo puede ser simple en el MVP:

* todos los campos críticos encontrados por patrones específicos: alta;
* algún campo encontrado por fallback: media;
* varios candidatos o ambigüedad: baja/media;
* faltan campos críticos: baja.

## 23. Avisos producidos por parsers

### 23.1 Informativos

| Código                   | Descripción                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `CUPS_NORMALIZED`        | CUPS original transformado para comparación                  |
| `PERIOD_CROSSES_MONTHS`  | Periodo cruza varios meses, pero se imputa por fecha cierre |

### 23.2 Revisión visual

| Código                           | Descripción                            |
| -------------------------------- | -------------------------------------- |
| `GENERIC_PARSER_USED`            | Se ha usado parser genérico            |
| `LOW_CONFIDENCE`                 | Confianza inferior al umbral           |
| `MULTIPLE_AMOUNT_CANDIDATES`     | Varios importes posibles                |
| `MULTIPLE_CONSUMPTION_CANDIDATES`| Varios consumos posibles               |
| `ATYPICAL_PERIOD`                | Periodo inusual                        |
| `ZERO_CONSUMPTION`               | Consumo cero                           |
| `ZERO_OR_NEGATIVE_AMOUNT`        | Importe cero o negativo                |
| `POSSIBLE_RECTIFICATION`         | Posible factura rectificativa o ajuste |

### 23.3 Bloqueantes

| Código                  | Descripción                               |
| ----------------------- | ----------------------------------------- |
| `UNKNOWN_CUPS`          | No se detecta CUPS                        |
| `UNCONTROLLED_CUPS`     | CUPS no pertenece a superficie de control |
| `MISSING_PERIOD_START`  | Falta fecha inicio                        |
| `MISSING_PERIOD_END`    | Falta fecha cierre                        |
| `MISSING_CONSUMPTION`   | Falta consumo                             |
| `MISSING_TOTAL_AMOUNT`  | Falta importe total                       |
| `ENERGY_TYPE_MISMATCH`  | Energía incompatible con CUPS controlado   |
| `DUPLICATE_INVOICE`     | Factura duplicada exacta                  |
| `UNREADABLE_PDF`        | PDF sin texto legible                     |

## 24. Duplicados en procesamiento

### 24.1 Por hash

Antes de parsear, se debe calcular hash SHA-256 del PDF.

Si ya existe, no se procesa.

### 24.2 Por número de factura

Si ya existe una factura con mismo número y mismo suministrador, debe considerarse duplicada exacta salvo que se detecte caso excepcional.

### 24.3 Mismo CUPS y mes

No es duplicado por sí mismo.

Varias facturas distintas para el mismo CUPS y mes deben permitirse y sumarse.

## 25. Estructura de carpetas recomendada para backend

```txt
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── invoices.py
│   ├── parsers/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── detector.py
│   │   ├── generic.py
│   │   ├── iberdrola_electricidad.py
│   │   ├── curenergia_electricidad_pvpc.py
│   │   ├── naturgy_regulada_electricidad.py
│   │   ├── energia_xxi_gas_natural.py
│   │   └── naturgy_regulada_gas_natural.py
│   ├── services/
│   │   ├── pdf_text_extractor.py
│   │   ├── cups_normalizer.py
│   │   ├── number_parser.py
│   │   └── date_parser.py
│   └── schemas/
│       └── invoices.py
└── tests/
    └── parsers/
        ├── test_iberdrola_electricidad.py
        ├── test_curenergia_electricidad_pvpc.py
        ├── test_naturgy_regulada_electricidad.py
        ├── test_energia_xxi_gas_natural.py
        └── test_naturgy_regulada_gas_natural.py
```

## 26. Tests con ejemplos reales

### 26.1 Estructura de ejemplos

Los PDFs de ejemplo se almacenarán separados de los JSON esperados.

```txt
examples/
├── facturas/
│   ├── electricidad/
│   │   ├── iberdrola/
│   │   │   ├── iberdrola_electricidad_vallehermoso_2025_01.pdf
│   │   │   └── iberdrola_electricidad_fuenlabrada_2024_10.pdf
│   │   ├── curenergia/
│   │   │   └── curenergia_electricidad_pvpc_fuenlabrada_2023_04.pdf
│   │   └── naturgy_regulada/
│   │       └── naturgy_regulada_electricidad_uprose_2025_08.pdf
│   └── gas_natural/
│       ├── energia_xxi/
│       │   └── energia_xxi_gas_natural_zarzaquemada_2025_02.pdf
│       └── naturgy/
│           └── naturgy_regulada_gas_natural_vallehermoso_2022_11.pdf
└── parser_expected/
    ├── iberdrola_electricidad_vallehermoso_2025_01.json
    ├── iberdrola_electricidad_fuenlabrada_2024_10.json
    ├── curenergia_electricidad_pvpc_fuenlabrada_2023_04.json
    ├── naturgy_regulada_electricidad_uprose_2025_08.json
    ├── energia_xxi_gas_natural_zarzaquemada_2025_02.json
    └── naturgy_regulada_gas_natural_vallehermoso_2022_11.json
```

### 26.2 Criterio de test

Cada test debe:

1. leer el PDF;
2. ejecutar el detector/parser correspondiente;
3. comparar la salida con el JSON esperado;
4. validar CUPS normalizado;
5. validar fechas y mes de cómputo;
6. validar consumo;
7. validar importe;
8. validar tipo de energía;
9. validar nombre técnico del parser;
10. validar que el parser específico no cae en parser genérico.

### 26.3 Tolerancias

Para importes y consumos, al usar `Decimal`, no debería haber tolerancia salvo formato decimal equivalente.

Los expected JSON pueden guardar decimales como string para evitar errores de coma flotante.

Ejemplo:

```json
{
  "consumption_kwh": "88",
  "total_amount_eur": "23.70"
}
```

### 26.4 Correspondencia entre PDF y JSON esperado

La correspondencia se hará por nombre base.

Ejemplo:

```txt
iberdrola_electricidad_fuenlabrada_2024_10.pdf
iberdrola_electricidad_fuenlabrada_2024_10.json
```

## 27. JSON esperados iniciales

Los JSON esperados iniciales están definidos en `examples/parser_expected/`.

El conjunto mínimo de pruebas reales será:

| JSON esperado                                                | Parser                         | Fuente       | Caso                                              |
| ------------------------------------------------------------ | ------------------------------ | ------------ | ------------------------------------------------- |
| `iberdrola_electricidad_vallehermoso_2025_01.json`           | `iberdrola_electricidad`       | Electricidad | Iberdrola Vallehermoso enero 2025                 |
| `iberdrola_electricidad_fuenlabrada_2024_10.json`           | `iberdrola_electricidad`       | Electricidad | Iberdrola Fuenlabrada octubre 2024                |
| `curenergia_electricidad_pvpc_fuenlabrada_2023_04.json`    | `curenergia_electricidad_pvpc` | Electricidad | Curenergía PVPC Fuenlabrada abril 2023           |
| `naturgy_regulada_electricidad_uprose_2025_08.json`         | `naturgy_regulada_electricidad`| Electricidad | Naturgy regulada UPROSE agosto 2025               |
| `energia_xxi_gas_natural_zarzaquemada_2025_02.json`         | `energia_xxi_gas_natural`      | Gas natural  | Energía XXI Zarzaquemada febrero 2025              |
| `naturgy_regulada_gas_natural_vallehermoso_2022_11.json`    | `naturgy_regulada_gas_natural` | Gas natural  | Naturgy gas Vallehermoso noviembre 2022           |

No se recomienda duplicar en este documento el contenido completo de cada JSON para evitar inconsistencias. La fuente de verdad de los resultados esperados será cada archivo JSON de `examples/parser_expected/`.

## 28. Consideraciones de implementación

### 28.1 No acoplar parser a base de datos

Los parsers deben ser funciones o clases puras en la medida de lo posible.

No deben consultar base de datos directamente.

La asociación con CUPS controlados debe hacerse en una capa de servicio posterior.

### 28.2 Separar extracción y validación

El parser extrae datos.

La capa de negocio valida:

* superficie de control;
* duplicados;
* compatibilidad de energía;
* completitud;
* estados finales.

### 28.3 Guardar candidatos

Cuando haya ambigüedad, debe guardarse información en `raw_candidates` para facilitar depuración y revisión.

### 28.4 Versionado

Cada parser debe tener versión.

Si cambia la lógica, se incrementará la versión para poder rastrear con qué versión se procesó una factura.

### 28.5 Parsers específicos independientes

Cada parser específico debe estar aislado en su propio módulo.

No deben mezclarse reglas de formatos distintos en un único parser salvo utilidades compartidas.

Utilidades compartidas recomendadas:

* normalización de CUPS;
* parseo de fechas;
* parseo de números españoles;
* selección de importe final;
* selección de consumo total.

## 29. Criterios de aceptación

El módulo de parsers se considera válido si:

* extrae correctamente los seis ejemplos iniciales;
* identifica correctamente electricidad y gas natural;
* distingue correctamente los formatos de Iberdrola, Curenergía, Naturgy regulada electricidad, Energía XXI gas natural y Naturgy regulada gas natural;
* normaliza CUPS según reglas de negocio;
* calcula el mes de cómputo por fecha de cierre;
* extrae total con IVA, no subtotales;
* extrae consumo total en kWh;
* bloquea o marca correctamente PDFs sin datos críticos;
* diferencia parser específico de parser genérico;
* produce avisos conforme a `09_validaciones_y_avisos.md`;
* mantiene parsers independientes y versionados.

## 30. Pendientes

TODO: Confirmar nombres definitivos de los PDFs de ejemplo en el repositorio.

TODO: Confirmar si los PDFs de ejemplo se anonimizarán y se versionarán o se mantendrán fuera del repositorio.

TODO: Definir implementación exacta de normalización de CUPS con sufijos.

TODO: Definir política final de almacenamiento o eliminación de texto bruto.

TODO: Definir umbral final de confianza para validación en bloque.

TODO: Confirmar si el CUPS `ES0217020101041874FT` de Naturgy gas Vallehermoso se incorpora definitivamente a `data/seed/cups_controlados.csv` o se mantiene como caso válido fuera de superficie de control.
