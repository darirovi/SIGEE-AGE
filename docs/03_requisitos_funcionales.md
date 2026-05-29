# Requisitos funcionales

## 1. Propósito del documento

Este documento define los requisitos funcionales del MVP de la aplicación auxiliar para la preparación de datos energéticos destinados a carga manual en SIGEE-AGE.

Su finalidad es traducir el alcance y las reglas de negocio en funcionalidades concretas que puedan ser implementadas, probadas y validadas.

Este documento debe servir como referencia para:

* diseño de pantallas;
* implementación backend y frontend;
* validación funcional;
* planificación de tareas en OpenCode;
* pruebas de aceptación del MVP.

## 2. Alcance funcional general

El MVP debe permitir al usuario gestor:

1. Acceder a la aplicación mediante autenticación simple.
2. Consultar edificios incluidos en la superficie de control.
3. Consultar CUPS controlados por edificio y fuente energética.
4. Subir facturas energéticas en PDF.
5. Procesar automáticamente facturas de electricidad y gas natural.
6. Revisar los datos extraídos.
7. Corregir datos cuando sea necesario.
8. Validar o descartar facturas.
9. Detectar duplicados, CUPS no controlados y datos incompletos.
10. Calcular totales por edificio, fuente energética, año y mes.
11. Detectar si un mes está completo o incompleto.
12. Exportar resultados a CSV y Excel.

## 3. Perfil de usuario

### 3.1 Usuario gestor

El MVP contempla un único perfil funcional: `gestor`.

El usuario gestor podrá realizar todas las operaciones disponibles en la aplicación.

### 3.2 Fuera de alcance

No se contemplan en el MVP:

* roles diferenciados;
* permisos por edificio;
* aprobación por doble usuario;
* administración avanzada de usuarios;
* SSO corporativo.

## 4. Convenciones de identificación

Los requisitos se identifican con el prefijo `RF`.

Prioridades:

| Prioridad | Significado                                      |
| --------- | ------------------------------------------------ |
| Alta      | Imprescindible para el MVP                       |
| Media     | Deseable para mejorar uso o trazabilidad         |
| Baja      | Puede quedar para evolución posterior si aprieta |

Estados:

| Estado     | Significado                           |
| ---------- | ------------------------------------- |
| MVP        | Debe implementarse en primera versión |
| Posterior  | Previsto para fase posterior          |
| Descartado | No forma parte del enfoque actual     |

## 5. Autenticación y acceso

### RF-001. Inicio de sesión

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir iniciar sesión mediante email y contraseña.

Criterios de aceptación:

* el usuario puede acceder con credenciales válidas;
* el usuario no puede acceder con credenciales incorrectas;
* las pantallas internas no deben ser accesibles sin autenticación.

### RF-002. Cierre de sesión

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir cerrar sesión.

Criterios de aceptación:

* tras cerrar sesión, el usuario vuelve a la pantalla de acceso;
* no se mantienen vistas internas accesibles sin volver a autenticarse.

### RF-003. Usuario único gestor

**Prioridad:** Alta
**Estado:** MVP

El MVP funcionará con un único perfil de usuario gestor.

Criterios de aceptación:

* no se muestran opciones de gestión avanzada de roles;
* todas las funcionalidades del MVP están disponibles para el usuario autenticado.

## 6. Gestión de edificios

### RF-010. Consulta de edificios

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe mostrar los edificios incluidos inicialmente en la superficie de control.

Edificios iniciales:

* Viviendas Logísticas de Fuenlabrada;
* Viviendas Logísticas de Villaverde;
* Acuartelamiento de Zarzaquemada-Leganés;
* Acuartelamiento Vallehermoso;
* UPROSE.

Criterios de aceptación:

* el usuario puede ver la lista de edificios;
* cada edificio muestra nombre y, si existe, nombre corto o referencia interna;
* los edificios inactivos no se usan para cálculos activos salvo consulta histórica.

### RF-011. Detalle de edificio

**Prioridad:** Media
**Estado:** MVP

La aplicación debe permitir consultar el detalle de un edificio.

El detalle debe incluir, como mínimo:

* nombre;
* código interno;
* dirección o municipio si se conoce;
* fuentes energéticas asociadas;
* CUPS controlados vinculados.

Criterios de aceptación:

* desde la lista de edificios se puede acceder al detalle;
* el detalle muestra los CUPS agrupados por fuente energética.

## 7. Gestión de CUPS controlados

### RF-020. Consulta de CUPS controlados

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir consultar los CUPS incluidos en la superficie de control.

La consulta debe mostrar:

* edificio asociado;
* fuente energética;
* CUPS original;
* CUPS normalizado;
* estado;
* primer mes controlado;
* último mes controlado si existe;
* observaciones si existen.

Criterios de aceptación:

* el usuario puede ver todos los CUPS controlados;
* se puede filtrar por edificio;
* se puede filtrar por fuente energética;
* los CUPS dados de baja siguen visibles para trazabilidad.

### RF-021. Alta manual de CUPS

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir dar de alta un nuevo CUPS controlado.

Campos mínimos:

* edificio;
* fuente energética;
* CUPS original;
* primer mes a controlar;
* estado;
* observaciones opcionales.

Reglas:

* el CUPS debe normalizarse automáticamente;
* desde el primer mes a controlar debe exigirse para completitud;
* el usuario no debe introducir manualmente el CUPS normalizado.

Criterios de aceptación:

* al guardar, se calcula `cups_key`;
* no se permite duplicar un mismo CUPS normalizado para la misma fuente energética;
* el CUPS aparece en la superficie de control desde el mes indicado.

### RF-022. Baja de CUPS

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir dar de baja un CUPS sin eliminarlo físicamente.

Campos mínimos:

* último mes a controlar;
* observación o motivo opcional.

Reglas:

* el CUPS deja de exigirse desde el mes posterior al último mes de control;
* las facturas históricas asociadas se conservan;
* el registro no debe borrarse si tiene histórico.

Criterios de aceptación:

* el usuario puede indicar último mes controlado;
* el CUPS sigue apareciendo como histórico;
* la completitud futura no exige ese CUPS después de su baja.

### RF-023. Edición limitada de CUPS

**Prioridad:** Media
**Estado:** MVP

La aplicación debe permitir modificar ciertos campos de CUPS controlados.

Campos editables recomendados:

* descripción;
* suministrador;
* tarifa;
* observaciones;
* vigencia si no contradice facturas existentes.

Campos sensibles:

* edificio;
* fuente energética;
* CUPS original.

Estos campos deben editarse con precaución porque afectan a cálculos y asociación de facturas.

Criterios de aceptación:

* los cambios relevantes actualizan la trazabilidad mínima;
* si se cambia el CUPS original, se recalcula el CUPS normalizado;
* no se permite dejar incoherencias con facturas validadas sin aviso.

## 8. Carga de facturas PDF

### RF-030. Subida individual de PDF

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir subir una factura PDF individual.

Criterios de aceptación:

* el usuario selecciona un archivo PDF;
* el sistema registra nombre, tamaño y hash;
* el sistema inicia el procesamiento de la factura;
* si el archivo no es PDF, se muestra error.

### RF-031. Subida múltiple de PDFs

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir subir varias facturas PDF en una misma operación.

Criterios de aceptación:

* el usuario puede seleccionar varios PDFs;
* cada archivo se procesa de forma independiente;
* se muestra el resultado individual de cada factura;
* el fallo de una factura no bloquea el procesamiento de las demás.

### RF-032. Registro técnico de subida

**Prioridad:** Alta
**Estado:** MVP

Cada PDF subido debe generar un registro técnico de subida.

Debe conservarse:

* nombre original del archivo;
* hash SHA-256;
* tamaño;
* estado técnico;
* fecha de subida;
* ruta temporal si se almacena el PDF.

Criterios de aceptación:

* el hash se calcula antes de procesar;
* se puede detectar duplicado exacto por hash;
* el registro técnico se conserva aunque el PDF se borre posteriormente.

### RF-033. Borrado o conservación temporal del PDF

**Prioridad:** Media
**Estado:** MVP

El sistema debe poder conservar temporalmente el PDF para revisión visual y eliminarlo posteriormente si se decide.

Criterios de aceptación:

* el PDF puede visualizarse durante la revisión si sigue disponible;
* tras validación, el sistema puede marcar el PDF como eliminado;
* los datos estructurados se conservan aunque el PDF ya no exista.

## 9. Parseo automático de facturas

### RF-040. Extracción de texto del PDF

**Prioridad:** Alta
**Estado:** MVP

El sistema debe extraer texto legible del PDF antes de aplicar parsers.

Criterios de aceptación:

* si el PDF tiene texto, se entrega al detector de formato;
* si el PDF no tiene texto suficiente, se genera aviso bloqueante;
* no se debe depender de OCR avanzado en el MVP.

### RF-041. Detección de formato de factura

**Prioridad:** Alta
**Estado:** MVP

El sistema debe identificar el formato de factura mediante marcadores de texto.

Formatos específicos iniciales:

* Iberdrola electricidad;
* Naturgy / Comercializadora Regulada Gas & Power electricidad;
* Energía XXI gas natural.

Criterios de aceptación:

* si reconoce formato específico, ejecuta el parser correspondiente;
* si no reconoce formato, ejecuta parser genérico;
* el parser utilizado queda registrado.

### RF-042. Parser Iberdrola electricidad

**Prioridad:** Alta
**Estado:** MVP

El sistema debe extraer los datos principales de facturas Iberdrola electricidad.

Datos mínimos:

* tipo de energía;
* comercializadora;
* número de factura;
* CUPS;
* periodo de facturación;
* consumo en kWh;
* total con IVA incluido.

Criterios de aceptación:

* el ejemplo real de Iberdrola se procesa correctamente;
* se extrae el total con IVA, no un subtotal;
* se extrae el consumo total, no solo consumos parciales;
* se calcula el mes de cómputo por fecha de cierre.

### RF-043. Parser Naturgy regulada electricidad

**Prioridad:** Alta
**Estado:** MVP

El sistema debe extraer los datos principales de facturas de Comercializadora Regulada, Gas & Power.

Datos mínimos:

* tipo de energía;
* comercializadora;
* número de factura;
* CUPS;
* periodo de consumo;
* consumo en kWh;
* total con IVA incluido.

Criterios de aceptación:

* el ejemplo real de Naturgy se procesa correctamente;
* el CUPS con sufijo se normaliza correctamente;
* se calcula el mes de cómputo por fecha de cierre.

### RF-044. Parser Energía XXI gas natural

**Prioridad:** Alta
**Estado:** MVP

El sistema debe extraer los datos principales de facturas Energía XXI de gas natural.

Datos mínimos:

* tipo de energía;
* comercializadora;
* número de factura;
* CUPS;
* periodo de facturación;
* consumo final en kWh;
* total con IVA incluido.

Criterios de aceptación:

* el ejemplo real de Energía XXI se procesa correctamente;
* se extrae consumo en kWh, no m³;
* se extrae el total con IVA, no la base previa;
* se soporta texto en catalán/valenciano presente en la factura.

### RF-045. Parser genérico

**Prioridad:** Alta
**Estado:** MVP

Si no se reconoce un formato específico, el sistema debe aplicar un parser genérico.

El parser genérico debe intentar extraer:

* CUPS;
* periodo;
* consumo en kWh;
* importe total;
* número de factura;
* tipo de energía.

Reglas:

* una factura procesada por parser genérico requiere revisión visual;
* no se permite validación en bloque;
* si faltan campos críticos, debe pasar a carga manual asistida o error de parseo.

Criterios de aceptación:

* el parser genérico genera aviso amarillo si extrae datos suficientes;
* genera avisos bloqueantes si faltan datos críticos.

## 10. Normalización y asociación

### RF-050. Normalización única de CUPS

**Prioridad:** Alta
**Estado:** MVP

El sistema debe normalizar todos los CUPS mediante una única función reutilizable.

La normalización debe:

* eliminar espacios;
* convertir a mayúsculas;
* conservar solo caracteres alfanuméricos;
* aplicar la equivalencia definida para sufijos.

Criterios de aceptación:

* ningún parser implementa su propia normalización independiente;
* la misma entrada siempre produce la misma salida;
* los ejemplos conocidos se normalizan correctamente.

### RF-051. Asociación automática a edificio

**Prioridad:** Alta
**Estado:** MVP

El sistema debe asociar una factura a un edificio usando el CUPS normalizado.

Reglas:

* el usuario no edita directamente el edificio de una factura;
* si se corrige el CUPS, se recalcula el edificio;
* si el CUPS no existe en la superficie de control, la factura queda fuera de totales.

Criterios de aceptación:

* una factura con CUPS controlado se asocia al edificio correcto;
* una factura con CUPS no controlado genera aviso bloqueante;
* la corrección del CUPS recalcula automáticamente la asociación.

### RF-052. Compatibilidad de fuente energética

**Prioridad:** Alta
**Estado:** MVP

El sistema debe comprobar que la fuente energética de la factura coincide con la fuente energética del CUPS controlado.

Criterios de aceptación:

* si coincide, la factura puede continuar el flujo normal;
* si no coincide, se genera aviso bloqueante;
* la factura no entra en totales hasta corregir la incoherencia.

## 11. Revisión visual y corrección

### RF-060. Pantalla de revisión de facturas

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe disponer de una pantalla de revisión de facturas procesadas.

Debe mostrar:

* archivo o factura;
* estado;
* parser utilizado;
* CUPS;
* edificio asociado;
* fuente energética;
* periodo;
* mes de cómputo;
* consumo;
* importe;
* avisos;
* acciones disponibles.

Criterios de aceptación:

* el usuario puede revisar cada factura procesada;
* se diferencian claramente errores bloqueantes y avisos de revisión;
* se puede acceder al PDF si está disponible.

### RF-061. Visualización del PDF

**Prioridad:** Media
**Estado:** MVP

La pantalla de revisión debe permitir visualizar el PDF seleccionado si el archivo sigue disponible.

Criterios de aceptación:

* el usuario puede contrastar los datos extraídos con el PDF;
* si el PDF fue eliminado, se informa claramente;
* la ausencia del PDF no elimina los datos estructurados ya validados.

### RF-062. Corrección manual de datos extraídos

**Prioridad:** Alta
**Estado:** MVP

El usuario debe poder corregir datos críticos de una factura.

Campos editables:

* CUPS original;
* tipo de energía;
* fecha de inicio;
* fecha de cierre;
* consumo kWh;
* importe total con IVA;
* número de factura;
* comercializadora.

Campos calculados automáticamente:

* CUPS normalizado;
* edificio;
* año de cómputo;
* mes de cómputo;
* estado de superficie de control.

Criterios de aceptación:

* al corregir fechas, se recalcula mes y año;
* al corregir CUPS, se recalcula CUPS normalizado y edificio;
* los valores originales extraídos se conservan para trazabilidad.

### RF-063. Carga manual asistida

**Prioridad:** Alta
**Estado:** MVP

Cuando el parser no pueda extraer datos suficientes, el sistema debe permitir completar manualmente los campos necesarios.

Criterios de aceptación:

* el usuario puede introducir los campos obligatorios;
* los datos manuales pasan por las mismas validaciones que los datos parseados;
* el origen queda registrado como `manual`;
* no se permite validación en bloque de facturas de origen manual.

## 12. Estados de factura

### RF-070. Gestión de estados

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe gestionar los estados mínimos de factura.

Estados requeridos:

| Estado                     | Entra en totales |
| -------------------------- | ---------------- |
| `pendiente_validacion`     | No               |
| `validada`                 | Sí               |
| `corregida`                | Sí               |
| `fuera_superficie_control` | No               |
| `error_parseo`             | No               |
| `requiere_carga_manual`    | No               |
| `duplicada`                | No               |
| `descartada`               | No               |

Criterios de aceptación:

* solo `validada` y `corregida` entran en totales;
* los estados bloqueantes impiden validación normal;
* los estados se reflejan de forma comprensible en pantalla.

### RF-071. Validación individual

**Prioridad:** Alta
**Estado:** MVP

El usuario debe poder validar una factura individual.

Criterios de aceptación:

* una factura sin errores bloqueantes puede validarse;
* una factura corregida puede validarse como `corregida`;
* se registra fecha de validación;
* la factura validada entra en cálculos.

### RF-072. Validación en bloque

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir validar en bloque facturas sin incidencias relevantes.

Solo se permite si:

* se ha usado parser específico;
* el CUPS está controlado;
* no faltan campos críticos;
* no hay avisos amarillos o rojos;
* no es duplicada;
* el tipo de energía coincide con el CUPS.

Criterios de aceptación:

* las facturas aptas pueden seleccionarse y validarse en bloque;
* las facturas con parser genérico no pueden validarse en bloque;
* las facturas con avisos relevantes quedan excluidas.

### RF-073. Descarte de factura

**Prioridad:** Alta
**Estado:** MVP

El usuario debe poder descartar una factura.

Criterios de aceptación:

* una factura descartada no entra en totales;
* el descarte queda registrado;
* una factura descartada puede consultarse posteriormente para trazabilidad básica.

## 13. Avisos, errores e incidencias

### RF-080. Generación de avisos por factura

**Prioridad:** Alta
**Estado:** MVP

El sistema debe generar avisos asociados a cada factura cuando detecte incidencias.

Niveles:

* `info`;
* `warning`;
* `error`.

Criterios de aceptación:

* los avisos se muestran en la pantalla de revisión;
* los avisos bloqueantes impiden validación;
* los avisos no bloqueantes pueden requerir revisión visual.

### RF-081. Semáforo de revisión

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe presentar un semáforo funcional para cada factura.

Reglas:

* verde: lista para validación en bloque;
* amarillo: requiere revisión visual;
* rojo: bloqueada hasta corregir o descartar.

Criterios de aceptación:

* el color se calcula según avisos y estado;
* el usuario entiende por qué una factura está en amarillo o rojo;
* las facturas rojas no pueden validarse sin corrección previa.

### RF-082. Avisos mínimos requeridos

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe contemplar, al menos, los siguientes avisos:

Informativos:

* CUPS normalizado;
* periodo cruza varios meses.

Revisión visual:

* parser genérico usado;
* confianza baja;
* varios importes candidatos;
* varios consumos candidatos;
* periodo atípico;
* consumo cero;
* importe cero o negativo;
* posible rectificativa.

Bloqueantes:

* CUPS no detectado;
* CUPS no controlado;
* falta fecha de cierre;
* falta consumo;
* falta importe;
* energía incompatible;
* factura duplicada;
* PDF sin texto legible.

Criterios de aceptación:

* cada aviso tiene código estable;
* cada aviso tiene mensaje visible;
* cada aviso indica si bloquea o no.

## 14. Duplicados y rectificativas

### RF-090. Detección de duplicado exacto por hash

**Prioridad:** Alta
**Estado:** MVP

Antes de procesar un PDF, el sistema debe comprobar si ya existe el mismo hash.

Criterios de aceptación:

* si el hash ya existe, se marca como duplicado;
* no se reprocesa la factura;
* se muestra aviso al usuario.

### RF-091. Detección por número de factura y suministrador

**Prioridad:** Media
**Estado:** MVP

El sistema debe considerar duplicada una factura con mismo número y mismo suministrador si ya existe una equivalente.

Criterios de aceptación:

* se detecta duplicado aunque el archivo no sea exactamente el mismo;
* el usuario recibe aviso;
* la factura no entra dos veces en totales.

### RF-092. Varias facturas en mismo CUPS y mes

**Prioridad:** Alta
**Estado:** MVP

El sistema debe permitir varias facturas distintas para el mismo CUPS y mes de cómputo.

Criterios de aceptación:

* no se bloquea automáticamente por coincidir CUPS y mes;
* las facturas distintas validadas se suman;
* puede mostrarse aviso informativo si procede.

### RF-093. Rectificativas y ajustes

**Prioridad:** Media
**Estado:** MVP

Las rectificativas y ajustes se tratarán como facturas válidas si el usuario las valida.

Criterios de aceptación:

* se imputan por la fecha de cierre de su propio periodo;
* no se redistribuyen a meses anteriores;
* se suman si coinciden con el mismo edificio, fuente, CUPS y mes.

## 15. Cálculo de totales

### RF-100. Cálculo por CUPS y mes

**Prioridad:** Alta
**Estado:** MVP

El sistema debe calcular el total por CUPS, año y mes a partir de facturas válidas.

Regla:

```txt
consumo_cups_mes = suma(consumption_kwh de facturas válidas)
importe_cups_mes = suma(total_amount_eur de facturas válidas)
```

Criterios de aceptación:

* solo entran facturas `validada` o `corregida`;
* varias facturas válidas del mismo CUPS y mes se suman;
* facturas pendientes, duplicadas o descartadas no se suman.

### RF-101. Cálculo por edificio, fuente y mes

**Prioridad:** Alta
**Estado:** MVP

El sistema debe calcular totales agregados por edificio, fuente energética, año y mes.

Regla:

```txt
consumo_total = suma(consumos válidos de CUPS exigibles)
importe_total = suma(importes válidos de CUPS exigibles)
```

Criterios de aceptación:

* el cálculo se agrupa por edificio, fuente, año y mes;
* el resultado se muestra aunque esté incompleto;
* el sistema indica si faltan CUPS exigibles.

### RF-102. Imputación mensual por fecha de cierre

**Prioridad:** Alta
**Estado:** MVP

El sistema debe imputar cada factura al mes y año de la fecha de cierre del periodo facturado.

Criterios de aceptación:

* no se realiza prorrateo;
* una factura que cruza meses se asigna completa al mes de cierre;
* el mes y año se recalculan si se corrige la fecha de cierre.

## 16. Completitud mensual

### RF-110. Determinación de CUPS exigibles

**Prioridad:** Alta
**Estado:** MVP

Para cada edificio, fuente energética, año y mes, el sistema debe determinar qué CUPS son exigibles.

Regla:

```txt
control_from_month <= mes_consulta <= control_to_month
```

Si `control_to_month` está vacío, el CUPS sigue activo.

Criterios de aceptación:

* los CUPS dados de alta empiezan a exigirse desde su primer mes de control;
* los CUPS dados de baja dejan de exigirse tras su último mes de control;
* la completitud se calcula con la vigencia correcta.

### RF-111. Estado completo, incompleto o sin datos

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe indicar el estado de cada edificio, fuente energética, año y mes.

Estados:

| Estado       | Regla                                                       |
| ------------ | ----------------------------------------------------------- |
| `completo`   | Todos los CUPS exigibles tienen al menos una factura válida |
| `incompleto` | Falta al menos un CUPS exigible                             |
| `sin_datos`  | Existen CUPS exigibles pero no hay facturas válidas         |

Criterios de aceptación:

* el estado se muestra junto a cada total;
* el usuario puede ver qué CUPS faltan;
* un total incompleto puede exportarse con aviso.

### RF-112. Listado de CUPS faltantes

**Prioridad:** Alta
**Estado:** MVP

Cuando un periodo esté incompleto, el sistema debe informar qué CUPS faltan.

Criterios de aceptación:

* se muestra CUPS faltante, edificio y fuente energética;
* se puede distinguir entre sin factura y factura no validada;
* los CUPS no exigibles no aparecen como faltantes.

## 17. Consulta de resultados

### RF-120. Tabla de resumen mensual

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe mostrar una tabla de resultados por edificio, fuente energética, año y mes.

Columnas mínimas:

* edificio;
* fuente energética;
* año;
* mes;
* consumo total kWh;
* gasto total con IVA;
* estado de completitud;
* avisos.

Criterios de aceptación:

* el usuario puede consultar resultados tras validar facturas;
* los totales se actualizan al validar, corregir o descartar facturas;
* los meses incompletos se muestran con aviso.

### RF-121. Filtros de resultados

**Prioridad:** Media
**Estado:** MVP

La tabla de resultados debe permitir filtrar por:

* año;
* mes o rango de meses;
* edificio;
* fuente energética;
* estado de completitud.

Criterios de aceptación:

* los filtros modifican la tabla de resultados;
* el usuario puede localizar rápidamente un edificio y mes concreto.

### RF-122. Detalle de un total mensual

**Prioridad:** Media
**Estado:** MVP

El usuario debe poder consultar el detalle que compone un total mensual.

El detalle debe mostrar:

* CUPS exigibles;
* facturas válidas asociadas;
* consumo por factura;
* importe por factura;
* CUPS faltantes si los hay.

Criterios de aceptación:

* desde un total mensual se accede a su detalle;
* el usuario puede verificar qué facturas alimentan el total;
* se identifican claramente las ausencias.

## 18. Exportaciones

### RF-130. Exportación resumen CSV

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir exportar el resumen mensual a CSV.

Campos mínimos:

* edificio;
* fuente energética;
* año;
* mes;
* consumo total;
* gasto total con IVA;
* estado de completitud;
* avisos.

Criterios de aceptación:

* el CSV respeta los filtros aplicados;
* los importes y consumos se exportan en formato consistente;
* los periodos incompletos quedan marcados.

### RF-131. Exportación resumen Excel

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe permitir exportar el resumen mensual a Excel.

Criterios de aceptación:

* el Excel contiene la misma información que el resumen;
* se puede abrir en una hoja de cálculo estándar;
* los campos numéricos se exportan como valores numéricos cuando sea posible.

### RF-132. Exportación de detalle

**Prioridad:** Media
**Estado:** MVP

La aplicación debe permitir exportar el detalle de facturas o CUPS para revisión interna.

Campos recomendados:

* edificio;
* fuente;
* CUPS;
* número de factura;
* periodo;
* mes de cómputo;
* consumo;
* importe;
* estado;
* parser usado;
* avisos.

Criterios de aceptación:

* el usuario puede generar un detalle auditable;
* se puede revisar qué facturas justifican cada total.

## 19. Trazabilidad mínima

### RF-140. Conservación de valores extraídos y finales

**Prioridad:** Alta
**Estado:** MVP

La aplicación debe conservar valores extraídos originalmente y valores finales usados para cálculo.

Criterios de aceptación:

* si el usuario corrige una factura, se conservan ambos valores;
* se puede saber si una factura fue corregida;
* los cálculos usan siempre valores finales validados.

### RF-141. Registro de validación

**Prioridad:** Alta
**Estado:** MVP

Al validar una factura, el sistema debe registrar fecha y, si aplica, usuario validador.

Criterios de aceptación:

* una factura validada tiene `validated_at`;
* si existe usuario autenticado, se guarda `validated_by`;
* la información se conserva para consulta posterior.

### RF-142. Eventos de auditoría básica

**Prioridad:** Media
**Estado:** MVP

El sistema debe registrar eventos básicos relevantes.

Eventos recomendados:

* factura subida;
* factura parseada;
* factura validada;
* factura corregida;
* factura descartada;
* CUPS creado;
* CUPS dado de baja;
* exportación generada.

Criterios de aceptación:

* se registran eventos mínimos sin sobrecargar el MVP;
* no se guardan datos innecesarios o sensibles en logs.

## 20. Seguridad funcional mínima

### RF-150. Protección de pantallas internas

**Prioridad:** Alta
**Estado:** MVP

Las pantallas internas deben requerir autenticación.

Criterios de aceptación:

* un usuario no autenticado no puede acceder a facturas, CUPS ni resultados;
* la sesión expirada redirige a login.

### RF-151. No exposición pública de PDFs

**Prioridad:** Alta
**Estado:** MVP

Los PDFs subidos no deben quedar expuestos públicamente.

Criterios de aceptación:

* no se generan URLs públicas permanentes;
* el acceso al PDF, si existe, requiere sesión;
* el PDF puede eliminarse tras validación si se decide.

### RF-152. Minimización de datos almacenados

**Prioridad:** Media
**Estado:** MVP

La aplicación debe evitar almacenar información innecesaria.

Criterios de aceptación:

* no se guarda texto completo de facturas salvo modo debug justificado;
* no se guardan secretos en base de datos;
* no se registran logs con contenido completo de facturas.

## 21. Requisitos fuera de alcance funcional

No forman parte del MVP:

* integración automática con SIGEE-AGE;
* escritura directa en SIGEE-AGE;
* automatización de navegador;
* scraping;
* OCR avanzado;
* SSO corporativo;
* roles complejos;
* permisos por edificio;
* reporting analítico avanzado;
* alertas automáticas por email;
* parser automático de gasóleo;
* custodia documental permanente de facturas.

## 22. Matriz resumen de requisitos MVP

| Código | Requisito                        | Prioridad | Estado |
| ------ | -------------------------------- | --------- | ------ |
| RF-001 | Inicio de sesión                 | Alta      | MVP    |
| RF-010 | Consulta de edificios            | Alta      | MVP    |
| RF-020 | Consulta de CUPS controlados     | Alta      | MVP    |
| RF-021 | Alta manual de CUPS              | Alta      | MVP    |
| RF-022 | Baja de CUPS                     | Alta      | MVP    |
| RF-030 | Subida individual de PDF         | Alta      | MVP    |
| RF-031 | Subida múltiple de PDFs          | Alta      | MVP    |
| RF-040 | Extracción de texto              | Alta      | MVP    |
| RF-041 | Detección de formato             | Alta      | MVP    |
| RF-042 | Parser Iberdrola electricidad    | Alta      | MVP    |
| RF-043 | Parser Naturgy electricidad      | Alta      | MVP    |
| RF-044 | Parser Energía XXI gas natural   | Alta      | MVP    |
| RF-045 | Parser genérico                  | Alta      | MVP    |
| RF-050 | Normalización única de CUPS      | Alta      | MVP    |
| RF-051 | Asociación automática a edificio | Alta      | MVP    |
| RF-060 | Pantalla de revisión             | Alta      | MVP    |
| RF-062 | Corrección manual                | Alta      | MVP    |
| RF-070 | Gestión de estados               | Alta      | MVP    |
| RF-071 | Validación individual            | Alta      | MVP    |
| RF-072 | Validación en bloque             | Alta      | MVP    |
| RF-080 | Avisos por factura               | Alta      | MVP    |
| RF-090 | Duplicado exacto por hash        | Alta      | MVP    |
| RF-100 | Cálculo por CUPS y mes           | Alta      | MVP    |
| RF-101 | Cálculo por edificio/fuente/mes  | Alta      | MVP    |
| RF-110 | CUPS exigibles                   | Alta      | MVP    |
| RF-111 | Estado de completitud            | Alta      | MVP    |
| RF-120 | Tabla de resumen mensual         | Alta      | MVP    |
| RF-130 | Exportación CSV                  | Alta      | MVP    |
| RF-131 | Exportación Excel                | Alta      | MVP    |
| RF-140 | Valores extraídos y finales      | Alta      | MVP    |

## 23. Criterios generales de aceptación del MVP

El MVP cumplirá este documento si:

1. Permite autenticación simple.
2. Muestra edificios y CUPS controlados.
3. Permite subir una o varias facturas PDF.
4. Procesa correctamente los tres ejemplos reales iniciales.
5. Normaliza CUPS con una función única.
6. Asocia facturas a edificios desde CUPS controlado.
7. Detecta CUPS fuera de superficie.
8. Permite revisión visual y corrección.
9. Permite validar individualmente y en bloque cuando proceda.
10. Excluye de totales facturas no validadas.
11. Calcula totales por edificio, fuente, año y mes.
12. Detecta completitud mensual y CUPS faltantes.
13. Exporta resumen a CSV y Excel.
14. Conserva trazabilidad mínima de extracción, corrección y validación.

## 24. Pendientes

TODO: Completar denominación final de edificios y códigos internos.

TODO: Completar lista definitiva de CUPS controlados para seed inicial.

TODO: Definir formato visual exacto de la tabla final de resultados.

TODO: Definir si el detalle exportable será por factura, por CUPS o ambas opciones desde el MVP.

TODO: Validar con el usuario gestor los mensajes finales de aviso y semáforo.
