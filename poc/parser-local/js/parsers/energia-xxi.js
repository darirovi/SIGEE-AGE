// Parser: Energia XXI Gas Natural
function parseEnergiaXXiGasNatural(text) {
  const r = createEmptyResult('', text); r.parser_name='energia_xxi_gas_natural'; r.energy_type='gas_natural'; r.supplier_name='Energía XXI Comercializadora de Referencia S.L.U.';
  const rc = {}; let m;
  if (m = text.match(/Núm\.\s*de\s*factura[:\s]*([A-Z0-9]+)/im)) { r.invoice_number=m[1]; rc.invoice_number=[m[0]]; }
  let pm = text.match(/Període\s*facturació[:\s]*del\s+(\d{2})\/(\d{2})\/(\d{4})\s+al\s+(\d{2})\/(\d{2})\/(\d{4})/im);
  if (!pm) pm = text.match(/del\s+(\d{2})\/(\d{2})\/(\d{4})\s+al\s+(\d{2})\/(\d{2})\/(\d{4})/im);
  if (pm) { r.period_start=`${pm[3]}-${pm[2]}-${pm[1]}`; r.period_end=`${pm[6]}-${pm[5]}-${pm[4]}`; rc.period=[pm[0]]; }
  if (m = text.match(/CUPS[:\s]*([A-Z0-9]+)/im)) { const raw=m[1].trim(); r.cups_original=raw; r.cups_key=normalizeCups(raw).normalized; rc.cups=[raw]; }
  if (m = text.match(/Consum\s+Total\s+([\d\.,]+)\s*kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }
  else if (m = text.match(/Consum\s+([\d\.,]+)\s*kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }
  if (m = text.match(/TOTAL\s*IMPORT\s*FACTURA[:\s]*([\d\.,]+)\s*€/im)) { r.total_amount_eur=parseSpanishNumber(m[1],2); rc.total_amount_eur=[m[0]]; }
  else if (m = text.match(/IMPORT\s*FACTURA[:\s]*([\d\.,]+)\s*€/im)) { r.total_amount_eur=parseSpanishNumber(m[1],2); rc.total_amount_eur=[m[0]]; }
  if (r.period_end) { const p=computePeriodMonth(r.period_end); if(p){ r.computed_year=p.year; r.computed_month=p.month; } }
  r.parse_confidence=calcConfidence(r); r.raw_candidates=rc; return r;
}
