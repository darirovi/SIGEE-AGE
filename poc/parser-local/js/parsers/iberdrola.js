// Parser: Iberdrola Electricidad
function parseIberdrolaElectricidad(text) {
  const r = createEmptyResult('', text); r.parser_name='iberdrola_electricidad'; r.energy_type='electricidad'; r.supplier_name='Iberdrola Clientes, S.A.U.';
  const rc = {};
  let m;
  if (m = text.match(/Nº\s*FACTURA[:\s]*([A-Z0-9]+)/im)) { r.invoice_number=m[1]; rc.invoice_number=[m[0]]; }
  if (m = text.match(/PERIODO\s*DE\s*FACTURACIÓN[:\s]*(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/im)) {
    r.period_start=parseSpanishDate(m[1]); r.period_end=parseSpanishDate(m[2]); rc.period=[m[0]];
  }
  if (m = text.match(/Identificación punto de suministro \(CUPS\)[:\s]*([A-Z0-9\s]+)/im)) {
    const raw=m[1].trim(); r.cups_original=raw; r.cups_key=normalizeCups(raw).normalized; rc.cups=[raw];
  }
  if (m = text.match(/Consumo total de esta factura[.\s]*([\d\.]+)\s*kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }
  else if (m = text.match(/Total:\s*([\d\.]+)\s*kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }
  if (m = text.match(/TOTAL[:\s]*([\d\.,]+)\s*€/im)) { r.total_amount_eur=parseSpanishNumber(m[1],2); rc.total_amount_eur=[m[0]]; }
  else if (m = text.match(/TOTAL\s*IMPORTE\s*FACTURA[:\s]*([\d\.,]+)\s*€/im)) { r.total_amount_eur=parseSpanishNumber(m[1],2); rc.total_amount_eur=[m[0]]; }
  if (r.period_end) { const p=computePeriodMonth(r.period_end); if(p){ r.computed_year=p.year; r.computed_month=p.month; } }
  r.parse_confidence=calcConfidence(r); r.raw_candidates=rc; return r;
}
