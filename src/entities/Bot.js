/**
 * Bot - Visual representation of Claude-themed bots
 * Used for harvesters and animated elements
 */
export default class Bot {
  constructor(scene, x, y, type = 'worker') {
    this.scene = scene;
    this.worldX = x;
    this.worldY = y;
    this.type = type;
    this.id = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // State
    this.working = false;
    this.targetX = x;
    this.targetY = y;

    // Visual components
    this.sprite = null;
    this.eye = null;
    this.workingIndicator = null;

    this.createSprite();
  }

  createSprite() {
    // Bot body - rounded rectangle
    this.sprite = this.scene.add.image(this.worldX, this.worldY, 'bot');
    this.sprite.setScale(0.75); // Slightly smaller than tile

    // Pulsing animation when idle
    this.idleAnimation = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 0.78,
      scaleY: 0.72,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  setWorking(working) {
    this.working = working;

    if (working) {
      // Stop idle animation, start work animation
      if (this.idleAnimation) {
        this.idleAnimation.pause();
      }

      // Faster pulsing when working
      this.workAnimation = this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 0.8,
        scaleY: 0.7,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Add working particles
      this.startWorkParticles();
    } else {
      // Resume idle animation
      if (this.workAnimation) {
        this.workAnimation.stop();
      }
      if (this.idleAnimation) {
        this.idleAnimation.resume();
      }

      this.stopWorkParticles();
    }
  }

  startWorkParticles() {
    if (this.particles) return;

    // Create simple particle effect using circles
    this.particles = [];
    this.particleTimer = this.scene.time.addEvent({
      delay: 200,
      callback: () => this.emitParticle(),
      loop: true
    });
  }

  emitParticle() {
    const particle = this.scene.add.circle(
      this.worldX + (Math.random() - 0.5) * 20,
      this.worldY,
      3,
      0xd97757
    );

    this.scene.tweens.add({
      targets: particle,
      y: particle.y - 20,
      alpha: 0,
      scale: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => particle.destroy()
    });
  }

  stopWorkParticles() {
    if (this.particleTimer) {
      this.particleTimer.destroy();
      this.particleTimer = null;
    }
  }

  /**
   * Move bot to a target position
   */
  moveTo(x, y, duration = 500) {
    this.targetX = x;
    this.targetY = y;

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: x,
        y: y,
        duration: duration,
        ease: 'Power2',
        onComplete: () => {
          this.worldX = x;
          this.worldY = y;
          resolve();
        }
      });
    });
  }

  /**
   * Play harvest animation
   */
  playHarvestAnimation() {
    // Quick bob down and up
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.worldY + 5,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: resolve
      });
    });
  }

  /**
   * Set position immediately
   */
  setPosition(x, y) {
    this.worldX = x;
    this.worldY = y;
    if (this.sprite) {
      this.sprite.setPosition(x, y);
    }
  }

  /**
   * Set visibility
   */
  setVisible(visible) {
    if (this.sprite) {
      this.sprite.setVisible(visible);
    }
  }

  /**
   * Flash the bot (for feedback)
   */
  flash(color = 0xffffff) {
    if (this.sprite) {
      this.sprite.setTint(color);
      this.scene.time.delayedCall(100, () => {
        this.sprite.clearTint();
      });
    }
  }

  destroy() {
    this.stopWorkParticles();

    if (this.idleAnimation) {
      this.idleAnimation.stop();
    }
    if (this.workAnimation) {
      this.workAnimation.stop();
    }
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.eye) {
      this.eye.destroy();
    }
  }
}
