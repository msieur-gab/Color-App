/**
 * Storage service for color palettes using Dexie.js
 */
class PaletteStorageService {
  constructor() {
    this.db = new Dexie('ColorPaletteDB');
    
    // Define database schema
    this.db.version(1).stores({
      palettes: '++id, baseColor, harmonyType, dateCreated'
    });
    
    // Events
    this.events = {
      onPaletteAdded: [],
      onPaletteRemoved: [],
      onPalettesChanged: []
    };
  }
  
  /**
   * Add event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName].push(callback);
    }
  }
  
  /**
   * Trigger event
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  triggerEvent(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  }
  
  /**
   * Save a palette to storage
   * @param {Object} palette - Palette object
   * @returns {Promise} Promise resolving to the ID of the saved palette
   */
  async savePalette(palette) {
    // Ensure dateCreated is set
    if (!palette.dateCreated) {
      palette.dateCreated = new Date();
    }
    
    // Set default name if not provided
    if (!palette.name) {
      const count = await this.getPaletteCount();
      palette.name = `Palette ${count + 1}`;
    }
    
    // Save to database
    const id = await this.db.palettes.add(palette);
    
    // Trigger events
    this.triggerEvent('onPaletteAdded', palette);
    this.triggerEvent('onPalettesChanged');
    
    return id;
  }
  
  /**
   * Update a palette
   * @param {Object} palette - Palette object with id
   * @returns {Promise} Promise resolving when update is complete
   */
  async updatePalette(palette) {
    if (!palette.id) {
      throw new Error('Palette ID is required for update');
    }
    
    // Update the palette
    await this.db.palettes.update(palette.id, palette);
    
    // Trigger events
    this.triggerEvent('onPalettesChanged');
    
    return palette.id;
  }
  
  /**
   * Get all palettes
   * @returns {Promise} Promise resolving to an array of palettes
   */
  async getAllPalettes() {
    return await this.db.palettes.toArray();
  }
  
  /**
   * Get palette by ID
   * @param {number} id - Palette ID
   * @returns {Promise} Promise resolving to a palette
   */
  async getPaletteById(id) {
    return await this.db.palettes.get(id);
  }
  
  /**
   * Delete a palette
   * @param {number} id - Palette ID
   * @returns {Promise} Promise resolving when deletion is complete
   */
  async deletePalette(id) {
    await this.db.palettes.delete(id);
    
    // Trigger events
    this.triggerEvent('onPaletteRemoved', id);
    this.triggerEvent('onPalettesChanged');
  }
  
  /**
   * Clear all palettes
   * @returns {Promise} Promise resolving when deletion is complete
   */
  async clearAllPalettes() {
    await this.db.palettes.clear();
    
    // Trigger events
    this.triggerEvent('onPalettesChanged');
  }
  
  /**
   * Get count of saved palettes
   * @returns {Promise} Promise resolving to the count
   */
  async getPaletteCount() {
    return await this.db.palettes.count();
  }
  
  /**
   * Check if database has any palettes
   * @returns {Promise} Promise resolving to boolean
   */
  async hasPalettes() {
    const count = await this.getPaletteCount();
    return count > 0;
  }
}

// Create a single instance
window.paletteStorage = new PaletteStorageService();
