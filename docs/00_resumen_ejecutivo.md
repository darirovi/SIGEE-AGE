# Resumen ejecutivo

## 1. Propósito del documento

Este documento resume la finalidad, alcance y enfoque de la prueba de concepto para una aplicación auxiliar destinada a organizar la información de facturas energéticas y facilitar la carga manual de consumos en SIGEE-AGE.

Está dirigido a perfiles de dirección técnica, responsables TIC, jefatura de proyecto y personas con responsabilidad funcional sobre la gestión energética de edificios administrativos.

## 2. Problema que se pretende resolver

La plataforma SIGEE-AGE requiere introducir información energética de edificios administrativos por fuente de energía, año y mes. En el caso tratado, los datos relevantes son principalmente:

* consumo energético;
* gasto económico con IVA incluido;
* edificio;
* fuente energética;
* mes y año de imputación.

La dificultad práctica es que un mismo edificio puede tener varios CUPS asociados y cada CUPS puede generar una factura independiente. Además, las facturas proceden de distintas comercializadoras, con formatos PDF diferentes.

Esto obliga al usuario gestor a revisar manualmente facturas, identificar el edificio correspondiente, sumar importes y consumos por mes, detectar facturas faltantes y trasladar los datos finales a SIGEE-AGE.

## 3. Objetivo de la prueba de concepto

El objetivo del prototipo es construir una aplicación web auxiliar que permita:

1. Subir facturas energéticas en PDF.
2. Extraer automáticamente los datos relevantes de cada factura.
3. Asociar cada factura al edificio correspondiente mediante el CUPS normalizado.
4. Calcular totales por edificio, fuente energética, año y mes.
5. Informar al usuario de facturas faltantes o situaciones que requieren revisión.
6. Mostrar una tabla final clara, similar a la información que el usuario debe introducir manualmente en SIGEE-AGE.
7. Permitir exportar los resultados a CSV o Excel.

La aplicación no pretende sustituir a SIGEE-AGE ni integrarse automáticamente con ella. Su función es reducir trabajo manual, errores de cálculo y falta de trazabilidad en la preparación de datos.

## 4. Alcance funcional inicial

El MVP contempla inicialmente:

* electricidad;
* gas natural;
* previsión de gasóleo/gasoil en el modelo de datos, sin foco inicial en parseo automático;
* un único usuario gestor;
* autenticación simple mediante email y contraseña;
* edificios y CUPS precargados a partir de la información ya identificada;
* carga múltiple de facturas PDF;
* parseo automático mediante parsers específicos por comercializadora/formato;
* parser genérico para formatos no reconocidos;
* carga asistida manual cuando el PDF no pueda interpretarse correctamente;
* revisión visual del PDF antes de validar facturas con avisos;
* validación individual y validación en bloque cuando no existan incidencias;
* cálculo de totales mensuales por edificio y fuente energética;
* exportación de resultados.

## 5. Fuentes de energía consideradas

### Electricidad

La electricidad es una fuente principal del MVP. Las facturas eléctricas se procesarán mediante parsers específicos, inicialmente para los formatos de ejemplo disponibles.

### Gas natural

El gas natural también entra en el MVP. Se contempla el parseo de facturas PDF y su agregación por edificio, mes y año.

### Gasóleo / gasoil

Queda previsto en el modelo de datos para no cerrar la arquitectura, pero no se prioriza el parseo automático en esta fase. En el caso actual, se considera únicamente vinculado a UPROSE y con una lógica distinta a la mensual, ya que la carga se produce cuando resulta necesario repostar o recargar.

## 6. Reglas clave de negocio

Las reglas de negocio iniciales son:

* La fecha de cierre del periodo de facturación determina el mes y año de cómputo.
* El importe utilizado será siempre el total de factura con IVA incluido.
* El consumo se registrará como número en kWh.
* La relación edificio-CUPS se basa en una superficie de control cerrada inicialmente.
* Solo se controlan los CUPS identificados en los pantallazos aportados.
* El CSV auxiliar no se considera fuente de verdad si contiene CUPS no confirmados por pantallazo.
* El CUPS se normaliza eliminando espacios, pasando a mayúsculas y tomando la clave normalizada definida para comparación.
* Un edificio se considera completo para una fuente energética y mes cuando existen facturas válidas para todos sus CUPS controlados y exigibles en ese periodo.
* Los totales incompletos se muestran igualmente, pero con aviso.
* Un duplicado exacto no se procesa.
* Varias facturas distintas para el mismo CUPS y mismo mes se permiten y se suman.
* Las rectificativas o ajustes se imputan al mes que corresponda según su fecha de cierre.

## 7. Qué queda fuera del MVP

Quedan fuera del alcance inicial:

* integración automática con SIGEE-AGE;
* automatización de navegador;
* scraping;
* pegado automático en formularios externos;
* SSO corporativo;
* multirol avanzado;
* permisos por organismo o edificio;
* conservación documental avanzada;
* repositorio permanente de facturas PDF;
* parseo automático de gasóleo;
* explotación analítica avanzada.

## 8. Enfoque técnico propuesto

La arquitectura recomendada para la prueba de concepto es:

* aplicación web en Next.js y TypeScript;
* autenticación simple con Supabase Auth;
* base de datos PostgreSQL gestionada mediante Supabase;
* almacenamiento temporal o privado de PDFs si fuese necesario durante revisión;
* backend Python con FastAPI para el parseo de facturas PDF;
* despliegue web sencillo en Vercel;
* despliegue del backend parser en un servicio compatible con Python.

Este enfoque permite separar la interfaz web del procesamiento documental, manteniendo una arquitectura razonablemente simple y extensible.

## 9. Beneficios esperados

La prueba de concepto busca validar si la aplicación permite:

* reducir el tiempo dedicado a revisar facturas;
* reducir errores manuales de transcripción y suma;
* identificar facturas faltantes antes de cerrar un mes;
* tratar de forma homogénea facturas de distintas comercializadoras;
* facilitar al gestor una tabla final organizada por edificio, fuente energética y mes;
* disponer de trazabilidad básica sobre qué facturas alimentan cada total;
* preparar una base técnica ampliable a más formatos o fuentes energéticas.

## 10. Limitaciones asumidas

El prototipo no persigue una automatización completa del proceso administrativo. El usuario sigue siendo responsable de validar los datos antes de utilizarlos en SIGEE-AGE.

Las principales limitaciones asumidas son:

* los formatos PDF pueden cambiar;
* no todas las comercializadoras estarán cubiertas inicialmente;
* algunos PDFs podrán requerir revisión o carga manual;
* no se conservarán necesariamente los PDFs a largo plazo;
* el objetivo es facilitar la carga manual, no sustituir los procedimientos existentes;
* la completitud depende de que la superficie de CUPS controlados esté correctamente mantenida.

## 11. Resultado esperado del MVP

Al finalizar el MVP debería existir una aplicación web capaz de:

1. Permitir acceso al usuario gestor.
2. Mostrar edificios y CUPS controlados precargados.
3. Cargar facturas PDF de electricidad y gas natural.
4. Extraer datos clave mediante parsers.
5. Permitir revisión visual y validación.
6. Calcular totales mensuales por edificio y fuente energética.
7. Avisar de meses incompletos o facturas problemáticas.
8. Exportar los resultados.

El MVP servirá para decidir si el enfoque es viable, qué esfuerzo requiere ampliar parsers y si merece la pena evolucionar la prueba hacia una herramienta operativa más robusta.

## 12. Pendientes de documentación

TODO: Completar documentos detallados de:

* alcance funcional;
* reglas de negocio;
* modelo de datos;
* parsers;
* pantallas y flujos;
* validaciones y avisos;
* plan de implementación para OpenCode;
* diagramas de arquitectura y flujo.
