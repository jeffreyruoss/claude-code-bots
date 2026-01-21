/**
 * Building - Base class for all placeable buildings
 */
export default class Building {
  constructor(scene, x, y, buildingType, config) {
    this.scene = scene;
    this.gridX = x;
    this.gridY = y;
    this.type = buildingType;
    this.config = config;
    this.id = `${buildingType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // State
    this.powered = false;
    this.active = false;
    this.blocked = false;
    this.efficiency = 1.0;
    this.productionProgress = 0;

    // Currently assigned recipe (for assemblers)
    this.currentRecipe = null;

    // Create sprite
    this.sprite = null;
    this.statusIndicator = null;

    this.createSprite();
  }

  createSprite() {
    const tileSize = 64;
    const worldX = this.gridX * tileSize + tileSize / 2;
    const worldY = this.gridY * tileSize + tileSize / 2;

    // Main building sprite
    this.sprite = this.scene.add.image(worldX, worldY, this.type);
    this.sprite.setInteractive();
    this.sprite.setData('building', this);

    // Status indicator (small circle in corner)
    this.statusIndicator = this.scene.add.circle(
      worldX + tileSize / 2 - 10,
      worldY - tileSize / 2 + 10,
      6,
      0x4ade80 // Green by default
    );
    this.statusIndicator.setStrokeStyle(2, 0x141413);

    this.updateStatusIndicator();
  }

  updateStatusIndicator() {
    if (!this.statusIndicator) return;

    if (!this.powered) {
      this.statusIndicator.setFillStyle(0xef4444); // Red - no power
    } else if (this.blocked) {
      this.statusIndicator.setFillStyle(0xfacc15); // Yellow - blocked
    } else if (this.active) {
      this.statusIndicator.setFillStyle(0x4ade80); // Green - running
    } else {
      this.statusIndicator.setFillStyle(0x9ca3af); // Gray - idle
    }
  }

  setPowered(powered) {
    this.powered = powered;
    this.updateStatusIndicator();
  }

  setActive(active) {
    this.active = active;
    this.updateStatusIndicator();
  }

  setBlocked(blocked) {
    this.blocked = blocked;
    this.updateStatusIndicator();
  }

  setRecipe(recipe) {
    this.currentRecipe = recipe;
    this.productionProgress = 0;
  }

  /**
   * Update production progress
   * @param {number} delta - Time elapsed in ms
   * @returns {boolean} - True if production cycle completed
   */
  updateProduction(delta) {
    if (!this.powered || !this.active || this.blocked) {
      return false;
    }

    const productionTime = this.currentRecipe?.productionTime || this.config.productionTime || 1000;
    this.productionProgress += delta * this.efficiency;

    if (this.productionProgress >= productionTime) {
      this.productionProgress = 0;
      return true;
    }

    return false;
  }

  getProductionPercent() {
    const productionTime = this.currentRecipe?.productionTime || this.config.productionTime || 1000;
    return Math.min(this.productionProgress / productionTime, 1);
  }

  select() {
    if (this.sprite) {
      this.sprite.setTint(0xd97757);
    }
  }

  deselect() {
    if (this.sprite) {
      this.sprite.clearTint();
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.statusIndicator) {
      this.statusIndicator.destroy();
    }
  }

  /**
   * Serialize building state for saving
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      gridX: this.gridX,
      gridY: this.gridY,
      currentRecipe: this.currentRecipe?.id || null,
      productionProgress: this.productionProgress,
      efficiency: this.efficiency
    };
  }

  /**
   * Restore building state from saved data
   */
  deserialize(data) {
    this.productionProgress = data.productionProgress || 0;
    this.efficiency = data.efficiency || 1.0;
    // Recipe will be set by the system after loading
  }
}
