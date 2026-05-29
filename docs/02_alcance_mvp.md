# Alcance del MVP

## 1. Propósito del documento

Este documento define el alcance funcional y técnico inicial del MVP de la aplicación auxiliar para la preparación de datos energéticos destinados a carga manual en SIGEE-AGE.

El objetivo es dejar claramente establecido:

* qué funcionalidades entran en la prueba de concepto;
* qué funcionalidades quedan fuera;
* qué fuentes de energía se contemplan;
* qué datos se consideran fuente de verdad inicial;
* qué reglas deben respetarse desde el primer desarrollo;
* qué límites se asumen para evitar sobredimensionar el prototipo.

## 2. Descripción general del MVP

El MVP consistirá en una aplicación web de apoyo al usuario gestor que permita subir facturas energéticas en PDF, extraer los datos necesarios, asociarlos a edificios mediante CUPS controlados, calcular totales por edificio, fuente energética y mes, y mostrar/exportar una tabla preparada para facilitar la posterior introducción manual de datos en SIGEE-AGE.

La aplicación no sustituye a SIGEE-AGE ni interactúa automáticamente con ella. Actúa como herramienta auxiliar de preparación, revisión y consolidación de datos.

## 3. Usuarios y roles

### 3.1 Usuario previsto

El MVP contempla un único perfil funcional:

* gestor de consumos energéticos.

### 3.2 Roles

Solo existirá un rol:

* `gestor`.

El usuario gestor podrá:

* iniciar sesión;
* consultar edificios y CUPS controlados;
* subir facturas;
* revisar datos extraídos;
* corregir datos cuando sea necesario;
* validar facturas;
* consultar totales;
* exportar resultados;
* mantener altas y bajas de CUPS si fuese necesario.

### 3.3 Fuera de alcance en usuarios y permisos

No se contemplan en el MVP:

* varios roles;
* jerarquías de permisos;
* permisos por edificio;
* permisos por organismo;
* aprobación por doble usuario;
* auditoría avanzada de acciones;
* SSO corporativo.

## 4. Autenticación

El acceso se realizará mediante:

* email;
* contraseña.

No se requiere SSO ni integración con sistemas corporativos en esta fase.

El enlace de la aplicación no será de difusión pública, pero deberá estar protegido por autenticación.

## 5. Plataforma destino

La plataforma destino de los datos es SIGEE-AGE.

La aplicación auxiliar no se integrará automáticamente con SIGEE-AGE. Su función será organizar la información en pantalla y permitir exportarla para que el usuario pueda introducir manualmente los valores requeridos.

## 6. Fuentes de energía incluidas

### 6.1 Electricidad

La electricidad entra dentro del alcance principal del MVP.

Funcionalidades incluidas:

* carga de facturas PDF eléctricas;
* detección de CUPS;
* detección del periodo facturado;
* extracción de consumo en kWh;
* extracción de importe total con IVA incluido;
* asignación al edificio correspondiente mediante CUPS normalizado;
* cálculo de totales mensuales por edificio.

Parsers iniciales previstos:

* Iberdrola electricidad;
* Naturgy / Comercializadora Regulada Gas & Power electricidad;
* parser genérico para formatos no reconocidos.

### 6.2 Gas natural

El gas natural entra dentro del alcance principal del MVP.

Funcionalidades incluidas:

* carga de facturas PDF de gas natural;
* detección de CUPS;
* detección del periodo facturado;
* extracción de consumo en kWh;
* extracción de importe total con IVA incluido;
* asignación al edificio correspondiente mediante CUPS normalizado;
* cálculo de totales mensuales por edificio.

Parser inicial previsto:

* Energía XXI gas natural;
* parser genérico para formatos no reconocidos.

### 6.3 Gasóleo / gasoil

El gasóleo queda previsto en el modelo de datos, pero no es foco principal de parseo en el MVP.

Criterios iniciales:

* se contempla como fuente energética posible;
* se considera inicialmente vinculado al edificio UPROSE;
* no se desarrollará parser específico de facturas de gasóleo en esta primera fase;
* las facturas o cargas de gasóleo no tienen necesariamente periodicidad mensual;
* la carga podrá tratarse en el futuro mediante entrada manual o parser específico si se aportan ejemplos.

En el MVP, el gasóleo debe estar previsto para no rehacer el modelo posteriormente, pero no debe condicionar el desarrollo inicial.

## 7. Superficie de control

### 7.1 Fuente de verdad inicial

La superficie de control inicial se define exclusivamente a partir de los CUPS visibles en los pantallazos aportados de SIGEE-AGE.

Los CUPS incluidos en CSV u otras fuentes auxiliares no se considerarán controlados salvo que estén confirmados por pantallazo o se den de alta manualmente en la aplicación.

### 7.2 Regla principal

Un edificio tiene una lista cerrada de CUPS controlados por fuente de energía.

La aplicación debe exigir facturas únicamente para esos CUPS controlados y vigentes en el periodo consultado.

### 7.3 CUPS fuera de superficie

Si se sube una factura cuyo CUPS no pertenece a la superficie de control:

* no debe entrar automáticamente en totales;
* debe mostrarse aviso;
* el usuario podrá descartar la factura o dar de alta el CUPS si procede.

## 8. Edificios incluidos inicialmente

El MVP parte de los edificios identificados en la documentación y pantallazos aportados.

Edificios iniciales:

* Viviendas Logísticas de Fuenlabrada;
* Viviendas Logísticas de Villaverde;
* Acuartelamiento de Zarzaquemada-Leganés;
* Acuartelamiento Vallehermoso;
* UPROSE.

Los nombres concretos podrán ajustarse en el seed inicial si se normaliza la denominación.

## 9. CUPS incluidos inicialmente

Los CUPS controlados se precargarán desde la información confirmada por pantallazos.

Tipos iniciales:

* CUPS eléctricos;
* CUPS de gas natural;
* previsión de CUPS o referencia de gasóleo si se decide incorporarla manualmente.

La relación funcional será:

```txt
Edificio -> Fuente energética -> CUPS controlados
```

## 10. Gestión de altas y bajas de CUPS

El MVP debe permitir mantener la superficie de control mediante vigencias.

### 10.1 Alta de CUPS

Una alta de CUPS deberá indicar:

* edificio;
* tipo de energía;
* CUPS;
* primer mes a controlar;
* estado activo;
* observaciones opcionales.

Desde el primer mes a controlar, ese CUPS deberá exigirse para considerar completo un edificio/fuente/mes.

### 10.2 Baja de CUPS

Una baja de CUPS no eliminará el registro.

Deberá indicar:

* último mes a controlar;
* motivo u observación opcional.

Desde el mes posterior al último mes de control, el CUPS dejará de exigirse para la completitud.

### 10.3 Histórico

No se requiere histórico administrativo completo, pero sí conservar la información necesaria para no perder trazabilidad de facturas anteriores.

## 11. Reglas de imputación temporal

La regla de imputación mensual es:

```txt
Mes y año de cómputo = mes y año de la fecha de cierre del periodo de facturación.
```

No se realizará prorrateo por días.

Ejemplos:

| Periodo facturado       | Fecha cierre | Mes de cómputo |
| ----------------------- | -----------: | -------------- |
| 10/12/2024 - 15/01/2025 |   15/01/2025 | enero 2025     |
| 20/08/2025 - 26/08/2025 |   26/08/2025 | agosto 2025    |
| 23/12/2024 - 27/02/2025 |   27/02/2025 | febrero 2025   |

## 12. Datos a extraer de cada factura

Para cada factura, los datos mínimos son:

* tipo de energía;
* comercializadora o suministrador detectado;
* número de factura, si está disponible;
* CUPS original;
* CUPS normalizado;
* fecha de inicio del periodo;
* fecha de cierre del periodo;
* año de cómputo;
* mes de cómputo;
* consumo en kWh;
* importe total con IVA incluido.

## 13. Normalización de CUPS

La comparación contra la superficie de control debe hacerse con CUPS normalizado.

Regla inicial:

```txt
cups_original = CUPS tal como aparece en la factura
cups_key = CUPS normalizado para comparación
```

La normalización debe:

* eliminar espacios;
* convertir a mayúsculas;
* conservar caracteres alfanuméricos;
* permitir comparar correctamente CUPS con sufijos o formatos extendidos.

Ejemplos:

| CUPS original             | CUPS normalizado     |
| ------------------------- | -------------------- |
| ES 0022 0000 0621 2876 CB | ES0022000006212876CB |
| ES0022000006290850YS1P    | ES0022000006290850YS |

La regla exacta de truncado o equivalencia deberá quedar implementada en una función única reutilizable.

## 14. Carga de facturas

El MVP debe permitir:

* subir una factura;
* subir varias facturas a la vez;
* procesarlas automáticamente;
* mostrar resultado individual por factura;
* detectar errores o avisos;
* permitir validación individual o en bloque.

## 15. Revisión visual y validación

La aplicación deberá contar con una pantalla de revisión de facturas.

La pantalla deberá permitir:

* ver una tabla con los datos extraídos;
* seleccionar una factura;
* visualizar el PDF si todavía está disponible;
* corregir campos críticos;
* validar la factura;
* descartar la factura.

Solo las facturas validadas o corregidas y validadas deben alimentar los totales definitivos.

## 16. Corrección manual

El usuario podrá corregir datos extraídos cuando exista error de parser o formato no reconocido.

Campos editables:

* CUPS original;
* tipo de energía;
* fecha inicio;
* fecha cierre;
* consumo kWh;
* importe total con IVA;
* número de factura;
* comercializadora.

El edificio no debe editarse directamente. Se recalcula a partir del CUPS normalizado y la superficie de control.

## 17. PDFs y almacenamiento

Los PDFs no tienen que conservarse indefinidamente.

Criterio del MVP:

* se pueden almacenar temporalmente durante el proceso de revisión;
* se pueden borrar tras el parseo y validación;
* no se quiere sobrecargar el sistema con almacenamiento documental;
* los datos estructurados validados son la información principal a conservar.

## 18. Duplicados

### 18.1 Duplicado exacto

Un duplicado exacto no se procesa.

Criterios posibles:

* mismo hash de PDF;
* mismo número de factura y mismo suministrador;
* misma combinación inequívoca de datos ya procesada.

### 18.2 Varias facturas para mismo CUPS y mes

Se permite que existan varias facturas distintas para un mismo CUPS y mismo mes de cómputo.

En ese caso:

* se suman consumos;
* se suman importes;
* puede mostrarse aviso informativo;
* no debe bloquearse el cálculo.

Esto cubre rectificativas, ajustes o facturación partida.

### 18.3 Rectificativas o ajustes

Las rectificativas se imputan al mes que corresponda por su fecha de cierre del periodo de facturación.

No se intentará reconstruir el mes económico original afectado si SIGEE-AGE solo permite total agregado por edificio, fuente y mes.

## 19. Completitud mensual

Para cada edificio, fuente energética, año y mes:

```txt
CUPS exigibles = CUPS controlados vigentes en ese edificio/fuente/mes
Facturas válidas = facturas validadas imputadas a ese edificio/fuente/mes
```

El periodo estará completo si todos los CUPS exigibles tienen al menos una factura válida.

Si faltan facturas:

* el total se muestra igualmente;
* se marca como incompleto;
* se informa qué CUPS faltan.

## 20. Salida y exportación

La aplicación deberá mostrar en pantalla una tabla final con:

* edificio;
* año;
* mes;
* fuente energética;
* consumo total;
* gasto total con IVA;
* estado de completitud;
* avisos.

También deberá permitir exportación:

* CSV;
* Excel.

## 21. Validación en bloque

La validación en bloque solo se permitirá para facturas sin incidencias relevantes.

Una factura podrá validarse en bloque si:

* tiene parser específico reconocido;
* todos los campos críticos están extraídos;
* el CUPS normalizado pertenece a la superficie de control;
* el tipo de energía coincide con el CUPS maestro;
* no es duplicado exacto;
* no requiere revisión visual obligatoria.

## 22. Formatos no reconocidos

Si una factura no tiene parser específico:

1. se intentará parser genérico;
2. si el parser genérico extrae todos los campos críticos, la factura requerirá revisión visual;
3. si faltan datos críticos, se abrirá carga manual asistida;
4. si el PDF no tiene texto legible, se permitirá carga manual o descarte.

Una factura procesada por parser genérico no debe validarse en bloque.

## 23. Fuera de alcance funcional

Quedan fuera del MVP:

* automatización de carga en SIGEE-AGE;
* scraping;
* integración mediante API con SIGEE-AGE;
* pegado automático;
* conservación documental de PDFs;
* firma o custodia documental;
* reporting analítico avanzado;
* alarmas automáticas por email;
* multiusuario avanzado;
* roles complejos;
* SSO;
* parseo inicial de gasóleo;
* OCR avanzado salvo decisión posterior.

## 24. Entregables esperados del MVP

El MVP deberá entregar:

* aplicación web accesible por navegador;
* autenticación email/contraseña;
* edificios y CUPS precargados;
* carga de PDFs;
* parsers iniciales de electricidad y gas natural;
* parser genérico;
* pantalla de revisión;
* validación individual y en bloque;
* cálculo de totales;
* avisos de incompletitud;
* exportación CSV/Excel;
* documentación técnica y funcional.

## 25. Criterio de éxito

El MVP se considerará exitoso si permite, con los ejemplos reales disponibles:

* extraer correctamente los datos principales de facturas eléctricas y de gas natural;
* asociar las facturas a edificios mediante CUPS normalizado;
* detectar facturas faltantes;
* generar totales mensuales coherentes;
* exportar la información en formato utilizable;
* reducir el trabajo manual respecto al proceso actual;
* demostrar que el enfoque puede ampliarse a más comercializadoras y fuentes energéticas.

## 26. Pendientes

TODO: Completar tabla definitiva de edificios y CUPS controlados.

TODO: Confirmar denominaciones finales de edificios.

TODO: Definir si los PDFs de ejemplo estarán anonimizados y versionados en el repositorio.

TODO: Completar criterios técnicos exactos de duplicado.

TODO: Completar reglas específicas para gasóleo si se aborda después del MVP inicial.
