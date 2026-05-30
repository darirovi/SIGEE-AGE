# CONVENCIONES_CODIGO.md

## 1. Propósito del documento

Este documento define las convenciones de código para implementar y mantener el MVP de la aplicación auxiliar SIGEE-AGE.

Debe servir como guía para OpenCode y para cualquier desarrollador que intervenga en el proyecto.

Sus objetivos son:

* mantener el código claro y predecible;
* evitar duplicación de reglas críticas;
* facilitar pruebas y mantenimiento;
* separar responsabilidades entre frontend, backend parser, base de datos y lógica de negocio;
* reducir riesgos de seguridad;
* asegurar precisión en consumos e importes;
* permitir añadir nuevos parsers sin rehacer la arquitectura.

---

## 2. Principios generales

Todo el código debe seguir estos principios:

1. Simplicidad antes que sofisticación.
2. Tipado estricto siempre que sea posible.
3. Separación clara de responsabilidades.
4. Reglas de negocio centralizadas y testeables.
5. Parsers desacoplados del resto de la aplicación.
6. Nada de integración automática con SIGEE-AGE.
7. Nada de scraping ni automatización de navegador.
8. Nada de prorrateo mensual en el MVP.
9. Nada de almacenamiento permanente obligatorio de PDFs.
10. Nada de `float` para importes o consumos.
11. Seguridad básica desde el inicio.
12. Código preparado para crecer, pero sin sobredimensionar.

---

## 3. Stack previsto

### 3.1 Frontend

Tecnologías previstas:

* Next.js;
* React;
* TypeScript;
* Tailwind CSS;
* Supabase client;
* librería de tablas si resulta útil.

### 3.2 Backend parser

Tecnologías previstas:

* Python;
* FastAPI;
* Pydantic;
* PyMuPDF o pdfplumber;
* Decimal;
* pytest.

### 3.3 Base de datos

Tecnología prevista:

* Supabase PostgreSQL;
* Supabase Auth;
* Supabase Storage privado si se conservan PDFs temporalmente.

---

## 4. Estructura recomendada del repositorio

```txt
sigee-age-helper/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── types/
│   │   └── tests/
│   └── parser-api/
│       ├── app/
│       │   ├── api/
│       │   ├── core/
│       │   ├── domain/
│       │   ├── parsers/
│       │   ├── services/
│       │   ├── utils/
│       │   └── main.py
│       └── tests/
├── packages/
│   └── shared/
│       ├── src/
│       └── tests/
├── docs/
├── opencode/
├── data/
│   └── seed/
├── examples/
│   └── facturas/
├── diagrams/
└── README.md
```

La estructura puede adaptarse al framework real, pero debe conservar la separación conceptual.

---

## 5. Convenciones de nombres

### 5.1 Carpetas

Usar nombres en minúsculas y, preferentemente, kebab-case en frontend:

```txt
invoice-review
controlled-cups
monthly-totals
```

En Python, usar snake_case:

```txt
invoice_parsers
text_extraction
format_detection
```

### 5.2 Archivos TypeScript

Usar nombres descriptivos.

Para componentes React:

```txt
InvoiceReviewTable.tsx
ControlledCupsForm.tsx
MonthlyTotalsFilters.tsx
```

Para servicios y utilidades:

```txt
invoiceService.ts
controlledCupsService.ts
normalizeCups.ts
calculateInvoiceTrafficLight.ts
```

Para tipos:

```txt
invoice.types.ts
cups.types.ts
monthlyTotals.types.ts
```

### 5.3 Archivos Python

Usar snake_case:

```txt
iberdrola_electricidad.py
naturgy_regulada_electricidad.py
energia_xxi_gas_natural.py
generic_invoice_parser.py
text_extractor.py
format_detector.py
money.py
dates.py
cups.py
```

### 5.4 Variables y funciones

En TypeScript:

```ts
const invoiceStatus = "pendiente_validacion";
function normalizeCups(value: string): string {}
```

En Python:

```python
invoice_status = "pendiente_validacion"
def normalize_cups(value: str) -> str:
    ...
```

### 5.5 Constantes

En TypeScript:

```ts
export const INVOICE_STATUSES = [
  "pendiente_validacion",
  "validada",
  "corregida",
] as const;
```

En Python:

```python
PARSER_VERSION = "1.0.0"
```

---

## 6. Idioma del código y comentarios

### 6.1 Código

Los identificadores técnicos deben estar preferentemente en inglés para mantener compatibilidad con convenciones habituales:

```txt
invoice
building
controlled_cups
monthly_totals
warning
```

Se aceptan términos propios del dominio cuando ya estén normalizados:

```txt
cups
sigee
```

### 6.2 Textos visibles para usuario

Los textos visibles en interfaz deben estar en español.

Ejemplos:

```txt
Factura pendiente de validación
CUPS no controlado
Total mensual incompleto
```

### 6.3 Comentarios

Los comentarios deben explicar decisiones o reglas no evidentes. No deben repetir lo que ya dice el código.

Correcto:

```ts
// El mes de cómputo se determina siempre por la fecha final del periodo.
const computedMonth = getMonthFromPeriodEnd(periodEnd);
```

Evitar:

```ts
// Incrementa i en 1
i++;
```

---

## 7. TypeScript

### 7.1 Configuración

TypeScript debe ejecutarse en modo estricto siempre que sea posible.

Recomendado:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 7.2 Evitar `any`

No usar `any` salvo causa justificada.

Preferir:

```ts
type InvoiceStatus =
  | "pendiente_validacion"
  | "validada"
  | "corregida"
  | "fuera_superficie_control"
  | "error_parseo"
  | "requiere_carga_manual"
  | "duplicada"
  | "descartada";
```

En vez de:

```ts
let status: any;
```

### 7.3 Tipos de dominio

Crear tipos compartidos para entidades principales:

```ts
export type EnergyTypeCode = "electricidad" | "gas_natural" | "gasoleo";

export type InvoiceStatus =
  | "pendiente_validacion"
  | "validada"
  | "corregida"
  | "fuera_superficie_control"
  | "error_parseo"
  | "requiere_carga_manual"
  | "duplicada"
  | "descartada";

export type WarningLevel = "info" | "warning" | "error";
```

### 7.4 Null y undefined

Usar `null` para valores ausentes persistidos en base de datos.

Usar `undefined` para propiedades opcionales internas cuando no proceda enviar el campo.

Evitar mezclar ambos sin criterio.

### 7.5 Validaciones

Toda entrada de usuario debe validarse antes de persistirse.

Mínimos:

* campos obligatorios;
* formato de fechas;
* mes entre 1 y 12;
* consumo numérico válido;
* importe numérico válido;
* CUPS original no vacío;
* PDF con extensión y MIME válidos.

---

## 8. React y Next.js

### 8.1 Componentes

Los componentes deben ser pequeños y con responsabilidad clara.

Ejemplo:

```txt
InvoiceReviewTable
InvoiceStatusBadge
InvoiceWarningsList
InvoiceTrafficLight
```

Evitar componentes grandes que mezclen:

* consultas;
* transformación de datos;
* presentación;
* mutaciones;
* reglas de negocio.

### 8.2 Organización por feature

Recomendado:

```txt
features/
├── invoices/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── types.ts
├── controlled-cups/
├── buildings/
└── monthly-totals/
```

### 8.3 Hooks

Los hooks deben encapsular consultas o estado de interfaz, no reglas de negocio críticas.

Ejemplo aceptable:

```ts
useInvoicesFilters()
useControlledCupsList()
```

Reglas como normalización de CUPS, cálculo de semáforo o cálculo de completitud deben estar en funciones testeables fuera del componente.

### 8.4 Formularios

Los formularios deben:

* mostrar errores claros;
* impedir envío si faltan campos obligatorios;
* no permitir edición manual de campos calculados como `cups_key`;
* recalcular campos derivados de forma explícita;
* confirmar acciones sensibles como descartar o dar de baja.

---

## 9. Tailwind y diseño UI

### 9.1 Criterio visual

La interfaz debe priorizar:

* claridad;
* legibilidad;
* rapidez de revisión;
* identificación de incidencias;
* consistencia.

No se busca un diseño complejo ni analítica visual avanzada en el MVP.

### 9.2 Estados visuales

Los colores no deben ser la única forma de transmitir información.

Correcto:

```txt
Rojo + texto: Bloqueada
Amarillo + texto: Requiere revisión
Verde + texto: Lista para validar
```

### 9.3 Tablas

Las tablas deben incluir, cuando proceda:

* filtros;
* estados vacíos;
* acciones claras;
* columnas esenciales;
* formato legible de importes y consumos.

---

## 10. Supabase y base de datos

### 10.1 Acceso a datos

El acceso desde frontend a Supabase debe limitarse a operaciones compatibles con seguridad básica.

Si se usa cliente Supabase directamente:

* activar RLS cuando proceda;
* no usar service role key en frontend;
* no exponer secretos;
* validar también en capa de aplicación.

### 10.2 Migraciones

Toda modificación estructural debe ir en migración.

Las migraciones deben:

* ser legibles;
* tener nombres descriptivos;
* incluir restricciones críticas;
* evitar cambios destructivos sin justificación.

Ejemplo de nombre:

```txt
20250601_create_energy_tables.sql
20250602_create_invoice_tables.sql
```

### 10.3 Seeds

Los seeds deben ser idempotentes si es posible.

No deben crear datos inventados.

Para CUPS controlados, la fuente inicial debe ser la documentación/pantallazos confirmados.

### 10.4 Precisión numérica

En PostgreSQL:

```sql
consumption_kwh numeric(14,3)
total_amount_eur numeric(14,2)
```

No usar:

```sql
float
real
double precision
```

para importes o consumos.

---

## 11. Estados y enums de dominio

### 11.1 Tipos de energía

Valores permitidos:

```txt
electricidad
gas_natural
gasoleo
```

### 11.2 Estados de factura

Valores permitidos:

```txt
pendiente_validacion
validada
corregida
fuera_superficie_control
error_parseo
requiere_carga_manual
duplicada
descartada
```

### 11.3 Fuentes de parseo

Valores permitidos:

```txt
parser_especifico
parser_generico
manual
```

### 11.4 Niveles de aviso

Valores permitidos:

```txt
info
warning
error
```

### 11.5 Estados de CUPS

Valores permitidos:

```txt
activo
baja
pendiente
```

---

## 12. Reglas de negocio críticas

Las siguientes reglas deben estar centralizadas y tener tests.

### 12.1 Normalización de CUPS

Debe existir una única función reutilizable.

Reglas:

* eliminar espacios;
* convertir a mayúsculas;
* conservar solo caracteres alfanuméricos;
* aplicar regla de equivalencia de sufijos.

Ejemplos obligatorios:

```txt
ES 0022 0000 0621 2876 CB -> ES0022000006212876CB
ES0022000006290850YS1P -> ES0022000006290850YS
```

### 12.2 Cálculo de mes de cómputo

El año y mes de cómputo salen siempre de `period_end`.

```txt
computed_year = year(period_end)
computed_month = month(period_end)
```

No se hace prorrateo.

### 12.3 Entrada en totales

Solo entran en totales las facturas con estado:

```txt
validada
corregida
```

### 12.4 Asociación edificio-factura

La factura se asocia al edificio a través del CUPS normalizado.

```txt
Factura -> CUPS controlado -> Edificio
```

El usuario no edita directamente el edificio de una factura.

### 12.5 Completitud mensual

Un mes está completo si todos los CUPS exigibles tienen factura validada o corregida.

Los CUPS exigibles se calculan por vigencia:

```txt
control_from <= mes_consulta <= control_to
```

Si `control_to` está vacío, el CUPS sigue activo.

---

## 13. Python

### 13.1 Estilo general

Usar código claro y tipado.

Recomendado:

```python
from decimal import Decimal
from datetime import date


def compute_period_month(period_end: date) -> tuple[int, int]:
    return period_end.year, period_end.month
```

### 13.2 Type hints

Toda función pública debe tener type hints.

Correcto:

```python
def parse_amount(value: str) -> Decimal:
    ...
```

Evitar:

```python
def parse_amount(value):
    ...
```

### 13.3 Pydantic

Usar Pydantic para contratos de entrada/salida del parser.

Modelos principales:

* `ParserWarning`;
* `InvoiceParseResult`.

### 13.4 Decimal

Usar `Decimal` para:

* importes;
* consumos;
* precios unitarios si se usan.

No usar `float`.

Correcto:

```python
Decimal("23.70")
```

Incorrecto:

```python
23.70
```

### 13.5 Errores

Los errores técnicos deben gestionarse sin exponer trazas internas al usuario.

La API puede registrar logs técnicos, pero la respuesta debe ser clara y segura.

---

## 14. FastAPI

### 14.1 Endpoints mínimos

```txt
GET /health
POST /parse-invoice
```

### 14.2 Responsabilidad del backend parser

El backend parser debe:

* recibir PDF;
* validar tipo y tamaño;
* extraer texto;
* detectar formato;
* ejecutar parser específico o genérico;
* devolver `InvoiceParseResult`.

No debe:

* escribir directamente en la base de datos;
* decidir si una factura entra en totales;
* validar superficie de control;
* gestionar usuarios;
* modificar SIGEE-AGE.

### 14.3 CORS

CORS debe limitarse mediante configuración:

```txt
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

No usar comodines en entornos no locales salvo decisión expresa.

---

## 15. Parsers de facturas

### 15.1 Interfaz común

Todos los parsers deben devolver el mismo contrato:

```python
InvoiceParseResult
```

Campos principales:

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

### 15.2 Nombre de parsers

Nombres oficiales:

```txt
iberdrola_electricidad
naturgy_regulada_electricidad
energia_xxi_gas_natural
generic_invoice_parser
```

### 15.3 Versionado de parsers

Cada parser debe declarar versión:

```python
PARSER_VERSION = "1.0.0"
```

Cambiar versión si se modifica comportamiento de extracción de forma relevante.

### 15.4 raw_candidates

Usar `raw_candidates` para conservar candidatos detectados cuando haya ambigüedad.

Ejemplo:

```json
{
  "amount_candidates": ["23,70", "18,63", "4,11"],
  "selected_total_amount": "23,70"
}
```

### 15.5 Warnings

Añadir avisos cuando:

* falta un campo crítico;
* hay varios candidatos;
* se usa parser genérico;
* el PDF no tiene texto suficiente;
* el consumo o importe son cero;
* se detecta posible rectificativa.

### 15.6 Parser genérico

El parser genérico debe ser conservador.

Reglas:

* `parse_source = parser_generico`;
* `parse_confidence <= 0.70`;
* aviso `GENERIC_PARSER_USED`;
* no habilita validación en bloque;
* no debe fallar si no encuentra campos.

---

## 16. Expresiones regulares y extracción

### 16.1 Regex legibles

Las expresiones regulares deben ser legibles y, si son complejas, tener comentario.

Correcto:

```python
INVOICE_NUMBER_RE = re.compile(
    r"N[ºú]m?\.?\s*(?:de\s*)?factura:\s*(?P<invoice_number>[A-Z0-9]+)",
    re.IGNORECASE,
)
```

### 16.2 No depender de una sola posición visual

Los PDFs pueden extraer texto en orden irregular.

Priorizar marcadores textuales y patrones robustos.

### 16.3 Tests por parser

Cada parser específico debe tener test con PDF real o texto real extraído.

Los tests deben comprobar, al menos:

* proveedor;
* número de factura;
* fechas;
* consumo;
* importe total;
* CUPS si aparece;
* energía;
* mes de cómputo.

---

## 17. Fechas, importes y consumos

### 17.1 Fechas

Usar `date` en Python y cadenas ISO `YYYY-MM-DD` en transporte JSON.

Interpretar:

```txt
31 de enero de 2025
03/03/2025
23/12/2024
27/02/2025
```

Contemplar meses en español y catalán si aparecen en facturas.

### 17.2 Importes

Convertir formato español:

```txt
23,70 € -> Decimal("23.70")
603,71 € -> Decimal("603.71")
```

### 17.3 Consumos

Convertir formatos como:

```txt
88 kWh -> Decimal("88")
8.650,000 kWh -> Decimal("8650.000")
```

### 17.4 Formato de salida

En JSON, si hay problemas de serialización de Decimal, usar cadenas o serialización controlada, pero nunca convertir internamente a float.

---

## 18. Gestión de PDFs

### 18.1 Almacenamiento

Los PDFs pueden conservarse temporalmente o en storage privado para revisión.

No deben exponerse públicamente.

No es obligatorio conservarlos permanentemente.

### 18.2 Metadatos

Siempre conservar:

* nombre original;
* hash SHA-256;
* tamaño;
* MIME type;
* fecha de subida;
* estado técnico;
* ruta privada si existe;
* fecha de borrado si se elimina.

### 18.3 Duplicados

La detección de duplicados exactos debe basarse en hash SHA-256.

No basta con el nombre de archivo.

---

## 19. Avisos

### 19.1 Estructura común

Todo aviso debe tener:

```json
{
  "level": "warning",
  "code": "MULTIPLE_AMOUNT_CANDIDATES",
  "message": "Se han detectado varios importes posibles. Revisa el total con IVA incluido antes de validar.",
  "field_name": "total_amount_eur",
  "is_blocking": false
}
```

### 19.2 Códigos estables

Usar códigos en mayúsculas con snake case.

Ejemplos:

```txt
CUPS_NORMALIZED
UNKNOWN_CUPS
UNCONTROLLED_CUPS
CUPS_AFTER_DEACTIVATION
UNREADABLE_PDF
DUPLICATE_FILE
GENERIC_PARSER_USED
MISSING_REQUIRED_FIELD
MULTIPLE_AMOUNT_CANDIDATES
MULTIPLE_CONSUMPTION_CANDIDATES
```

### 19.3 Mensajes

Los mensajes visibles deben estar en español y ser accionables.

Correcto:

```txt
El CUPS de esta factura no pertenece a la superficie de control. La factura no entrará en totales salvo que des de alta el CUPS.
```

Evitar:

```txt
Error CUPS.
```

---

## 20. Semáforo operativo

### 20.1 Valores

```txt
verde
amarillo
rojo
```

### 20.2 No usar solo color

El semáforo debe devolver también texto.

Ejemplo:

```ts
type InvoiceTrafficLight = {
  status: "verde" | "amarillo" | "rojo";
  label: string;
  description: string;
};
```

### 20.3 Centralización

El cálculo debe estar en una función reutilizable y testeable.

No duplicar lógica de semáforo en varios componentes.

---

## 21. Validación y acciones de usuario

### 21.1 Validación individual

Solo se puede validar si no hay errores bloqueantes.

Resultado:

* `validada` si no hubo cambios manuales;
* `corregida` si hubo cambios manuales.

### 21.2 Validación en bloque

Solo debe incluir facturas verdes.

Debe excluir:

* parser genérico;
* warnings;
* errores;
* duplicadas;
* descartadas;
* fuera de superficie;
* pendientes con revisión visual.

### 21.3 Descarte

Descartar no borra físicamente.

Debe:

* pedir confirmación;
* permitir motivo opcional;
* cambiar estado a `descartada`;
* excluir de totales;
* conservar trazabilidad.

---

## 22. Exportaciones

### 22.1 CSV

Debe ser compatible con Excel/LibreOffice.

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

### 22.2 Excel

Hojas recomendadas:

```txt
Totales
Facturas incluidas
CUPS faltantes
Avisos
```

### 22.3 Reglas

Las exportaciones deben:

* respetar filtros aplicados;
* partir de facturas validadas o corregidas;
* indicar completitud;
* no incluir PDFs;
* registrar auditoría si procede.

---

## 23. Auditoría mínima

Registrar acciones relevantes:

```txt
alta_cups
baja_cups
correccion_factura
validacion_factura
descarte_factura
exportacion
```

Estructura recomendada:

```json
{
  "event_type": "validacion_factura",
  "entity_type": "invoice",
  "entity_id": "uuid",
  "payload": {}
}
```

No convertir la auditoría en un workflow administrativo complejo.

---

## 24. Tests

### 24.1 Qué debe tener tests

Obligatorio para lógica crítica:

* normalización de CUPS;
* conversión de importes;
* conversión de consumos;
* parseo de fechas;
* cálculo de mes de cómputo;
* detector de formato;
* parsers específicos;
* parser genérico;
* duplicados por hash;
* asignación de estado inicial;
* semáforo;
* CUPS exigibles;
* completitud mensual;
* agregación de totales.

### 24.2 Convención de nombres

TypeScript:

```txt
normalizeCups.test.ts
calculateInvoiceTrafficLight.test.ts
```

Python:

```txt
test_normalize_cups.py
test_iberdrola_electricidad.py
test_format_detector.py
```

### 24.3 Fixtures

Usar fixtures claras y pequeñas.

Para parsers, usar PDFs de ejemplo o texto real extraído de los PDFs de ejemplo.

No depender de recursos externos para tests del MVP.

---

## 25. Manejo de errores

### 25.1 Errores técnicos

Deben registrarse internamente y mostrarse de forma comprensible.

Ejemplo visible:

```txt
No se ha podido procesar el PDF. Comprueba que el archivo es una factura PDF legible.
```

No mostrar al usuario:

```txt
Traceback ...
```

### 25.2 Errores de negocio

Deben traducirse a avisos claros.

Ejemplo:

```txt
El CUPS de esta factura no pertenece a la superficie de control.
```

### 25.3 Errores de validación de formularios

Deben aparecer junto al campo afectado cuando sea posible.

---

## 26. Seguridad básica

### 26.1 Secretos

Nunca subir secretos reales.

No incluir en repositorio:

* claves privadas;
* service role keys;
* contraseñas;
* tokens;
* URLs privadas con credenciales.

### 26.2 Variables de entorno

Usar `.env.example` sin valores reales.

### 26.3 PDFs

Los PDFs deben estar en almacenamiento privado o temporal.

No usar buckets públicos por defecto.

### 26.4 Validación de archivos

Validar:

* extensión `.pdf`;
* MIME type;
* tamaño máximo;
* errores de lectura.

### 26.5 CORS

No usar `*` en entornos no locales.

---

## 27. Logs

### 27.1 Qué registrar

Registrar información técnica útil:

* inicio de parseo;
* parser usado;
* error técnico controlado;
* identificador de subida si existe;
* duración si se mide rendimiento.

### 27.2 Qué no registrar

No registrar innecesariamente:

* PDFs completos;
* textos completos de facturas en producción;
* secretos;
* datos sensibles no necesarios;
* trazas visibles al usuario.

---

## 28. Rendimiento y límites

El MVP no requiere optimización avanzada.

Sí debe evitar:

* procesar PDFs duplicados innecesariamente;
* bloquear toda la subida múltiple por un archivo fallido;
* consultas muy ineficientes en pantallas principales;
* cargar PDFs completos cuando no se necesitan.

---

## 29. Accesibilidad y usabilidad básica

La interfaz debe:

* usar textos claros;
* no depender solo de color;
* tener botones con etiquetas comprensibles;
* mostrar estados de carga;
* mostrar estados vacíos;
* confirmar acciones sensibles;
* permitir revisar incidencias de forma rápida.

---

## 30. Revisión antes de merge o entrega

Antes de considerar terminada una tarea, comprobar:

1. La tarea cumple su criterio de aceptación.
2. No contradice la documentación.
3. No añade funcionalidades fuera de alcance.
4. No duplica reglas críticas.
5. No introduce `float` en importes o consumos.
6. No expone secretos.
7. Tiene tests si afecta a lógica crítica.
8. El lint/formateo pasa si está configurado.
9. Los errores se gestionan de forma clara.
10. Se puede explicar qué archivos se han modificado y por qué.

---

## 31. Checklist rápida para OpenCode al terminar cada tarea

OpenCode debe responder siempre con:

```txt
Resumen:

Archivos modificados:

Reglas de negocio afectadas:

Pruebas ejecutadas:

Comandos ejecutados:

Limitaciones o riesgos:

Siguiente paso recomendado:
```

Si no ha ejecutado pruebas, debe indicarlo expresamente y explicar por qué.

---

## 32. Criterios de rechazo de una implementación

Una implementación debe rechazarse si:

* rompe el flujo principal;
* introduce integración automática con SIGEE-AGE;
* usa scraping o automatización de navegador;
* usa `float` para importes o consumos;
* duplica normalización de CUPS;
* permite validar facturas con errores bloqueantes;
* suma facturas no validadas en totales;
* calcula el mes de cómputo con una fecha distinta de `period_end`;
* hace prorrateo entre meses;
* expone secretos;
* expone PDFs públicamente sin decisión expresa;
* no permite mantener trazabilidad mínima;
* no tiene tests en lógica crítica.

---

## 33. Criterio de evolución futura

El código debe dejar abierta la posibilidad de añadir en fases posteriores:

* nuevos parsers;
* entrada manual más avanzada;
* parser de gasóleo;
* roles y permisos;
* auditoría más completa;
* integración futura si se autorizase.

Pero esas posibilidades no deben implementarse en el MVP salvo instrucción expresa.

La prioridad actual es entregar una herramienta auxiliar simple, verificable y alineada con las reglas de negocio documentadas.
