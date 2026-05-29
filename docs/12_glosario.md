# Glosario

## 1. Propósito del documento

Este documento recoge los términos principales utilizados en la documentación del MVP de la aplicación auxiliar SIGEE-AGE.

Su finalidad es unificar el lenguaje entre perfiles funcionales, técnicos, responsables de proyecto y herramientas de apoyo al desarrollo.

Debe utilizarse como referencia común para evitar ambigüedades durante:

* análisis funcional;
* diseño técnico;
* implementación;
* pruebas;
* validación de resultados;
* comunicación con OpenCode o equipo de desarrollo.

## 2. Términos generales del proyecto

### Aplicación auxiliar

Herramienta web propuesta para preparar, revisar, consolidar y exportar datos energéticos antes de introducirlos manualmente en SIGEE-AGE.

No sustituye a SIGEE-AGE ni introduce datos automáticamente en dicha plataforma.

### SIGEE-AGE

Plataforma destino en la que el usuario gestor debe registrar consumos energéticos agregados por edificio, fuente energética, año y mes.

En el MVP, SIGEE-AGE se mantiene como sistema externo y la carga final sigue siendo manual.

### MVP

Producto mínimo viable.

Primera versión funcional de la aplicación, centrada en resolver el flujo principal sin sobredimensionar el sistema.

Incluye carga de facturas PDF, parseo, revisión, validación, cálculo de totales y exportación.

### Prueba de concepto

Versión inicial destinada a validar si el enfoque técnico y funcional resuelve el problema operativo real.

No implica todavía una herramienta definitiva ni completamente integrada en procedimientos administrativos.

### Usuario gestor

Perfil funcional principal del MVP.

Es la persona que sube facturas, revisa datos, corrige errores, valida información y utiliza los resultados para preparar la carga manual en SIGEE-AGE.

### Herramienta de apoyo

Concepto que recuerda que la aplicación ayuda a reducir trabajo manual y errores, pero no elimina la responsabilidad del usuario sobre la validación final de los datos.

## 3. Energía y suministros

### Fuente energética

Tipo de energía o suministro que se controla.

Valores previstos inicialmente:

* electricidad;
* gas natural;
* gasóleo.

### Electricidad

Fuente energética principal del MVP.

Se contempla la carga y parseo automático de facturas PDF de electricidad, inicialmente para formatos Iberdrola y Naturgy / Comercializadora Regulada Gas & Power.

### Gas natural

Fuente energética incluida en el MVP.

Se contempla la carga y parseo automático de facturas PDF de gas natural, inicialmente para formato Energía XXI.

### Gasóleo / gasoil

Fuente energética prevista en el modelo de datos, pero sin parser automático en el MVP inicial.

En el caso actual se contempla inicialmente asociada a UPROSE y con tratamiento futuro mediante carga manual o parser específico.

### Comercializadora

Empresa que emite la factura energética al titular del contrato.

Ejemplos del MVP:

* Iberdrola Clientes, S.A.U.;
* Comercializadora Regulada, Gas & Power, S.A.;
* Energía XXI Comercializadora de Referencia, S.L.U.

### Suministrador

Entidad asociada al suministro energético.

En algunos documentos puede usarse de forma próxima a comercializadora, aunque técnicamente puede existir diferencia entre comercializadora y distribuidora.

### Distribuidora

Empresa responsable de la red de distribución o del acceso al suministro.

Puede aparecer en facturas, pero no es el eje principal del MVP.

### Tarifa

Modalidad contractual o de acceso asociada al suministro.

Puede guardarse como información auxiliar del CUPS, pero no condiciona los cálculos principales del MVP salvo validaciones o trazabilidad.

### Peaje

Concepto regulado asociado al acceso a redes de transporte o distribución.

Puede aparecer en facturas, pero no se usa como dato principal para SIGEE-AGE en el MVP.

## 4. CUPS y superficie de control

### CUPS

Código Unificado de Punto de Suministro.

Identifica un punto de suministro energético.

Es el eje principal para asociar una factura con un edificio.

### CUPS original

Valor del CUPS tal como aparece en la factura o como lo introduce el usuario.

Debe conservarse para trazabilidad.

Campo recomendado:

```txt
cups_original
```

### CUPS normalizado

Valor del CUPS transformado para comparación interna.

Debe eliminar espacios, convertir a mayúsculas, conservar caracteres alfanuméricos y aplicar la regla de equivalencia definida para sufijos.

Campo recomendado:

```txt
cups_key
```

### Normalización de CUPS

Proceso por el que un CUPS original se convierte en una clave comparable.

Debe realizarse mediante una única función reutilizable.

Ningún parser debe implementar su propia normalización independiente.

### Sufijo de CUPS

Parte final del CUPS que puede variar según el formato mostrado en factura.

La aplicación debe aplicar la equivalencia definida para comparar correctamente CUPS con sufijos extendidos.

Ejemplo:

```txt
ES0022000006290850YS1P -> ES0022000006290850YS
```

### CUPS controlado

CUPS incluido en la superficie de control de la aplicación.

Solo los CUPS controlados y vigentes se exigen para calcular completitud mensual.

### Superficie de control

Conjunto de edificios, fuentes energéticas y CUPS que la aplicación debe controlar.

Estructura lógica:

```txt
Edificio -> Fuente energética -> CUPS controlados
```

### CUPS exigible

CUPS que debe tener al menos una factura válida para un edificio, fuente energética y mes concreto.

Un CUPS es exigible si:

* pertenece a la superficie de control;
* está asociado al edificio;
* pertenece a la fuente energética consultada;
* su vigencia incluye el mes consultado.

### CUPS faltante

CUPS exigible que no tiene factura válida imputada al mes consultado.

Los CUPS faltantes determinan que un mes esté incompleto.

### CUPS fuera de superficie de control

CUPS detectado en una factura que no existe en la superficie de control.

La factura no debe entrar automáticamente en totales.

El usuario puede descartarla o dar de alta el CUPS si procede.

### Alta de CUPS

Operación por la que se incorpora un nuevo CUPS a la superficie de control.

Debe indicar edificio, fuente energética, CUPS original, primer mes a controlar y estado.

### Baja de CUPS

Operación por la que un CUPS deja de ser exigible desde el mes posterior al último mes controlado.

No implica borrado físico si existen facturas o histórico asociado.

### Vigencia de CUPS

Periodo durante el cual un CUPS está dentro de la superficie de control y se exige para completitud.

Se define mediante:

* primer mes a controlar;
* último mes a controlar, si existe.

## 5. Edificios

### Edificio

Unidad funcional sobre la que se consolidan consumos e importes energéticos.

Un edificio puede tener varios CUPS asociados.

### Edificio inicial

Edificio incluido en el seed inicial del MVP.

Edificios previstos:

* Viviendas Logísticas de Fuenlabrada;
* Viviendas Logísticas de Villaverde;
* Acuartelamiento de Zarzaquemada-Leganés;
* Acuartelamiento Vallehermoso;
* UPROSE.

### Código interno de edificio

Clave estable usada por la aplicación para identificar un edificio.

Campo recomendado:

```txt
building_key
```

Ejemplos:

* `FUENLABRADA`;
* `VILLAVERDE`;
* `ZARZAQUEMADA`;
* `VALLEHERMOSO`;
* `UPROSE`.

### Asociación factura-edificio

Proceso por el que una factura se vincula a un edificio a partir del CUPS normalizado.

El usuario no debe editar directamente el edificio de una factura.

Si se corrige el CUPS, el edificio debe recalcularse automáticamente.

## 6. Facturas

### Factura energética

Documento emitido por una comercializadora con datos de consumo, periodo facturado e importe.

En el MVP se procesan facturas PDF de electricidad y gas natural.

### PDF legible

PDF del que se puede extraer texto sin OCR avanzado.

El MVP asume que las facturas de entrada son PDFs con texto legible.

### PDF sin texto legible

PDF del que no se puede extraer texto suficiente.

Debe generar aviso bloqueante y requerir carga manual o sustitución del archivo.

### Número de factura

Identificador de factura emitido por la comercializadora.

Es muy recomendable para trazabilidad y detección de duplicados, aunque no siempre debe bloquear si faltase y el resto de datos son suficientes.

Campo recomendado:

```txt
invoice_number
```

### Periodo de facturación

Intervalo de fechas cubierto por la factura.

Incluye:

* fecha de inicio;
* fecha de cierre.

Campos recomendados:

```txt
period_start
period_end
```

### Fecha de cierre del periodo

Fecha final del periodo facturado.

Es la fecha que determina el mes y año de cómputo.

### Mes de cómputo

Mes al que se imputa íntegramente una factura.

Se calcula a partir de la fecha de cierre del periodo.

Campo recomendado:

```txt
computed_month
```

### Año de cómputo

Año al que se imputa íntegramente una factura.

Se calcula a partir de la fecha de cierre del periodo.

Campo recomendado:

```txt
computed_year
```

### Imputación mensual

Regla que asigna una factura a un año y mes.

En el MVP:

```txt
Mes y año de cómputo = mes y año de period_end
```

No se realiza prorrateo.

### Prorrateo

Distribución proporcional de consumo o importe entre varios meses.

Queda fuera del MVP.

Aunque una factura cubra días de varios meses, todo se imputa al mes de la fecha de cierre.

### Consumo

Energía consumida indicada en factura.

Debe guardarse en kWh.

Campo recomendado:

```txt
consumption_kwh
```

### Consumo en kWh

Unidad normalizada de consumo energético utilizada por el MVP.

En gas natural, si la factura muestra m³ y kWh, debe extraerse el valor final en kWh.

### Importe total con IVA incluido

Importe final de factura que debe usarse para cálculos y exportaciones.

Campo recomendado:

```txt
total_amount_eur
```

No deben usarse subtotales, bases imponibles, potencia, energía parcial ni IVA aislado.

### Base imponible

Importe antes de impuestos.

No debe usarse como gasto total en el MVP.

### Total de factura

Importe final que incluye impuestos y conceptos aplicables.

Es el valor económico que debe entrar en totales.

### Rectificativa

Factura que corrige o ajusta una facturación anterior.

En el MVP se trata como factura válida si el usuario la valida.

Se imputa por su propia fecha de cierre y se suma si corresponde al mismo edificio, fuente, CUPS y mes.

### Ajuste

Factura o concepto que regulariza un consumo o importe.

Se trata de forma similar a una rectificativa si el usuario lo valida.

### Facturación partida

Situación en la que un mismo CUPS y mes puede tener varias facturas distintas.

No debe bloquearse automáticamente.

Si las facturas son distintas y válidas, se suman.

## 7. Parseo y extracción

### Parser

Componente que recibe texto o PDF de una factura y extrae datos estructurados.

Debe devolver un contrato común normalizado.

### Parser específico

Parser diseñado para una comercializadora o formato concreto.

Ejemplos:

* `iberdrola_electricidad`;
* `naturgy_regulada_electricidad`;
* `energia_xxi_gas_natural`.

### Parser genérico

Parser basado en patrones comunes, usado cuando no se reconoce un formato específico.

Sus resultados requieren revisión visual y no permiten validación en bloque.

### Detector de formato

Componente que analiza el texto de la factura para decidir qué parser debe ejecutarse.

Busca marcadores de comercializadora, tipo de factura y etiquetas conocidas.

### Extracción de texto

Proceso de obtener texto legible desde el PDF antes de aplicar parsers.

Puede realizarse con herramientas como PyMuPDF o pdfplumber.

### OCR

Reconocimiento óptico de caracteres sobre imágenes.

Queda fuera del MVP salvo decisión posterior.

### Contrato de parser

Estructura común que debe devolver cualquier parser.

Incluye, entre otros:

* parser usado;
* confianza;
* fuente energética;
* comercializadora;
* número de factura;
* CUPS;
* periodo;
* consumo;
* importe;
* avisos.

### Confianza de parseo

Valor numérico entre 0 y 1 que expresa la seguridad del parser sobre el resultado extraído.

Campo recomendado:

```txt
parse_confidence
```

Una confianza baja debe generar revisión visual.

### Origen del dato

Indica cómo se obtuvo la información de la factura.

Campo recomendado:

```txt
parse_source
```

Valores previstos:

* `parser_especifico`;
* `parser_generico`;
* `manual`.

### Carga manual asistida

Proceso por el que el usuario completa manualmente datos que el parser no ha podido extraer.

Los datos manuales deben pasar por las mismas validaciones que los datos parseados.

### Datos extraídos

Valores obtenidos automáticamente por el parser.

Deben conservarse para trazabilidad aunque el usuario los corrija.

### Datos finales

Valores que se usarán para validación, cálculo de totales y exportación.

Pueden coincidir con los datos extraídos o ser valores corregidos por el usuario.

## 8. Estados, avisos y validación

### Estado de factura

Situación funcional de una factura dentro del flujo.

Valores mínimos:

* `pendiente_validacion`;
* `validada`;
* `corregida`;
* `fuera_superficie_control`;
* `error_parseo`;
* `requiere_carga_manual`;
* `duplicada`;
* `descartada`.

### Pendiente de validación

Estado de una factura cuyos datos se han extraído o introducido, pero todavía no han sido confirmados por el usuario.

No entra en totales.

### Validada

Factura confirmada por el usuario sin cambios.

Entra en totales.

### Corregida

Factura cuyos datos fueron modificados por el usuario y posteriormente confirmados.

Entra en totales.

### Fuera de superficie de control

Factura cuyo CUPS no pertenece a los CUPS controlados.

No entra en totales salvo que el usuario dé de alta el CUPS y regularice la situación.

### Error de parseo

Estado de una factura que no ha podido procesarse correctamente.

No entra en totales.

### Requiere carga manual

Estado de una factura que necesita que el usuario complete campos obligatorios.

No entra en totales hasta que se complete y valide.

### Duplicada

Factura que ya existe o cuyo PDF coincide con uno previamente subido.

No se reprocesa ni entra en totales.

### Descartada

Factura excluida por decisión del usuario.

No entra en totales, pero puede conservarse para trazabilidad básica.

### Aviso

Mensaje asociado a una factura o proceso que informa de una incidencia, revisión necesaria o dato relevante.

Debe tener código, nivel, mensaje, campo afectado si procede y marca de bloqueante.

### Aviso informativo

Aviso de nivel `info`.

No bloquea validación ni exige revisión visual por sí solo.

### Aviso de revisión visual

Aviso de nivel `warning`.

No bloquea necesariamente la validación individual, pero impide validación en bloque.

### Aviso bloqueante

Aviso de nivel `error`.

Impide validar una factura hasta que se corrija la incidencia o se descarte.

### Semáforo

Indicador visual del estado operativo de una factura.

Valores:

* verde: lista para validar;
* amarillo: requiere revisión visual;
* rojo: bloqueada.

### Revisión visual

Comprobación manual de los datos extraídos contra la factura PDF.

Es necesaria cuando hay avisos amarillos, parser genérico, baja confianza o valores atípicos.

### Validación individual

Confirmación manual de una factura concreta para que entre en totales.

### Validación en bloque

Confirmación simultánea de varias facturas sin incidencias.

Solo debe permitirse para facturas verdes procedentes de parser específico y sin avisos relevantes.

### Corrección manual

Modificación por el usuario de campos críticos de una factura.

Debe recalcular CUPS normalizado, edificio, año de cómputo y mes de cómputo cuando corresponda.

### Descarte

Acción por la que el usuario decide que una factura no debe utilizarse.

La factura descartada no entra en cálculos.

## 9. Duplicados

### Duplicado exacto

Factura o archivo ya existente en el sistema.

Criterio principal recomendado:

* mismo hash SHA-256 del PDF.

Debe bloquearse y no reprocesarse.

### Duplicado equivalente

Factura que coincide con otra ya existente por criterios funcionales, como mismo número de factura y suministrador.

Debe bloquearse salvo decisión excepcional documentada.

### Hash de PDF

Huella digital calculada sobre el contenido del archivo PDF.

Se usa para detectar subidas repetidas del mismo documento.

Campo recomendado:

```txt
file_hash_sha256
```

### Misma factura subida dos veces

Caso en el que el usuario intenta subir un PDF ya procesado.

Debe generar aviso de duplicado y no reprocesarse.

### Mismo CUPS y mismo mes

No implica duplicado por sí solo.

Puede haber varias facturas distintas para el mismo CUPS y mes, y se sumarán si son válidas.

## 10. Totales y completitud

### Total mensual

Resultado agregado por edificio, fuente energética, año y mes.

Incluye consumo total e importe total con IVA.

### Total de consumo

Suma de `consumption_kwh` de facturas validadas o corregidas dentro del grupo consultado.

### Total de gasto

Suma de `total_amount_eur` de facturas validadas o corregidas dentro del grupo consultado.

### Completitud mensual

Situación que indica si un edificio y fuente energética tienen todas las facturas esperadas para un mes.

Un mes está completo cuando todos los CUPS exigibles tienen al menos una factura válida.

### Mes completo

Mes en el que todos los CUPS exigibles están cubiertos por facturas validadas o corregidas.

### Mes incompleto

Mes en el que falta al menos un CUPS exigible con factura válida.

Debe mostrarse el total parcial igualmente, con aviso.

### CUPS cubierto

CUPS exigible que tiene al menos una factura válida imputada al mes consultado.

### CUPS esperado

CUPS que debería tener factura en un mes concreto por estar dentro de la superficie de control y vigencia.

### CUPS faltante

CUPS esperado que no tiene factura válida en el mes consultado.

### Vista de totales

Consulta, vista SQL o cálculo backend que agrupa facturas validadas por edificio, fuente energética, año y mes.

Puede implementarse como vista, endpoint o tabla materializada en fases posteriores.

## 11. Exportaciones

### Exportación

Descarga de datos estructurados desde la aplicación para revisión o uso externo.

En el MVP, las exportaciones sirven como apoyo a la carga manual en SIGEE-AGE.

### Resumen mensual

Exportación principal con totales consolidados por edificio, fuente energética, año y mes.

### Detalle de facturas

Exportación que lista las facturas que alimentan los totales o que están relacionadas con los filtros aplicados.

### CUPS faltantes

Exportación que lista los CUPS exigibles sin factura válida para un periodo concreto.

### CSV

Archivo de texto tabular.

En el MVP se recomienda generar CSV compatible con Excel en entorno español:

* UTF-8;
* separador `;`;
* coma decimal;
* fechas en `dd/mm/yyyy`.

### Excel

Archivo `.xlsx` orientado a revisión funcional.

Puede contener varias hojas:

* resumen mensual;
* detalle de facturas;
* CUPS faltantes;
* parámetros.

### Parámetros de exportación

Filtros usados para generar un archivo exportado.

Ejemplos:

* año;
* mes;
* edificio;
* fuente energética;
* estado de completitud.

## 12. Base de datos y entidades

### Entidad

Objeto principal del modelo de datos.

Ejemplos:

* edificio;
* CUPS controlado;
* factura;
* aviso;
* subida de PDF.

### `energy_types`

Tabla o catálogo de fuentes energéticas.

Valores iniciales:

* electricidad;
* gas natural;
* gasóleo.

### `buildings`

Tabla de edificios gestionados.

### `controlled_cups`

Tabla de CUPS incluidos en la superficie de control.

Relaciona edificio, fuente energética y CUPS normalizado.

### `invoice_uploads`

Tabla técnica de subidas de archivos PDF.

Guarda nombre, hash, tamaño, estado técnico y ruta temporal si procede.

### `invoices`

Tabla principal de facturas procesadas.

Contiene datos extraídos, datos finales, estado, parser usado y asociación con CUPS y edificio.

### `invoice_warnings`

Tabla de avisos asociados a facturas.

### `monthly_totals`

Vista, consulta o tabla derivada de totales mensuales.

Puede calcularse bajo demanda en el MVP.

### `audit_events`

Tabla opcional de auditoría mínima.

Puede registrar acciones relevantes como validaciones, correcciones, altas de CUPS o exportaciones.

### Seed

Datos iniciales cargados en la base de datos.

En el MVP incluye:

* tipos de energía;
* edificios iniciales;
* CUPS controlados confirmados.

### Migración

Archivo SQL versionado que crea o modifica la estructura de base de datos.

Permite reproducir el esquema desde cero.

## 13. Arquitectura técnica

### Frontend

Parte web de la aplicación.

Responsable de interfaz, navegación, formularios, revisión, validación y exportación.

Tecnología recomendada:

* Next.js;
* React;
* TypeScript;
* Tailwind CSS.

### Backend parser

Servicio encargado de extraer texto y datos de facturas PDF.

Tecnología recomendada:

* Python;
* FastAPI;
* Pydantic;
* PyMuPDF o pdfplumber.

### Supabase

Plataforma propuesta para autenticación, base de datos PostgreSQL y almacenamiento temporal o privado de PDFs.

### Supabase Auth

Servicio de autenticación usado para login con email y contraseña.

### Supabase PostgreSQL

Base de datos relacional donde se guardan edificios, CUPS, facturas, avisos y datos de proceso.

### Supabase Storage

Almacenamiento privado o temporal de PDFs si se decide conservarlos durante revisión.

### API

Interfaz de comunicación entre componentes.

Ejemplo del backend parser:

```txt
POST /parse-invoice
```

### Endpoint

Ruta concreta de una API.

Ejemplos:

* `GET /health`;
* `POST /parse-invoice`.

### Servicio de negocio

Código encargado de aplicar reglas funcionales, como asociación de CUPS, estados, avisos, validación y cálculo de completitud.

### Separación de responsabilidades

Principio por el que cada bloque del sistema hace solo lo que le corresponde.

Ejemplo:

* el parser extrae datos;
* la capa de negocio decide estados y asociación;
* el frontend muestra y permite revisar;
* la base de datos persiste información.

## 14. Seguridad y privacidad

### Autenticación

Proceso de identificar al usuario mediante email y contraseña.

### Sesión

Estado autenticado del usuario dentro de la aplicación.

### Ruta protegida

Pantalla o endpoint que solo puede usarse si el usuario está autenticado.

### Almacenamiento temporal

Conservación limitada del PDF durante el proceso de revisión.

El MVP no requiere repositorio documental permanente.

### Borrado de PDF

Eliminación del archivo PDF una vez procesado o validado, conservando datos estructurados y trazabilidad mínima.

### Datos sensibles innecesarios

Información que no es necesaria para preparar consumos energéticos y que debe evitarse en exportaciones o almacenamiento si no aporta valor al MVP.

## 15. Pruebas y aceptación

### Test unitario

Prueba automática de una función o componente aislado.

Ejemplos:

* normalización de CUPS;
* parseo de números;
* parseo de fechas.

### Test de parser

Prueba que comprueba que una factura real de ejemplo produce el JSON esperado.

### JSON esperado

Archivo con la salida correcta que debe devolver un parser para una factura concreta.

Sirve como referencia para tests automáticos.

### Criterio de aceptación

Condición verificable que indica si una funcionalidad está correctamente implementada.

### Prueba funcional

Validación manual o automatizada de un flujo completo de usuario.

Ejemplo:

```txt
Subir factura -> revisar -> validar -> comprobar total mensual
```

### Caso de prueba

Escenario concreto que debe verificarse.

Ejemplos:

* PDF duplicado;
* CUPS no controlado;
* factura con parser genérico;
* mes incompleto;
* exportación de resumen.

## 16. Términos específicos de OpenCode

### OpenCode

Herramienta o agente de apoyo al desarrollo que ejecutará tareas de implementación a partir de la documentación del proyecto.

### Prompt de desarrollo

Instrucción detallada entregada a OpenCode para implementar una parte concreta del sistema.

### Tarea de implementación

Unidad de trabajo técnica o funcional que puede desarrollarse y validarse de forma independiente.

### Checklist de validación

Lista de comprobaciones que debe superarse antes de considerar terminada una tarea, módulo o fase.

### Convenciones de código

Reglas de estilo, estructura y buenas prácticas que deben seguirse durante la implementación.

## 17. Siglas y abreviaturas

| Término   | Significado                                                     |
| --------- | --------------------------------------------------------------- |
| AGE       | Administración General del Estado                               |
| API       | Application Programming Interface                               |
| CSV       | Comma-Separated Values                                          |
| CUPS      | Código Unificado de Punto de Suministro                         |
| MVP       | Producto mínimo viable                                          |
| OCR       | Optical Character Recognition                                   |
| PDF       | Portable Document Format                                        |
| SIGEE-AGE | Sistema/plataforma de gestión energética de edificios de la AGE |
| SQL       | Structured Query Language                                       |
| UI        | User Interface                                                  |
| UX        | User Experience                                                 |
| XLSX      | Formato Excel moderno                                           |

## 18. Reglas terminológicas

### 18.1 Usar “factura válida” solo cuando entra en totales

Una factura válida es una factura con estado `validada` o `corregida`.

Una factura pendiente no debe llamarse válida aunque sus datos parezcan correctos.

### 18.2 Usar “CUPS controlado” solo si está en superficie de control

No todo CUPS detectado en una factura es controlado.

Solo lo es si existe en `controlled_cups` y está dentro de la vigencia aplicable.

### 18.3 Usar “mes de cómputo” para el mes calculado

El mes de cómputo no siempre coincide con el mes de inicio del periodo de facturación.

Debe calcularse siempre con la fecha de cierre.

### 18.4 Usar “importe total con IVA incluido” como dato económico principal

No utilizar “importe”, “subtotal” o “base” de forma ambigua cuando se hable del valor que entra en totales.

### 18.5 Usar “parser específico” y “parser genérico” de forma diferenciada

El parser específico puede permitir validación en bloque si no hay incidencias.

El parser genérico siempre exige revisión visual.

### 18.6 Usar “exportación” y no “integración”

El MVP exporta datos para apoyo manual.

No integra automáticamente con SIGEE-AGE.

## 19. Relación con otros documentos

Este glosario complementa toda la documentación del proyecto.

Debe consultarse especialmente junto con:

* `01_contexto_y_objetivo.md`;
* `02_alcance_mvp.md`;
* `03_requisitos_funcionales.md`;
* `04_reglas_negocio.md`;
* `05_modelo_datos.md`;
* `08_parsers_facturas.md`;
* `09_validaciones_y_avisos.md`;
* `10_exportaciones.md`;
* `11_plan_implementacion_opencode.md`.

Si durante la implementación aparece un término nuevo que pueda generar ambigüedad, debe añadirse a este documento.
