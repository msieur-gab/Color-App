/**
 * Main application script
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize any global app behavior
  setupResponsiveBehavior();
  setupServiceWorker();
  setupToasts();
});

/**
 * Setup responsive UI behavior
 */
function setupResponsiveBehavior() {
  // Handle mobile menu toggle if needed
  const handleResize = () => {
    document.body.classList.toggle('mobile', window.innerWidth < 768);
  };
  
  // Initial call
  handleResize();
  
  // Add resize listener
  window.addEventListener('resize', handleResize);
}

/**
 * Setup service worker for PWA functionality
 */
function setupServiceWorker() {
  // Only register service worker in production
  if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
        });
    });
  }
}

/**
 * Setup global toast notifications
 */
function setupToasts() {
  // Create a global toast notification helper
  window.showToast = (message, type = 'default', duration = 3000) => {
    // Check for existing toast container
    let toastContainer = document.getElementById('global-toast-container');
    
    // Create container if it doesn't exist
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'global-toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.right = '20px';
      toastContainer.style.zIndex = '1000';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `global-toast ${type}`;
    toast.textContent = message;
    
    // Style the toast
    toast.style.backgroundColor = type === 'error' ? '#f44336' : '#333';
    toast.style.color = 'white';
    toast.style.padding = '12px 16px';
    toast.style.marginTop = '10px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast (with slight delay for transition)
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // Remove toast after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toastContainer.removeChild(toast);
        
        // Remove container if empty
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      }, 300);
    }, duration);
  };
}

/**
 * Export color palette to different formats
 */
window.exportPalette = {
  /**
   * Export palette as CSS variables
   * @param {Array} colors - Array of color hex codes
   * @returns {string} CSS variables string
   */
  toCSS: (colors, prefix = 'color') => {
    return `:root {\n${colors.map((color, index) => `  --${prefix}-${index + 1}: ${color};`).join('\n')}\n}`;
  },
  
  /**
   * Export palette as SCSS variables
   * @param {Array} colors - Array of color hex codes
   * @returns {string} SCSS variables string
   */
  toSCSS: (colors, prefix = 'color') => {
    return colors.map((color, index) => `${prefix}-${index + 1}: ${color};`).join('\n');
  },
  
  /**
   * Export palette as Tailwind CSS config
   * @param {Array} colors - Array of color hex codes
   * @returns {string} Tailwind config string
   */
  toTailwind: (colors) => {
    const colorObj = colors.reduce((acc, color, index) => {
      acc[`color${index + 1}`] = color;
      return acc;
    }, {});
    
    return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colorObj, null, 6).replace(/"/g, "'")}\n    }\n  }\n}`;
  }
};
