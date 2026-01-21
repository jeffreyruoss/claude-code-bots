/**
 * ResourceNode - Harvestable resource deposits on the map
 */
export default class ResourceNode {
  constructor(scene, x, y, resourceType, initialAmount = 100) {
    this.scene = scene;
    this.gridX = x;
    this.gridY = y;
    this.resourceType = resourceType;
    this.id = `node_${resourceType}_${x}_${y}`;

    // Resource state
    this.amount = initialAmount;
    this.maxAmount = initialAmount;
    this.regenRate = this.getRegenRate();
    this.regenAccumulator = 0;

    // Visual state
    this.depleted = false;
    this.sprite = null;
    this.amountText = null;

    this.createSprite();
  }

  getRegenRate() {
    // Slow regeneration to prevent soft-lock
    switch (this.resourceType) {
      case 'scrap':
        return 0.5; // 0.5 per second
      case 'energy':
        return 0.3;
      case 'dataCores':
        return 0.1; // Very slow
      default:
        return 0;
    }
  }

  createSprite() {
    const tileSize = 64;
    const worldX = this.gridX * tileSize + tileSize / 2;
    const worldY = this.gridY * tileSize + tileSize / 2;

    // Main node sprite
    this.sprite = this.scene.add.image(worldX, worldY, `node_${this.resourceType}`);
    this.sprite.setInteractive();
    this.sprite.setData('node', this);

    // Amount indicator text
    this.amountText = this.scene.add.text(worldX, worldY + 24, this.amount.toString(), {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#141413',
      backgroundColor: '#faf9f5',
      padding: { x: 2, y: 1 }
    });
    this.amountText.setOrigin(0.5);

    this.updateVisual();
  }

  updateVisual() {
    if (!this.sprite) return;

    // Fade out as resource depletes
    const ratio = this.amount / this.maxAmount;
    this.sprite.setAlpha(0.3 + ratio * 0.7);

    // Update amount text
    if (this.amountText) {
      this.amountText.setText(Math.floor(this.amount).toString());
    }

    // Mark as depleted if empty
    this.depleted = this.amount <= 0;

    if (this.depleted) {
      this.sprite.setTint(0x666666);
    } else {
      this.sprite.clearTint();
    }
  }

  /**
   * Harvest resources from this node
   * @param {number} amount - Amount to harvest
   * @returns {number} - Actual amount harvested
   */
  harvest(amount = 1) {
    if (this.depleted) return 0;

    const harvested = Math.min(amount, this.amount);
    this.amount -= harvested;
    this.updateVisual();

    // Show floating text
    this.showHarvestFeedback(harvested);

    return harvested;
  }

  showHarvestFeedback(amount) {
    const tileSize = 64;
    const worldX = this.gridX * tileSize + tileSize / 2;
    const worldY = this.gridY * tileSize;

    const text = this.scene.add.text(worldX, worldY, `+${amount}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#d97757',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    // Animate floating up and fading
    this.scene.tweens.add({
      targets: text,
      y: worldY - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  /**
   * Update regeneration
   * @param {number} delta - Time elapsed in ms
   */
  update(delta) {
    if (this.amount >= this.maxAmount) return;
    if (this.regenRate <= 0) return;

    this.regenAccumulator += delta / 1000; // Convert to seconds

    if (this.regenAccumulator >= 1) {
      const regenAmount = this.regenRate * Math.floor(this.regenAccumulator);
      this.amount = Math.min(this.maxAmount, this.amount + regenAmount);
      this.regenAccumulator = this.regenAccumulator % 1;
      this.updateVisual();
    }
  }

  /**
   * Check if a harvester can work on this node
   */
  canHarvest() {
    return !this.depleted && this.amount > 0;
  }

  select() {
    if (this.sprite && !this.depleted) {
      this.sprite.setTint(0xd97757);
    }
  }

  deselect() {
    if (this.sprite && !this.depleted) {
      this.sprite.clearTint();
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.amountText) {
      this.amountText.destroy();
    }
  }

  /**
   * Serialize node state for saving
   */
  serialize() {
    return {
      id: this.id,
      resourceType: this.resourceType,
      gridX: this.gridX,
      gridY: this.gridY,
      amount: this.amount,
      maxAmount: this.maxAmount
    };
  }

  /**
   * Restore node state from saved data
   */
  deserialize(data) {
    this.amount = data.amount;
    this.maxAmount = data.maxAmount;
    this.updateVisual();
  }
}
