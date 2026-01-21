import Building from '../entities/Building.js';

/**
 * BuildingManager - Handles building placement, removal, and queries
 */
export default class BuildingManager {
  constructor(scene, resourceManager) {
    this.scene = scene;
    this.resourceManager = resourceManager;

    // All placed buildings
    this.buildings = new Map(); // id -> Building
    this.buildingGrid = new Map(); // "x,y" -> Building

    // Building definitions (will be set from config)
    this.buildingDefs = {};

    // Selected building for placement
    this.selectedBuildingType = null;
    this.placementPreview = null;

    // Events
    this.events = scene.events;
  }

  /**
   * Set building definitions from config
   */
  setBuildingDefinitions(defs) {
    this.buildingDefs = defs;
  }

  /**
   * Select a building type for placement
   */
  selectBuildingType(type) {
    this.selectedBuildingType = type;
    this.events.emit('building-selected', type);
  }

  /**
   * Clear building selection
   */
  clearSelection() {
    this.selectedBuildingType = null;
    this.hidePreview();
    this.events.emit('building-selected', null);
  }

  /**
   * Show placement preview at grid position
   */
  showPreview(gridX, gridY) {
    if (!this.selectedBuildingType) return;

    const tileSize = 64;
    const worldX = gridX * tileSize + tileSize / 2;
    const worldY = gridY * tileSize + tileSize / 2;

    // Create or update preview
    if (!this.placementPreview) {
      this.placementPreview = this.scene.add.image(worldX, worldY, this.selectedBuildingType);
      this.placementPreview.setAlpha(0.6);
    } else {
      this.placementPreview.setTexture(this.selectedBuildingType);
      this.placementPreview.setPosition(worldX, worldY);
    }

    // Color based on validity
    const canPlace = this.canPlace(gridX, gridY);
    this.placementPreview.setTint(canPlace ? 0x4ade80 : 0xef4444);
  }

  /**
   * Hide placement preview
   */
  hidePreview() {
    if (this.placementPreview) {
      this.placementPreview.destroy();
      this.placementPreview = null;
    }
  }

  /**
   * Check if a building can be placed at position
   */
  canPlace(gridX, gridY) {
    // Check if tile is occupied
    if (this.buildingGrid.has(`${gridX},${gridY}`)) {
      return false;
    }

    // Check if we can afford it
    if (this.selectedBuildingType) {
      const def = this.buildingDefs[this.selectedBuildingType];
      if (def && !this.resourceManager.canAfford(def.cost)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Place a building at position
   * @returns {Building|null} The placed building or null if failed
   */
  place(gridX, gridY, buildingType = null) {
    const type = buildingType || this.selectedBuildingType;
    if (!type) return null;

    const def = this.buildingDefs[type];
    if (!def) {
      console.warn(`Unknown building type: ${type}`);
      return null;
    }

    // Check if can place
    if (this.buildingGrid.has(`${gridX},${gridY}`)) {
      return null;
    }

    // Check cost
    if (!this.resourceManager.canAfford(def.cost)) {
      this.events.emit('placement-failed', 'insufficient-resources');
      return null;
    }

    // Spend resources
    this.resourceManager.spend(def.cost);

    // Create building
    const building = new Building(this.scene, gridX, gridY, type, def);

    // Register
    this.buildings.set(building.id, building);
    this.buildingGrid.set(`${gridX},${gridY}`, building);

    this.events.emit('building-placed', building);

    return building;
  }

  /**
   * Remove a building
   * @param {Building|string} buildingOrId - Building instance or ID
   * @param {boolean} refund - Whether to refund partial cost
   */
  remove(buildingOrId, refund = true) {
    const building = typeof buildingOrId === 'string'
      ? this.buildings.get(buildingOrId)
      : buildingOrId;

    if (!building) return false;

    // Refund 50% of cost
    if (refund) {
      const def = this.buildingDefs[building.type];
      if (def && def.cost) {
        for (const [resource, amount] of Object.entries(def.cost)) {
          this.resourceManager.add(resource, Math.floor(amount * 0.5));
        }
      }
    }

    // Unregister
    this.buildings.delete(building.id);
    this.buildingGrid.delete(`${building.gridX},${building.gridY}`);

    // Destroy visual
    building.destroy();

    this.events.emit('building-removed', building);

    return true;
  }

  /**
   * Get building at grid position
   */
  getAt(gridX, gridY) {
    return this.buildingGrid.get(`${gridX},${gridY}`) || null;
  }

  /**
   * Get all buildings of a type
   */
  getByType(type) {
    return Array.from(this.buildings.values()).filter(b => b.type === type);
  }

  /**
   * Get all buildings
   */
  getAll() {
    return Array.from(this.buildings.values());
  }

  /**
   * Get building count
   */
  getCount(type = null) {
    if (type) {
      return this.getByType(type).length;
    }
    return this.buildings.size;
  }

  /**
   * Get adjacent buildings to a position
   */
  getAdjacent(gridX, gridY) {
    const adjacent = [];
    const offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dx, dy] of offsets) {
      const building = this.getAt(gridX + dx, gridY + dy);
      if (building) {
        adjacent.push(building);
      }
    }

    return adjacent;
  }

  /**
   * Serialize all buildings for saving
   */
  serialize() {
    return Array.from(this.buildings.values()).map(b => b.serialize());
  }

  /**
   * Deserialize buildings from save
   */
  deserialize(data) {
    // Clear existing
    for (const building of this.buildings.values()) {
      building.destroy();
    }
    this.buildings.clear();
    this.buildingGrid.clear();

    // Recreate buildings
    for (const buildingData of data) {
      const def = this.buildingDefs[buildingData.type];
      if (!def) continue;

      const building = new Building(
        this.scene,
        buildingData.gridX,
        buildingData.gridY,
        buildingData.type,
        def
      );
      building.deserialize(buildingData);

      this.buildings.set(building.id, building);
      this.buildingGrid.set(`${buildingData.gridX},${buildingData.gridY}`, building);
    }
  }
}
