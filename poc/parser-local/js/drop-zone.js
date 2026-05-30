// DRAG & DROP ZONE
// Handles dragover/dragleave/drop on #drop-zone + click fallback to file input

function initDropZone() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('fileInput');
  const filePreview = document.getElementById('file-preview');
  const dropText = document.getElementById('drop-text');

  if (!dropZone) return;

  // Click fallback: open file picker
  dropZone.addEventListener('click', () => {
    if (fileInput) fileInput.click();
  });

  // Prevent default drag behaviors on window
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
      if (e.target === dropZone || dropZone.contains(e.target)) {
        e.preventDefault();
      }
    }, false);
  });

  dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-400', 'bg-blue-50');
    dropText.textContent = '¡Suelta para procesar!';
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-400', 'bg-blue-50');
    dropText.textContent = '¡Suelta para procesar!';
  });

  dropZone.addEventListener('dragleave', (e) => {
    // Only trigger if leaving the drop zone entirely
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('border-blue-400', 'bg-blue-50');
      dropText.textContent = 'Arrastra archivos PDF aquí';
    }
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-400', 'bg-blue-50');
    dropText.textContent = 'Arrastra archivos PDF aquí';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Show preview
      showFilePreview(files);
      // Process immediately
      processFiles(files);
    }
  });

  function showFilePreview(files) {
    if (files.length === 0) {
      filePreview.classList.add('hidden');
      return;
    }
    const parts = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const size = f.size < 1024 * 1024
        ? (f.size / 1024).toFixed(1) + ' KB'
        : (f.size / (1024 * 1024)).toFixed(1) + ' MB';
      parts.push(`${f.name} (${size})`);
    }
    filePreview.textContent = files.length === 1 ? parts[0] : `${files.length} archivos: ${parts.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`;
    filePreview.classList.remove('hidden');
  }

  // Wire file input change to show preview
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      showFilePreview(fileInput.files);
    });
  }

  // Expose for external use
  window.initDropZone = initDropZone;
}
