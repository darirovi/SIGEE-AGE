# Vendor Files — pdf.js

This directory holds the pdf.js library files needed for local PDF text extraction.

## Why local files?

The PoC runs entirely offline (file:// protocol). No CDN calls are allowed,
so pdf.js must be hosted locally in this directory.

## Files needed

- `pdf.min.js` — main library
- `pdf.worker.min.js` — web worker for off-thread PDF parsing

## Download instructions

**Version: pdf.js 3.x (latest stable at time of PoC: 3.11.174)**

1. Go to the pdf.js releases page:
   https://github.com/mozilla/pdf.js/releases/tag/v3.11.174

2. Download the following artifacts (attached to the release):
   - `pdfjs-3.11.174-dist.tar.gz` or `zip`

3. Extract the archive. Inside you will find a `build/` directory containing:
   ```
   build/pdf.min.js
   build/pdf.worker.min.js
   ```

4. Copy both files into this directory (`poc/parser-local/vendor/`):
   ```
   poc/parser-local/vendor/pdf.min.js
   poc/parser-local/vendor/pdf.worker.min.js
   ```

## Direct URLs (v3.11.174)

- Release page: https://github.com/mozilla/pdf.js/releases/tag/v3.11.174
- Archive download: https://github.com/mozilla/pdf.js/releases/download/v3.11.174/pdfjs-3.11.174-dist.tar.gz

## Version note

- PoC was built and tested with **pdf.js 3.11.174**
- Other 3.x versions should work; 2.x is NOT compatible with the API used in this PoC
- If you use a different version, verify `pdfjsLib.getDocument()` and
  `page.getTextContent()` behave consistently
