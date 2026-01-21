/**
 * ProductionSystem - Handles tick-based production for all buildings
 */
export default class ProductionSystem {
  constructor(scene, resourceManager, buildingManager) {
    this.scene = scene;
    this.resourceManager = resourceManager;
    this.buildingManager = buildingManager;

    // Resource nodes on the map
    this.resourceNodes = new Map(); // "x,y" -> ResourceNode

    // Recipes (will be set from config)
    this.recipes = [];

    // Research bonuses
    this.speedMultiplier = 1.0;

    // Power system
    this.totalPowerGenerated = 0;
    this.totalPowerConsumed = 0;

    // Production tick timing
    this.tickInterval = 1000; // 1 second
    this.tickAccumulator = 0;
  }

  /**
   * Set recipes from config
   */
  setRecipes(recipes) {
    this.recipes = recipes;
  }

  /**
   * Register a resource node
   */
  addResourceNode(node) {
    this.resourceNodes.set(`${node.gridX},${node.gridY}`, node);
  }

  /**
   * Remove a resource node
   */
  removeResourceNode(node) {
    this.resourceNodes.delete(`${node.gridX},${node.gridY}`);
  }

  /**
   * Get resource node at position
   */
  getNodeAt(gridX, gridY) {
    return this.resourceNodes.get(`${gridX},${gridY}`) || null;
  }

  /**
   * Get adjacent resource nodes to a position
   */
  getAdjacentNodes(gridX, gridY) {
    const adjacent = [];
    const offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dx, dy] of offsets) {
      const node = this.getNodeAt(gridX + dx, gridY + dy);
      if (node) {
        adjacent.push(node);
      }
    }

    return adjacent;
  }

  /**
   * Main update loop
   */
  update(delta) {
    // Update all resource nodes (regeneration)
    for (const node of this.resourceNodes.values()) {
      node.update(delta);
    }

    // Accumulate time for production tick
    this.tickAccumulator += delta;

    if (this.tickAccumulator >= this.tickInterval) {
      this.tickAccumulator -= this.tickInterval;
      this.processTick();
    }
  }

  /**
   * Process one production tick
   */
  processTick() {
    // Phase 1: Calculate power
    this.calculatePower();

    // Phase 2: Distribute power and update building states
    this.distributePower();

    // Phase 3: Process each building type
    this.processGenerators();
    this.processHarvesters();
    this.processAssemblers();
    this.processResearchTerminals();
    this.processRepairStations();
  }

  /**
   * Calculate total power generation
   */
  calculatePower() {
    const generators = this.buildingManager.getByType('generator');
    this.totalPowerGenerated = generators.length * 10 * this.speedMultiplier;
  }

  /**
   * Distribute power to buildings
   */
  distributePower() {
    const buildings = this.buildingManager.getAll();
    let powerNeeded = 0;

    // Calculate total power needed
    for (const building of buildings) {
      if (building.type !== 'generator') {
        powerNeeded += building.config.powerConsumption || 1;
      }
    }

    this.totalPowerConsumed = powerNeeded;

    // Determine if we have enough power
    const hasPower = this.totalPowerGenerated >= powerNeeded;

    // Update building power states
    for (const building of buildings) {
      if (building.type === 'generator') {
        building.setPowered(true);
        building.setActive(true);
      } else {
        building.setPowered(hasPower);
      }
    }

    this.scene.events.emit('power-updated', {
      generated: this.totalPowerGenerated,
      consumed: this.totalPowerConsumed
    });
  }

  /**
   * Process generator buildings
   */
  processGenerators() {
    // Generators just provide power, calculated in calculatePower()
    const generators = this.buildingManager.getByType('generator');
    for (const gen of generators) {
      gen.setActive(true);
    }
  }

  /**
   * Process harvester buildings
   */
  processHarvesters() {
    const harvesters = this.buildingManager.getByType('harvester');

    for (const harvester of harvesters) {
      if (!harvester.powered) {
        harvester.setActive(false);
        harvester.setBlocked(false);
        continue;
      }

      // Find adjacent resource nodes
      const nodes = this.getAdjacentNodes(harvester.gridX, harvester.gridY);
      const harvestableNode = nodes.find(n => n.canHarvest());

      if (!harvestableNode) {
        harvester.setActive(false);
        harvester.setBlocked(true);
        continue;
      }

      // Check if we can store the resource
      if (this.resourceManager.isFull(harvestableNode.resourceType)) {
        harvester.setActive(false);
        harvester.setBlocked(true);
        continue;
      }

      // Harvest!
      harvester.setActive(true);
      harvester.setBlocked(false);

      const harvestAmount = Math.ceil(2 * this.speedMultiplier);
      const harvested = harvestableNode.harvest(harvestAmount);

      if (harvested > 0) {
        this.resourceManager.add(harvestableNode.resourceType, harvested);
        this.scene.events.emit('resource-harvested', {
          type: harvestableNode.resourceType,
          amount: harvested
        });
      }
    }
  }

  /**
   * Process assembler buildings
   */
  processAssemblers() {
    const assemblers = this.buildingManager.getByType('assembler');

    for (const assembler of assemblers) {
      if (!assembler.powered) {
        assembler.setActive(false);
        assembler.setBlocked(false);
        continue;
      }

      // Check if recipe is set
      if (!assembler.currentRecipe) {
        assembler.setActive(false);
        assembler.setBlocked(false);
        continue;
      }

      const recipe = assembler.currentRecipe;

      // Check if we have inputs
      let hasInputs = true;
      for (const input of recipe.inputs) {
        if (!this.resourceManager.has(input.resource, input.amount)) {
          hasInputs = false;
          break;
        }
      }

      if (!hasInputs) {
        assembler.setActive(false);
        assembler.setBlocked(true);
        continue;
      }

      // Check if we can store output
      if (this.resourceManager.isFull(recipe.output)) {
        assembler.setActive(false);
        assembler.setBlocked(true);
        continue;
      }

      // Produce!
      assembler.setActive(true);
      assembler.setBlocked(false);

      // Consume inputs
      for (const input of recipe.inputs) {
        this.resourceManager.remove(input.resource, input.amount);
      }

      // Produce output
      this.resourceManager.add(recipe.output, recipe.outputAmount || 1);

      this.scene.events.emit('item-crafted', {
        recipe: recipe.id,
        output: recipe.output,
        amount: recipe.outputAmount || 1
      });
    }
  }

  /**
   * Process research terminal buildings
   */
  processResearchTerminals() {
    // Research terminals are handled by ResearchManager
    // Just update their visual state based on whether research is active
  }

  /**
   * Process repair station buildings
   */
  processRepairStations() {
    const repairStations = this.buildingManager.getByType('repairStation');

    for (const station of repairStations) {
      if (!station.powered) {
        station.setActive(false);
        continue;
      }

      // Repair stations boost efficiency of nearby buildings
      const adjacent = this.buildingManager.getAdjacent(station.gridX, station.gridY);

      if (adjacent.length > 0) {
        station.setActive(true);
        for (const building of adjacent) {
          building.efficiency = Math.min(1.5, building.efficiency + 0.1);
        }
      } else {
        station.setActive(false);
      }
    }
  }

  /**
   * Apply speed multiplier from research
   */
  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
  }

  /**
   * Get recipe by ID
   */
  getRecipe(id) {
    return this.recipes.find(r => r.id === id);
  }

  /**
   * Get recipes available for a building type
   */
  getRecipesForBuilding(buildingType) {
    return this.recipes.filter(r => r.buildingType === buildingType);
  }

  /**
   * Serialize resource nodes for saving
   */
  serializeNodes() {
    return Array.from(this.resourceNodes.values()).map(n => n.serialize());
  }
}
