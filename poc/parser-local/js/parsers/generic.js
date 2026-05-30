// Parser: Generic Invoice
function parseGenericInvoice(text) {
  const r = createEmptyResult('', text); r.parser_name='generic_invoice_parser'; r.parse_source='parser_generico'; r.parse_confidence=0.50; r.energy_type=null; r.supplier_name=null; r.requires_visual_review=true;
  const rc = {};
  const cupsCompact = text.match(/(ES[0-9]{20,22})/im);
  const cupsSpaced = text.match(/(ES[0-9]{4}\s[0-9]{4}\s[0-9]{4}\s[0-9]{4}\s[A-Z0-9]{2,3})/im);
  if (cupsCompact) { const raw=cupsCompact[1]; r.cups_original=raw; r.cups_key=normalizeCups(raw).normalized; rc.cups=[raw]; }
  else if (cupsSpaced) { const raw=cupsSpaced[1]; r.cups_original=raw; r.cups_key=normalizeCups(raw).normalized; rc.cups=[raw]; }
  const invM = text.match(/(?:Nº|Núm|Num|Factura)[:\.\s]*([A-Z0-9\-]+)/im);
  if (invM) { r.invoice_number=invM[1]; rc.invoice_number=[invM[0]]; }
  let pm = text.match(/(\d{2})\/(\d{2})\/(\d{4})\s*[-–]\s*(\d{2})\/(\d{2})\/(\d{4})/im);
  if (pm) { r.period_start=`${pm[3]}-${pm[2]}-${pm[1]}`; r.period_end=`${pm[6]}-${pm[5]}-${pm[4]}`; rc.period=[pm[0]]; }
  else { const dpm = text.match(/(\d{2})\.(\d{2})\.(\d{4})\s*[-–]\s*(\d{2})\.(\d{2})\.(\d{4})/im); if (dpm) { r.period_start=`${dpm[3]}-${dpm[2]}-${dpm[1]}`; r.period_end=`${dpm[6]}-${dpm[5]}-${dpm[4]}`; rc.period=[dpm[0]]; } }
  const allKwh = text.match(/([\d\.,]+)\s*kWh/im)||[];
  const kwhVals = allKwh.map(m=>parseSpanishNumber(m)).filter(v=>v!=='NaN');
  if (kwhVals.length>0) { rc.consumption_kwh=allKwh.map(m=>m); r.consumption_kwh=kwhVals.reduce((a,b)=>parseFloat(b)>parseFloat(a)?b:a); }
  const allEur = text.match(/([\d\.,]+)\s*€/im)||[];
  const eurVals = allEur.map(m=>parseSpanishNumber(m.replace(/€/g,'').trim(),2)).filter(v=>v!=='NaN');
  if (eurVals.length>0) { rc.total_amount_eur=allEur.map(m=>m); r.total_amount_eur=eurVals.reduce((a,b)=>parseFloat(b)>parseFloat(a)?b:a); }
  const lt = text.toLowerCase();
  if (/\b(electricidad|energ[ií]a\s+activa|potencia|kWh)\b/.test(lt)) { r.energy_type='electricidad'; rc.energy_type=['electricidad']; }
  else if (/\b(gas\s*natural|gas|m[m³])\b/.test(lt)) { r.energy_type='gas_natural'; rc.energy_type=['gas_natural']; }
  else if (/\b(gasoil|gasoil[eo])\b/.test(lt)) { r.energy_type='gasoleo'; rc.energy_type=['gasoleo']; }
  if (r.period_end) { const p=computePeriodMonth(r.period_end); if(p){ r.computed_year=p.year; r.computed_month=p.month; } }
  const f = (r.invoice_number?1:0)+(r.period_start?1:0)+(r.period_end?1:0)+(r.cups_original?1:0)+(r.consumption_kwh&&r.consumption_kwh!=='NaN'?1:0)+(r.total_amount_eur&&r.total_amount_eur!=='NaN'?1:0);
  r.parse_confidence = f>=5 ? 0.65 : f>=3 ? 0.50 : 0.30;
  r.warnings = [];
  if (kwhVals.length > 1) { r.warnings.push({ code:'MULTIPLE_CONSUMPTION_CANDIDATES', level:'warning', message:`Se encontraron ${kwhVals.length} candidatos de consumo`, isBlocking:false }); }
  if (eurVals.length > 1) { r.warnings.push({ code:'MULTIPLE_AMOUNT_CANDIDATES', level:'warning', message:`Se encontraron ${eurVals.length} candidatos de importe`, isBlocking:false }); }
  r.raw_candidates=rc; return r;
}
