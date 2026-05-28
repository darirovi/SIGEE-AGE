# Contexto del proyecto para OpenCode

## Objetivo

TODO: Implementar un MVP web para procesar facturas energéticas PDF, extraer datos clave y generar totales por edificio, fuente energética y mes para carga manual en SIGEE-AGE.

## Decisiones cerradas

TODO:
- Fuente de verdad inicial: CUPS visibles en pantallazos SIGEE-AGEE.
- Un edificio contiene CUPS controlados.
- La relación edificio-CUPS no se infiere dinámicamente: se precarga y se mantiene.
- Fecha de cierre del periodo de facturación determina mes/año de cómputo.
- Importe: total factura con IVA incluido.
- Consumo: número en kWh.
- Duplicado exacto: no procesar.
- Varias facturas en mismo CUPS/mes: se suman.
- PDFs: se pueden borrar tras validación para no sobrecargar.

## Stack previsto

TODO: Next.js + TypeScript + Supabase + FastAPI Python.

## Restricciones

TODO:
- No ejecutar nada en terminal del cliente final.
- El usuario final solo accede por navegador.
- Sin automatización contra SIGEE-AGE.
