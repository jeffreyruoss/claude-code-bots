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
   * Create textures for all building types
   * @param {Phaser.Scene} scene - The scene to create textures in
   */
  static createBuildingTextures(scene) {
    const size = 64;
    const buildings = [
      { key: 'building_generator', drawSymbol: this._drawLightningBolt },
      { key: 'building_harvester', drawSymbol: this._drawClaw },
      { key: 'building_assembler', drawSymbol: this._drawGear },
      { key: 'building_research_terminal', drawSymbol: this._drawCircuit },
      { key: 'building_storage_bay', drawSymbol: this._drawContainer },
      { key: 'building_repair_station', drawSymbol: this._drawWrench }
    ];

    buildings.forEach(({ key, drawSymbol }) => {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

      // Draw building base (box)
      const padding = 4;
      const boxSize = size - padding * 2;

      // Shadow
      graphics.fillStyle(COLORS.BLACK, 0.2);
      graphics.fillRoundedRect(padding + 2, padding + 2, boxSize, boxSize, 6);

      // Main body
      graphics.fillStyle(COLORS.TEXT, 1);
      graphics.fillRoundedRect(padding, padding, boxSize, boxSize, 6);

      // Inner panel
      graphics.fillStyle(0x2a2a2a, 1);
      graphics.fillRoundedRect(padding + 3, padding + 3, boxSize - 6, boxSize - 6, 4);

      // Draw the symbol
      drawSymbol.call(this, graphics, size);

      // Generate texture and cleanup
      graphics.generateTexture(key, size, size);
      graphics.destroy();
    });
  }

  /**
   * Draw lightning bolt symbol for generator
   */
  static _drawLightningBolt(graphics, size) {
    const cx = size / 2;
    const cy = size / 2;

    graphics.fillStyle(COLORS.YELLOW, 1);
    graphics.beginPath();
    graphics.moveTo(cx + 2, cy - 14);
    graphics.lineTo(cx - 6, cy + 2);
    graphics.lineTo(cx - 1, cy + 2);
    graphics.lineTo(cx - 4, cy + 14);
    graphics.lineTo(cx + 6, cy - 2);
    graphics.lineTo(cx + 1, cy - 2);
    graphics.closePath();
    graphics.fillPath();

    // Glow effect
    graphics.fillStyle(COLORS.YELLOW, 0.3);
    graphics.fillCircle(cx, cy, 16);
  }

  /**
   * Draw claw/arm symbol for harvester
   */
  static _drawClaw(graphics, size) {
    const cx = size / 2;
    const cy = size / 2;

    graphics.lineStyle(3, COLORS.PRIMARY, 1);

    // Left claw
    graphics.beginPath();
    graphics.moveTo(cx - 10, cy + 10);
    graphics.lineTo(cx - 10, cy - 5);
    graphics.lineTo(cx - 4, cy - 12);
    graphics.strokePath();

    // Right claw
    graphics.beginPath();
    graphics.moveTo(cx + 10, cy + 10);
    graphics.lineTo(cx + 10, cy - 5);
    graphics.lineTo(cx + 4, cy - 12);
    graphics.strokePath();

    // Center arm
    graphics.fillStyle(COLORS.PRIMARY, 1);
    graphics.fillRect(cx - 3, cy - 2, 6, 14);

    // Joints
    graphics.fillCircle(cx - 10, cy - 5, 3);
    graphics.fillCircle(cx + 10, cy - 5, 3);
  }

  /**
   * Draw gear symbol for assembler
   */
  static _drawGear(graphics, size) {
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = 14;
    const innerRadius = 8;
    const teeth = 8;

    graphics.fillStyle(COLORS.GRAY_LIGHT, 1);

    // Draw gear teeth
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2;

      graphics.beginPath();
      graphics.moveTo(
        cx + Math.cos(angle) * innerRadius,
        cy + Math.sin(angle) * innerRadius
      );
      graphics.lineTo(
        cx + Math.cos(angle) * outerRadius,
        cy + Math.sin(angle) * outerRadius
      );
      graphics.lineTo(
        cx + Math.cos(nextAngle) * outerRadius,
        cy + Math.sin(nextAngle) * outerRadius
      );
      graphics.lineTo(
        cx + Math.cos(nextAngle) * innerRadius,
        cy + Math.sin(nextAngle) * innerRadius
      );
      graphics.closePath();
      graphics.fillPath();
    }

    // Center circle
    graphics.fillCircle(cx, cy, innerRadius);

    // Inner hole
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillCircle(cx, cy, 4);
  }

  /**
   * Draw circuit/data symbol for research terminal
   */
  static _drawCircuit(graphics, size) {
    const cx = size / 2;
    const cy = size / 2;

    graphics.lineStyle(2, COLORS.CYAN, 1);

    // Central node
    graphics.fillStyle(COLORS.CYAN, 1);
    graphics.fillCircle(cx, cy, 5);

    // Circuit traces
    const nodes = [
      { x: cx - 12, y: cy - 10 },
      { x: cx + 12, y: cy - 10 },
      { x: cx - 12, y: cy + 10 },
      { x: cx + 12, y: cy + 10 },
      { x: cx, y: cy - 14 },
      { x: cx, y: cy + 14 }
    ];

    nodes.forEach(node => {
      graphics.beginPath();
      graphics.moveTo(cx, cy);
      graphics.lineTo(node.x, node.y);
      graphics.strokePath();
      graphics.fillCircle(node.x, node.y, 3);
    });

    // Glow effect
    graphics.fillStyle(COLORS.CYAN, 0.2);
    graphics.fillCircle(cx, cy, 18);
  }

  /**
   * Draw container symbol for storage bay
   */
  static _drawContainer(graphics, size) {
    const cx = size / 2;
    const cy = size / 2;

    // Outer container
    graphics.fillStyle(COLORS.GRAY_MED, 1);
    graphics.fillRect(cx - 14, cy - 10, 28, 20);

    // Container lid
    graphics.fillStyle(COLORS.GRAY_LIGHT, 1);
    graphics.fillRect(cx - 14, cy - 12, 28, 4);

    // Container divisions
    graphics.lineStyle(2, COLORS.GRAY_DARK, 1);
    graphics.beginPath();
    graphics.moveTo(cx - 5, cy - 8);
    graphics.lineTo(cx - 5, cy + 10);
    graphics.moveTo(cx + 5, cy - 8);
    graphics.lineTo(cx + 5, cy + 10);
    graphics.strokePath();

    // Handle
    graphics.fillStyle(COLORS.PRIMARY, 1);
    graphics.fillRect(cx - 4, cy - 14, 8, 3);
  }

  /**
   * Draw wrench symbol for repair station
   */
  static _drawWrench(graphics, size) {
    const cx = size / 2;
    const cy = size / 2;

    graphics.fillStyle(COLORS.GRAY_LIGHT, 1);

    // Wrench handle
    graphics.save();
    const angle = Math.PI / 4;

    // Draw rotated wrench
    graphics.beginPath();
    // Handle
    graphics.fillRect(cx - 3, cy - 2, 18, 6);

    // Head (open end)
    graphics.fillStyle(COLORS.GRAY_LIGHT, 1);
    graphics.beginPath();
    graphics.moveTo(cx - 12, cy - 8);
    graphics.lineTo(cx - 6, cy - 2);
    graphics.lineTo(cx - 6, cy + 4);
    graphics.lineTo(cx - 12, cy + 10);
    graphics.lineTo(cx - 16, cy + 6);
    graphics.lineTo(cx - 10, cy + 1);
    graphics.lineTo(cx - 10, cy + 1);
    graphics.lineTo(cx - 16, cy - 4);
    graphics.closePath();
    graphics.fillPath();

    // Box end
    graphics.fillCircle(cx + 10, cy + 1, 7);
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillCircle(cx + 10, cy + 1, 3);

    graphics.restore();

    // Add colored accent
    graphics.fillStyle(COLORS.GREEN, 1);
    graphics.fillCircle(cx - 10, cy + 1, 2);
  }

  /**
   * Create textures for resource nodes
   * @param {Phaser.Scene} scene - The scene to create textures in
   */
  static createResourceNodeTextures(scene) {
    const size = 64;

    // Scrap - irregular polygon cluster in grays
    this._createScrapTexture(scene, 'resource_scrap', size);

    // Energy - glowing circle in yellow/orange
    this._createEnergyTexture(scene, 'resource_energy', size);

    // Data Core - hexagon in blue/purple
    this._createDataCoreTexture(scene, 'resource_data_core', size);
  }

  /**
   * Create scrap resource texture
   */
  static _createScrapTexture(scene, key, size) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    // Draw irregular polygon pieces
    const pieces = [
      { x: cx - 8, y: cy - 6, color: COLORS.GRAY_DARK },
      { x: cx + 6, y: cy - 8, color: COLORS.GRAY_MED },
      { x: cx - 4, y: cy + 8, color: COLORS.GRAY_LIGHT },
      { x: cx + 10, y: cy + 4, color: COLORS.GRAY_MED },
      { x: cx, y: cy, color: COLORS.GRAY_DARK }
    ];

    pieces.forEach(piece => {
      graphics.fillStyle(piece.color, 1);
      // Draw irregular polygon
      graphics.beginPath();
      graphics.moveTo(piece.x, piece.y - 8);
      graphics.lineTo(piece.x + 7, piece.y - 3);
      graphics.lineTo(piece.x + 5, piece.y + 6);
      graphics.lineTo(piece.x - 4, piece.y + 7);
      graphics.lineTo(piece.x - 6, piece.y - 2);
      graphics.closePath();
      graphics.fillPath();
    });

    // Add some metallic highlights
    graphics.fillStyle(COLORS.WHITE, 0.3);
    graphics.fillRect(cx - 6, cy - 10, 3, 2);
    graphics.fillRect(cx + 4, cy - 4, 2, 3);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Create energy resource texture
   */
  static _createEnergyTexture(scene, key, size) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    // Outer glow
    graphics.fillStyle(COLORS.YELLOW, 0.15);
    graphics.fillCircle(cx, cy, 28);

    graphics.fillStyle(COLORS.YELLOW, 0.25);
    graphics.fillCircle(cx, cy, 22);

    graphics.fillStyle(COLORS.YELLOW, 0.4);
    graphics.fillCircle(cx, cy, 16);

    // Main energy orb
    graphics.fillStyle(COLORS.YELLOW, 1);
    graphics.fillCircle(cx, cy, 12);

    // Inner bright core
    graphics.fillStyle(COLORS.PRIMARY, 0.6);
    graphics.fillCircle(cx, cy, 8);

    // Highlight
    graphics.fillStyle(COLORS.WHITE, 0.8);
    graphics.fillCircle(cx - 3, cy - 3, 4);

    // Small energy sparks
    graphics.fillStyle(COLORS.YELLOW, 0.8);
    graphics.fillCircle(cx + 14, cy - 8, 2);
    graphics.fillCircle(cx - 12, cy + 10, 2);
    graphics.fillCircle(cx + 8, cy + 14, 2);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Create data core resource texture
   */
  static _createDataCoreTexture(scene, key, size) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;
    const hexRadius = 18;

    // Outer glow
    graphics.fillStyle(COLORS.PURPLE, 0.2);
    this._drawHexagon(graphics, cx, cy, hexRadius + 8);

    // Main hexagon
    graphics.fillStyle(COLORS.BLUE, 1);
    this._drawHexagon(graphics, cx, cy, hexRadius);

    // Inner hexagon
    graphics.fillStyle(COLORS.PURPLE, 0.8);
    this._drawHexagon(graphics, cx, cy, hexRadius - 5);

    // Center detail
    graphics.fillStyle(COLORS.CYAN, 1);
    this._drawHexagon(graphics, cx, cy, 6);

    // Data lines
    graphics.lineStyle(1, COLORS.CYAN, 0.6);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      graphics.beginPath();
      graphics.moveTo(cx, cy);
      graphics.lineTo(
        cx + Math.cos(angle) * (hexRadius - 2),
        cy + Math.sin(angle) * (hexRadius - 2)
      );
      graphics.strokePath();
    }

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Helper to draw a hexagon
   */
  static _drawHexagon(graphics, cx, cy, radius) {
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
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

  /**
   * Create all textures at once (convenience method for BootScene)
   * @param {Phaser.Scene} scene - The scene to create textures in
   */
  static createAllTextures(scene) {
    this.createBotTexture(scene, 'bot', 48);
    this.createBuildingTextures(scene);
    this.createResourceNodeTextures(scene);
    this.createUITextures(scene);
    this.createGridTexture(scene);
  }
}
