/**
 * Web Component for Camera Capture
 * Allows users to take photos using their device camera
 */
class CameraCapture extends HTMLElement {
  constructor() {
    super();
    
    // Component state
    this.state = {
      isOpen: false,
      stream: null,
      hasCamera: true,
      capturedImage: null,
      facingMode: 'environment' // Default to rear camera
    };
    
    // Check if camera is available on this device
    this._checkCameraAvailability();
  }
  
  /**
   * Check if the device has camera capabilities
   */
  async _checkCameraAvailability() {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.state.hasCamera = false;
        return;
      }
      
      // Try to get a list of video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      this.state.hasCamera = videoDevices.length > 0;
    } catch (error) {
      console.warn('Error checking camera availability:', error);
      this.state.hasCamera = false;
    }
  }
  
  /**
   * Component lifecycle: when added to DOM
   */
  connectedCallback() {
    this._render();
    this._attachEventListeners();
  }
  
  /**
   * Component lifecycle: when removed from DOM
   */
  disconnectedCallback() {
    this._stopCamera();
  }
  
  /**
   * Render the component
   */
  _render() {
    this.innerHTML = `
      <div class="camera-capture-container">
        ${this.state.hasCamera ? `
        <button id="open-camera-btn" class="open-camera-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          Take Photo
        </button>` : ''}
        
        <div id="camera-modal" class="camera-modal" style="display: none;">
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
        </div>
      </div>
    `;
  }
  
  /**
   * Attach event listeners to elements
   */
  _attachEventListeners() {
    // Open camera button
    const openCameraBtn = this.querySelector('#open-camera-btn');
    if (openCameraBtn) {
      openCameraBtn.addEventListener('click', () => {
        this._openCamera();
      });
    }
    
    // Close camera button
    const closeCameraBtn = this.querySelector('#close-camera-btn');
    if (closeCameraBtn) {
      closeCameraBtn.addEventListener('click', () => {
        this._closeCamera();
      });
    }
    
    // Capture button
    const captureBtn = this.querySelector('#capture-btn');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        this._capturePhoto();
      });
    }

    const flipCameraBtn = this.querySelector('#flip-camera-btn');
      if (flipCameraBtn) {
        flipCameraBtn.addEventListener('click', () => {
          this._flipCamera();
        });
      }
    
    // Retake button
    const retakeBtn = this.querySelector('#retake-btn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        this._retakePhoto();
      });
    }
    
    // Use photo button
    const usePhotoBtn = this.querySelector('#use-photo-btn');
    if (usePhotoBtn) {
      usePhotoBtn.addEventListener('click', () => {
        this._usePhoto();
      });
    }
    
    // Close when clicking outside the modal
    const modal = this.querySelector('#camera-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this._closeCamera();
        }
      });
    }
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this._closeCamera();
      }
    });
  }
  
  /**
   * Open camera modal and start camera
   */
  _openCamera() {
    const modal = this.querySelector('#camera-modal');
    modal.style.display = 'flex';
    this.state.isOpen = true;
    
    this._startCamera();
  }

  // Add a new method to flip the camera
_flipCamera() {
  // Toggle camera mode
  this.state.facingMode = this.state.facingMode === 'environment' ? 'user' : 'environment';
  
  // Update video element class based on camera mode
  const videoElement = this.querySelector('#camera-preview');
  if (this.state.facingMode === 'user') {
    videoElement.classList.add('camera-flipped');
  } else {
    videoElement.classList.remove('camera-flipped');
  }
  
  // Restart camera with new mode
  this._stopCamera();
  this._startCamera();
}
  
  /**
   * Close camera modal and stop camera
   */
  _closeCamera() {
    const modal = this.querySelector('#camera-modal');
    modal.style.display = 'none';
    this.state.isOpen = false;
    
    this._stopCamera();
    this._resetCapturedState();
  }
  
  /**
   * Start camera stream
   */
  async _startCamera() {
    const videoElement = this.querySelector('#camera-preview');
    const cameraPreview = this.querySelector('#camera-preview');
    const noCamera = this.querySelector('#no-camera');
    const capturedPreview = this.querySelector('#captured-preview');
    const cameraControls = this.querySelector('#camera-controls');
    
    capturedPreview.style.display = 'none';
    
    try {
      const constraints = {
        video: {
          facingMode: this.state.facingMode, // Use current facing mode
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.state.stream = stream;
      this.state.hasCamera = true;
      
      videoElement.srcObject = stream;
      // Set appropriate class based on camera mode
      if (this.state.facingMode === 'user') {
        videoElement.classList.add('camera-flipped');
      } else {
        videoElement.classList.remove('camera-flipped');
      }
      
      cameraPreview.style.display = 'block';
      cameraControls.style.display = 'flex';
      noCamera.style.display = 'none';
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.state.hasCamera = false;
      
      cameraPreview.style.display = 'none';
      cameraControls.style.display = 'none';
      noCamera.style.display = 'block';
    }
  }
  
  /**
   * Stop camera stream
   */
  _stopCamera() {
    if (this.state.stream) {
      const tracks = this.state.stream.getTracks();
      tracks.forEach(track => track.stop());
      this.state.stream = null;
    }
  }
  
  /**
   * Capture photo from camera
   */
  _capturePhoto() {
    const videoElement = this.querySelector('#camera-preview');
    const canvasElement = this.querySelector('#camera-canvas');
    const capturedImage = this.querySelector('#captured-image');
    const capturedPreview = this.querySelector('#captured-preview');
    const cameraControls = this.querySelector('#camera-controls');
    
    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Draw video frame to canvas
    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Convert to image
    const imageDataUrl = canvasElement.toDataURL('image/png');
    
    // Update state and UI
    this.state.capturedImage = imageDataUrl;
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
    const videoElement = this.querySelector('#camera-preview');
    const capturedPreview = this.querySelector('#captured-preview');
    const cameraControls = this.querySelector('#camera-controls');
    
    // Reset state
    this.state.capturedImage = null;
    
    // Show video preview, hide captured preview
    videoElement.style.display = 'block';
    capturedPreview.style.display = 'none';
    cameraControls.style.display = 'flex';
  }
  
  /**
   * Use captured photo
   */
  _usePhoto() {
    // Close the camera modal
    this._closeCamera();
    
    // Trigger an event with the captured image
    const event = new CustomEvent('photoCaptured', {
      detail: {
        image: this.state.capturedImage
      },
      bubbles: true
    });
    
    this.dispatchEvent(event);
    
    // Reset the captured state
    this._resetCapturedState();
  }
  
  /**
   * Reset captured state
   */
  _resetCapturedState() {
    const videoElement = this.querySelector('#camera-preview');
    const capturedPreview = this.querySelector('#captured-preview');
    const cameraControls = this.querySelector('#camera-controls');
    
    if (videoElement && capturedPreview && cameraControls) {
      videoElement.style.display = 'block';
      capturedPreview.style.display = 'none';
      cameraControls.style.display = 'flex';
    }
    
    this.state.capturedImage = null;
  }
}

// Define the custom element
customElements.define('camera-capture', CameraCapture);
