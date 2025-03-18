/**
 * Web Component for Saved Palettes
 */
class SavedPalettes extends HTMLElement {
  constructor() {
    super();
    
    // Component state
    this.state = {
      palettes: [],
      loading: true
    };
    
    // Toast message timeout
    this.toastTimeout = null;
  }
  
  /**
   * Component lifecycle: when added to DOM
   */
  connectedCallback() {
    this._render();
    this._loadPalettes();
    this._attachEventListeners();
    
    // Listen for palette changes
    window.paletteStorage.addEventListener('onPalettesChanged', () => {
      this._loadPalettes();
    });
  }
  
  /**
   * Load palettes from storage
   */
  async _loadPalettes() {
    this.state.loading = true;
    this._updateLoadingState();
    
    try {
      this.state.palettes = await window.paletteStorage.getAllPalettes();
      this.state.loading = false;
      this._updatePalettesList();
    } catch (error) {
      console.error('Error loading palettes:', error);
      this.state.loading = false;
      this._updatePalettesList();
    }
  }
  
  /**
   * Render the component
   */
  _render() {
    this.innerHTML = `
      <div class="card saved-palettes-container">
        <div class="saved-palettes-header">
          <h2>Saved Palettes</h2>
          <button id="export-all-btn" class="success">Export All</button>
        </div>
        
        <div id="palettes-content">
          ${this._renderLoading()}
        </div>
        
        <div id="toast" class="toast" style="display: none;">
          Color copied to clipboard!
        </div>
      </div>
    `;
  }
  
  /**
   * Render loading indicator
   * @returns {string} HTML string
   */
  _renderLoading() {
    return `
      <div class="loading-indicator">
        <p>Loading palettes...</p>
      </div>
    `;
  }
  
  /**
   * Render empty state
   * @returns {string} HTML string
   */
  _renderEmptyState() {
    return `
      <div class="empty-state">
        <h3>No Saved Palettes</h3>
        <p>Your saved palettes will appear here.</p>
        <p>Generate a palette and click "Save" to add it to your collection.</p>
      </div>
    `;
  }
  
  /**
   * Render palettes list
   * @returns {string} HTML string
   */
  _renderPalettesList() {
    return `
      <div class="palettes-list">
        ${this.state.palettes.map(palette => this._renderPaletteItem(palette)).join('')}
      </div>
    `;
  }
  
  /**
   * Render individual palette item
   * @param {Object} palette - Palette object
   * @returns {string} HTML string
   */
  _renderPaletteItem(palette) {
    const dateStr = new Date(palette.dateCreated).toLocaleDateString();
    
    return `
      <div class="palette-item" data-id="${palette.id}">
        <div class="palette-colors-preview">
          ${palette.colors.map(color => `
            <div 
              class="palette-color-preview tooltip" 
              style="background-color: ${color};"
              data-color="${color}"
            >
              <span class="tooltip-text">Click to copy</span>
            </div>
          `).join('')}
        </div>
        
        <div class="palette-info">
          <div class="palette-info-text">
            <span class="harmony-type">${HarmonyGenerator.getHarmonyName(palette.harmonyType)}</span>
            <span class="base-color">${palette.baseColor}</span>
          </div>
          
          <div class="palette-actions">
            <button class="load-btn tooltip" data-id="${palette.id}">
              <span class="tooltip-text">Load this palette</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </button>
            
            <button class="export-btn tooltip" data-id="${palette.id}">
              <span class="tooltip-text">Export as JSON</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </button>
            
            <button class="delete-btn tooltip" data-id="${palette.id}">
              <span class="tooltip-text">Delete palette</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Update loading state
   */
  _updateLoadingState() {
    const contentEl = this.querySelector('#palettes-content');
    if (this.state.loading) {
      contentEl.innerHTML = this._renderLoading();
    }
  }
  
  /**
   * Update palettes list
   */
  _updatePalettesList() {
    const contentEl = this.querySelector('#palettes-content');
    
    if (this.state.palettes.length === 0) {
      contentEl.innerHTML = this._renderEmptyState();
    } else {
      contentEl.innerHTML = this._renderPalettesList();
      this._attachPaletteItemListeners();
    }
  }
  
  /**
   * Attach event listeners to elements
   */
  _attachEventListeners() {
    // Export all button
    const exportAllBtn = this.querySelector('#export-all-btn');
    exportAllBtn.addEventListener('click', () => {
      this._exportAllPalettes();
    });
  }
  
  /**
   * Attach event listeners to palette items
   */
  _attachPaletteItemListeners() {
    // Color preview click to copy
    const colorPreviews = this.querySelectorAll('.palette-color-preview');
    colorPreviews.forEach(el => {
      el.addEventListener('click', e => {
        const color = e.currentTarget.dataset.color;
        this._copyToClipboard(color);
        this._showToast(`Copied ${color} to clipboard!`);
      });
    });
    
    // Load palette button
    const loadBtns = this.querySelectorAll('.load-btn');
    loadBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        const id = parseInt(e.currentTarget.dataset.id);
        this._loadPalette(id);
      });
    });
    
    // Export palette button
    const exportBtns = this.querySelectorAll('.export-btn');
    exportBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        const id = parseInt(e.currentTarget.dataset.id);
        this._exportPalette(id);
      });
    });
    
    // Delete palette button
    const deleteBtns = this.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        const id = parseInt(e.currentTarget.dataset.id);
        this._deletePalette(id);
      });
    });
  }
  
  /**
   * Load a palette to the generator
   * @param {number} id - Palette ID
   */
  async _loadPalette(id) {
    try {
      const palette = await window.paletteStorage.getPaletteById(id);
      
      if (!palette) {
        this._showToast('Palette not found', 'error');
        return;
      }
      
      // Get the generator component
      const generator = document.querySelector('color-palette-generator');
      
      if (generator) {
        // Update generator state
        generator.state.baseColor = palette.baseColor;
        generator.state.harmonyType = palette.harmonyType;
        generator.state.palette = [...palette.colors];
        
        // Update UI
        generator.querySelector('#base-color').value = palette.baseColor;
        generator.querySelector('#hex-input').value = palette.baseColor;
        generator.querySelector('#harmony-type').value = palette.harmonyType;
        generator._updatePaletteColors();
        
        // Show toast
        this._showToast('Palette loaded!');
        
        // Scroll to generator
        generator.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading palette:', error);
      this._showToast('Error loading palette', 'error');
    }
  }
  
  /**
   * Export a palette as JSON
   * @param {number} id - Palette ID
   */
  async _exportPalette(id) {
    try {
      const palette = await window.paletteStorage.getPaletteById(id);
      
      if (!palette) {
        this._showToast('Palette not found', 'error');
        return;
      }
      
      const dataStr = JSON.stringify(palette, null, 2);
      this._downloadJSON(dataStr, `palette-${id}.json`);
      this._showToast('Palette exported!');
    } catch (error) {
      console.error('Error exporting palette:', error);
      this._showToast('Error exporting palette', 'error');
    }
  }
  
  /**
   * Export all palettes as JSON
   */
  async _exportAllPalettes() {
    try {
      const palettes = await window.paletteStorage.getAllPalettes();
      
      if (palettes.length === 0) {
        this._showToast('No palettes to export', 'error');
        return;
      }
      
      const dataStr = JSON.stringify(palettes, null, 2);
      this._downloadJSON(dataStr, `all-palettes.json`);
      this._showToast('All palettes exported!');
    } catch (error) {
      console.error('Error exporting palettes:', error);
      this._showToast('Error exporting palettes', 'error');
    }
  }
  
  /**
   * Delete a palette
   * @param {number} id - Palette ID
   */
  async _deletePalette(id) {
    if (confirm('Are you sure you want to delete this palette?')) {
      try {
        await window.paletteStorage.deletePalette(id);
        this._showToast('Palette deleted!');
      } catch (error) {
        console.error('Error deleting palette:', error);
        this._showToast('Error deleting palette', 'error');
      }
    }
  }
  
  /**
   * Download data as JSON file
   * @param {string} data - JSON string
   * @param {string} filename - File name
   */
  _downloadJSON(data, filename) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  _copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }
  
  /**
   * Show toast message
   * @param {string} message - Message to show
   * @param {string} type - Message type (default, error)
   */
  _showToast(message, type = 'default') {
    const toast = this.querySelector('#toast');
    
    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    // Set message and type
    toast.textContent = message;
    toast.className = 'toast';
    
    if (type === 'error') {
      toast.classList.add('error');
    }
    
    // Show toast
    toast.style.display = 'block';
    
    // Hide after 3 seconds
    this.toastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

// Define the custom element
customElements.define('saved-palettes', SavedPalettes);
