# CONTEXTO_PROYECTO.md

## 1. Propósito de este documento

Este documento proporciona a OpenCode el contexto mínimo y suficiente para empezar a implementar el MVP de la aplicación auxiliar SIGEE-AGE.

Debe leerse antes de cualquier tarea de desarrollo. Su función es evitar interpretaciones incorrectas del alcance, de las reglas de negocio y de la relación de la aplicación con SIGEE-AGE.

OpenCode debe tratar este documento como punto de entrada, pero no como única fuente. La implementación debe respetar también el resto de documentación funcional y técnica del proyecto.

---

## 2. Resumen del proyecto

El proyecto consiste en construir una aplicación web auxiliar para preparar datos de consumos energéticos antes de introducirlos manualmente en SIGEE-AGE.

SIGEE-AGE es la plataforma destino donde el usuario gestor debe registrar consumos y gastos energéticos por:

* edificio;
* fuente energética;
* año;
* mes;
* consumo;
* importe económico con IVA incluido.

La aplicación que se va a construir no sustituye a SIGEE-AGE. Tampoco debe modificar SIGEE-AGE, automatizar navegación ni hacer scraping.

Su objetivo es ayudar al usuario a:

1. Subir facturas energéticas en PDF.
2. Extraer datos relevantes automáticamente.
3. Asociar cada factura al edificio correcto mediante CUPS.
4. Revisar y corregir datos cuando sea necesario.
5. Validar facturas.
6. Calcular totales mensuales por edificio y fuente energética.
7. Detectar incidencias, duplicados y facturas faltantes.
8. Exportar resultados para facilitar la carga manual posterior en SIGEE-AGE.

---

## 3. Problema operativo que resuelve

El usuario gestor recibe facturas de distintas comercializadoras y en formatos PDF diferentes.

Un mismo edificio puede tener varios CUPS, y cada CUPS puede generar facturas independientes. Para preparar correctamente un mes, el usuario necesita:

* identificar el CUPS de cada factura;
* saber a qué edificio pertenece;
* saber a qué fuente energética corresponde;
* calcular el mes de imputación;
* sumar consumos e importes;
* comprobar si falta alguna factura esperada;
* evitar duplicados;
* trasladar los datos finales a SIGEE-AGE.

El proceso manual actual consume tiempo y genera riesgo de errores de transcripción, asociación, suma y completitud.

La aplicación debe reducir ese trabajo, pero manteniendo siempre revisión humana final.

---

## 4. Principio fundamental

La aplicación es una herramienta auxiliar.

Debe preparar, ordenar, revisar y consolidar información, pero no debe introducir datos automáticamente en SIGEE-AGE.

El usuario gestor mantiene la responsabilidad final sobre los datos validados y exportados.

---

## 5. Alcance del MVP

El MVP debe permitir:

* autenticación simple mediante email y contraseña;
* gestión de un único perfil funcional: `gestor`;
* consulta de edificios incluidos en la superficie de control;
* consulta, alta, edición limitada y baja lógica de CUPS controlados;
* subida individual y múltiple de facturas PDF;
* extracción automática de texto de PDFs legibles;
* detección de formato de factura;
* ejecución de parsers específicos iniciales;
* parser genérico para formatos no reconocidos;
* revisión visual de datos extraídos;
* corrección manual de datos;
* validación o descarte de facturas;
* detección de duplicados;
* detección de CUPS no controlados;
* cálculo de totales mensuales por edificio y fuente energética;
* detección de meses incompletos;
* exportación CSV y Excel.

---

## 6. Fuentes energéticas

El modelo debe contemplar estas fuentes:

```txt
electricidad
gas_natural
gasoleo
```

### 6.1 Electricidad

Fuente principal del MVP.

Debe contar con parseo automático de facturas PDF.

Parsers específicos iniciales:

* `iberdrola_electricidad`;
* `naturgy_regulada_electricidad`.

### 6.2 Gas natural

Fuente principal del MVP.

Debe contar con parseo automático de facturas PDF.

Parser específico inicial:

* `energia_xxi_gas_natural`.

### 6.3 Gasóleo

Debe estar previsto en el modelo de datos, pero no se desarrollará parser automático en la primera fase.

Criterios iniciales:

* se contempla como fuente energética posible;
* se asocia inicialmente a UPROSE;
* no necesariamente sigue periodicidad mensual;
* podrá tratarse más adelante mediante carga manual o parser específico.

---

## 7. Edificios iniciales

El MVP parte de los edificios identificados en la documentación y pantallazos aportados.

Edificios iniciales:

| Código interno sugerido | Nombre                                  |
| ----------------------- | --------------------------------------- |
| `FUENLABRADA`           | Viviendas Logísticas de Fuenlabrada     |
| `VILLAVERDE`            | Viviendas Logísticas de Villaverde      |
| `ZARZAQUEMADA`          | Acuartelamiento de Zarzaquemada-Leganés |
| `VALLEHERMOSO`          | Acuartelamiento Vallehermoso            |
| `UPROSE`                | UPROSE                                  |

Los nombres pueden ajustarse en el seed inicial si se normaliza la denominación, pero deben conservar una identificación clara.

---

## 8. Superficie de control

La superficie de control es el conjunto de edificios, fuentes energéticas y CUPS que la aplicación debe controlar.

Estructura lógica:

```txt
Edificio -> Fuente energética -> CUPS controlados
```

La fuente de verdad inicial son los CUPS visibles en los pantallazos de SIGEE-AGE aportados al proyecto.

El CSV auxiliar no debe considerarse fuente de verdad si contiene CUPS no confirmados por pantallazo, salvo que el usuario los dé de alta manualmente.

---

## 9. Regla de asociación edificio-factura

Una factura se asocia al edificio mediante el CUPS normalizado.

Relación principal:

```txt
Factura -> CUPS controlado -> Edificio
```

El usuario no debe editar directamente el edificio de una factura.

Si se corrige el CUPS, la aplicación debe recalcular automáticamente el edificio asociado.

---

## 10. Normalización de CUPS

Debe existir una única función reutilizable de normalización de CUPS.

La normalización debe:

* eliminar espacios;
* convertir a mayúsculas;
* conservar solo caracteres alfanuméricos;
* aplicar la regla de equivalencia definida para comparar CUPS con sufijos.

Ejemplos:

| CUPS original               | CUPS normalizado       |
| --------------------------- | ---------------------- |
| `ES 0022 0000 0621 2876 CB` | `ES0022000006212876CB` |
| `ES0022000006290850YS1P`    | `ES0022000006290850YS` |

La normalización no debe duplicarse en varios puntos del código.

---

## 11. Regla de imputación mensual

El mes y año de cómputo de una factura se determinan por la fecha de cierre del periodo de facturación.

```txt
computed_year = año(period_end)
computed_month = mes(period_end)
```

No se hará prorrateo por días entre meses en el MVP.

Ejemplo:

```txt
Periodo: 10/12/2024 - 15/01/2025
Mes de cómputo: enero 2025
```

---

## 12. Datos mínimos de una factura válida

Para que una factura pueda entrar en totales debe disponer de:

* CUPS normalizado reconocible;
* fuente energética;
* fecha de inicio del periodo;
* fecha de cierre del periodo;
* año y mes calculados;
* consumo en kWh;
* importe total con IVA incluido;
* estado final `validada` o `corregida`.

El número de factura es muy recomendable, pero no siempre debe bloquear si el resto de datos permite trazabilidad suficiente.

---

## 13. Estados principales de factura

Estados previstos:

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

Solo entran en totales:

```txt
validada
corregida
```

No entran en totales:

* facturas pendientes;
* duplicadas;
* descartadas;
* con error de parseo;
* fuera de superficie de control;
* que requieren carga manual y no han sido completadas;
* con avisos bloqueantes no corregidos.

---

## 14. Avisos y semáforos

Cada aviso debe tener:

* código estable;
* nivel;
* mensaje visible;
* campo afectado, si procede;
* indicador de bloqueo.

Niveles:

```txt
info
warning
error
```

Semáforo operativo:

| Color    | Significado              | Acción esperada                                |
| -------- | ------------------------ | ---------------------------------------------- |
| Verde    | Lista para validar       | Validar individualmente o en bloque            |
| Amarillo | Requiere revisión visual | Revisar PDF y confirmar o corregir             |
| Rojo     | Bloqueada                | Corregir, completar, sustituir PDF o descartar |

La validación en bloque solo debe permitirse para facturas sin incidencias relevantes.

---

## 15. Parsers iniciales

Los parsers específicos iniciales son:

| Parser                          | Fuente       | Formato                                |
| ------------------------------- | ------------ | -------------------------------------- |
| `iberdrola_electricidad`        | Electricidad | Iberdrola Clientes                     |
| `naturgy_regulada_electricidad` | Electricidad | Comercializadora Regulada, Gas & Power |
| `energia_xxi_gas_natural`       | Gas natural  | Energía XXI                            |

También debe existir:

```txt
generic_invoice_parser
```

El parser genérico puede intentar extraer datos básicos de PDFs no reconocidos, pero sus resultados deben requerir revisión visual y no deben permitir validación automática en bloque.

---

## 16. Flujo básico de procesamiento de facturas

El flujo recomendado es:

```txt
1. Recibir PDF.
2. Calcular hash SHA-256.
3. Comprobar duplicado exacto por hash.
4. Extraer texto del PDF.
5. Detectar si el PDF tiene texto suficiente.
6. Identificar comercializadora/formato.
7. Ejecutar parser específico si existe.
8. Ejecutar parser genérico si no existe parser específico.
9. Normalizar CUPS, fechas, consumo e importe.
10. Validar campos críticos.
11. Asociar CUPS con superficie de control.
12. Crear registro técnico de subida.
13. Crear factura con datos extraídos.
14. Crear avisos.
15. Mostrar resultado para revisión.
```

---

## 17. Contrato común de parser

Todo parser debe devolver una estructura normalizada equivalente a:

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

Los parsers no deben decidir por sí mismos si una factura entra en totales. Esa decisión pertenece a la capa de negocio.

---

## 18. Stack técnico recomendado

### Frontend

* Next.js;
* React;
* TypeScript;
* Tailwind CSS;
* cliente Supabase.

### Base de datos y autenticación

* Supabase Auth;
* Supabase PostgreSQL;
* Supabase Storage privado si se decide conservar PDFs temporalmente.

### Backend de parseo

* Python;
* FastAPI;
* Pydantic;
* PyMuPDF o pdfplumber;
* Decimal para importes y consumos;
* pytest para pruebas.

---

## 19. Separación de responsabilidades

### Frontend

Debe encargarse de:

* experiencia de usuario;
* login y sesión;
* carga de PDFs;
* revisión y corrección;
* validación o descarte;
* consulta de edificios, CUPS, facturas y totales;
* exportaciones;
* visualización del PDF durante revisión, si está disponible.

No debe encargarse de:

* parsear PDFs;
* guardar secretos;
* exponer PDFs públicamente;
* duplicar reglas complejas que deban vivir en capa de negocio.

### Backend parser

Debe encargarse de:

* extraer texto de PDFs;
* detectar formato;
* ejecutar parsers;
* devolver datos normalizados;
* generar avisos técnicos de extracción.

No debe encargarse de:

* validar superficie de control contra base de datos;
* decidir entrada en totales;
* gestionar usuarios;
* modificar SIGEE-AGE.

### Capa de negocio

Debe encargarse de:

* comprobar CUPS contra superficie de control;
* asociar factura a edificio;
* comprobar compatibilidad de fuente energética;
* detectar duplicados;
* asignar estado inicial;
* permitir o bloquear validación;
* calcular totales y completitud;
* generar avisos funcionales.

---

## 20. Modelo de datos mínimo esperado

Entidades principales:

```txt
users
energy_types
buildings
controlled_cups
invoice_uploads
invoices
invoice_warnings
monthly_totals
audit_events
```

Los totales mensuales pueden calcularse a partir de facturas validadas o materializarse como vista/tabla derivada si facilita rendimiento o exportación.

Consumos e importes deben almacenarse como `numeric` o `Decimal`, nunca como `float`.

---

## 21. Exportaciones

El MVP debe permitir exportar resultados a:

* CSV;
* Excel.

Las exportaciones deben estar orientadas a facilitar la carga manual posterior en SIGEE-AGE.

Los datos exportados deben partir de facturas validadas o corregidas y deben indicar claramente si el total mensual está completo o incompleto.

---

## 22. Restricciones importantes

No implementar en el MVP:

* integración automática con SIGEE-AGE;
* scraping;
* automatización de navegador;
* SSO corporativo;
* roles múltiples;
* permisos por edificio;
* aprobación por doble usuario;
* auditoría avanzada;
* prorrateo entre meses;
* parser automático de gasóleo;
* almacenamiento permanente obligatorio de PDFs;
* OCR avanzado salvo decisión posterior.

---

## 23. Documentación que debe respetarse

Antes de implementar cada área, OpenCode debe consultar la documentación específica:

| Documento                            | Uso principal                |
| ------------------------------------ | ---------------------------- |
| `00_resumen_ejecutivo.md`            | Visión general del proyecto  |
| `01_contexto_y_objetivo.md`          | Contexto funcional y límites |
| `02_alcance_mvp.md`                  | Qué entra y qué queda fuera  |
| `03_requisitos_funcionales.md`       | Requisitos implementables    |
| `04_reglas_negocio.md`               | Reglas obligatorias          |
| `05_modelo_datos.md`                 | Estructura de datos          |
| `06_arquitectura_tecnica.md`         | Arquitectura y stack         |
| `07_pantallas_y_flujos.md`           | Pantallas y navegación       |
| `08_parsers_facturas.md`             | Diseño de parsers            |
| `09_validaciones_y_avisos.md`        | Estados, avisos y bloqueos   |
| `10_exportaciones.md`                | Formatos de salida           |
| `11_plan_implementacion_opencode.md` | Plan de implementación       |
| `12_glosario.md`                     | Términos del proyecto        |

La documentación para OpenCode complementaria será:

| Documento                           | Uso principal                                  |
| ----------------------------------- | ---------------------------------------------- |
| `opencode/TAREAS_IMPLEMENTACION.md` | Lista ordenada de tareas                       |
| `opencode/PROMPTS_DESARROLLO.md`    | Prompts de trabajo por bloque                  |
| `opencode/CHECKLIST_VALIDACION.md`  | Checklist antes de considerar terminado el MVP |
| `opencode/CONVENCIONES_CODIGO.md`   | Estilo, organización y buenas prácticas        |

---

## 24. Definición de éxito del MVP

El MVP se considera funcionalmente válido si permite:

1. Autenticarse como usuario gestor.
2. Consultar edificios y CUPS controlados.
3. Subir facturas PDF de ejemplo.
4. Extraer correctamente datos clave de los formatos iniciales.
5. Detectar duplicados exactos.
6. Detectar CUPS no controlados.
7. Revisar, corregir, validar o descartar facturas.
8. Calcular totales mensuales por edificio y fuente energética.
9. Mostrar si un mes está completo o incompleto.
10. Exportar datos a CSV y Excel.
11. Mantener separación clara entre datos extraídos y datos validados.
12. No modificar ni interactuar automáticamente con SIGEE-AGE.

---

## 25. Criterio de implementación

Ante cualquier duda, OpenCode debe priorizar:

1. Cumplimiento de reglas de negocio.
2. Simplicidad mantenible.
3. Trazabilidad mínima suficiente.
4. Seguridad básica.
5. Claridad para el usuario gestor.
6. Facilidad para añadir nuevos parsers en el futuro.

No debe sobredimensionar el MVP con funcionalidades no solicitadas.
