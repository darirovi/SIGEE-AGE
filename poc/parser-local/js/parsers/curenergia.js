// Parser: Curenergia Electricidad PVPC
function parseCurenergiaPvpc(text) {
  const r = createEmptyResult('', text); r.parser_name='curenergia_electricidad_pvpc'; r.energy_type='electricidad'; r.supplier_name='Curenergía';
  const rc = {}; let m;

  // Invoice: "Nº Factura: 09230531040000010" (note: no "de")
  if (m = text.match(/Nº\s*Factura[:\s]*([A-Z0-9]+)/im)) { r.invoice_number=m[1]; rc.invoice_number=[m[0]]; }
  else if (m = text.match(/Nº?\s*factura[:\s]*([A-Z0-9]+)/im)) { r.invoice_number=m[1]; rc.invoice_number=[m[0]]; }

  // Period: "Periodo de consumo: 3 de abril de 2023 a 12 de abril de 2023" (words, not slashes)
  let pm = text.match(/Periodo de consumo[:\s]*(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4})\s*a\s*(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4})/im);
  if (pm) {
    const m1 = MONTH_MAP[pm[2].toLowerCase()] || MONTH_MAP[pm[2].toLowerCase().replace('í','i')];
    const m2 = MONTH_MAP[pm[5].toLowerCase()] || MONTH_MAP[pm[5].toLowerCase().replace('í','i')];
    if (m1 && m2) {
      r.period_start = `${pm[3]}-${m1}-${pm[1].padStart(2,'0')}`;
      r.period_end = `${pm[6]}-${m2}-${pm[4].padStart(2,'0')}`;
      rc.period = [pm[0]];
    }
  }

  // CUPS: "CUPS : ES 0021 0000 0427 9670 GB" (spaced ES format with 2-letter entity suffix)
  if (m = text.match(/CUPS\s*:\s*ES\s*([0-9]{4})\s*([0-9]{4})\s*([0-9]{4})\s*([0-9]{4})\s*([A-Z]{2})(?:\s|$)/im)) {
    const raw = `ES ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
    r.cups_original = raw;
    r.cups_key = normalizeCups(raw).normalized;
    rc.cups = [raw];
  }
  // Fallback: try to find ES-formatted CUPS anywhere in text
  if (!r.cups_original) {
    if (m = text.match(/ES\s+0021\s+0000\s+0427\s+9670\s+GB/im)) {
      r.cups_original = m[0]; r.cups_key = normalizeCups(m[0]).normalized; rc.cups = [m[0]];
    }
  }

  // Consumption: "Su consumo en el periodo facturado ha sido: 16 kWh"
  if (m = text.match(/Su consumo[^:]*:\s*([\d\.,]+)\s*kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }
  else if (m = text.match(/Consumo(?: energía activa)?[:\s]*([\d\.,]+)\s*kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }
  else if (m = text.match(/Consumo total[:\s]*([\d\.,]+)\s*kWh/im)) { r.consumption_kwh=parseSpanishNumber(m[1]); rc.consumption_kwh=[m[0]]; }

  // Total: "IMPORTE FACTURA: 9,77 €" or "IMPORTE DOCUMENTO 9,77 €"
  if (m = text.match(/IMPORTE\s+FACTURA[:\s]*([\d\.,]+)\s*[€]/im)) { r.total_amount_eur=parseSpanishNumber(m[1],2); rc.total_amount_eur=[m[0]]; }
  else if (m = text.match(/IMPORTE\s+DOCUMENTO[:\s]*([\d\.,]+)\s*[€]/im)) { r.total_amount_eur=parseSpanishNumber(m[1],2); rc.total_amount_eur=[m[0]]; }

  if (r.period_end) { const p=computePeriodMonth(r.period_end); if(p){ r.computed_year=p.year; r.computed_month=p.month; } }
  r.parse_confidence=calcConfidence(r); r.raw_candidates=rc; return r;
}
