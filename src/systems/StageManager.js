/**
 * StageManager - Handles stage-based progression and objectives
 */
export default class StageManager {
  constructor(scene, resourceManager, buildingManager, researchManager) {
    this.scene = scene;
    this.resourceManager = resourceManager;
    this.buildingManager = buildingManager;
    this.researchManager = researchManager;

    // Stage definitions (set from config)
    this.stageDefs = [];

    // Current stage (1-indexed for display)
    this.currentStage = 1;

    // Progress tracking for current objective
    this.progress = 0;

    // Whether current stage is complete
    this.stageComplete = false;

    // Tutorial hints shown
    this.hintsShown = new Set();

    // Events
    this.events = scene.events;

    // Listen for game events to track progress
    this.setupListeners();
  }

  /**
   * Set stage definitions from config
   */
  setStageDefinitions(defs) {
    this.stageDefs = defs;
  }

  /**
   * Setup event listeners for progress tracking
   */
  setupListeners() {
    // Building placed
    this.events.on('building-placed', (building) => {
      this.checkProgress('build', building.type);
    });

    // Resource harvested
    this.events.on('resource-harvested', (data) => {
      this.checkProgress('collect', data.type, data.amount);
    });

    // Item crafted
    this.events.on('item-crafted', (data) => {
      this.checkProgress('craft', data.output, data.amount);
    });

    // Research completed
    this.events.on('research-completed', (research) => {
      this.checkProgress('research', research.id);
    });

    // Resources changed (for total tracking)
    this.events.on('resources-changed', () => {
      this.checkResourceTotals();
    });
  }

  /**
   * Get current stage definition
   */
  getCurrentStage() {
    return this.stageDefs[this.currentStage - 1] || null;
  }

  /**
   * Check if an action contributes to current objective
   */
  checkProgress(actionType, targetId, amount = 1) {
    const stage = this.getCurrentStage();
    if (!stage || this.stageComplete) return;

    if (stage.targetType === actionType && stage.targetId === targetId) {
      this.progress += amount;
      this.events.emit('stage-progress', {
        stage: this.currentStage,
        progress: this.progress,
        target: stage.targetAmount
      });

      if (this.progress >= stage.targetAmount) {
        this.completeStage();
      }
    }

    // Special case: count-based objectives (like "have 5 harvesters")
    if (stage.targetType === 'have' && actionType === 'build') {
      const count = this.buildingManager.getCount(stage.targetId);
      this.progress = count;
      this.events.emit('stage-progress', {
        stage: this.currentStage,
        progress: this.progress,
        target: stage.targetAmount
      });

      if (this.progress >= stage.targetAmount) {
        this.completeStage();
      }
    }
  }

  /**
   * Check resource totals for collection objectives
   */
  checkResourceTotals() {
    const stage = this.getCurrentStage();
    if (!stage || this.stageComplete) return;

    if (stage.targetType === 'total') {
      const total = this.resourceManager.totalCollected[stage.targetId] || 0;
      this.progress = total;
      this.events.emit('stage-progress', {
        stage: this.currentStage,
        progress: this.progress,
        target: stage.targetAmount
      });

      if (this.progress >= stage.targetAmount) {
        this.completeStage();
      }
    }
  }

  /**
   * Complete current stage and advance
   */
  completeStage() {
    const stage = this.getCurrentStage();
    if (!stage) return;

    this.stageComplete = true;

    // Apply rewards (rewards are resource:amount pairs directly)
    if (stage.rewards) {
      for (const [resource, amount] of Object.entries(stage.rewards)) {
        this.resourceManager.add(resource, amount);
      }
    }

    this.events.emit('stage-complete', {
      stage: this.currentStage,
      name: stage.name,
      rewards: stage.rewards
    });

    // Auto-advance after delay
    this.scene.time.delayedCall(2000, () => {
      this.advanceStage();
    });
  }

  /**
   * Advance to next stage
   */
  advanceStage() {
    this.currentStage++;
    this.progress = 0;
    this.stageComplete = false;
    this.hintsShown.clear();

    const nextStage = this.getCurrentStage();

    this.events.emit('stage-started', {
      stage: this.currentStage,
      name: nextStage?.name || 'Open Play',
      objective: nextStage?.objective || 'Continue expanding your bot factory!'
    });

    // Show first tutorial hint if any
    if (nextStage?.tutorialHints?.length > 0) {
      this.showHint(0);
    }
  }

  /**
   * Show a tutorial hint
   */
  showHint(index) {
    const stage = this.getCurrentStage();
    if (!stage?.tutorialHints) return;

    const hint = stage.tutorialHints[index];
    if (!hint || this.hintsShown.has(index)) return;

    this.hintsShown.add(index);
    this.events.emit('show-hint', { text: hint, index });
  }

  /**
   * Get progress percentage for current stage
   */
  getProgressPercent() {
    const stage = this.getCurrentStage();
    if (!stage) return 100;

    return Math.min((this.progress / stage.targetAmount) * 100, 100);
  }

  /**
   * Check if in open play mode (past defined stages)
   */
  isOpenPlay() {
    return this.currentStage > this.stageDefs.length;
  }

  /**
   * Serialize for saving
   */
  serialize() {
    return {
      currentStage: this.currentStage,
      progress: this.progress,
      stageComplete: this.stageComplete,
      hintsShown: Array.from(this.hintsShown)
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data) {
    this.currentStage = data.currentStage || 1;
    this.progress = data.progress || 0;
    this.stageComplete = data.stageComplete || false;
    this.hintsShown = new Set(data.hintsShown || []);

    // Emit current stage info
    const stage = this.getCurrentStage();
    this.events.emit('stage-started', {
      stage: this.currentStage,
      name: stage?.name || 'Open Play',
      objective: stage?.objective || 'Continue expanding!'
    });
  }
}
