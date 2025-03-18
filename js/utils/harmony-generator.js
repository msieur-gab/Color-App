/**
 * Color harmony generation utility
 * Generates color palettes based on different harmony rules
 */
class HarmonyGenerator {
  /**
   * Generate a color palette based on a harmony type
   * @param {string} baseColor - Base hex color
   * @param {string} harmonyType - Type of harmony to generate
   * @param {number} colorCount - Number of colors to generate (default: 5)
   * @returns {Array} Array of hex color strings
   */
  static generatePalette(baseColor, harmonyType, colorCount = 5) {
    // Ensure hex is formatted correctly
    baseColor = ColorConverter.formatHex(baseColor);
    
    // Get HSL values of the base color
    const hsl = ColorConverter.hexToHSL(baseColor);
    
    // Generate the appropriate palette based on harmony type
    let palette;
    switch (harmonyType) {
      case 'analogous':
        palette = this.generateAnalogous(baseColor, hsl, colorCount);
        break;
      case 'monochromatic':
        palette = this.generateMonochromatic(baseColor, hsl, colorCount);
        break;
      case 'complementary':
        palette = this.generateComplementary(baseColor, hsl, colorCount);
        break;
      case 'splitComplementary':
        palette = this.generateSplitComplementary(baseColor, hsl, colorCount);
        break;
      case 'compound':
        palette = this.generateCompound(baseColor, hsl, colorCount);
        break;
      case 'triadic':
        palette = this.generateTriadic(baseColor, hsl, colorCount);
        break;
      case 'square':
        palette = this.generateSquare(baseColor, hsl, colorCount);
        break;
      case 'shades':
        palette = this.generateShades(baseColor, hsl, colorCount);
        break;
      default:
        palette = Array(colorCount).fill(baseColor);
    }
    
    // Ensure we return exactly the requested number of colors
    if (palette.length < colorCount) {
      // If we need more colors, duplicate the last one
      while (palette.length < colorCount) {
        palette.push(palette[palette.length - 1]);
      }
    } else if (palette.length > colorCount) {
      // If we have too many colors, trim the array
      palette = palette.slice(0, colorCount);
    }
    
    return palette;
  }
  
  /**
   * Generate analogous color scheme
   * Colors adjacent to each other on the color wheel
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateAnalogous(baseColor, hsl, colorCount = 5) {
    const colors = [];
    
    // Calculate the angle spread for even distribution
    // For 5 colors, we want -60°, -30°, 0°, +30°, +60° (span of 120°)
    // For other counts, we'll maintain a 120° span centered on the base hue
    const angleSpan = 120;
    const step = angleSpan / (colorCount - 1);
    
    // Find the starting angle to keep base color in the middle
    const startAngle = hsl.h - (angleSpan / 2);
    
    for (let i = 0; i < colorCount; i++) {
      // For the center color, use the exact base color
      if (i === Math.floor(colorCount / 2) && colorCount % 2 !== 0) {
        colors.push(baseColor);
      } else {
        const angle = (startAngle + (step * i) + 360) % 360;
        colors.push(ColorConverter.hslToHex(angle, hsl.s, hsl.l));
      }
    }
    
    return colors;
  }
  
  /**
   * Generate monochromatic color scheme
   * Different shades and saturations of the same color
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateMonochromatic(baseColor, hsl, colorCount = 5) {
    const colors = [];
    
    // We'll vary both lightness and saturation
    // For odd counts, keep base color in the middle
    const isOdd = colorCount % 2 !== 0;
    const middleIndex = Math.floor(colorCount / 2);
    
    for (let i = 0; i < colorCount; i++) {
      if (isOdd && i === middleIndex) {
        // Use exact base color for the middle position in odd-numbered palettes
        colors.push(baseColor);
      } else {
        // Determine if we're in the first or second half
        const firstHalf = isOdd ? i < middleIndex : i <= middleIndex;
        
        if (firstHalf) {
          // First half: Vary lightness (darker)
          const lAdjust = isOdd 
            ? 30 * (middleIndex - i) / middleIndex
            : 30 * (middleIndex - i + 0.5) / (middleIndex + 0.5);
          
          colors.push(ColorConverter.hslToHex(
            hsl.h, 
            hsl.s, 
            Math.max(hsl.l - lAdjust, 5)
          ));
        } else {
          // Second half: Vary saturation
          const sAdjust = isOdd
            ? 25 * (i - middleIndex) / (colorCount - middleIndex - 1)
            : 25 * (i - middleIndex) / (colorCount - middleIndex - 0.5);
          
          colors.push(ColorConverter.hslToHex(
            hsl.h, 
            Math.min(hsl.s + sAdjust, 100), 
            hsl.l
          ));
        }
      }
    }
    
    return colors;
  }
  
  /**
   * Generate complementary color scheme
   * Colors opposite each other on the color wheel
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateComplementary(baseColor, hsl, colorCount = 5) {
    const colors = [];
    const complementHue = (hsl.h + 180) % 360;
    
    // For odd numbers, we want middle color to be the base color
    // For even numbers, we want half base colors, half complement colors
    if (colorCount % 2 !== 0) {
      // Odd count - base color in the middle
      const halfCount = Math.floor(colorCount / 2);
      
      // Add variations of original color
      for (let i = 0; i < halfCount; i++) {
        const lAdjust = 30 * (halfCount - i) / halfCount;
        colors.push(ColorConverter.hslToHex(
          hsl.h, 
          hsl.s, 
          Math.max(hsl.l - lAdjust, 5)
        ));
      }
      
      // Add base color
      colors.push(baseColor);
      
      // Add variations of complement
      for (let i = 0; i < halfCount; i++) {
        const lAdjust = 30 * (i + 1) / halfCount;
        colors.push(ColorConverter.hslToHex(
          complementHue, 
          hsl.s, 
          Math.min(hsl.l + lAdjust, 95)
        ));
      }
    } else {
      // Even count - half base colors, half complement colors
      const halfCount = colorCount / 2;
      
      // Add variations of original color
      for (let i = 0; i < halfCount; i++) {
        if (i === 0) {
          colors.push(baseColor); // Exact base color
        } else {
          const lAdjust = 25 * i / (halfCount - 1);
          colors.push(ColorConverter.hslToHex(
            hsl.h, 
            hsl.s, 
            Math.min(hsl.l + lAdjust, 95)
          ));
        }
      }
      
      // Add variations of complement color
      for (let i = 0; i < halfCount; i++) {
        if (i === 0) {
          colors.push(ColorConverter.hslToHex(complementHue, hsl.s, hsl.l)); // Exact complement
        } else {
          const lAdjust = 25 * i / (halfCount - 1);
          colors.push(ColorConverter.hslToHex(
            complementHue, 
            hsl.s, 
            Math.max(hsl.l - lAdjust, 5)
          ));
        }
      }
    }
    
    return colors;
  }

  /**
   * Generate split complementary color scheme
   * Base color plus two colors adjacent to its complement
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateSplitComplementary(baseColor, hsl, colorCount = 5) {
    const colors = [];
    
    // The three main split complementary colors
    const complementHue = (hsl.h + 180) % 360;
    const splitAngle = 30; // 30° offset from complement
    
    const mainColors = [
      baseColor, // Original color
      ColorConverter.hslToHex((complementHue + splitAngle) % 360, hsl.s, hsl.l), // Split 1
      ColorConverter.hslToHex((complementHue - splitAngle + 360) % 360, hsl.s, hsl.l) // Split 2
    ];
    
    if (colorCount <= 3) {
      // If we need 3 or fewer colors, just return the main colors
      return mainColors.slice(0, colorCount);
    } else {
      // For more than 3 colors, add variations of the main colors
      colors.push(...mainColors);
      
      // We need (colorCount - 3) more colors
      const remaining = colorCount - 3;
      
      // Add variations of each of the three primary colors
      for (let i = 0; i < remaining; i++) {
        const colorIndex = i % 3; // Cycle through the 3 main colors
        const isLighter = Math.floor(i / 3) % 2 === 0; // Alternate lighter/darker
        
        let baseHue;
        if (colorIndex === 0) {
          baseHue = hsl.h;
        } else if (colorIndex === 1) {
          baseHue = (complementHue + splitAngle) % 360;
        } else {
          baseHue = (complementHue - splitAngle + 360) % 360;
        }
        
        if (isLighter) {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            Math.min(hsl.s + 10, 100), 
            Math.min(hsl.l + 15, 95)
          ));
        } else {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            Math.max(hsl.s - 10, 0), 
            Math.max(hsl.l - 15, 5)
          ));
        }
      }
    }
    
    return colors;
  }

  /**
   * Generate compound color scheme (also known as complementary plus analogous)
   * Combines complementary with analogous colors
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateCompound(baseColor, hsl, colorCount = 5) {
    const colors = [];
    
    // Complementary hue
    const complementHue = (hsl.h + 180) % 360;
    
    // Main colors in the compound scheme
    // 1. Base color
    // 2. Analogous +30°
    // 3. Analogous -30°
    // 4. Complement
    // 5. Complement analogous +30°
    const mainColors = [
      baseColor, // Original color
      ColorConverter.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l), // Analogous +30°
      ColorConverter.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l), // Analogous -30°
      ColorConverter.hslToHex(complementHue, hsl.s, hsl.l), // Complement
      ColorConverter.hslToHex((complementHue + 30) % 360, hsl.s, hsl.l) // Complement analogous +30°
    ];
    
    if (colorCount <= 5) {
      // If we need 5 or fewer colors, just return the main colors
      return mainColors.slice(0, colorCount);
    } else {
      // For more than 5 colors, add variations of the main colors
      colors.push(...mainColors);
      
      // We need (colorCount - 5) more colors
      const remaining = colorCount - 5;
      
      // Add lighter and darker versions of base color and complement
      for (let i = 0; i < remaining; i++) {
        // Alternate between base side and complement side
        const baseHue = i % 2 === 0 ? hsl.h : complementHue;
        const isLighter = Math.floor(i / 2) % 2 === 0; // Alternate lighter/darker
        
        if (isLighter) {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            Math.min(hsl.s + 10, 100), 
            Math.min(hsl.l + 15, 95)
          ));
        } else {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            Math.max(hsl.s - 10, 0), 
            Math.max(hsl.l - 15, 5)
          ));
        }
      }
    }
    
    return colors;
  }
  
  /**
   * Generate triadic color scheme
   * Three colors evenly spaced around the color wheel
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateTriadic(baseColor, hsl, colorCount = 5) {
    const colors = [];
    
    // The three main triadic colors
    const mainColors = [
      baseColor, // Original color
      ColorConverter.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l), // +120°
      ColorConverter.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)  // +240°
    ];
    
    if (colorCount <= 3) {
      // If we need 3 or fewer colors, just return the main triadic colors
      return mainColors.slice(0, colorCount);
    } else {
      // For more than 3 colors, add variations of the main colors
      colors.push(...mainColors);
      
      // We need (colorCount - 3) more colors
      const remaining = colorCount - 3;
      
      // Add lighter and darker versions of base color
      for (let i = 0; i < remaining; i++) {
        const colorIndex = i % 3; // Cycle through the 3 main colors
        const isLighter = Math.floor(i / 3) % 2 === 0; // Alternate lighter/darker
        
        const baseHue = colorIndex === 0 ? hsl.h : 
                         colorIndex === 1 ? (hsl.h + 120) % 360 : 
                         (hsl.h + 240) % 360;
        
        if (isLighter) {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            hsl.s, 
            Math.min(hsl.l + 20, 95)
          ));
        } else {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            hsl.s, 
            Math.max(hsl.l - 20, 5)
          ));
        }
      }
    }
    
    return colors;
  }
  
  /**
   * Generate square color scheme
   * Four colors evenly spaced around the color wheel
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateSquare(baseColor, hsl, colorCount = 5) {
    const colors = [];
    
    // The four main square colors
    const mainColors = [
      baseColor, // Original color
      ColorConverter.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),  // +90°
      ColorConverter.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), // +180°
      ColorConverter.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)  // +270°
    ];
    
    if (colorCount <= 4) {
      // If we need 4 or fewer colors, just return the main square colors
      return mainColors.slice(0, colorCount);
    } else {
      // For more than 4 colors, add variations of the main colors
      colors.push(...mainColors);
      
      // We need (colorCount - 4) more colors
      const remaining = colorCount - 4;
      
      // Add lighter and darker versions of base color
      for (let i = 0; i < remaining; i++) {
        const colorIndex = i % 4; // Cycle through the 4 main colors
        const isLighter = Math.floor(i / 4) % 2 === 0; // Alternate lighter/darker
        
        const baseHue = colorIndex === 0 ? hsl.h : 
                         colorIndex === 1 ? (hsl.h + 90) % 360 : 
                         colorIndex === 2 ? (hsl.h + 180) % 360 : 
                         (hsl.h + 270) % 360;
        
        if (isLighter) {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            hsl.s, 
            Math.min(hsl.l + 20, 95)
          ));
        } else {
          colors.push(ColorConverter.hslToHex(
            baseHue, 
            hsl.s, 
            Math.max(hsl.l - 20, 5)
          ));
        }
      }
    }
    
    return colors;
  }
  
  /**
   * Generate shades color scheme
   * Different lightness values of the same color
   * @param {string} baseColor - Base hex color
   * @param {Object} hsl - HSL values of base color
   * @param {number} colorCount - Number of colors to generate
   * @returns {Array} Array of hex color strings
   */
  static generateShades(baseColor, hsl, colorCount = 5) {
    const colors = [];
    
    // Create a gradient of lightness values
    for (let i = 0; i < colorCount; i++) {
      // For even distribution between light and dark
      const lightness = 5 + (90 * i / (colorCount - 1));
      
      // If this matches the base color lightness exactly, use the actual base color
      if (Math.abs(lightness - hsl.l) < 2) {
        colors.push(baseColor);
      } else {
        colors.push(ColorConverter.hslToHex(hsl.h, hsl.s, lightness));
      }
    }
    
    return colors;
  }
  
  /**
   * Get a human-readable name for a harmony type
   * @param {string} harmonyType - The harmony type key
   * @returns {string} Human readable name
   */
  static getHarmonyName(harmonyType) {
    const names = {
      'analogous': 'Analogous',
      'monochromatic': 'Monochromatic',
      'complementary': 'Complementary',
      'splitComplementary': 'Split Complementary',
      'compound': 'Compound',
      'triadic': 'Triadic',
      'square': 'Square',
      'shades': 'Shades'
    };
    
    return names[harmonyType] || harmonyType;
  }
  
  /**
   * Get available harmony types
   * @returns {Array} Array of harmony type objects with id and name
   */
  static getHarmonyTypes() {
    return [
      { id: 'analogous', name: 'Analogous' },
      { id: 'monochromatic', name: 'Monochromatic' },
      { id: 'complementary', name: 'Complementary' },
      { id: 'splitComplementary', name: 'Split Complementary' },
      { id: 'compound', name: 'Compound' },
      { id: 'triadic', name: 'Triadic' },
      { id: 'square', name: 'Square' },
      { id: 'shades', name: 'Shades' }
    ];
  }
}