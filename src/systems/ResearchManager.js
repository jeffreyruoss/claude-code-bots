/**
 * ResearchManager - Handles tech tree and research unlocks
 */
export default class ResearchManager {
  constructor(scene, resourceManager) {
    this.scene = scene;
    this.resourceManager = resourceManager;

    // Research definitions (set from config)
    this.researchDefs = [];

    // Completed research IDs
    this.completed = new Set();

    // Currently researching (null if none)
    this.currentResearch = null;
    this.researchProgress = 0;

    // Events
    this.events = scene.events;
  }

  /**
   * Set research definitions from config
   */
  setResearchDefinitions(defs) {
    this.researchDefs = defs;
  }

  /**
   * Get all available research (prerequisites met, not completed)
   */
  getAvailable() {
    return this.researchDefs.filter(research => {
      // Already completed?
      if (this.completed.has(research.id)) {
        return false;
      }

      // Prerequisites met?
      if (research.requires && research.requires.length > 0) {
        for (const reqId of research.requires) {
          if (!this.completed.has(reqId)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Check if research can be started
   */
  canResearch(researchId) {
    const research = this.researchDefs.find(r => r.id === researchId);
    if (!research) return false;

    // Already completed?
    if (this.completed.has(researchId)) {
      return false;
    }

    // Prerequisites met?
    if (research.requires && research.requires.length > 0) {
      for (const reqId of research.requires) {
        if (!this.completed.has(reqId)) {
          return false;
        }
      }
    }

    // Can afford cost?
    const costAmount = research.cost.dataCores || research.cost;
    if (!this.resourceManager.has('dataCores', costAmount)) {
      return false;
    }

    return true;
  }

  /**
   * Start researching
   */
  startResearch(researchId) {
    if (!this.canResearch(researchId)) {
      return false;
    }

    const research = this.researchDefs.find(r => r.id === researchId);

    // Spend data cores
    const costAmount = research.cost.dataCores || research.cost;
    if (!this.resourceManager.remove('dataCores', costAmount)) {
      return false;
    }

    this.currentResearch = research;
    this.researchProgress = 0;

    this.events.emit('research-started', research);

    return true;
  }

  /**
   * Complete current research instantly (called when progress reaches 100%)
   */
  completeResearch() {
    if (!this.currentResearch) return;

    const research = this.currentResearch;
    this.completed.add(research.id);

    // Apply research effect
    this.applyEffect(research.effect);

    this.events.emit('research-completed', research);

    this.currentResearch = null;
    this.researchProgress = 0;
  }

  /**
   * Apply research effect
   */
  applyEffect(effect) {
    if (!effect) return;

    // Handle effect based on type property
    switch (effect.type) {
      case 'harvesterSpeed':
      case 'allBuildingsSpeed':
        this.events.emit('apply-speed-bonus', effect.bonus);
        break;

      case 'storageCapacity':
        this.resourceManager.increaseAllCapacity(effect.bonus);
        break;

      case 'unlockBuilding':
        this.events.emit('unlock-building', effect.buildingId);
        break;

      case 'unlockRecipe':
        this.events.emit('unlock-recipe', effect.recipeId);
        break;
    }
  }

  /**
   * Update research progress (called each tick when research terminal is active)
   */
  update(delta) {
    if (!this.currentResearch) return;

    // Research takes time based on research terminal count
    const terminals = this.scene.buildingManager?.getByType('researchTerminal') || [];
    const activeTerminals = terminals.filter(t => t.powered && t.active);

    if (activeTerminals.length === 0) return;

    // Each terminal contributes to research speed
    const researchSpeed = activeTerminals.length * 10; // 10% per second per terminal
    this.researchProgress += (delta / 1000) * researchSpeed;

    if (this.researchProgress >= 100) {
      this.completeResearch();
    }

    this.events.emit('research-progress', {
      research: this.currentResearch,
      progress: this.researchProgress
    });
  }

  /**
   * Check if a research is completed
   */
  isCompleted(researchId) {
    return this.completed.has(researchId);
  }

  /**
   * Get completed research count
   */
  getCompletedCount() {
    return this.completed.size;
  }

  /**
   * Serialize for saving
   */
  serialize() {
    return {
      completed: Array.from(this.completed),
      currentResearch: this.currentResearch?.id || null,
      researchProgress: this.researchProgress
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data) {
    this.completed = new Set(data.completed || []);

    if (data.currentResearch) {
      this.currentResearch = this.researchDefs.find(r => r.id === data.currentResearch);
      this.researchProgress = data.researchProgress || 0;

      // Re-apply all completed research effects
      for (const researchId of this.completed) {
        const research = this.researchDefs.find(r => r.id === researchId);
        if (research) {
          this.applyEffect(research.effect);
        }
      }
    }
  }
}
