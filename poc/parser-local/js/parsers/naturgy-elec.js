// Parser: Naturgy Regulada Electricidad
function parseNaturgyReguladaElectricidad(text) {
  const r = createEmptyResult('', text); r.parser_name='naturgy_regulada_electricidad'; r.energy_type='electricidad'; r.supplier_name='Comercializadora Regulada, Gas & Power';
  const rc = {}; let m;
  if (m = text.match(/Nº\s*factura[:\s]*([A-Z0-9]+)/im)) { r.invoice_number=m[1]; rc.invoice_number=[m[0]]; }
  const pm = text.match(/(\d{2})\s+de\s+(\w+)\s+de\s+(\d{4})\s+a\s+(\d{2})\s+de\s+(\w+)\s+de\s+(\d{4})/im);
  if (pm) {
    const m1=MONTH_MAP[pm[2].toLowerCase()]||MONTH_MAP[pm[2].toLowerCase().replace('í','i')];
    const m2=MONTH_MAP[pm[5].toLowerCase()]||MONTH_MAP[pm[5].toLowerCase().replace('í','i')];
    if (m1&&m2) { r.period_start=`${pm[3]}-${m1}-${pm[1]}`; r.period_end=`${pm[6]}-${m2}-${pm[4]}`; rc.period=[pm[0]]; }
  }
  if (m = text.match(/Código unificado de punto de suministro CUPS[:\s]*([A-Z0-9]+)/im)) { const raw=m[1].trim(); r.cups_original=raw; r.cups_key=normalizeCups(raw).normalized; rc.cups=[raw]; }
  if (m = text.match(/Su consumo en el periodo facturado ha sido\s+([\d\.]+)\s+kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }
  if (m = text.match(/TOTAL\s*IMPORTE\s*FACTURA[:\s]*([\d\.,]+)\s*€/im)) { r.total_amount_eur=parseSpanishNumber(m[1],2); rc.total_amount_eur=[m[0]]; }
  if (r.period_end) { const p=computePeriodMonth(r.period_end); if(p){ r.computed_year=p.year; r.computed_month=p.month; } }
  r.parse_confidence=calcConfidence(r); r.raw_candidates=rc; return r;
}
