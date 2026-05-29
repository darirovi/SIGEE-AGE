# Decisiones del proyecto

## 1. Propósito del documento

Este documento registra las decisiones principales tomadas durante la definición del MVP de la aplicación auxiliar SIGEE-AGE.

Su finalidad es conservar el criterio funcional y técnico del proyecto para evitar reinterpretaciones durante la implementación, especialmente al trabajar con OpenCode o con equipo de desarrollo.

Este documento no sustituye a las reglas de negocio ni a los requisitos funcionales. Actúa como registro de decisiones aceptadas, sus motivos e impacto.

## 2. Formato de decisión

Cada decisión se documenta con la siguiente estructura:

| Campo    | Descripción                                  |
| -------- | -------------------------------------------- |
| Código   | Identificador estable de la decisión         |
| Decisión | Criterio adoptado                            |
| Motivo   | Razón principal de la decisión               |
| Impacto  | Consecuencias sobre diseño, desarrollo o uso |
| Estado   | Situación de la decisión                     |

Estados posibles:

| Estado       | Significado                                                       |
| ------------ | ----------------------------------------------------------------- |
| `aceptada`   | Decisión vigente                                                  |
| `pendiente`  | Decisión aún no cerrada                                           |
| `revisable`  | Decisión válida para el MVP, pero susceptible de cambio posterior |
| `descartada` | Alternativa descartada                                            |

## 3. Decisiones funcionales

## DEC-001. La aplicación será una herramienta auxiliar

**Decisión:**
La aplicación no sustituirá a SIGEE-AGE. Será una herramienta auxiliar para preparar, revisar, consolidar y exportar datos.

**Motivo:**
El objetivo del MVP es reducir trabajo manual y errores antes de la carga en SIGEE-AGE, sin modificar el sistema destino ni sus procedimientos.

**Impacto:**
La aplicación no escribirá datos directamente en SIGEE-AGE. El usuario seguirá introduciendo manualmente los datos finales.

**Estado:** aceptada.

## DEC-002. No habrá integración automática con SIGEE-AGE en el MVP

**Decisión:**
No se desarrollará integración automática, API, scraping, automatización de navegador ni carga directa en SIGEE-AGE.

**Motivo:**
El MVP debe mantenerse simple, seguro y centrado en la preparación de datos.

**Impacto:**
La salida principal serán tablas en pantalla y exportaciones CSV/Excel.

**Estado:** aceptada.

## DEC-003. El usuario final mantiene la responsabilidad de validación

**Decisión:**
El usuario gestor será responsable de revisar y validar los datos antes de utilizarlos en SIGEE-AGE.

**Motivo:**
Las facturas pueden variar de formato, contener rectificativas o requerir interpretación humana.

**Impacto:**
El sistema incluirá revisión visual, corrección manual, avisos y semáforos. No se dará por definitiva una factura sin validación.

**Estado:** aceptada.

## DEC-004. El MVP tendrá un único perfil de usuario gestor

**Decisión:**
El MVP contemplará solo el rol `gestor`.

**Motivo:**
No es necesario modelar permisos complejos para validar la prueba de concepto.

**Impacto:**
No se implementarán multirol, permisos por edificio, jerarquías ni doble aprobación.

**Estado:** aceptada.

## DEC-005. La autenticación será mediante email y contraseña

**Decisión:**
El acceso se realizará con autenticación simple mediante email y contraseña.

**Motivo:**
Es suficiente para el MVP y evita complejidad de integración corporativa.

**Impacto:**
No se implementará SSO corporativo en la primera fase.

**Estado:** aceptada.

## DEC-006. La carga final en SIGEE-AGE seguirá siendo manual

**Decisión:**
La aplicación generará resultados preparados para que el usuario los introduzca manualmente en SIGEE-AGE.

**Motivo:**
El alcance aprobado se limita a preparar datos, no a operar sobre sistemas externos.

**Impacto:**
Las pantallas y exportaciones deben estar orientadas a facilitar la transcripción fiable.

**Estado:** aceptada.

## 4. Decisiones sobre alcance energético

## DEC-010. Electricidad entra en el alcance principal del MVP

**Decisión:**
La electricidad será una fuente energética principal del MVP.

**Motivo:**
Existen facturas reales de ejemplo y CUPS eléctricos identificados en la superficie de control.

**Impacto:**
Se implementarán parsers automáticos de electricidad para formatos iniciales.

**Estado:** aceptada.

## DEC-011. Gas natural entra en el alcance principal del MVP

**Decisión:**
El gas natural será una fuente energética principal del MVP.

**Motivo:**
Existen facturas reales de ejemplo y necesidad funcional de consolidar consumos de gas natural.

**Impacto:**
Se implementará parser automático inicial para Energía XXI gas natural.

**Estado:** aceptada.

## DEC-012. Gasóleo queda previsto, pero sin parser automático inicial

**Decisión:**
El gasóleo se incluirá como fuente prevista en el modelo, pero no se desarrollará parser automático en el MVP inicial.

**Motivo:**
La prioridad inicial está en electricidad y gas natural. El gasóleo tiene comportamiento menos mensual y no hay foco inicial de parseo.

**Impacto:**
El modelo de datos contemplará `gasoleo`, pero su carga automática quedará para fase posterior.

**Estado:** aceptada.

## DEC-013. Gasóleo se considerará inicialmente vinculado a UPROSE

**Decisión:**
En el caso actual, el gasóleo se tratará inicialmente como asociado a UPROSE.

**Motivo:**
La información disponible apunta a que la lógica de gasóleo se relaciona con UPROSE y no sigue necesariamente periodicidad mensual.

**Impacto:**
No debe condicionar el desarrollo inicial de parsers ni la completitud mensual general.

**Estado:** aceptada.

## 5. Decisiones sobre superficie de control y CUPS

## DEC-020. Los CUPS son el eje de asociación factura-edificio

**Decisión:**
La factura se asociará al edificio mediante el CUPS normalizado.

**Motivo:**
El CUPS identifica el punto de suministro y permite evitar selección manual del edificio.

**Impacto:**
El usuario no editará directamente el edificio de una factura. Si se corrige el CUPS, se recalcula el edificio.

**Estado:** aceptada.

## DEC-021. La superficie de control inicial se basa en pantallazos de SIGEE-AGE

**Decisión:**
Los CUPS controlados iniciales serán los confirmados en los pantallazos aportados de SIGEE-AGE.

**Motivo:**
Los pantallazos son la evidencia funcional disponible de qué CUPS están realmente controlados.

**Impacto:**
El CSV u otras fuentes auxiliares no se considerarán fuente de verdad si contienen CUPS no confirmados por pantallazo.

**Estado:** aceptada.

## DEC-022. El CSV auxiliar no será fuente de verdad inicial

**Decisión:**
El CSV auxiliar no determinará por sí solo la superficie de control inicial.

**Motivo:**
Puede contener CUPS no confirmados o no visibles en SIGEE-AGE.

**Impacto:**
Solo se precargarán como activos los CUPS confirmados por pantallazos o alta manual posterior.

**Estado:** aceptada.

## DEC-023. Un CUPS controlado pertenece a un único edificio en el MVP

**Decisión:**
En el MVP, cada CUPS controlado se asociará a un único edificio.

**Motivo:**
Simplifica el modelo y responde al caso práctico actual.

**Impacto:**
La combinación `cups_key + energy_type_code` debería ser única en la superficie de control.

**Estado:** aceptada.

## DEC-024. Un edificio puede tener varios CUPS

**Decisión:**
Un edificio podrá tener uno o varios CUPS por fuente energética.

**Motivo:**
El problema operativo principal consiste precisamente en consolidar varias facturas/CUPS por edificio.

**Impacto:**
La completitud mensual debe comprobar todos los CUPS exigibles del edificio y fuente.

**Estado:** aceptada.

## DEC-025. El CUPS se normalizará mediante una única función reutilizable

**Decisión:**
Toda normalización de CUPS se realizará mediante una función única compartida.

**Motivo:**
Evita incoherencias entre parsers, frontend, backend y reglas de negocio.

**Impacto:**
Ningún parser debe implementar su propia normalización independiente.

**Estado:** aceptada.

## DEC-026. El CUPS original se conservará para trazabilidad

**Decisión:**
Se guardará el CUPS tal como aparece en factura o como lo introduce el usuario.

**Motivo:**
Permite comprobar posteriormente la correspondencia entre documento y dato normalizado.

**Impacto:**
El modelo debe incluir `cups_original` y `cups_key`.

**Estado:** aceptada.

## DEC-027. Los CUPS nuevos se darán de alta manualmente si procede

**Decisión:**
Si aparece una factura con CUPS no controlado, el usuario podrá descartarla o dar de alta el CUPS si procede.

**Motivo:**
No todo CUPS detectado debe pasar automáticamente a la superficie de control.

**Impacto:**
Las facturas con CUPS no controlado no entran automáticamente en totales.

**Estado:** aceptada.

## DEC-028. Los CUPS con histórico no se borrarán físicamente

**Decisión:**
Los CUPS con facturas o histórico asociado no se eliminarán físicamente.

**Motivo:**
Debe mantenerse trazabilidad de los datos calculados en periodos anteriores.

**Impacto:**
La baja se gestionará mediante último mes de control y estado.

**Estado:** aceptada.

## DEC-029. Las altas y bajas de CUPS se gestionarán mediante vigencias

**Decisión:**
Cada CUPS tendrá primer mes a controlar y, si procede, último mes a controlar.

**Motivo:**
Permite calcular correctamente la completitud mensual sin eliminar histórico.

**Impacto:**
Un CUPS será exigible si el mes consultado está dentro de su vigencia.

**Estado:** aceptada.

## 6. Decisiones sobre facturas y cálculo mensual

## DEC-030. El mes de cómputo se determina por la fecha de cierre del periodo

**Decisión:**
El año y mes de cómputo se calcularán desde `period_end`.

**Motivo:**
Es una regla simple, trazable y suficiente para el MVP.

**Impacto:**
Una factura que cubra varios meses se imputará completa al mes de cierre.

**Estado:** aceptada.

## DEC-031. No se realizará prorrateo entre meses

**Decisión:**
El MVP no distribuirá consumo ni importe por días entre distintos meses.

**Motivo:**
El prorrateo añadiría complejidad y podría no coincidir con el criterio operativo de carga manual.

**Impacto:**
Todo el consumo e importe de una factura se imputan al mes de la fecha de cierre.

**Estado:** aceptada.

## DEC-032. El consumo se almacenará siempre en kWh

**Decisión:**
La unidad interna de consumo será kWh.

**Motivo:**
SIGEE-AGE y las consolidaciones energéticas requieren una unidad homogénea.

**Impacto:**
En gas natural se debe extraer el consumo final en kWh, no el volumen en m³.

**Estado:** aceptada.

## DEC-033. El importe válido será el total con IVA incluido

**Decisión:**
El dato económico utilizado será siempre el total final de factura con IVA incluido.

**Motivo:**
Es el dato que representa el gasto total que debe consolidarse.

**Impacto:**
Los parsers deben evitar usar subtotales, bases imponibles, energía parcial, potencia o IVA aislado.

**Estado:** aceptada.

## DEC-034. Varias facturas distintas del mismo CUPS y mes se permiten

**Decisión:**
Se permitirá que existan varias facturas distintas para un mismo CUPS y mes.

**Motivo:**
Puede haber rectificativas, ajustes, refacturaciones o facturación partida.

**Impacto:**
Si son facturas distintas y válidas, sus consumos e importes se suman.

**Estado:** aceptada.

## DEC-035. Las rectificativas se tratan como facturas válidas si el usuario las valida

**Decisión:**
Una rectificativa o ajuste entrará en totales si el usuario la valida.

**Motivo:**
El MVP no reconstruirá contabilidad energética histórica compleja.

**Impacto:**
La rectificativa se imputará al mes determinado por su propia fecha de cierre.

**Estado:** aceptada.

## DEC-036. Solo facturas validadas o corregidas entran en totales

**Decisión:**
Los totales solo se calcularán con facturas en estado `validada` o `corregida`.

**Motivo:**
Garantiza que los datos usados han sido confirmados por el usuario.

**Impacto:**
Facturas pendientes, duplicadas, descartadas, fuera de superficie o con error no alimentan resultados.

**Estado:** aceptada.

## DEC-037. Los meses incompletos se mostrarán igualmente

**Decisión:**
Un mes incompleto se mostrará con el total parcial disponible y aviso de CUPS faltantes.

**Motivo:**
El usuario necesita conocer el avance y detectar qué facturas faltan.

**Impacto:**
La pantalla de totales y las exportaciones deben incluir estado de completitud.

**Estado:** aceptada.

## DEC-038. La completitud se calcula por edificio, fuente, año y mes

**Decisión:**
La completitud mensual se calculará a nivel de edificio + fuente energética + año + mes.

**Motivo:**
Ese es el nivel de agregación necesario para preparar la carga manual.

**Impacto:**
Deben cruzarse facturas válidas contra CUPS exigibles en ese periodo.

**Estado:** aceptada.

## 7. Decisiones sobre parsers

## DEC-040. Se implementarán parsers específicos iniciales

**Decisión:**
El MVP incluirá parsers específicos para los formatos reales disponibles.

**Motivo:**
Los parsers específicos ofrecen mayor fiabilidad que un parser genérico.

**Impacto:**
Se desarrollarán parsers para Iberdrola electricidad, Naturgy regulada electricidad y Energía XXI gas natural.

**Estado:** aceptada.

## DEC-041. Parser Iberdrola electricidad incluido en el MVP

**Decisión:**
Se implementará el parser `iberdrola_electricidad`.

**Motivo:**
Existe factura real de ejemplo y es uno de los formatos previstos.

**Impacto:**
Debe extraer CUPS, periodo, consumo total, importe total con IVA, número de factura y comercializadora.

**Estado:** aceptada.

## DEC-042. Parser Naturgy regulada electricidad incluido en el MVP

**Decisión:**
Se implementará el parser `naturgy_regulada_electricidad`.

**Motivo:**
Existe factura real de ejemplo de Comercializadora Regulada, Gas & Power.

**Impacto:**
Debe contemplar CUPS con sufijo extendido y normalización correcta.

**Estado:** aceptada.

## DEC-043. Parser Energía XXI gas natural incluido en el MVP

**Decisión:**
Se implementará el parser `energia_xxi_gas_natural`.

**Motivo:**
Existe factura real de ejemplo de gas natural en formato Energía XXI.

**Impacto:**
Debe soportar etiquetas en catalán/valenciano y extraer consumo final en kWh.

**Estado:** aceptada.

## DEC-044. Habrá parser genérico para formatos no reconocidos

**Decisión:**
Si no se detecta un formato específico, se aplicará un parser genérico.

**Motivo:**
Permite obtener datos candidatos de facturas no previstas sin bloquear completamente el flujo.

**Impacto:**
Las facturas procesadas por parser genérico requerirán revisión visual y no podrán validarse en bloque.

**Estado:** aceptada.

## DEC-045. No se usará OCR avanzado en el MVP

**Decisión:**
El MVP asumirá PDFs con texto legible y no dependerá de OCR avanzado.

**Motivo:**
El OCR añade complejidad, costes y posibles errores.

**Impacto:**
Un PDF sin texto suficiente generará aviso bloqueante y requerirá carga manual o sustitución.

**Estado:** aceptada.

## DEC-046. Los parsers devolverán un contrato común

**Decisión:**
Todos los parsers deberán devolver una estructura normalizada común.

**Motivo:**
Facilita el tratamiento posterior, las validaciones y los tests.

**Impacto:**
Se usará un contrato tipo `InvoiceParseResult` con campos estándar y avisos.

**Estado:** aceptada.

## DEC-047. Los parsers no escribirán directamente en base de datos

**Decisión:**
El backend parser devolverá datos estructurados, pero no decidirá persistencia ni reglas completas de negocio.

**Motivo:**
Mantiene separación entre extracción documental y lógica funcional.

**Impacto:**
La capa de aplicación será responsable de asociar CUPS, estados, avisos funcionales y guardado.

**Estado:** aceptada.

## 8. Decisiones sobre validación, avisos y estados

## DEC-050. Se usará un sistema de semáforo por factura

**Decisión:**
Cada factura tendrá un estado visual tipo semáforo: verde, amarillo o rojo.

**Motivo:**
El usuario necesita identificar rápidamente qué puede validar, qué debe revisar y qué está bloqueado.

**Impacto:**
El frontend debe mostrar semáforos y explicar los motivos mediante avisos.

**Estado:** aceptada.

## DEC-051. Los avisos tendrán código estable

**Decisión:**
Cada aviso tendrá código, nivel, mensaje, campo afectado si procede y marca de bloqueante.

**Motivo:**
Facilita implementación, filtros, pruebas y comprensión por el usuario.

**Impacto:**
Los avisos se guardarán en `invoice_warnings` y se mostrarán en revisión.

**Estado:** aceptada.

## DEC-052. Los avisos se dividirán en info, warning y error

**Decisión:**
Se usarán tres niveles de aviso: `info`, `warning` y `error`.

**Motivo:**
Permite distinguir información, revisión visual y bloqueo.

**Impacto:**
Los errores bloquean validación; los warnings impiden validación en bloque; los info no bloquean.

**Estado:** aceptada.

## DEC-053. La validación en bloque solo se permitirá para facturas verdes

**Decisión:**
Solo podrán validarse en bloque facturas sin incidencias relevantes, con parser específico y sin avisos de revisión o error.

**Motivo:**
La validación en bloque debe ser segura y limitarse a casos fiables.

**Impacto:**
Facturas con parser genérico, warnings, errores o revisión visual quedan excluidas.

**Estado:** aceptada.

## DEC-054. La corrección manual conservará los datos extraídos originales

**Decisión:**
Cuando el usuario corrija una factura, se conservarán los valores extraídos inicialmente.

**Motivo:**
Es necesario mantener trazabilidad entre extracción automática y dato final validado.

**Impacto:**
El modelo de datos debe incluir campos extraídos y campos finales.

**Estado:** aceptada.

## DEC-055. El edificio no será editable directamente en factura

**Decisión:**
El usuario no podrá modificar directamente el edificio asociado a una factura.

**Motivo:**
La asociación debe depender del CUPS controlado para evitar errores manuales.

**Impacto:**
Si el usuario corrige el CUPS, el sistema recalcula el edificio automáticamente.

**Estado:** aceptada.

## DEC-056. Las facturas descartadas no entran en totales

**Decisión:**
Una factura descartada quedará excluida de cálculos.

**Motivo:**
El usuario puede decidir que un documento no aplica al proceso.

**Impacto:**
El estado `descartada` se conservará para trazabilidad, pero no suma.

**Estado:** aceptada.

## 9. Decisiones sobre duplicados

## DEC-060. Se detectará duplicado exacto por hash de PDF

**Decisión:**
Antes de procesar un PDF se comprobará si ya existe el mismo hash SHA-256.

**Motivo:**
Es el criterio más directo para evitar reprocesar el mismo archivo.

**Impacto:**
Si el hash ya existe, la factura se marcará como duplicada y no se reprocesará.

**Estado:** aceptada.

## DEC-061. Se considerará duplicado equivalente por número de factura y suministrador

**Decisión:**
Si ya existe una factura con el mismo número y suministrador, se considerará duplicado equivalente salvo revisión posterior.

**Motivo:**
Evita duplicar facturas aunque el archivo no sea idéntico.

**Impacto:**
Debe generar aviso bloqueante de duplicado.

**Estado:** aceptada.

## DEC-062. Mismo CUPS y mismo mes no implica duplicado

**Decisión:**
No se considerará duplicado automáticamente que existan varias facturas para el mismo CUPS y mes.

**Motivo:**
Puede haber facturas distintas, rectificativas o ajustes.

**Impacto:**
Si son facturas distintas y válidas, se suman.

**Estado:** aceptada.

## 10. Decisiones sobre almacenamiento documental

## DEC-070. Los PDFs no se conservarán necesariamente de forma permanente

**Decisión:**
Los PDFs podrán almacenarse temporalmente durante revisión y eliminarse posteriormente.

**Motivo:**
El MVP no pretende ser un repositorio documental.

**Impacto:**
Debe conservarse la información estructurada aunque el PDF se borre.

**Estado:** aceptada.

## DEC-071. Se conservará el registro técnico de subida

**Decisión:**
Aunque se borre el PDF, se mantendrá el registro de subida con metadatos.

**Motivo:**
Permite trazabilidad mínima y detección de duplicados por hash.

**Impacto:**
La tabla `invoice_uploads` debe mantenerse tras el borrado del fichero.

**Estado:** aceptada.

## DEC-072. Los enlaces a PDFs no se incluirán por defecto en exportaciones

**Decisión:**
Las exportaciones no incluirán enlaces directos a PDFs salvo decisión expresa posterior.

**Motivo:**
Evita exposición innecesaria de documentos y simplifica seguridad.

**Impacto:**
Las exportaciones se centran en datos estructurados.

**Estado:** aceptada.

## 11. Decisiones sobre exportaciones

## DEC-080. Habrá exportación CSV y Excel

**Decisión:**
El MVP incluirá exportaciones en CSV y Excel `.xlsx`.

**Motivo:**
Son formatos útiles para revisión, trazabilidad y carga manual asistida.

**Impacto:**
Debe existir módulo de exportaciones con filtros y nombres de archivo claros.

**Estado:** aceptada.

## DEC-081. El CSV estará orientado a Excel en entorno español

**Decisión:**
El CSV usará criterios compatibles con Excel en configuración española.

**Motivo:**
Facilita la apertura directa por el usuario gestor.

**Impacto:**
Se recomienda separador `;`, coma decimal, fechas `dd/mm/yyyy` y UTF-8 con BOM si conviene.

**Estado:** aceptada.

## DEC-082. El Excel no tendrá macros ni reporting avanzado

**Decisión:**
El Excel será una salida limpia y revisable, sin macros, fórmulas complejas ni cuadros analíticos.

**Motivo:**
El MVP no debe convertirse en un sistema de reporting.

**Impacto:**
El Excel tendrá hojas simples: resumen mensual, detalle de facturas, CUPS faltantes y parámetros.

**Estado:** aceptada.

## DEC-083. Los meses incompletos también se exportarán

**Decisión:**
Las exportaciones incluirán meses incompletos marcados como tales.

**Motivo:**
El usuario necesita detectar y resolver faltantes antes de cerrar la carga manual.

**Impacto:**
Las exportaciones deben incluir estado de completitud y CUPS faltantes.

**Estado:** aceptada.

## 12. Decisiones técnicas

## DEC-090. Stack frontend recomendado: Next.js, React, TypeScript y Tailwind

**Decisión:**
El frontend se implementará preferentemente con Next.js, React, TypeScript y Tailwind CSS.

**Motivo:**
Permite una aplicación web moderna, mantenible y desplegable con facilidad.

**Impacto:**
La estructura del repositorio tendrá carpeta `frontend/` con organización por features.

**Estado:** aceptada.

## DEC-091. Supabase será la opción recomendada para Auth y PostgreSQL

**Decisión:**
Se recomienda usar Supabase para autenticación, base de datos PostgreSQL y almacenamiento privado/temporal si procede.

**Motivo:**
Reduce complejidad operativa del MVP y ofrece una base suficiente para autenticación y persistencia.

**Impacto:**
El repositorio incluirá carpeta `supabase/` con migraciones, seed y políticas.

**Estado:** aceptada.

## DEC-092. El backend parser se implementará con FastAPI y Python

**Decisión:**
El procesamiento de PDFs y parsers se implementará en un backend Python con FastAPI.

**Motivo:**
Python ofrece buenas librerías para extracción de texto, tratamiento documental y tests de parsers.

**Impacto:**
La carpeta `backend/` contendrá API, parsers, servicios comunes y tests.

**Estado:** aceptada.

## DEC-093. Se usará Pydantic para contratos de parser

**Decisión:**
Los contratos de entrada/salida del backend parser se definirán con Pydantic.

**Motivo:**
Aporta validación, tipado y claridad en la comunicación entre parser y aplicación.

**Impacto:**
El resultado de parseo tendrá estructura estable y testeable.

**Estado:** aceptada.

## DEC-094. Se usará Decimal para importes y consumos

**Decisión:**
Los importes y consumos se tratarán como decimales, no como float.

**Motivo:**
Evita errores de precisión en cálculos económicos y energéticos.

**Impacto:**
Python usará `Decimal` y PostgreSQL usará `numeric`.

**Estado:** aceptada.

## DEC-095. Los totales podrán calcularse bajo demanda en el MVP

**Decisión:**
Los totales mensuales podrán implementarse inicialmente mediante consulta o vista, sin tabla materializada obligatoria.

**Motivo:**
Simplifica la primera versión y evita sincronización innecesaria.

**Impacto:**
Una tabla o vista materializada queda como evolución si aparece necesidad de rendimiento.

**Estado:** aceptada.

## DEC-096. El repositorio se organizará por frontend, backend, supabase, docs y ejemplos

**Decisión:**
La estructura del repositorio separará claramente documentación, frontend, backend, base de datos, datos y ejemplos.

**Motivo:**
Facilita mantenimiento, desarrollo incremental y trabajo con OpenCode.

**Impacto:**
OpenCode debe respetar la estructura definida en la arquitectura técnica.

**Estado:** aceptada.

## 13. Decisiones sobre pruebas

## DEC-100. Las facturas reales de ejemplo se usarán como tests de parsers

**Decisión:**
Las facturas aportadas servirán como casos de prueba iniciales para los parsers.

**Motivo:**
Permiten verificar extracción sobre documentos reales.

**Impacto:**
Se crearán JSON esperados para cada factura de ejemplo.

**Estado:** aceptada.

## DEC-101. Habrá tests específicos de normalización de CUPS

**Decisión:**
La función de normalización de CUPS tendrá tests unitarios propios.

**Motivo:**
Un error en normalización afectaría a asociación, completitud y totales.

**Impacto:**
Los ejemplos de CUPS con espacios y sufijos deben estar cubiertos.

**Estado:** aceptada.

## DEC-102. Habrá tests de parseo de números y fechas

**Decisión:**
Las funciones de parseo numérico y fechas tendrán tests unitarios.

**Motivo:**
Los formatos españoles y catalanes/valencianos pueden producir errores si no se prueban.

**Impacto:**
Debe cubrirse coma decimal, separador de miles y fechas en distintos formatos.

**Estado:** aceptada.

## DEC-103. Los criterios de aceptación guiarán el cierre del MVP

**Decisión:**
El MVP se dará por válido cuando supere los criterios funcionales y técnicos definidos.

**Motivo:**
Evita cerrar el desarrollo solo porque compile o se vea completo visualmente.

**Impacto:**
Deben verificarse parseo, validación, totales, completitud y exportaciones.

**Estado:** aceptada.

## 14. Decisiones descartadas

## DEC-120. Se descarta automatización de navegador sobre SIGEE-AGE

**Decisión:**
No se hará automatización de navegador para introducir datos en SIGEE-AGE.

**Motivo:**
Sería frágil, dependiente de cambios de interfaz y fuera del alcance de herramienta auxiliar.

**Impacto:**
El usuario realizará la carga manual con apoyo de las tablas generadas.

**Estado:** descartada.

## DEC-121. Se descarta scraping de SIGEE-AGE

**Decisión:**
No se extraerán datos de SIGEE-AGE mediante scraping.

**Motivo:**
No forma parte del alcance y podría generar problemas técnicos o procedimentales.

**Impacto:**
La superficie de control se alimentará mediante pantallazos, seed y altas manuales.

**Estado:** descartada.

## DEC-122. Se descarta multirol avanzado en el MVP

**Decisión:**
No se implementarán roles complejos, permisos por edificio ni jerarquías.

**Motivo:**
No son necesarios para validar la prueba de concepto.

**Impacto:**
El MVP tendrá un único perfil gestor.

**Estado:** descartada.

## DEC-123. Se descarta conservación documental avanzada en el MVP

**Decisión:**
No se implementará repositorio documental permanente de PDFs.

**Motivo:**
La finalidad es preparar datos, no custodiar documentación oficial.

**Impacto:**
Los PDFs pueden borrarse tras revisión, manteniendo datos estructurados.

**Estado:** descartada.

## DEC-124. Se descarta analítica energética avanzada en el MVP

**Decisión:**
No se implementarán cuadros de mando, predicción, comparativas complejas ni análisis de desviaciones en la primera versión.

**Motivo:**
El MVP debe centrarse en consolidar y exportar datos fiables.

**Impacto:**
La analítica queda como evolución posterior.

**Estado:** descartada.

## 15. Decisiones pendientes o revisables

## DEC-140. Conservación temporal exacta de PDFs

**Decisión:**
Está pendiente definir cuánto tiempo se conservarán los PDFs tras el parseo o validación.

**Motivo:**
Depende de la necesidad real de revisión y de criterios operativos.

**Impacto:**
El sistema debe permitir borrarlos sin perder datos estructurados.

**Estado:** pendiente.

## DEC-141. Nivel de auditoría inicial

**Decisión:**
La auditoría mínima es recomendable, pero su profundidad exacta queda revisable.

**Motivo:**
Puede implementarse de forma simple al inicio y ampliarse después.

**Impacto:**
Acciones como validaciones, correcciones, altas de CUPS y exportaciones pueden registrarse si no complica el MVP.

**Estado:** revisable.

## DEC-142. Tratamiento futuro de gasóleo

**Decisión:**
El tratamiento específico de gasóleo queda pendiente de fase posterior.

**Motivo:**
No hay parser inicial ni periodicidad mensual clara.

**Impacto:**
El modelo lo contempla, pero no bloquea el desarrollo inicial.

**Estado:** pendiente.

## DEC-143. Uso de vista SQL o cálculo backend para totales

**Decisión:**
La forma exacta de calcular totales puede decidirse durante implementación.

**Motivo:**
Ambas opciones son válidas para el MVP si respetan las reglas de negocio.

**Impacto:**
Debe priorizarse simplicidad y consistencia; una vista materializada queda para futuro si hace falta rendimiento.

**Estado:** revisable.

## DEC-144. Política final de despliegue

**Decisión:**
El despliegue final concreto del MVP queda pendiente de decidir.

**Motivo:**
Dependerá de la disponibilidad de servicios, seguridad requerida y entorno de prueba.

**Impacto:**
La arquitectura recomienda Vercel para frontend y servicio compatible Python para backend, pero puede ajustarse.

**Estado:** pendiente.

## 16. Regla de actualización del documento

Este documento debe actualizarse cuando se tome una decisión que afecte a:

* alcance funcional;
* reglas de negocio;
* parsers;
* modelo de datos;
* arquitectura;
* validaciones;
* exportaciones;
* seguridad;
* despliegue;
* criterios de cierre del MVP.

Cada nueva decisión debe añadirse con código propio y estado claro.

Si una decisión aceptada cambia en el futuro, no debe borrarse sin más: debe añadirse una nueva decisión que explique el cambio y su motivo.
