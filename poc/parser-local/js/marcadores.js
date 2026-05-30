// PARSER DETECTION — MARCADORES

const MARCADORES = {
  'iberdrola_electricidad': ['IBERDROLA CLIENTES, S.A.U.','RESUMEN DE FACTURA','PERIODO DE FACTURACIÓN','Identificación punto de suministro (CUPS)','Consumo total de esta factura'],
  'curenergia_electricidad_pvpc': ['CURENERGÍA COMERCIALIZADOR DE ÚLTIMO RECURSO','PVPC - MERCADO REGULADO','Consumo energía activa','CUPS :','IMPORTE FACTURA'],
  'naturgy_regulada_electricidad': ['Comercializadora Regulada, Gas & Power','DATOS DE LA FACTURA DE ELECTRICIDAD','INFORMACIÓN DE CONSUMO ELÉCTRICO','Código unificado de punto de suministro CUPS','TOTAL IMPORTE FACTURA'],
  'energia_xxi_gas_natural': ['Energía','XXI','GAS NATURAL','TOTAL IMPORT FACTURA','Consum Total','S25CON'],
  'naturgy_regulada_gas_natural': ['Comercializadora Regulada, Gas & Power','aquí tienes tu factura de gas','Tus datos de suministro de gas','Total a pagar','Consumo kWh','Código CUPS:']
};

function detectParser(text) {
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const textNorm = norm(text);
  const scores = {};
  for (const [parser, marcadores] of Object.entries(MARCADORES)) {
    scores[parser] = marcadores.reduce((cnt, m) => {
      const mNorm = norm(m);
      if (m.includes(' ')) {
        return cnt + (textNorm.includes(mNorm) ? 1 : 0);
      }
      try {
        const regex = new RegExp('\\b' + mNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        return cnt + (regex.test(textNorm) ? 1 : 0);
      } catch(e) {
        return cnt + (textNorm.includes(mNorm) ? 1 : 0);
      }
    }, 0);
  }
  const rawCandidates = {...scores};
  let best = 'generic_invoice_parser', bestScore = 0;
  for (const [p, s] of Object.entries(scores)) { if (s > bestScore) { bestScore = s; best = p; } }
  if (bestScore < 2) best = 'generic_invoice_parser';
  return { parserName: best, rawCandidates };
}
