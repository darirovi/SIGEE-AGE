# SIGEE-AGE - Prototipo de apoyo a la carga de consumos energéticos

## Estado

TODO: Proyecto en fase de documentación funcional y técnica para PoC/MVP.

## Objetivo

TODO: Describir la aplicación auxiliar para organizar facturas de electricidad y gas natural, extraer consumos e importes, agruparlos por edificio/fuente energética/mes y facilitar la carga manual en SIGEE-AGE.

## Alcance inicial

TODO:
- Electricidad: parseo de facturas PDF.
- Gas natural: parseo de facturas PDF.
- Gasóleo: previsto en modelo, sin foco inicial de parseo.
- Un único usuario/rol gestor.
- Sin integración automática con SIGEE-AGE.

## Índice documental

Ver [`docs/INDICE_DOCUMENTACION.md`](docs/INDICE_DOCUMENTACION.md).

## Estructura

```txt
docs/       Documentación funcional, técnica y de dirección.
opencode/   Contexto y tareas para implementación asistida con OpenCode.
data/       Datos iniciales precargados.
examples/   Facturas PDF de ejemplo y salidas esperadas para tests de parser.
diagrams/   Diagramas de arquitectura y flujos.
backlog/    Plan de implementación y mejoras futuras.
scripts/    Scripts auxiliares.
```
