/**
 * Image Color Extractor Utility
 * Handles extracting dominant colors from uploaded images
 */
class ImageColorExtractor {
  /**
   * Extract dominant color from an image
   * @param {File|HTMLImageElement|String} source - Image source (File, HTMLImageElement, or URL)
   * @returns {Promise<string>} Promise resolving to hex color string
   */
  static async extractDominantColor(source) {
    const imageData = await this._getImageData(source);
    const dominantColor = this._findDominantColor(imageData);
    return dominantColor;
  }
  
  /**
   * Extract a color palette from an image
   * @param {File|HTMLImageElement|String} source - Image source (File, HTMLImageElement, or URL)
   * @param {number} colorCount - Number of colors to extract (default: 5)
   * @returns {Promise<Array<string>>} Promise resolving to array of hex color strings
   */
  static async extractPalette(source, colorCount = 5) {
    const imageData = await this._getImageData(source);
    const colors = this._findColorPalette(imageData, colorCount);
    return colors;
  }
  
  /**
   * Get image data from various sources
   * @param {File|HTMLImageElement|String} source - Image source
   * @returns {Promise<ImageData>} Promise resolving to image data
   * @private
   */
  static async _getImageData(source) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
          // Limit size for performance
          const MAX_SIZE = 500;
          let width = img.width;
          let height = img.height;
          
          // Scale down large images for better performance
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round(height * (MAX_SIZE / width));
              width = MAX_SIZE;
            } else {
              width = Math.round(width * (MAX_SIZE / height));
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, width, height);
          resolve(imageData);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Set image source
        if (source instanceof File) {
          img.src = URL.createObjectURL(source);
        } else if (source instanceof HTMLImageElement) {
          img.src = source.src;
        } else if (typeof source === 'string') {
          img.src = source;
        } else {
          reject(new Error('Invalid image source'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Find the dominant color in image data
   * @param {ImageData} imageData - Image data
   * @returns {string} Hex color string
   * @private
   */
  static _findDominantColor(imageData) {
    const data = imageData.data;
    const colorMap = {};
    const step = 4; // Skip some pixels for performance
    
    // Count color occurrences
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Round color values to reduce unique colors (color quantization)
      const roundTo = 8;
      const roundedR = Math.round(r / roundTo) * roundTo;
      const roundedG = Math.round(g / roundTo) * roundTo;
      const roundedB = Math.round(b / roundTo) * roundTo;
      
      const color = `${roundedR},${roundedG},${roundedB}`;
      
      if (colorMap[color]) {
        colorMap[color].count++;
      } else {
        colorMap[color] = {
          count: 1,
          color: [roundedR, roundedG, roundedB]
        };
      }
    }
    
    // Find the most common color
    let maxCount = 0;
    let dominantColor = [0, 0, 0];
    
    for (const color in colorMap) {
      if (colorMap[color].count > maxCount) {
        maxCount = colorMap[color].count;
        dominantColor = colorMap[color].color;
      }
    }
    
    // Convert to hex
    return this._rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
  }
  
  /**
   * Find a color palette in image data
   * @param {ImageData} imageData - Image data
   * @param {number} colorCount - Number of colors to extract
   * @returns {Array<string>} Array of hex color strings
   * @private
   */
  static _findColorPalette(imageData, colorCount) {
    const data = imageData.data;
    const colorMap = {};
    const step = 5; // Skip some pixels for performance
    
    // Count color occurrences with quantization
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Round color values to reduce unique colors (color quantization)
      const roundTo = 8;
      const roundedR = Math.round(r / roundTo) * roundTo;
      const roundedG = Math.round(g / roundTo) * roundTo;
      const roundedB = Math.round(b / roundTo) * roundTo;
      
      const color = `${roundedR},${roundedG},${roundedB}`;
      
      if (colorMap[color]) {
        colorMap[color].count++;
      } else {
        colorMap[color] = {
          count: 1,
          color: [roundedR, roundedG, roundedB]
        };
      }
    }
    
    // Get the most common colors
    const colors = Object.values(colorMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, colorCount * 2); // Get more colors than needed for filtering
    
    // Filter similar colors
    const filteredColors = this._filterSimilarColors(colors, colorCount);
    
    // Convert to hex
    return filteredColors.map(color => 
      this._rgbToHex(color.color[0], color.color[1], color.color[2])
    );
  }
  
  /**
   * Filter similar colors to get a diverse palette
   * @param {Array} colors - Array of color objects
   * @param {number} maxColors - Maximum number of colors to return
   * @returns {Array} Filtered array of color objects
   * @private
   */
  static _filterSimilarColors(colors, maxColors) {
    const result = [];
    const minDistance = 40; // Minimum distance between colors
    
    for (const color of colors) {
      if (result.length >= maxColors) break;
      
      // Check if this color is too similar to any already selected color
      let tooSimilar = false;
      
      for (const selectedColor of result) {
        const distance = this._colorDistance(color.color, selectedColor.color);
        if (distance < minDistance) {
          tooSimilar = true;
          break;
        }
      }
      
      if (!tooSimilar) {
        result.push(color);
      }
    }
    
    // If we don't have enough colors, lower the threshold and try again
    if (result.length < maxColors && colors.length > maxColors) {
      return this._filterSimilarColors(colors, maxColors, minDistance * 0.8);
    }
    
    return result;
  }
  
  /**
   * Calculate distance between two colors in RGB space
   * @param {Array} rgb1 - First RGB color
   * @param {Array} rgb2 - Second RGB color
   * @returns {number} Color distance
   * @private
   */
  static _colorDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }
  
  /**
   * Convert RGB to Hex
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {string} Hex color string
   * @private
   */
  static _rgbToHex(r, g, b) {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    return '#' + 
      ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1);
  }
}

// Make it available globally
window.ImageColorExtractor = ImageColorExtractor;