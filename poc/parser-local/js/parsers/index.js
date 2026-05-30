// Parser registry — maps parser name to parse function
// Individual parsers are loaded via script tags before this file

const PARSERS = {
  'iberdrola_electricidad': parseIberdrolaElectricidad,
  'curenergia_electricidad_pvpc': parseCurenergiaPvpc,
  'naturgy_regulada_electricidad': parseNaturgyReguladaElectricidad,
  'naturgy_regulada_gas_natural': parseNaturgyReguladaGasNatural,
  'energia_xxi_gas_natural': parseEnergiaXXiGasNatural,
  'generic_invoice_parser': parseGenericInvoice
};

// ============================================================
// PROCESS FILES
// ============================================================
async function processFiles(files) {
  showOverlay(true);
  for (const file of files) {
    const rawText = await extractPdfText(file);
    const result = createEmptyResult(file.name, rawText);
    if (!rawText || rawText.trim().length < 20) {
      result.warnings.push({ code:'UNREADABLE_PDF', level:'error', message:'PDF sin texto extraíble', isBlocking:true });
      result.parse_confidence = 0;
      window.results.push(result);
      await renderResults();
      continue;
    }
    const { parserName, rawCandidates } = detectParser(rawText);
    let parsed;
    if (parserName === 'iberdrola_electricidad') parsed = parseIberdrolaElectricidad(rawText);
    else if (parserName === 'curenergia_electricidad_pvpc') parsed = parseCurenergiaPvpc(rawText);
    else if (parserName === 'naturgy_regulada_electricidad') parsed = parseNaturgyReguladaElectricidad(rawText);
    else if (parserName === 'naturgy_regulada_gas_natural') parsed = parseNaturgyReguladaGasNatural(rawText);
    else if (parserName === 'energia_xxi_gas_natural') parsed = parseEnergiaXXiGasNatural(rawText);
    else parsed = parseGenericInvoice(rawText);
    Object.assign(result, parsed);
    result.file_name = file.name;
    result.raw_candidates = rawCandidates;
    result.warnings = buildWarnings(result, window.controlledCups);
    if (result.cups_key && window.controlledCups[result.cups_key]) {
      result.controlled_cups_match = true;
      result.building_key = window.controlledCups[result.cups_key].building_key;
      result.building_name = window.controlledCups[result.cups_key].building_name;
    }
    result._validation = await validateAgainstExpected(result);
    window.results.push(result);
    await renderResults();
  }
  showOverlay(false);
}
