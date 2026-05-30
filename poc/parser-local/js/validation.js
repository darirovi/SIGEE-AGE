// WARNING CODES
const BLOCKING_CODES = new Set(['UNCONTROLLED_CUPS','MISSING_PERIOD_START','MISSING_PERIOD_END','MISSING_CONSUMPTION','MISSING_TOTAL_AMOUNT','ENERGY_TYPE_MISMATCH','DUPLICATE_INVOICE','UNREADABLE_PDF']);

function buildWarnings(result, ctrlCups) {
  const w = [];
  if (!result.cups_key || !ctrlCups[result.cups_key]) {
    w.push({ code:'UNCONTROLLED_CUPS', level:'error', message:'CUPS no está en la lista de CUPS controlados', isBlocking:true });
  }
  if (result.cups_original && result.cups_key && result.cups_original !== result.cups_key) {
    w.push({ code:'CUPS_NORMALIZED', level:'info', message:'CUPS fue normalizado', isBlocking:false });
  }
  if (result.period_start && result.period_end) {
    const sm = result.period_start.slice(5,7), em = result.period_end.slice(5,7);
    if (sm !== em) w.push({ code:'PERIOD_CROSSES_MONTHS', level:'info', message:'El periodo cruza mes', isBlocking:false });
  }
  const amt = parseFloat(result.total_amount_eur);
  if (result.consumption_kwh === null || result.consumption_kwh === '0' || result.consumption_kwh === 0) {
    w.push({ code:'ZERO_CONSUMPTION', level:'error', message:'Consumo cero o faltante', isBlocking:false });
  }
  if (result.total_amount_eur === null || isNaN(amt) || amt <= 0) {
    w.push({ code:'ZERO_OR_NEGATIVE_AMOUNT', level:'error', message:'Importe cero o negativo', isBlocking:false });
  }
  if (result.parser_name === 'generic_invoice_parser') {
    w.push({ code:'GENERIC_PARSER_USED', level:'warning', message:'Parser genérico usado — extracción puede ser incompleta', isBlocking:false });
  }
  if (result.parse_confidence < 0.80) {
    w.push({ code:'LOW_CONFIDENCE', level:'warning', message:'Confianza de parseo baja (< 80%)', isBlocking:false });
  }
  return w;
}

// ============================================================
// EXPECTED JSON VALIDATION
// ============================================================
function getExpectedFilename(result) {
  return result.file_name.replace(/\.pdf$/i, '.json');
}

async function loadExpectedForResult(result) {
  const key = getExpectedFilename(result);
  if (window.expectedCache[key] !== undefined) return window.expectedCache[key];
  try {
    const resp = await fetch(`/examples/parser_expected/${key}`);
    if (!resp.ok) { window.expectedCache[key] = null; return null; }
    window.expectedCache[key] = await resp.json();
    return window.expectedCache[key];
  } catch { window.expectedCache[key] = null; return null; }
}

const VALIDATION_FIELDS = ['parser_name','energy_type','invoice_number','cups_key','period_start','period_end','computed_year','computed_month','consumption_kwh','total_amount_eur'];

async function validateAgainstExpected(result) {
  const expected = await loadExpectedForResult(result);
  if (!expected) return { status: 'na', diffs: [] };
  const diffs = [];
  for (const field of VALIDATION_FIELDS) {
    const a = String(result[field] ?? '');
    const b = String(expected[field] ?? '');
    if (a !== b) diffs.push({ field, actual: a, expected: b });
  }
  return { status: diffs.length === 0 ? 'ok' : 'warn', diffs };
}
