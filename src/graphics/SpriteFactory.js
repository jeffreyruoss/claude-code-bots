/**
 * SpriteFactory - Procedural graphics generation for Claude Code Bots
 * Generates all game textures using Phaser's Graphics API
 */

// Color palette
const COLORS = {
  PRIMARY: 0xd97757,      // orange/rust
  SECONDARY: 0xda7756,
  BACKGROUND: 0xfaf9f5,
  GRID: 0xeeece2,
  TEXT: 0x141413,
  // Status colors
  GREEN: 0x4ade80,
  RED: 0xef4444,
  YELLOW: 0xfacc15,
  // Additional colors for resources
  GRAY_DARK: 0x4a4a4a,
  GRAY_MED: 0x6b6b6b,
  GRAY_LIGHT: 0x9a9a9a,
  BLUE: 0x3b82f6,
  PURPLE: 0x8b5cf6,
  CYAN: 0x22d3ee,
  WHITE: 0xffffff,
  BLACK: 0x000000
};

export default class SpriteFactory {
  /**
   * Create a bot texture with rounded rectangle body and circular "eye" (Claude logo style)
   * @param {Phaser.Scene} scene - The scene to create the texture in
   * @param {string} key - The texture key to use
   * @param {number} size - The size of the bot (width and height)
   */
  static createBotTexture(scene, key, size = 48) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    const padding = 4;
    const bodyWidth = size - padding * 2;
    const bodyHeight = size - padding * 2;
    const cornerRadius = 8;

    // Draw body (rounded rectangle) - darker background
    graphics.fillStyle(COLORS.TEXT, 1);
    graphics.fillRoundedRect(padding, padding, bodyWidth, bodyHeight, cornerRadius);

    // Draw inner body highlight
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillRoundedRect(padding + 2, padding + 2, bodyWidth - 4, bodyHeight - 4, cornerRadius - 2);

    // Draw the "eye" - circular orange element (Claude logo style)
    const eyeRadius = size * 0.18;
    const eyeCenterX = size / 2;
    const eyeCenterY = size / 2 - 2;

    // Outer glow
    graphics.fillStyle(COLORS.PRIMARY, 0.3);
    graphics.fillCircle(eyeCenterX, eyeCenterY, eyeRadius + 4);

    // Main eye
    graphics.fillStyle(COLORS.PRIMARY, 1);
    graphics.fillCircle(eyeCenterX, eyeCenterY, eyeRadius);

    // Inner highlight
    graphics.fillStyle(COLORS.SECONDARY, 1);
    graphics.fillCircle(eyeCenterX - 2, eyeCenterY - 2, eyeRadius * 0.4);

    // Small antenna/sensor on top
    graphics.fillStyle(COLORS.PRIMARY, 1);
    graphics.fillRect(size / 2 - 2, padding - 2, 4, 6);
    graphics.fillCircle(size / 2, padding - 2, 3);

    // Generate texture and cleanup
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Create UI textures
   * @param {Phaser.Scene} scene - The scene to create textures in
   */
  static createUITextures(scene) {
    // Panel background
    this._createPanelTexture(scene, 'ui_panel_bg', 200, 150);

    // Button
    this._createButtonTexture(scene, 'ui_button', 120, 40);
    this._createButtonTexture(scene, 'ui_button_hover', 120, 40, true);

    // Status indicators
    this._createStatusIndicator(scene, 'ui_status_green', COLORS.GREEN);
    this._createStatusIndicator(scene, 'ui_status_red', COLORS.RED);
    this._createStatusIndicator(scene, 'ui_status_yellow', COLORS.YELLOW);
  }

  /**
   * Create panel background texture
   */
  static _createPanelTexture(scene, key, width, height) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Shadow
    graphics.fillStyle(COLORS.BLACK, 0.2);
    graphics.fillRoundedRect(4, 4, width, height, 12);

    // Main panel
    graphics.fillStyle(COLORS.BACKGROUND, 0.95);
    graphics.fillRoundedRect(0, 0, width, height, 12);

    // Border
    graphics.lineStyle(2, COLORS.GRID, 1);
    graphics.strokeRoundedRect(0, 0, width, height, 12);

    // Inner accent line
    graphics.lineStyle(1, COLORS.PRIMARY, 0.3);
    graphics.strokeRoundedRect(4, 4, width - 8, height - 8, 10);

    graphics.generateTexture(key, width + 4, height + 4);
    graphics.destroy();
  }

  /**
   * Create button texture
   */
  static _createButtonTexture(scene, key, width, height, isHover = false) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Shadow
    graphics.fillStyle(COLORS.BLACK, 0.15);
    graphics.fillRoundedRect(2, 2, width, height, 8);

    // Main button
    const bgColor = isHover ? COLORS.SECONDARY : COLORS.PRIMARY;
    graphics.fillStyle(bgColor, 1);
    graphics.fillRoundedRect(0, 0, width, height, 8);

    // Top highlight
    graphics.fillStyle(COLORS.WHITE, 0.2);
    graphics.fillRoundedRect(2, 2, width - 4, height / 3, { tl: 6, tr: 6, bl: 0, br: 0 });

    graphics.generateTexture(key, width + 2, height + 2);
    graphics.destroy();
  }

  /**
   * Create status indicator texture
   */
  static _createStatusIndicator(scene, key, color) {
    const size = 16;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    const cx = size / 2;
    const cy = size / 2;

    // Outer glow
    graphics.fillStyle(color, 0.3);
    graphics.fillCircle(cx, cy, 7);

    // Main circle
    graphics.fillStyle(color, 1);
    graphics.fillCircle(cx, cy, 5);

    // Highlight
    graphics.fillStyle(COLORS.WHITE, 0.5);
    graphics.fillCircle(cx - 1, cy - 1, 2);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Create grid texture with circuit trace pattern
   * @param {Phaser.Scene} scene - The scene to create the texture in
   */
  static createGridTexture(scene) {
    const size = 64;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Background
    graphics.fillStyle(COLORS.BACKGROUND, 1);
    graphics.fillRect(0, 0, size, size);

    // Grid lines
    graphics.lineStyle(1, COLORS.GRID, 0.8);

    // Outer border
    graphics.strokeRect(0, 0, size, size);

    // Subtle circuit trace pattern
    graphics.lineStyle(1, COLORS.GRID, 0.4);

    // Horizontal trace
    graphics.beginPath();
    graphics.moveTo(0, size / 2);
    graphics.lineTo(size / 4, size / 2);
    graphics.lineTo(size / 4, size / 4);
    graphics.lineTo(size / 2, size / 4);
    graphics.strokePath();

    // Vertical trace
    graphics.beginPath();
    graphics.moveTo(size / 2, size);
    graphics.lineTo(size / 2, size * 3 / 4);
    graphics.lineTo(size * 3 / 4, size * 3 / 4);
    graphics.lineTo(size * 3 / 4, size / 2);
    graphics.strokePath();

    // Corner dots (connection points)
    graphics.fillStyle(COLORS.GRID, 0.5);
    graphics.fillCircle(size / 4, size / 4, 2);
    graphics.fillCircle(size * 3 / 4, size * 3 / 4, 2);

    // Diagonal accent
    graphics.lineStyle(1, COLORS.GRID, 0.2);
    graphics.beginPath();
    graphics.moveTo(size * 3 / 4, 0);
    graphics.lineTo(size, size / 4);
    graphics.strokePath();

    graphics.generateTexture('grid_tile', size, size);
    graphics.destroy();
  }
}
