/**
 * Web Component for Color Palette Generator
 */
class ColorPaletteGenerator extends HTMLElement {
  constructor() {
    super();
    
    // Component state
    this.state = {
      baseColor: '#4287f5',
      harmonyType: 'analogous',
      colorCount: 5,
      paletteName: '',
      palette: []
    };
    
    // Generate initial palette
    this._generatePalette();
    
    // Toast message timeout
    this.toastTimeout = null;
  }
  
  /**
   * Component lifecycle: when added to DOM
   */
  connectedCallback() {
    this._render();
    this._attachEventListeners();
  }
  
  /**
   * Generate color palette based on current state
   */
  _generatePalette() {
    this.state.palette = HarmonyGenerator.generatePalette(
      this.state.baseColor,
      this.state.harmonyType,
      this.state.colorCount
    );
  }
  
  /**
   * Render the component
   */
  _render() {
    this.innerHTML = `
      <div class="card palette-generator">
        <div class="palette-controls">
          <div class="control-group">
            <label for="base-color">Base Color</label>
            <div class="color-input-group">
              <input
                type="color"
                id="base-color"
                value="${this.state.baseColor}"
              />
              <input
                type="text"
                id="hex-input"
                value="${this.state.baseColor}"
                placeholder="#RRGGBB"
              />
            </div>
          </div>
          
          <div class="control-group">
            <label for="harmony-type">Harmony Type</label>
            <select id="harmony-type">
              ${this._renderHarmonyOptions()}
            </select>
          </div>
          
          <div class="control-group">
            <label for="color-count">Number of Colors</label>
            <div class="color-count-control">
              <button id="decrease-count" class="count-btn" ${this.state.colorCount <= 3 ? 'disabled' : ''}>-</button>
              <input
                type="number"
                id="color-count"
                value="${this.state.colorCount}"
                min="3"
                max="10"
              />
              <button id="increase-count" class="count-btn" ${this.state.colorCount >= 10 ? 'disabled' : ''}>+</button>
            </div>
          </div>
          
          <div class="control-group">
            <label for="palette-name">Palette Name</label>
            <input
              type="text"
              id="palette-name"
              value="${this.state.paletteName}"
              placeholder="Enter a name for this palette"
            />
          </div>
          
          <div class="control-group">
            <label>Actions</label>
            <div class="button-group">
              <button id="generate-btn">Generate</button>
              <button id="save-btn" class="success">Save</button>
              <button id="copy-all-btn" class="purple">Copy All</button>
            </div>
          </div>
        </div>
        
        <div class="current-palette">
          <h2>Current Palette</h2>
          <div class="palette-colors">
            ${this._renderPaletteColors()}
          </div>
        </div>
        
        <div id="toast" class="toast" style="display: none;">
          Color copied to clipboard!
        </div>
      </div>
    `;
  }
  
  /**
   * Render harmony type options
   * @returns {string} HTML string of option elements
   */
  _renderHarmonyOptions() {
    return HarmonyGenerator.getHarmonyTypes()
      .map(type => {
        const selected = type.id === this.state.harmonyType ? 'selected' : '';
        return `<option value="${type.id}" ${selected}>${type.name}</option>`;
      })
      .join('');
  }
  
  /**
   * Render the palette color swatches
   * @returns {string} HTML string of palette colors
   */
  _renderPaletteColors() {
    return this.state.palette
      .map(color => {
        const textColor = ColorConverter.getContrastColor(color);
        return `
          <div 
            class="palette-color tooltip" 
            style="background-color: ${color}; color: ${textColor};"
            data-color="${color}"
          >
            <span class="color-hex">${color}</span>
            <span class="tooltip-text">Click to copy</span>
          </div>
        `;
      })
      .join('');
  }
  
  /**
   * Attach event listeners to elements
   */
  _attachEventListeners() {
    // Color picker
    const colorPicker = this.querySelector('#base-color');
    colorPicker.addEventListener('input', e => {
      this.state.baseColor = e.target.value;
      this.querySelector('#hex-input').value = e.target.value;
      this._generatePalette();
      this._updatePaletteColors();
    });
    
    // Hex input
    const hexInput = this.querySelector('#hex-input');
    hexInput.addEventListener('input', e => {
      let value = e.target.value;
      
      // Add # if missing
      if (value && !value.startsWith('#')) {
        value = '#' + value;
      }
      
      // Only update if valid hex
      if (ColorConverter.isValidHex(value)) {
        value = ColorConverter.formatHex(value);
        this.state.baseColor = value;
        this.querySelector('#base-color').value = value;
        this._generatePalette();
        this._updatePaletteColors();
      }
    });
    
    // Harmony type selector
    const harmonySelect = this.querySelector('#harmony-type');
    harmonySelect.addEventListener('change', e => {
      this.state.harmonyType = e.target.value;
      this._generatePalette();
      this._updatePaletteColors();
    });
    
    // Color count input
    const colorCountInput = this.querySelector('#color-count');
    colorCountInput.addEventListener('change', e => {
      const count = parseInt(e.target.value, 10);
      // Ensure the value is between min and max
      if (count >= 3 && count <= 10) {
        this.state.colorCount = count;
        this._generatePalette();
        this._updatePaletteColors();
        
        // Enable/disable buttons based on new count
        this.querySelector('#decrease-count').disabled = count <= 3;
        this.querySelector('#increase-count').disabled = count >= 10;
      }
    });
    
    // Decrease color count button
    const decreaseBtn = this.querySelector('#decrease-count');
    decreaseBtn.addEventListener('click', () => {
      if (this.state.colorCount > 3) {
        this.state.colorCount--;
        this.querySelector('#color-count').value = this.state.colorCount;
        this._generatePalette();
        this._updatePaletteColors();
        
        // Update button states
        decreaseBtn.disabled = this.state.colorCount <= 3;
        this.querySelector('#increase-count').disabled = false;
      }
    });
    
    // Increase color count button
    const increaseBtn = this.querySelector('#increase-count');
    increaseBtn.addEventListener('click', () => {
      if (this.state.colorCount < 10) {
        this.state.colorCount++;
        this.querySelector('#color-count').value = this.state.colorCount;
        this._generatePalette();
        this._updatePaletteColors();
        
        // Update button states
        increaseBtn.disabled = this.state.colorCount >= 10;
        this.querySelector('#decrease-count').disabled = false;
      }
    });
    
    // Palette name input
    const nameInput = this.querySelector('#palette-name');
    nameInput.addEventListener('input', e => {
      this.state.paletteName = e.target.value;
    });
    
    // Generate button
    const generateBtn = this.querySelector('#generate-btn');
    generateBtn.addEventListener('click', () => {
      this._generatePalette();
      this._updatePaletteColors();
    });
    
    // Save palette button
    const saveBtn = this.querySelector('#save-btn');
    saveBtn.addEventListener('click', () => {
      this._savePalette();
    });
    
    // Copy all button
    const copyAllBtn = this.querySelector('#copy-all-btn');
    copyAllBtn.addEventListener('click', () => {
      this._copyAllColors();
    });
    
    // Click to copy individual colors
    const paletteColors = this.querySelectorAll('.palette-color');
    paletteColors.forEach(el => {
      el.addEventListener('click', e => {
        const color = e.currentTarget.dataset.color;
        this._copyToClipboard(color);
        this._showToast(`Copied ${color} to clipboard!`);
      });
    });
  }
  
  /**
   * Update palette colors without re-rendering everything
   */
  _updatePaletteColors() {
    const paletteContainer = this.querySelector('.palette-colors');
    paletteContainer.innerHTML = this._renderPaletteColors();
    
    // Re-attach click events
    const paletteColors = this.querySelectorAll('.palette-color');
    paletteColors.forEach(el => {
      el.addEventListener('click', e => {
        const color = e.currentTarget.dataset.color;
        this._copyToClipboard(color);
        this._showToast(`Copied ${color} to clipboard!`);
      });
    });
  }
  
  /**
   * Save the current palette to storage
   */
  _savePalette() {
    const palette = {
      name: this.state.paletteName,
      baseColor: this.state.baseColor,
      harmonyType: this.state.harmonyType,
      colorCount: this.state.colorCount,
      colors: [...this.state.palette],
      dateCreated: new Date()
    };
    
    window.paletteStorage.savePalette(palette)
      .then(() => {
        this._showToast('Palette saved!');
      })
      .catch(error => {
        console.error('Error saving palette:', error);
        this._showToast('Error saving palette', 'error');
      });
  }
  
  /**
   * Copy all colors to clipboard
   */
  _copyAllColors() {
    const colors = this.state.palette.join(', ');
    this._copyToClipboard(colors);
    this._showToast('All colors copied to clipboard!');
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
customElements.define('color-palette-generator', ColorPaletteGenerator);
