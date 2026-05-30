// UTILITIES

function normalizeCups(cupsRaw) {
  const original = cupsRaw;
  const cleaned = cupsRaw.replace(/\s+/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  let normalized = cleaned;
  if (normalized.length === 22) normalized = normalized.slice(0, -2);
  // Safety: CUPS must be exactly 20 chars (ES + 18 alphanumeric).
  // Truncate any trailing suffix beyond 20 chars.
  if (normalized.length > 20) normalized = normalized.slice(0, 20);
  return { normalized, wasNormalized: normalized !== cleaned, original };
}

function parseSpanishNumber(value, decimalPlaces = null) {
  if (value === null || value === undefined) return 'NaN';
  let s = String(value).trim();
  s = s.replace(/[€£$]\s*/g, '').replace(/\s*(kWh|m³|KWh|M3|kwH|KWH)\s*/gi, '').trim();
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  let numericStr;
  if (lastComma !== -1 && (lastDot === -1 || lastComma > lastDot)) {
    numericStr = s.slice(0, lastComma).replace(/\./g, '') + '.' + s.slice(lastComma + 1).replace(/,/g, '');
  } else if (lastDot !== -1) {
    numericStr = s.replace(/,/g, '');
  } else {
    numericStr = s.replace(/[^\d\-]/g, '');
  }
  const num = Number(numericStr);
  if (isNaN(num)) return 'NaN';
  if (decimalPlaces !== null) return num.toFixed(decimalPlaces);
  return String(num);
}

const MONTH_MAP = {
  'enero':'01','febrero':'02','marzo':'03','abril':'04','mayo':'05','junio':'06',
  'julio':'07','agosto':'08','septiembre':'09','setiembre':'09','octubre':'10',
  'noviembre':'11','diciembre':'12'
};

function parseSpanishDate(text) {
  if (!text) return null;
  const s = text.trim();
  const slashMatch = s.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[2].padStart(2,'0')}-${slashMatch[1].padStart(2,'0')}`;
  const singleMatch = s.match(/\b(\d{1,2})\s+de\s+([a-záéíóúñü]+)\s+de\s+(\d{4})\b/i);
  if (singleMatch) {
    const month = MONTH_MAP[singleMatch[2].toLowerCase()];
    return month ? `${singleMatch[3]}-${month}-${singleMatch[1].padStart(2,'0')}` : null;
  }
  return null;
}

function parseDateWithDots(text) {
  if (!text) return null;
  const m = text.trim().match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
  return m ? `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}` : null;
}

function computePeriodMonth(periodEnd) {
  if (!periodEnd) return null;
  const m = periodEnd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? { year: parseInt(m[1],10), month: parseInt(m[2],10) } : null;
}

function formatDate(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
}

function parsePeriodRange(text) {
  if (!text) return null;
  const s = text.trim();
  const slashRange = s.match(/(?:del\s+)?(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(?:al|-)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
  if (slashRange) {
    return {
      start: `${slashRange[3]}-${slashRange[2].padStart(2,'0')}-${slashRange[1].padStart(2,'0')}`,
      end: `${slashRange[6]}-${slashRange[5].padStart(2,'0')}-${slashRange[4].padStart(2,'0')}`
    };
  }
  const sp = s.match(/(?:del\s+)?(\d{1,2})\s+de\s+([a-záéíóúñü]+)\s+de\s+(\d{4})\s+a\s+(?:del\s+)?(\d{1,2})\s+de\s+([a-záéíóúñü]+)\s+de\s+(\d{4})/i);
  if (sp) {
    const m1 = MONTH_MAP[sp[2].toLowerCase()], m2 = MONTH_MAP[sp[5].toLowerCase()];
    if (m1 && m2) return { start: `${sp[3]}-${m1}-${sp[1].padStart(2,'0')}`, end: `${sp[6]}-${m2}-${sp[4].padStart(2,'0')}` };
  }
  return null;
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function cupsStatus(result) {
  if (!result.cups_key) return { cls:'cups-uncontrolled', icon:'⚪', label:'desconocido' };
  return window.controlledCups && window.controlledCups[result.cups_key]
    ? { cls:'cups-controlled', icon:'🟢', label:'controlado' }
    : { cls:'cups-uncontrolled', icon:'🔴', label:'no controlado' };
}

function getSemaphoreState(result) {
  if (!result) return { color: 'gray', bg: 'bg-gray-100 border-gray-200', label: 'desconocido' };
  const blocking = result.warnings.filter(w => w.isBlocking).length;
  if (blocking > 0) {
    return { color: 'red', bg: 'bg-red-50 border-red-200', label: 'requiere atención' };
  }
  if (result.estado === 'corregida' || result.warnings.length > 0) {
    return { color: 'yellow', bg: 'bg-yellow-50 border-yellow-200', label: 'corregida / avisos' };
  }
  if (result.estado === 'validada') {
    return { color: 'green', bg: 'bg-green-50 border-green-200', label: 'validada' };
  }
  return { color: 'gray', bg: 'bg-gray-100 border-gray-200', label: 'desconocido' };
}

window.escapeHtml = escapeHtml;
window.cupsStatus = cupsStatus;
window.getSemaphoreState = getSemaphoreState;

// ============================================================
// EMPTY RESULT (shared — used by parsers before validation.js loads)
// ============================================================
function createEmptyResult(fileName, rawText) {
  return {
    file_name: fileName, parser_name:'unknown', parser_version:'1.0.0', parse_source:'parser_especifico',
    parse_confidence: 0.0, energy_type:null, supplier_name:null, invoice_number:null,
    cups_original:null, cups_key:null, period_start:null, period_end:null,
    computed_year:null, computed_month:null, consumption_kwh:null, total_amount_eur:null,
    controlled_cups_match:false, building_key:null, building_name:null,
    raw_candidates:{}, warnings:[], raw_text:rawText
  };
}

function calcConfidence(result) {
  const f = (result.invoice_number?1:0) + (result.period_start?1:0) + (result.period_end?1:0) +
    (result.cups_original?1:0) + (result.consumption_kwh && result.consumption_kwh!=='NaN'?1:0) +
    (result.total_amount_eur && result.total_amount_eur!=='NaN'?1:0);
  return f >= 5 ? 0.95 : 0.70;
}
