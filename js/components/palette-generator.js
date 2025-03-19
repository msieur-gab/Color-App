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
      palette: [],
      imagePreview: null
    };
    
    // Generate initial palette
    this._generatePalette();
    
    // Camera state
    this.cameraMode = 'environment'; // Default to rear camera
    this.cameraStream = null;
    
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
      <div class="card palette-generator sticky-generator">
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
            <label for="image-upload">Extract From Image</label>
            <div class="image-upload-container">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                class="image-upload-input"
              />
              <label for="image-upload" class="image-upload-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7"></path>
                  <circle cx="16" cy="8" r="2"></circle>
                  <path d="M3 16l5-5 8 8"></path>
                </svg>
                Browse...
              </label>
              
              <button id="camera-btn" class="camera-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                Take Photo
              </button>
              
              ${this.state.imagePreview ? `
                <button id="capture-color-btn" class="capture-color-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
                  </svg>
                  Extract Colors
                </button>
              ` : ''}
            </div>
            ${this.state.imagePreview ? `
              <div class="image-preview-container">
                <img src="${this.state.imagePreview}" alt="Preview" class="image-preview" />
                <button id="remove-image-btn" class="remove-image-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ` : ''}
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
    
    // Image upload
    const imageUpload = this.querySelector('#image-upload');
    imageUpload.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = event => {
          this.state.imagePreview = event.target.result;
          this._render();
          this._attachEventListeners();
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Camera button
    const cameraBtn = this.querySelector('#camera-btn');
    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => {
        this._openCamera();
      });
    }
    
    // Capture/extract colors from image
    const captureBtn = this.querySelector('#capture-color-btn');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        this._extractColorsFromImage();
      });
    }
    
    // Remove image
    const removeImageBtn = this.querySelector('#remove-image-btn');
    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.state.imagePreview = null;
        this._render();
        this._attachEventListeners();
      });
    }
    
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
   * Open camera modal for taking a photo
   */
  _openCamera() {
    // Create camera modal if it doesn't exist
    if (!document.getElementById('camera-modal')) {
      const cameraModal = document.createElement('div');
      cameraModal.id = 'camera-modal';
      cameraModal.className = 'camera-modal';
      cameraModal.style.display = 'flex';
      cameraModal.innerHTML = `
        <div class="camera-modal-content">
          <div class="camera-header">
            <h3>Take a Photo</h3>
            <button id="close-camera-btn" class="close-camera-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="camera-body">
            <video id="camera-preview" autoplay playsinline></video>
            <canvas id="camera-canvas" style="display: none;"></canvas>
            
            <div id="camera-controls" class="camera-controls">
              <button id="capture-btn" class="capture-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              
              <button id="flip-camera-btn" class="camera-flip-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9h6M9 9L7 11M9 9L7 7"></path>
                  <path d="M21 15h-6m0 0l2 2m-2-2l2-2"></path>
                  <path d="M9 15a6 6 0 006 0"></path>
                  <path d="M15 9a6 6 0 00-6 0"></path>
                </svg>
              </button>
            </div>
            
            <div id="captured-preview" class="captured-preview" style="display: none;">
              <img id="captured-image" src="" alt="Captured photo">
              <div class="captured-controls">
                <button id="retake-btn" class="retake-btn">Retake</button>
                <button id="use-photo-btn" class="use-photo-btn">Use This Photo</button>
              </div>
            </div>
            
            <div id="no-camera" class="no-camera" style="display: none;">
              <p>Unable to access camera.</p>
              <p>Please make sure you've given camera permissions or try a different browser.</p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(cameraModal);
      
      // Attach camera event listeners
      const closeCameraBtn = document.getElementById('close-camera-btn');
      closeCameraBtn.addEventListener('click', () => {
        this._closeCamera();
      });
      
      const captureBtn = document.getElementById('capture-btn');
      captureBtn.addEventListener('click', () => {
        this._capturePhoto();
      });
      
      const retakeBtn = document.getElementById('retake-btn');
      retakeBtn.addEventListener('click', () => {
        this._retakePhoto();
      });
      
      const usePhotoBtn = document.getElementById('use-photo-btn');
      usePhotoBtn.addEventListener('click', () => {
        this._usePhoto();
      });
      
      const flipCameraBtn = document.getElementById('flip-camera-btn');
      flipCameraBtn.addEventListener('click', () => {
        this._flipCamera();
      });
      
      // Close when clicking outside the modal content
      cameraModal.addEventListener('click', (e) => {
        if (e.target === cameraModal) {
          this._closeCamera();
        }
      });
      
      // Handle escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.cameraStream) {
          this._closeCamera();
        }
      });
      
      // Start camera
      this._startCamera();
    } else {
      // If modal already exists, show it and start camera
      document.getElementById('camera-modal').style.display = 'flex';
      this._startCamera();
    }
  }
  
  /**
   * Start camera stream
   */
  async _startCamera() {
    const videoElement = document.getElementById('camera-preview');
    const noCamera = document.getElementById('no-camera');
    const capturedPreview = document.getElementById('captured-preview');
    const cameraControls = document.getElementById('camera-controls');
    
    // Reset UI
    if (videoElement) videoElement.style.display = 'block';
    if (capturedPreview) capturedPreview.style.display = 'none';
    if (cameraControls) cameraControls.style.display = 'flex';
    if (noCamera) noCamera.style.display = 'none';
    
    try {
      const constraints = {
        video: {
          facingMode: this.cameraMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.cameraStream = stream;
      
      videoElement.srcObject = stream;
      
      // Set appropriate class based on camera mode
      if (this.cameraMode === 'user') {
        videoElement.classList.add('camera-flipped');
      } else {
        videoElement.classList.remove('camera-flipped');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      if (videoElement) videoElement.style.display = 'none';
      if (cameraControls) cameraControls.style.display = 'none';
      if (noCamera) noCamera.style.display = 'flex';
    }
  }
  
  /**
   * Close camera modal and stop camera
   */
  _closeCamera() {
    const modal = document.getElementById('camera-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    this._stopCamera();
  }
  
  /**
   * Stop camera stream
   */
  _stopCamera() {
    if (this.cameraStream) {
      const tracks = this.cameraStream.getTracks();
      tracks.forEach(track => track.stop());
      this.cameraStream = null;
    }
  }
  
  /**
   * Flip between front and rear cameras
   */
  _flipCamera() {
    // Toggle camera mode
    this.cameraMode = this.cameraMode === 'environment' ? 'user' : 'environment';
    
    // Update video element class based on camera mode
    const videoElement = document.getElementById('camera-preview');
    if (this.cameraMode === 'user') {
      videoElement.classList.add('camera-flipped');
    } else {
      videoElement.classList.remove('camera-flipped');
    }
    
    // Restart camera with new mode
    this._stopCamera();
    this._startCamera();
  }
  
  /**
   * Capture photo from camera
   */
  _capturePhoto() {
    const videoElement = document.getElementById('camera-preview');
    const canvasElement = document.getElementById('camera-canvas');
    const capturedImage = document.getElementById('captured-image');
    const capturedPreview = document.getElementById('captured-preview');
    const cameraControls = document.getElementById('camera-controls');
    
    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Get the context and prepare for drawing
    const context = canvasElement.getContext('2d');
    
    // If using front camera (selfie mode), we need to flip the image horizontally
    if (this.cameraMode === 'user') {
      context.translate(canvasElement.width, 0);
      context.scale(-1, 1);
    }
    
    // Draw video frame to canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Reset transform if we modified it
    if (this.cameraMode === 'user') {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    // Convert to image
    const imageDataUrl = canvasElement.toDataURL('image/png');
    
    // Update UI
    capturedImage.src = imageDataUrl;
    
    // Show captured preview, hide camera controls
    videoElement.style.display = 'none';
    cameraControls.style.display = 'none';
    capturedPreview.style.display = 'block';
  }
  
  /**
   * Retake photo
   */
  _retakePhoto() {
    const videoElement = document.getElementById('camera-preview');
    const capturedPreview = document.getElementById('captured-preview');
    const cameraControls = document.getElementById('camera-controls');
    
    // Show video preview, hide captured preview
    videoElement.style.display = 'block';
    capturedPreview.style.display = 'none';
    cameraControls.style.display = 'flex';
  }
  
  /**
   * Use captured photo
   */
  _usePhoto() {
    const capturedImage = document.getElementById('captured-image');
    
    // Set the captured image as the preview
    this.state.imagePreview = capturedImage.src;
    
    // Close the camera modal
    this._closeCamera();
    
    // Re-render the component
    this._render();
    this._attachEventListeners();
  }
  
  /**
   * Extract colors from the uploaded image
   */
  async _extractColorsFromImage() {
    if (!this.state.imagePreview) return;
    
    try {
      this._showToast('Extracting colors...', 'info');
      
      // Extract colors from the image
      const colors = await ImageColorExtractor.extractPalette(
        this.state.imagePreview, 
        this.state.colorCount
      );
      
      if (colors && colors.length > 0) {
        // Set the base color to the first extracted color
        this.state.baseColor = colors[0];
        this.querySelector('#base-color').value = colors[0];
        this.querySelector('#hex-input').value = colors[0];
        
        // Generate name suggestion
        if (!this.state.paletteName) {
          this.state.paletteName = 'Image Palette';
          this.querySelector('#palette-name').value = this.state.paletteName;
        }
        
        // Use the extracted colors as the palette
        this.state.palette = colors;
        this._updatePaletteColors();
        
        this._showToast('Colors extracted successfully!', 'success');
      } else {
        this._showToast('Could not extract colors. Try a different image.', 'error');
      }
    } catch (error) {
      console.error('Error extracting colors:', error);
      this._showToast('Error extracting colors', 'error');
    }
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
    // Make sure we have a palette name
    if (!this.state.paletteName.trim()) {
      // Generate a default name if empty
      this.state.paletteName = this.state.imagePreview
        ? 'Image Palette'
        : `${HarmonyGenerator.getHarmonyName(this.state.harmonyType)} Palette`;
      this.querySelector('#palette-name').value = this.state.paletteName;
    }
    
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
   * @param {string} type - Message type (default, error, success, info)
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
    
    if (type !== 'default') {
      toast.classList.add(type);
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