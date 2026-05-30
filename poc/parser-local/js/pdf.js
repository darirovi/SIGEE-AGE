// PDF EXTRACTION
async function extractPdfText(file) {
  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:buf}).promise;
    let txt = '';
    for (let i=1; i<=pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      txt += content.items.map(item=>item.str).join(' ') + '\n';
    }
    return txt;
  } catch(e) { return ''; }
}
