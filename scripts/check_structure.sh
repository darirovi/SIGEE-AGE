#!/usr/bin/env bash
set -euo pipefail

echo "Comprobando estructura mínima..."

test -f README.md
test -f docs/INDICE_DOCUMENTACION.md
test -f opencode/CONTEXTO_PROYECTO.md
test -d examples/facturas/electricidad/iberdrola
test -d examples/facturas/electricidad/naturgy_regulada
test -d examples/facturas/gas_natural/energia_xxi
test -d diagrams/source

echo "OK: estructura mínima presente."
