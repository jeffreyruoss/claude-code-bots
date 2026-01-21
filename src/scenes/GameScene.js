import { GAME_CONFIG, TIMING } from '../config/constants.js';
import { BUILDINGS } from '../config/buildings.js';
import { RECIPES } from '../config/recipes.js';
import { RESEARCH } from '../config/research.js';
import { STAGES } from '../config/stages.js';
import ResourceManager from '../systems/ResourceManager.js';
import BuildingManager from '../systems/BuildingManager.js';
import ProductionSystem from '../systems/ProductionSystem.js';
import ResearchManager from '../systems/ResearchManager.js';
import StageManager from '../systems/StageManager.js';
import ResourceNode from '../entities/ResourceNode.js';
import StorageService from '../services/StorageService.js';

/**
 * GameScene - Main gameplay scene
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize storage service
    this.storageService = new StorageService();

    // Create the tile grid background
    this.createGrid();

    // Initialize game systems
    this.initializeSystems();

    // Setup input handling
    this.setupInput();

    // Setup camera
    this.setupCamera();

    // Generate initial resource nodes
    this.generateInitialNodes();

    // Load saved game if exists
    this.loadGame();

    // Setup auto-save
    this.setupAutoSave();

    // Start production loop
    this.productionTimer = this.time.addEvent({
      delay: TIMING.PRODUCTION_TICK,
      callback: () => this.productionSystem.update(TIMING.PRODUCTION_TICK),
      loop: true
    });

    // Listen for save event from main.js
    this.game.events.on('save-game', () => this.saveGame());
  }

  createGrid() {
    // Create a large grid of tiles
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const gridWidth = 50;
    const gridHeight = 50;

    // Grid container
    this.gridContainer = this.add.container(0, 0);

    for (let x = -gridWidth / 2; x < gridWidth / 2; x++) {
      for (let y = -gridHeight / 2; y < gridHeight / 2; y++) {
        const tile = this.add.image(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          'grid_tile'
        );
        tile.setData('gridX', x);
        tile.setData('gridY', y);
        this.gridContainer.add(tile);
      }
    }
  }

  initializeSystems() {
    // Resource manager
    this.resourceManager = new ResourceManager(this);

    // Building manager
    this.buildingManager = new BuildingManager(this, this.resourceManager);

    // Convert BUILDINGS object to lookup by ID
    const buildingDefs = {};
    Object.values(BUILDINGS).forEach(b => {
      buildingDefs[b.id] = b;
    });
    this.buildingManager.setBuildingDefinitions(buildingDefs);

    // Production system
    this.productionSystem = new ProductionSystem(this, this.resourceManager, this.buildingManager);
    this.productionSystem.setRecipes(RECIPES);

    // Research manager
    this.researchManager = new ResearchManager(this, this.resourceManager);
    this.researchManager.setResearchDefinitions(RESEARCH);

    // Stage manager
    this.stageManager = new StageManager(
      this,
      this.resourceManager,
      this.buildingManager,
      this.researchManager
    );
    this.stageManager.setStageDefinitions(STAGES);

    // Listen for speed bonus from research
    this.events.on('apply-speed-bonus', (bonus) => {
      this.productionSystem.setSpeedMultiplier(1 + bonus);
    });
  }

  setupInput() {
    // Enable pointer events
    this.input.on('pointerdown', (pointer) => this.handlePointerDown(pointer));
    this.input.on('pointermove', (pointer) => this.handlePointerMove(pointer));
    this.input.on('pointerup', (pointer) => this.handlePointerUp(pointer));

    // Mouse wheel zoom
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      const zoomChange = deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + zoomChange, 0.5, 2);
      this.cameras.main.setZoom(newZoom);
    });

    // Right click to remove building
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.handleRightClick(pointer);
      }
    });

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ONE', () => this.selectBuilding('generator'));
    this.input.keyboard.on('keydown-TWO', () => this.selectBuilding('harvester'));
    this.input.keyboard.on('keydown-THREE', () => this.selectBuilding('assembler'));
    this.input.keyboard.on('keydown-FOUR', () => this.selectBuilding('researchTerminal'));
    this.input.keyboard.on('keydown-FIVE', () => this.selectBuilding('storageBay'));
    this.input.keyboard.on('keydown-SIX', () => this.selectBuilding('repairStation'));
    this.input.keyboard.on('keydown-ESC', () => this.buildingManager.clearSelection());

    // Panning state
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.cameraStart = { x: 0, y: 0 };
  }

  setupCamera() {
    // Center camera and set bounds
    this.cameras.main.centerOn(0, 0);
    this.cameras.main.setZoom(1);

    // Set camera bounds
    const worldSize = 50 * GAME_CONFIG.TILE_SIZE;
    this.cameras.main.setBounds(-worldSize / 2, -worldSize / 2, worldSize, worldSize);
  }

  generateInitialNodes() {
    // Generate starting resource nodes around spawn
    const nodeConfigs = [
      // Scrap piles near center
      { x: 2, y: 0, type: 'scrap', amount: 100 },
      { x: -2, y: 1, type: 'scrap', amount: 80 },
      { x: 3, y: -2, type: 'scrap', amount: 60 },
      { x: -1, y: 3, type: 'scrap', amount: 70 },

      // Energy nodes
      { x: 0, y: -2, type: 'energy', amount: 80 },
      { x: -3, y: -1, type: 'energy', amount: 60 },
      { x: 4, y: 2, type: 'energy', amount: 50 },

      // Distant scrap
      { x: 6, y: -4, type: 'scrap', amount: 120 },
      { x: -5, y: 5, type: 'scrap', amount: 100 },
      { x: -7, y: -3, type: 'scrap', amount: 90 },

      // Distant energy
      { x: -4, y: -5, type: 'energy', amount: 70 },
      { x: 5, y: 4, type: 'energy', amount: 60 },

      // Rare data core
      { x: 8, y: -2, type: 'dataCores', amount: 30 },
      { x: -6, y: 7, type: 'dataCores', amount: 25 }
    ];

    nodeConfigs.forEach(config => {
      const node = new ResourceNode(this, config.x, config.y, config.type, config.amount);
      this.productionSystem.addResourceNode(node);
    });
  }

  handlePointerDown(pointer) {
    if (pointer.rightButtonDown()) return;

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const gridX = Math.floor(worldPoint.x / GAME_CONFIG.TILE_SIZE);
    const gridY = Math.floor(worldPoint.y / GAME_CONFIG.TILE_SIZE);

    // Check if clicking on a building
    const building = this.buildingManager.getAt(gridX, gridY);
    if (building && !this.buildingManager.selectedBuildingType) {
      this.selectGameObject(building);
      return;
    }

    // Check if clicking on a resource node for manual harvest
    const node = this.productionSystem.getNodeAt(gridX, gridY);
    if (node && node.canHarvest() && !this.buildingManager.selectedBuildingType) {
      const harvested = node.harvest(5);
      if (harvested > 0) {
        this.resourceManager.add(node.resourceType, harvested);
      }
      return;
    }

    // Try to place building if one is selected
    if (this.buildingManager.selectedBuildingType) {
      const placed = this.buildingManager.place(gridX, gridY);
      if (placed) {
        // Play placement sound/effect here if desired
      }
      return;
    }

    // Otherwise start panning
    this.isPanning = true;
    this.panStart.x = pointer.x;
    this.panStart.y = pointer.y;
    this.cameraStart.x = this.cameras.main.scrollX;
    this.cameraStart.y = this.cameras.main.scrollY;
  }

  handlePointerMove(pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const gridX = Math.floor(worldPoint.x / GAME_CONFIG.TILE_SIZE);
    const gridY = Math.floor(worldPoint.y / GAME_CONFIG.TILE_SIZE);

    // Update placement preview
    if (this.buildingManager.selectedBuildingType) {
      this.buildingManager.showPreview(gridX, gridY);
    }

    // Handle panning
    if (this.isPanning && pointer.isDown) {
      const dx = this.panStart.x - pointer.x;
      const dy = this.panStart.y - pointer.y;
      this.cameras.main.scrollX = this.cameraStart.x + dx / this.cameras.main.zoom;
      this.cameras.main.scrollY = this.cameraStart.y + dy / this.cameras.main.zoom;
    }
  }

  handlePointerUp(pointer) {
    this.isPanning = false;
  }

  handleRightClick(pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const gridX = Math.floor(worldPoint.x / GAME_CONFIG.TILE_SIZE);
    const gridY = Math.floor(worldPoint.y / GAME_CONFIG.TILE_SIZE);

    // Remove building if there is one
    const building = this.buildingManager.getAt(gridX, gridY);
    if (building) {
      this.buildingManager.remove(building);
    }

    // Clear selection
    this.buildingManager.clearSelection();
    this.deselectGameObject();
  }

  selectBuilding(buildingId) {
    this.buildingManager.selectBuildingType(buildingId);
    this.deselectGameObject();
  }

  selectGameObject(obj) {
    // Deselect previous
    if (this.selectedObject && this.selectedObject.deselect) {
      this.selectedObject.deselect();
    }

    this.selectedObject = obj;

    if (obj && obj.select) {
      obj.select();
    }

    // Emit event for UI
    this.events.emit('object-selected', obj);
  }

  deselectGameObject() {
    if (this.selectedObject && this.selectedObject.deselect) {
      this.selectedObject.deselect();
    }
    this.selectedObject = null;
    this.events.emit('object-selected', null);
  }

  setupAutoSave() {
    this.autoSaveTimer = this.time.addEvent({
      delay: TIMING.AUTO_SAVE,
      callback: () => this.saveGame(),
      loop: true
    });
  }

  async saveGame() {
    const state = {
      resources: this.resourceManager.serialize(),
      buildings: this.buildingManager.serialize(),
      research: this.researchManager.serialize(),
      currentStage: this.stageManager.currentStage,
      stageProgress: {
        progress: this.stageManager.progress,
        stageComplete: this.stageManager.stageComplete
      },
      cameraPosition: {
        x: this.cameras.main.scrollX,
        y: this.cameras.main.scrollY,
        zoom: this.cameras.main.zoom
      },
      resourceNodes: this.productionSystem.serializeNodes()
    };

    const success = await this.storageService.saveGame(state);
    if (success) {
      this.events.emit('game-saved');
    }
  }

  async loadGame() {
    const state = await this.storageService.loadGame();

    if (!state) {
      // New game - give starting resources
      this.resourceManager.add('scrap', 20);
      this.resourceManager.add('energy', 10);

      // Start stage 1
      this.stageManager.advanceStage();
      return;
    }

    // Restore state
    if (state.resources) {
      this.resourceManager.deserialize(state.resources);
    }

    if (state.buildings) {
      this.buildingManager.deserialize(state.buildings);
    }

    if (state.research) {
      this.researchManager.deserialize(state.research);
    }

    if (state.stageProgress) {
      this.stageManager.deserialize({
        currentStage: state.currentStage,
        ...state.stageProgress
      });
    }

    if (state.cameraPosition) {
      this.cameras.main.scrollX = state.cameraPosition.x;
      this.cameras.main.scrollY = state.cameraPosition.y;
      this.cameras.main.setZoom(state.cameraPosition.zoom);
    }

    // Note: Resource nodes are regenerated, not saved (by design)
    // This prevents soft-locks and keeps the world fresh

    this.events.emit('game-loaded');
  }

  update(time, delta) {
    // Update research progress
    this.researchManager.update(delta);
  }
}
