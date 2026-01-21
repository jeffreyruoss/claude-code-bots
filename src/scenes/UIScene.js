import { COLORS, GAME_CONFIG } from '../config/constants.js';
import { BUILDINGS } from '../config/buildings.js';
import { RESOURCES } from '../config/resources.js';

/**
 * UIScene - HUD overlay scene that runs parallel to GameScene
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Get reference to game scene
    this.gameScene = this.scene.get('GameScene');

    // Create UI components
    this.createResourcePanel();
    this.createToolbar();
    this.createInfoPanel();
    this.createStageOverlay();
    this.createPowerIndicator();

    // Setup event listeners
    this.setupEventListeners();
  }

  createResourcePanel() {
    const panelX = 10;
    const panelY = 10;
    const panelWidth = 180;
    const panelHeight = 212;

    // Panel background
    this.resourcePanelBg = this.add.rectangle(
      panelX + panelWidth / 2,
      panelY + panelHeight / 2,
      panelWidth,
      panelHeight,
      0xfaf9f5,
      0.95
    );
    this.resourcePanelBg.setStrokeStyle(2, 0xeeece2);

    // Title
    this.add.text(panelX + 10, panelY + 8, 'Resources', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#d97757',
      fontStyle: 'bold'
    });

    // Resource displays
    this.resourceTexts = {};
    const resourceTypes = ['scrap', 'energy', 'circuits', 'dataCores', 'advancedCircuits', 'botFrames', 'powerCores'];
    const resourceNames = ['Scrap', 'Energy', 'Circuits', 'Data Cores', 'Adv Circuits', 'Bot Frames', 'Power Cores'];
    const resourceColors = ['#6b6b6b', '#facc15', '#22d3ee', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899'];

    resourceTypes.forEach((type, i) => {
      const y = panelY + 35 + i * 24;

      // Resource icon (small colored circle)
      this.add.circle(panelX + 18, y + 6, 6, parseInt(resourceColors[i].replace('#', '0x')));

      // Resource name
      this.add.text(panelX + 30, y, resourceNames[i], {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#141413'
      });

      // Resource amount
      this.resourceTexts[type] = this.add.text(panelX + panelWidth - 15, y, '0', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#141413'
      });
      this.resourceTexts[type].setOrigin(1, 0);
    });

    // Update initial values
    this.updateResourceDisplay();
  }

  createToolbar() {
    const toolbarY = GAME_CONFIG.HEIGHT - 80;
    const toolbarWidth = 420;
    const startX = (GAME_CONFIG.WIDTH - toolbarWidth) / 2;

    // Toolbar background
    this.toolbarBg = this.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      toolbarY + 30,
      toolbarWidth + 20,
      70,
      0xfaf9f5,
      0.95
    );
    this.toolbarBg.setStrokeStyle(2, 0xeeece2);

    // Building buttons
    this.buildingButtons = {};
    const buildings = Object.values(BUILDINGS);

    buildings.forEach((building, i) => {
      const x = startX + i * 70 + 35;
      const y = toolbarY + 30;

      // Button background
      const btn = this.add.rectangle(x, y, 60, 60, 0xeeece2)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x141413);

      // Building icon
      const icon = this.add.image(x, y - 5, building.id);
      icon.setScale(0.8);

      // Hotkey label
      this.add.text(x - 25, y + 20, (i + 1).toString(), {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#6b6b6b'
      });

      // Hover tooltip
      btn.on('pointerover', () => {
        btn.setFillStyle(0xd97757, 0.3);
        this.showTooltip(x, toolbarY - 10, building);
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(0xeeece2);
        this.hideTooltip();
      });

      btn.on('pointerdown', () => {
        this.selectBuilding(building.id);
      });

      this.buildingButtons[building.id] = { btn, icon };
    });
  }

  createInfoPanel() {
    const panelX = GAME_CONFIG.WIDTH - 210;
    const panelY = 10;
    const panelWidth = 200;
    const panelHeight = 150;

    // Panel container (hidden by default)
    this.infoPanel = this.add.container(panelX, panelY);
    this.infoPanel.setVisible(false);

    // Background
    const bg = this.add.rectangle(
      panelWidth / 2,
      panelHeight / 2,
      panelWidth,
      panelHeight,
      0xfaf9f5,
      0.95
    );
    bg.setStrokeStyle(2, 0xeeece2);
    this.infoPanel.add(bg);

    // Title
    this.infoPanelTitle = this.add.text(10, 10, 'Selected', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#d97757',
      fontStyle: 'bold'
    });
    this.infoPanel.add(this.infoPanelTitle);

    // Description
    this.infoPanelDesc = this.add.text(10, 35, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#141413',
      wordWrap: { width: panelWidth - 20 }
    });
    this.infoPanel.add(this.infoPanelDesc);

    // Status
    this.infoPanelStatus = this.add.text(10, 80, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#6b6b6b'
    });
    this.infoPanel.add(this.infoPanelStatus);
  }

  createStageOverlay() {
    const overlayX = GAME_CONFIG.WIDTH / 2;
    const overlayY = 30;

    // Stage name
    this.stageText = this.add.text(overlayX, overlayY, 'Stage 1', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#d97757',
      fontStyle: 'bold'
    });
    this.stageText.setOrigin(0.5);

    // Objective
    this.objectiveText = this.add.text(overlayX, overlayY + 22, 'Build your first Harvester Bot', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#141413'
    });
    this.objectiveText.setOrigin(0.5);

    // Progress bar background
    this.progressBarBg = this.add.rectangle(overlayX, overlayY + 45, 200, 8, 0xeeece2);
    this.progressBarBg.setStrokeStyle(1, 0x141413);

    // Progress bar fill
    this.progressBar = this.add.rectangle(overlayX - 99, overlayY + 45, 0, 6, 0xd97757);
    this.progressBar.setOrigin(0, 0.5);
  }

  createPowerIndicator() {
    const x = 10;
    const y = 232;

    // Power icon
    this.add.text(x, y, '⚡', {
      fontSize: '16px'
    });

    // Power text
    this.powerText = this.add.text(x + 25, y, 'Power: 0 / 0', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#141413'
    });
  }

  setupEventListeners() {
    const gameEvents = this.gameScene.events;

    // Resource changes
    gameEvents.on('resources-changed', (resources) => {
      this.updateResourceDisplay();
    });

    // Power updates
    gameEvents.on('power-updated', (data) => {
      this.powerText.setText(`Power: ${data.consumed} / ${data.generated}`);
      if (data.consumed > data.generated) {
        this.powerText.setColor('#ef4444');
      } else {
        this.powerText.setColor('#141413');
      }
    });

    // Object selection
    gameEvents.on('object-selected', (obj) => {
      this.updateInfoPanel(obj);
    });

    // Building selected for placement
    gameEvents.on('building-selected', (type) => {
      this.updateToolbarSelection(type);
    });

    // Stage events
    gameEvents.on('stage-started', (data) => {
      this.stageText.setText(`Stage ${data.stage}: ${data.name}`);
      this.objectiveText.setText(data.objective);
      this.progressBar.width = 0;
    });

    gameEvents.on('stage-progress', (data) => {
      const percent = Math.min(data.progress / data.target, 1);
      this.progressBar.width = 198 * percent;
    });

    gameEvents.on('stage-complete', (data) => {
      this.progressBar.width = 198;
      this.showStageCompleteMessage(data);
    });

    // Hints
    gameEvents.on('show-hint', (data) => {
      this.showHint(data.text);
    });

    // Save indicator
    gameEvents.on('game-saved', () => {
      this.showSaveIndicator();
    });
  }

  updateResourceDisplay() {
    if (!this.gameScene.resourceManager) return;

    const resources = this.gameScene.resourceManager.getAll();
    const capacity = this.gameScene.resourceManager.capacity;

    for (const [type, text] of Object.entries(this.resourceTexts)) {
      const amount = Math.floor(resources[type] || 0);
      const cap = capacity[type] || 100;
      text.setText(`${amount}/${cap}`);

      // Color when near capacity
      if (amount >= cap) {
        text.setColor('#ef4444');
      } else if (amount >= cap * 0.8) {
        text.setColor('#facc15');
      } else {
        text.setColor('#141413');
      }
    }
  }

  updateInfoPanel(obj) {
    if (!obj) {
      this.infoPanel.setVisible(false);
      return;
    }

    this.infoPanel.setVisible(true);

    if (obj.type && obj.config) {
      // It's a building
      this.infoPanelTitle.setText(obj.config.name || obj.type);
      this.infoPanelDesc.setText(obj.config.description || '');

      let status = '';
      if (!obj.powered) status = '⚠️ No power';
      else if (obj.blocked) status = '⏸️ Blocked';
      else if (obj.active) status = '✓ Running';
      else status = '○ Idle';

      this.infoPanelStatus.setText(status);
    }
  }

  updateToolbarSelection(type) {
    // Reset all buttons
    for (const [id, { btn }] of Object.entries(this.buildingButtons)) {
      if (id === type) {
        btn.setStrokeStyle(3, 0xd97757);
      } else {
        btn.setStrokeStyle(2, 0x141413);
      }
    }
  }

  selectBuilding(buildingId) {
    this.gameScene.selectBuilding(buildingId);
  }

  showTooltip(x, y, building) {
    if (this.tooltip) {
      this.tooltip.destroy();
    }

    const costText = Object.entries(building.cost)
      .map(([res, amt]) => `${res}: ${amt}`)
      .join(', ');

    const text = `${building.name}\nCost: ${costText}`;

    // Background
    this.tooltip = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 150, 45, 0x141413, 0.9);
    bg.setStrokeStyle(1, 0xd97757);

    const label = this.add.text(0, 0, text, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#faf9f5',
      align: 'center'
    });
    label.setOrigin(0.5);

    this.tooltip.add([bg, label]);
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  showStageCompleteMessage(data) {
    const msg = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      `✓ Stage Complete!\n${data.name}`,
      {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#d97757',
        align: 'center',
        backgroundColor: '#faf9f5',
        padding: { x: 20, y: 15 }
      }
    );
    msg.setOrigin(0.5);
    msg.setStroke('#141413', 2);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: GAME_CONFIG.HEIGHT / 2 - 50,
      duration: 2000,
      delay: 1500,
      onComplete: () => msg.destroy()
    });
  }

  showHint(text) {
    const hint = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT - 120,
      `💡 ${text}`,
      {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#141413',
        backgroundColor: '#facc15',
        padding: { x: 15, y: 8 }
      }
    );
    hint.setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 1000,
      delay: 5000,
      onComplete: () => hint.destroy()
    });
  }

  showSaveIndicator() {
    const indicator = this.add.text(
      GAME_CONFIG.WIDTH - 10,
      GAME_CONFIG.HEIGHT - 20,
      '💾 Saved',
      {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#6b6b6b'
      }
    );
    indicator.setOrigin(1, 1);

    this.tweens.add({
      targets: indicator,
      alpha: 0,
      duration: 1000,
      delay: 1500,
      onComplete: () => indicator.destroy()
    });
  }
}
