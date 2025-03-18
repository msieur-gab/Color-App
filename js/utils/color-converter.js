/**
 * Utility functions for color conversions
 */
class ColorConverter {
  /**
   * Convert HEX color to HSL
   * @param {string} hex - Hex color code (with or without #)
   * @returns {Object} HSL color object with h, s, and l properties
   */
  static hexToHSL(hex) {
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find the min and max values to calculate the lightness
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      
      h /= 6;
    }
    
    // Convert to degrees and percentages
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { h, s, l };
  }
  
  /**
   * Convert HSL color to HEX
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {string} Hex color code with #
   */
  static hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    // Convert to hex
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  /**
   * Determine if a color is light or dark
   * @param {string} hexColor - Hex color code with #
   * @returns {boolean} True if color is light, false if dark
   */
  static isColorLight(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate perceived brightness using the formula
    // (0.299*R + 0.587*G + 0.114*B)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // If brightness is greater than 128, color is light
    return brightness > 128;
  }
  
  /**
   * Get contrasting text color (black or white) based on background color
   * @param {string} hexColor - Hex color code with #
   * @returns {string} Black (#000000) or white (#ffffff)
   */
  static getContrastColor(hexColor) {
    return this.isColorLight(hexColor) ? '#000000' : '#ffffff';
  }
  
  /**
   * Validate a hex color
   * @param {string} hex - Hex color string to validate
   * @returns {boolean} True if valid hex color
   */
  static isValidHex(hex) {
    // Accept both 3-digit and 6-digit hex with or without #
    return /^#?([0-9A-F]{3}){1,2}$/i.test(hex);
  }
  
  /**
   * Ensure hex color has # and is 6 digits
   * @param {string} hex - Hex color to format
   * @returns {string} Formatted hex color
   */
  static formatHex(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    return `#${hex.toLowerCase()}`;
  }
}

// Make it available globally
window.ColorConverter = ColorConverter;
