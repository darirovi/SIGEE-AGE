// TOAST NOTIFICATION SYSTEM
// Usage: window.showToast(message, level) where level is 'success' | 'error' | 'info'

(function() {
  const CONTAINER_ID = 'toast-container';
  const AUTO_DISMISS_MS = 4000;

  function getContainer() {
    return document.getElementById(CONTAINER_ID);
  }

  function showToast(message, level = 'info') {
    const container = getContainer();
    if (!container) return;

    const validLevels = ['success', 'error', 'info'];
    if (!validLevels.includes(level)) level = 'info';

    const colors = {
      success: 'border-green-500 bg-green-50 text-green-800',
      error:   'border-red-500 bg-red-50 text-red-800',
      info:    'border-blue-500 bg-blue-50 text-blue-800',
    };
    const icons = {
      success: `<svg class="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
      error:   `<svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
      info:    `<svg class="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    };

    const toast = document.createElement('div');
    toast.className = [
      'flex items-center gap-3',
      'px-4 py-3 rounded-lg border-l-4 shadow-md',
      'text-sm font-medium',
      'transform transition-all duration-300',
      'translate-x-full opacity-0',
      colors[level]
    ].join(' ');

    toast.innerHTML = `
      ${icons[level]}
      <span class="flex-1">${escapeHtml(message)}</span>
      <button class="ml-2 text-current opacity-50 hover:opacity-100 cursor-pointer text-lg leading-none">&times;</button>
    `;

    // Dismiss button
    toast.querySelector('button').addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    });

    // Auto-dismiss
    const timer = setTimeout(() => removeToast(toast), AUTO_DISMISS_MS);
    toast._dismissTimer = timer;
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    clearTimeout(toast._dismissTimer);
    toast.classList.add('translate-x-full', 'opacity-0');
    toast.classList.remove('opacity-100', 'translate-x-0');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  window.showToast = showToast;
})();
