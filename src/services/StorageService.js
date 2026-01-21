/**
 * StorageService - Handles save/load functionality for Claude Code Bots
 *
 * Currently uses localStorage, but designed with an interface that can
 * easily be swapped to Supabase or another backend storage solution.
 *
 * State structure:
 * - resources: object with resource counts
 * - buildings: array of building objects (id, type, x, y, state)
 * - research: array of completed research ids
 * - currentStage: number
 * - stageProgress: object with current objective progress
 * - cameraPosition: {x, y, zoom}
 * - lastSaved: timestamp
 */

const STORAGE_KEY = 'claude-code-bots-save';

class StorageService {
  constructor() {
    this.storageKey = STORAGE_KEY;
  }

  /**
   * Load game state from storage
   * @returns {Promise<Object|null>} The saved game state, or null if no save exists
   */
  async loadGame() {
    try {
      const savedData = localStorage.getItem(this.storageKey);

      if (!savedData) {
        return null;
      }

      const state = JSON.parse(savedData);

      // Validate that the loaded data has expected structure
      if (!this._validateState(state)) {
        console.warn('StorageService: Loaded state failed validation, returning null');
        return null;
      }

      return state;
    } catch (error) {
      console.error('StorageService: Error loading game state:', error);
      return null;
    }
  }

  /**
   * Save game state to storage
   * @param {Object} state - The game state to save
   * @returns {Promise<boolean>} True if save was successful, false otherwise
   */
  async saveGame(state) {
    try {
      if (!state) {
        console.error('StorageService: Cannot save null or undefined state');
        return false;
      }

      // Add timestamp to state
      const stateToSave = {
        ...state,
        lastSaved: Date.now()
      };

      const serializedState = JSON.stringify(stateToSave);
      localStorage.setItem(this.storageKey, serializedState);

      return true;
    } catch (error) {
      console.error('StorageService: Error saving game state:', error);

      // Check for quota exceeded error
      if (error.name === 'QuotaExceededError' ||
          error.code === 22 ||
          error.code === 1014) {
        console.error('StorageService: localStorage quota exceeded');
      }

      return false;
    }
  }

  /**
   * Reset/delete saved game data
   * @returns {Promise<boolean>} True if reset was successful, false otherwise
   */
  async resetGame() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('StorageService: Error resetting game state:', error);
      return false;
    }
  }

  /**
   * Check if a saved game exists
   * @returns {Promise<boolean>} True if a save exists, false otherwise
   */
  async hasSavedGame() {
    try {
      return localStorage.getItem(this.storageKey) !== null;
    } catch (error) {
      console.error('StorageService: Error checking for saved game:', error);
      return false;
    }
  }

  /**
   * Get the timestamp of the last save
   * @returns {Promise<number|null>} Timestamp of last save, or null if no save exists
   */
  async getLastSaveTime() {
    try {
      const state = await this.loadGame();
      return state?.lastSaved || null;
    } catch (error) {
      console.error('StorageService: Error getting last save time:', error);
      return null;
    }
  }

  /**
   * Validate that a state object has the expected structure
   * @param {Object} state - The state to validate
   * @returns {boolean} True if state is valid, false otherwise
   * @private
   */
  _validateState(state) {
    if (!state || typeof state !== 'object') {
      return false;
    }

    // Check for required top-level properties
    const requiredProps = [
      'resources',
      'buildings',
      'research',
      'currentStage',
      'stageProgress',
      'cameraPosition'
    ];

    for (const prop of requiredProps) {
      if (!(prop in state)) {
        console.warn(`StorageService: Missing required property: ${prop}`);
        return false;
      }
    }

    // Validate types
    if (typeof state.resources !== 'object' || state.resources === null) {
      console.warn('StorageService: resources must be an object');
      return false;
    }

    if (!Array.isArray(state.buildings)) {
      console.warn('StorageService: buildings must be an array');
      return false;
    }

    if (!Array.isArray(state.research)) {
      console.warn('StorageService: research must be an array');
      return false;
    }

    if (typeof state.currentStage !== 'number') {
      console.warn('StorageService: currentStage must be a number');
      return false;
    }

    if (typeof state.stageProgress !== 'object' || state.stageProgress === null) {
      console.warn('StorageService: stageProgress must be an object');
      return false;
    }

    if (typeof state.cameraPosition !== 'object' || state.cameraPosition === null) {
      console.warn('StorageService: cameraPosition must be an object');
      return false;
    }

    // Validate cameraPosition structure
    if (typeof state.cameraPosition.x !== 'number' ||
        typeof state.cameraPosition.y !== 'number' ||
        typeof state.cameraPosition.zoom !== 'number') {
      console.warn('StorageService: cameraPosition must have x, y, and zoom as numbers');
      return false;
    }

    return true;
  }

  /**
   * Create a default/initial game state
   * Useful for starting a new game
   * @returns {Object} A fresh game state object
   */
  static createDefaultState() {
    return {
      resources: {},
      buildings: [],
      research: [],
      currentStage: 1,
      stageProgress: {},
      cameraPosition: { x: 0, y: 0, zoom: 1 },
      lastSaved: null
    };
  }
}

export default StorageService;
