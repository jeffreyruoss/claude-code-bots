import SpriteFactory from '../graphics/SpriteFactory.js';

/**
 * BootScene - Handles initial loading and texture generation
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Claude Code Bots', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#d97757'
    });
    loadingText.setOrigin(0.5);

    const progressText = this.add.text(width / 2, height / 2, 'Initializing...', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#141413'
    });
    progressText.setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(width / 2, height / 2 + 40, 300, 20, 0xeeece2);
    progressBarBg.setStrokeStyle(2, 0x141413);

    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 148, height / 2 + 40, 0, 16, 0xd97757);
    progressBar.setOrigin(0, 0.5);

    // Simulate loading progress
    this.load.on('progress', (value) => {
      progressBar.width = 296 * value;
    });

    this.load.on('complete', () => {
      progressText.setText('Generating textures...');
    });

    // Load a tiny placeholder to trigger progress events
    // (since we're generating textures, not loading external assets)
    this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  create() {
    // Generate all game textures
    this.generateTextures();

    // Small delay to show loading complete, then start game
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }

  generateTextures() {
    // Generate bot texture
    SpriteFactory.createBotTexture(this, 'bot', 48);

    // Generate building textures with correct keys matching building IDs
    this.createBuildingTexture('generator');
    this.createBuildingTexture('harvester');
    this.createBuildingTexture('assembler');
    this.createBuildingTexture('researchTerminal');
    this.createBuildingTexture('storageBay');
    this.createBuildingTexture('repairStation');

    // Generate resource node textures
    this.createResourceNodeTextures();

    // Generate UI textures
    SpriteFactory.createUITextures(this);

    // Generate grid texture
    SpriteFactory.createGridTexture(this);
  }

  createBuildingTexture(buildingId) {
    const size = 64;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const padding = 4;
    const boxSize = size - padding * 2;

    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillRoundedRect(padding + 2, padding + 2, boxSize, boxSize, 6);

    // Main body
    graphics.fillStyle(0x141413, 1);
    graphics.fillRoundedRect(padding, padding, boxSize, boxSize, 6);

    // Inner panel
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillRoundedRect(padding + 3, padding + 3, boxSize - 6, boxSize - 6, 4);

    // Draw symbol based on building type
    this.drawBuildingSymbol(graphics, buildingId, size);

    graphics.generateTexture(buildingId, size, size);
    graphics.destroy();
  }

  drawBuildingSymbol(graphics, buildingId, size) {
    const cx = size / 2;
    const cy = size / 2;

    switch (buildingId) {
      case 'generator':
        // Lightning bolt
        graphics.fillStyle(0xfacc15, 1);
        graphics.beginPath();
        graphics.moveTo(cx + 2, cy - 14);
        graphics.lineTo(cx - 6, cy + 2);
        graphics.lineTo(cx - 1, cy + 2);
        graphics.lineTo(cx - 4, cy + 14);
        graphics.lineTo(cx + 6, cy - 2);
        graphics.lineTo(cx + 1, cy - 2);
        graphics.closePath();
        graphics.fillPath();
        // Glow
        graphics.fillStyle(0xfacc15, 0.3);
        graphics.fillCircle(cx, cy, 16);
        break;

      case 'harvester':
        // Claw/arm
        graphics.lineStyle(3, 0xd97757, 1);
        graphics.beginPath();
        graphics.moveTo(cx - 10, cy + 10);
        graphics.lineTo(cx - 10, cy - 5);
        graphics.lineTo(cx - 4, cy - 12);
        graphics.strokePath();
        graphics.beginPath();
        graphics.moveTo(cx + 10, cy + 10);
        graphics.lineTo(cx + 10, cy - 5);
        graphics.lineTo(cx + 4, cy - 12);
        graphics.strokePath();
        graphics.fillStyle(0xd97757, 1);
        graphics.fillRect(cx - 3, cy - 2, 6, 14);
        graphics.fillCircle(cx - 10, cy - 5, 3);
        graphics.fillCircle(cx + 10, cy - 5, 3);
        break;

      case 'assembler':
        // Gear
        graphics.fillStyle(0x9ca3af, 1);
        const teeth = 8;
        const outerRadius = 14;
        const innerRadius = 8;
        for (let i = 0; i < teeth; i++) {
          const angle = (i / teeth) * Math.PI * 2;
          const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2;
          graphics.beginPath();
          graphics.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
          graphics.lineTo(cx + Math.cos(angle) * outerRadius, cy + Math.sin(angle) * outerRadius);
          graphics.lineTo(cx + Math.cos(nextAngle) * outerRadius, cy + Math.sin(nextAngle) * outerRadius);
          graphics.lineTo(cx + Math.cos(nextAngle) * innerRadius, cy + Math.sin(nextAngle) * innerRadius);
          graphics.closePath();
          graphics.fillPath();
        }
        graphics.fillCircle(cx, cy, innerRadius);
        graphics.fillStyle(0x2a2a2a, 1);
        graphics.fillCircle(cx, cy, 4);
        break;

      case 'researchTerminal':
        // Circuit/data symbol
        graphics.fillStyle(0x22d3ee, 1);
        graphics.fillCircle(cx, cy, 5);
        graphics.lineStyle(2, 0x22d3ee, 1);
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
        graphics.fillStyle(0x22d3ee, 0.2);
        graphics.fillCircle(cx, cy, 18);
        break;

      case 'storageBay':
        // Container
        graphics.fillStyle(0x6b6b6b, 1);
        graphics.fillRect(cx - 14, cy - 10, 28, 20);
        graphics.fillStyle(0x9ca3af, 1);
        graphics.fillRect(cx - 14, cy - 12, 28, 4);
        graphics.lineStyle(2, 0x4a4a4a, 1);
        graphics.beginPath();
        graphics.moveTo(cx - 5, cy - 8);
        graphics.lineTo(cx - 5, cy + 10);
        graphics.moveTo(cx + 5, cy - 8);
        graphics.lineTo(cx + 5, cy + 10);
        graphics.strokePath();
        graphics.fillStyle(0xd97757, 1);
        graphics.fillRect(cx - 4, cy - 14, 8, 3);
        break;

      case 'repairStation':
        // Wrench
        graphics.fillStyle(0x9ca3af, 1);
        graphics.fillRect(cx - 3, cy - 2, 18, 6);
        graphics.beginPath();
        graphics.moveTo(cx - 12, cy - 8);
        graphics.lineTo(cx - 6, cy - 2);
        graphics.lineTo(cx - 6, cy + 4);
        graphics.lineTo(cx - 12, cy + 10);
        graphics.lineTo(cx - 16, cy + 6);
        graphics.lineTo(cx - 10, cy + 1);
        graphics.lineTo(cx - 16, cy - 4);
        graphics.closePath();
        graphics.fillPath();
        graphics.fillCircle(cx + 10, cy + 1, 7);
        graphics.fillStyle(0x2a2a2a, 1);
        graphics.fillCircle(cx + 10, cy + 1, 3);
        graphics.fillStyle(0x4ade80, 1);
        graphics.fillCircle(cx - 10, cy + 1, 2);
        break;
    }
  }

  createResourceNodeTextures() {
    // Scrap
    this.createScrapTexture();

    // Energy
    this.createEnergyTexture();

    // Data Core
    this.createDataCoreTexture();
  }

  createScrapTexture() {
    const size = 64;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    const pieces = [
      { x: cx - 8, y: cy - 6, color: 0x4a4a4a },
      { x: cx + 6, y: cy - 8, color: 0x6b6b6b },
      { x: cx - 4, y: cy + 8, color: 0x9ca3af },
      { x: cx + 10, y: cy + 4, color: 0x6b6b6b },
      { x: cx, y: cy, color: 0x4a4a4a }
    ];

    pieces.forEach(piece => {
      graphics.fillStyle(piece.color, 1);
      graphics.beginPath();
      graphics.moveTo(piece.x, piece.y - 8);
      graphics.lineTo(piece.x + 7, piece.y - 3);
      graphics.lineTo(piece.x + 5, piece.y + 6);
      graphics.lineTo(piece.x - 4, piece.y + 7);
      graphics.lineTo(piece.x - 6, piece.y - 2);
      graphics.closePath();
      graphics.fillPath();
    });

    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillRect(cx - 6, cy - 10, 3, 2);
    graphics.fillRect(cx + 4, cy - 4, 2, 3);

    graphics.generateTexture('node_scrap', size, size);
    graphics.destroy();
  }

  createEnergyTexture() {
    const size = 64;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    graphics.fillStyle(0xfacc15, 0.15);
    graphics.fillCircle(cx, cy, 28);
    graphics.fillStyle(0xfacc15, 0.25);
    graphics.fillCircle(cx, cy, 22);
    graphics.fillStyle(0xfacc15, 0.4);
    graphics.fillCircle(cx, cy, 16);
    graphics.fillStyle(0xfacc15, 1);
    graphics.fillCircle(cx, cy, 12);
    graphics.fillStyle(0xd97757, 0.6);
    graphics.fillCircle(cx, cy, 8);
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(cx - 3, cy - 3, 4);
    graphics.fillStyle(0xfacc15, 0.8);
    graphics.fillCircle(cx + 14, cy - 8, 2);
    graphics.fillCircle(cx - 12, cy + 10, 2);
    graphics.fillCircle(cx + 8, cy + 14, 2);

    graphics.generateTexture('node_energy', size, size);
    graphics.destroy();
  }

  createDataCoreTexture() {
    const size = 64;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    const drawHex = (radius, alpha = 1) => {
      graphics.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) graphics.moveTo(x, y);
        else graphics.lineTo(x, y);
      }
      graphics.closePath();
      graphics.fillPath();
    };

    graphics.fillStyle(0x8b5cf6, 0.2);
    drawHex(26);
    graphics.fillStyle(0x3b82f6, 1);
    drawHex(18);
    graphics.fillStyle(0x8b5cf6, 0.8);
    drawHex(13);
    graphics.fillStyle(0x22d3ee, 1);
    drawHex(6);

    graphics.lineStyle(1, 0x22d3ee, 0.6);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      graphics.beginPath();
      graphics.moveTo(cx, cy);
      graphics.lineTo(cx + Math.cos(angle) * 16, cy + Math.sin(angle) * 16);
      graphics.strokePath();
    }

    graphics.generateTexture('node_dataCores', size, size);
    graphics.destroy();
  }
}
