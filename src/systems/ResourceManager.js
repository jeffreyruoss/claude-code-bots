/**
 * ResourceManager - Handles global inventory and resource operations
 */
export default class ResourceManager {
  constructor(scene) {
    this.scene = scene;

    // Global inventory
    this.resources = {
      scrap: 0,
      energy: 0,
      circuits: 0,
      dataCores: 0,
      advancedCircuits: 0,
      botFrames: 0,
      powerCores: 0
    };

    // Capacity limits
    this.capacity = {
      scrap: 100,
      energy: 100,
      circuits: 50,
      dataCores: 50,
      advancedCircuits: 25,
      botFrames: 25,
      powerCores: 25
    };

    // Stats tracking
    this.totalCollected = {
      scrap: 0,
      energy: 0,
      circuits: 0,
      dataCores: 0,
      advancedCircuits: 0,
      botFrames: 0,
      powerCores: 0
    };

    // Event emitter for UI updates
    this.events = scene.events;
  }

  /**
   * Add resources to inventory
   * @returns {number} Amount actually added (may be less if at capacity)
   */
  add(resourceType, amount) {
    if (!this.resources.hasOwnProperty(resourceType)) {
      console.warn(`Unknown resource type: ${resourceType}`);
      return 0;
    }

    const currentAmount = this.resources[resourceType];
    const maxCapacity = this.capacity[resourceType];
    const spaceAvailable = maxCapacity - currentAmount;
    const amountToAdd = Math.min(amount, spaceAvailable);

    this.resources[resourceType] += amountToAdd;
    this.totalCollected[resourceType] += amountToAdd;

    this.events.emit('resources-changed', this.resources);

    return amountToAdd;
  }

  /**
   * Remove resources from inventory
   * @returns {boolean} True if successful, false if insufficient
   */
  remove(resourceType, amount) {
    if (!this.resources.hasOwnProperty(resourceType)) {
      console.warn(`Unknown resource type: ${resourceType}`);
      return false;
    }

    if (this.resources[resourceType] < amount) {
      return false;
    }

    this.resources[resourceType] -= amount;
    this.events.emit('resources-changed', this.resources);

    return true;
  }

  /**
   * Check if we have enough of a resource
   */
  has(resourceType, amount) {
    return this.resources[resourceType] >= amount;
  }

  /**
   * Check if we can afford a cost object
   * @param {Object} cost - Object with resource types as keys, amounts as values
   */
  canAfford(cost) {
    for (const [resourceType, amount] of Object.entries(cost)) {
      if (!this.has(resourceType, amount)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Spend resources according to a cost object
   * @returns {boolean} True if successful
   */
  spend(cost) {
    if (!this.canAfford(cost)) {
      return false;
    }

    for (const [resourceType, amount] of Object.entries(cost)) {
      this.remove(resourceType, amount);
    }

    return true;
  }

  /**
   * Get current amount of a resource
   */
  get(resourceType) {
    return this.resources[resourceType] || 0;
  }

  /**
   * Get all resources
   */
  getAll() {
    return { ...this.resources };
  }

  /**
   * Get capacity for a resource
   */
  getCapacity(resourceType) {
    return this.capacity[resourceType] || 0;
  }

  /**
   * Increase capacity (from research or storage buildings)
   */
  increaseCapacity(resourceType, amount) {
    if (this.capacity.hasOwnProperty(resourceType)) {
      this.capacity[resourceType] += amount;
      this.events.emit('capacity-changed', this.capacity);
    }
  }

  /**
   * Increase all capacities
   */
  increaseAllCapacity(amount) {
    for (const resourceType of Object.keys(this.capacity)) {
      this.capacity[resourceType] += amount;
    }
    this.events.emit('capacity-changed', this.capacity);
  }

  /**
   * Check if inventory is full for a resource type
   */
  isFull(resourceType) {
    return this.resources[resourceType] >= this.capacity[resourceType];
  }

  /**
   * Get fill percentage for a resource
   */
  getFillPercent(resourceType) {
    return this.resources[resourceType] / this.capacity[resourceType];
  }

  /**
   * Serialize for saving
   */
  serialize() {
    return {
      resources: { ...this.resources },
      capacity: { ...this.capacity },
      totalCollected: { ...this.totalCollected }
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data) {
    if (data.resources) {
      this.resources = { ...data.resources };
    }
    if (data.capacity) {
      this.capacity = { ...data.capacity };
    }
    if (data.totalCollected) {
      this.totalCollected = { ...data.totalCollected };
    }
    this.events.emit('resources-changed', this.resources);
    this.events.emit('capacity-changed', this.capacity);
  }
}
