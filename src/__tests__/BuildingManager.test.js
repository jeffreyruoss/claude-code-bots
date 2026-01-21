import { describe, it, expect, beforeEach, vi } from 'vitest';
import BuildingManager from '../systems/BuildingManager.js';
import ResourceManager from '../systems/ResourceManager.js';
import { createMockScene } from './mocks/phaserMocks.js';

// Mock the Building class since it creates Phaser sprites
vi.mock('../entities/Building.js', () => {
  return {
    default: class MockBuilding {
      constructor(scene, gridX, gridY, type, config) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;
        this.config = config;
        this.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.destroyed = false;
      }

      destroy() {
        this.destroyed = true;
      }

      serialize() {
        return {
          id: this.id,
          type: this.type,
          gridX: this.gridX,
          gridY: this.gridY
        };
      }

      deserialize(data) {
        // Restore state from data
      }
    }
  };
});

describe('BuildingManager', () => {
  let buildingManager;
  let resourceManager;
  let mockScene;

  const mockBuildingDefs = {
    miner: {
      name: 'Miner',
      cost: { scrap: 20, energy: 10 },
      productionTime: 2000
    },
    assembler: {
      name: 'Assembler',
      cost: { scrap: 40, circuits: 5 },
      productionTime: 3000
    },
    generator: {
      name: 'Generator',
      cost: { scrap: 30 },
      productionTime: 1000
    }
  };

  beforeEach(() => {
    mockScene = createMockScene();
    resourceManager = new ResourceManager(mockScene);
    buildingManager = new BuildingManager(mockScene, resourceManager);
    buildingManager.setBuildingDefinitions(mockBuildingDefs);
  });

  describe('initialization', () => {
    it('should start with no buildings', () => {
      expect(buildingManager.getCount()).toBe(0);
      expect(buildingManager.getAll()).toEqual([]);
    });

    it('should have no selected building type', () => {
      expect(buildingManager.selectedBuildingType).toBeNull();
    });
  });

  describe('building definitions', () => {
    it('should store building definitions', () => {
      expect(buildingManager.buildingDefs).toBe(mockBuildingDefs);
      expect(buildingManager.buildingDefs.miner.cost.scrap).toBe(20);
    });
  });

  describe('building selection', () => {
    it('should select a building type for placement', () => {
      buildingManager.selectBuildingType('miner');

      expect(buildingManager.selectedBuildingType).toBe('miner');
    });

    it('should emit building-selected event when selecting', () => {
      buildingManager.selectBuildingType('miner');

      const events = mockScene.events.getEmittedEvents('building-selected');
      expect(events.length).toBe(1);
      expect(events[0].args[0]).toBe('miner');
    });

    it('should clear selection', () => {
      buildingManager.selectBuildingType('miner');
      buildingManager.clearSelection();

      expect(buildingManager.selectedBuildingType).toBeNull();
    });

    it('should emit building-selected with null when clearing', () => {
      buildingManager.selectBuildingType('miner');
      mockScene.events.clearEmittedEvents();

      buildingManager.clearSelection();

      const events = mockScene.events.getEmittedEvents('building-selected');
      expect(events.length).toBe(1);
      expect(events[0].args[0]).toBeNull();
    });
  });

  describe('building placement', () => {
    beforeEach(() => {
      // Give enough resources for testing
      resourceManager.add('scrap', 100);
      resourceManager.add('energy', 50);
      resourceManager.add('circuits', 20);
    });

    it('should place a building at grid position', () => {
      buildingManager.selectBuildingType('miner');
      const building = buildingManager.place(5, 5);

      expect(building).not.toBeNull();
      expect(building.type).toBe('miner');
      expect(building.gridX).toBe(5);
      expect(building.gridY).toBe(5);
    });

    it('should place a building with explicit type', () => {
      const building = buildingManager.place(3, 3, 'generator');

      expect(building).not.toBeNull();
      expect(building.type).toBe('generator');
    });

    it('should register building in buildings map', () => {
      buildingManager.selectBuildingType('miner');
      const building = buildingManager.place(5, 5);

      expect(buildingManager.buildings.has(building.id)).toBe(true);
      expect(buildingManager.getCount()).toBe(1);
    });

    it('should register building in grid map', () => {
      buildingManager.selectBuildingType('miner');
      buildingManager.place(5, 5);

      expect(buildingManager.buildingGrid.has('5,5')).toBe(true);
    });

    it('should spend resources when placing', () => {
      const initialScrap = resourceManager.get('scrap');
      const initialEnergy = resourceManager.get('energy');

      buildingManager.place(5, 5, 'miner');

      expect(resourceManager.get('scrap')).toBe(initialScrap - 20);
      expect(resourceManager.get('energy')).toBe(initialEnergy - 10);
    });

    it('should emit building-placed event', () => {
      const building = buildingManager.place(5, 5, 'miner');

      const events = mockScene.events.getEmittedEvents('building-placed');
      expect(events.length).toBe(1);
      expect(events[0].args[0]).toBe(building);
    });

    it('should not place on occupied tile', () => {
      buildingManager.place(5, 5, 'miner');
      const secondBuilding = buildingManager.place(5, 5, 'generator');

      expect(secondBuilding).toBeNull();
      expect(buildingManager.getCount()).toBe(1);
    });

    it('should not place when cannot afford cost', () => {
      resourceManager.resources.scrap = 10; // Not enough

      const building = buildingManager.place(5, 5, 'miner');

      expect(building).toBeNull();
    });

    it('should emit placement-failed event when insufficient resources', () => {
      resourceManager.resources.scrap = 10;

      buildingManager.place(5, 5, 'miner');

      const events = mockScene.events.getEmittedEvents('placement-failed');
      expect(events.length).toBe(1);
      expect(events[0].args[0]).toBe('insufficient-resources');
    });

    it('should return null for unknown building type', () => {
      const building = buildingManager.place(5, 5, 'unknown');

      expect(building).toBeNull();
    });

    it('should return null when no type selected and none provided', () => {
      const building = buildingManager.place(5, 5);

      expect(building).toBeNull();
    });
  });

  describe('building removal', () => {
    let placedBuilding;

    beforeEach(() => {
      resourceManager.add('scrap', 100);
      resourceManager.add('energy', 50);
      placedBuilding = buildingManager.place(5, 5, 'miner');
    });

    it('should remove a building by reference', () => {
      const result = buildingManager.remove(placedBuilding);

      expect(result).toBe(true);
      expect(buildingManager.getCount()).toBe(0);
    });

    it('should remove a building by ID', () => {
      const result = buildingManager.remove(placedBuilding.id);

      expect(result).toBe(true);
      expect(buildingManager.getCount()).toBe(0);
    });

    it('should remove from grid map', () => {
      buildingManager.remove(placedBuilding);

      expect(buildingManager.buildingGrid.has('5,5')).toBe(false);
    });

    it('should destroy the building sprite', () => {
      buildingManager.remove(placedBuilding);

      expect(placedBuilding.destroyed).toBe(true);
    });

    it('should refund 50% of cost by default', () => {
      const scrapBefore = resourceManager.get('scrap');

      buildingManager.remove(placedBuilding);

      // Miner costs 20 scrap, 10 energy - should refund 10 scrap, 5 energy
      expect(resourceManager.get('scrap')).toBe(scrapBefore + 10);
    });

    it('should not refund when refund=false', () => {
      const scrapBefore = resourceManager.get('scrap');

      buildingManager.remove(placedBuilding, false);

      expect(resourceManager.get('scrap')).toBe(scrapBefore);
    });

    it('should emit building-removed event', () => {
      mockScene.events.clearEmittedEvents();

      buildingManager.remove(placedBuilding);

      const events = mockScene.events.getEmittedEvents('building-removed');
      expect(events.length).toBe(1);
      expect(events[0].args[0]).toBe(placedBuilding);
    });

    it('should return false for non-existent building', () => {
      const result = buildingManager.remove('fake-id');

      expect(result).toBe(false);
    });
  });

  describe('getByType queries', () => {
    beforeEach(() => {
      // Increase capacity to allow testing with more resources
      resourceManager.capacity.scrap = 500;
      resourceManager.capacity.energy = 200;
      resourceManager.capacity.circuits = 100;

      resourceManager.add('scrap', 200);
      resourceManager.add('energy', 100);
      resourceManager.add('circuits', 50);

      buildingManager.place(1, 1, 'miner');
      buildingManager.place(2, 2, 'miner');
      buildingManager.place(3, 3, 'generator');
      buildingManager.place(4, 4, 'assembler');
      buildingManager.place(5, 5, 'miner');
    });

    it('should return all buildings of specified type', () => {
      const miners = buildingManager.getByType('miner');

      expect(miners.length).toBe(3);
      miners.forEach(b => expect(b.type).toBe('miner'));
    });

    it('should return empty array for type with no buildings', () => {
      const storages = buildingManager.getByType('storage');

      expect(storages).toEqual([]);
    });

    it('should return correct count by type', () => {
      expect(buildingManager.getCount('miner')).toBe(3);
      expect(buildingManager.getCount('generator')).toBe(1);
      expect(buildingManager.getCount('assembler')).toBe(1);
    });

    it('should return total count when no type specified', () => {
      expect(buildingManager.getCount()).toBe(5);
    });
  });

  describe('getAt queries', () => {
    beforeEach(() => {
      resourceManager.add('scrap', 100);
      resourceManager.add('energy', 50);
    });

    it('should return building at position', () => {
      const placed = buildingManager.place(5, 5, 'miner');
      const found = buildingManager.getAt(5, 5);

      expect(found).toBe(placed);
    });

    it('should return null when no building at position', () => {
      const found = buildingManager.getAt(10, 10);

      expect(found).toBeNull();
    });
  });

  describe('getAdjacent queries', () => {
    beforeEach(() => {
      resourceManager.add('scrap', 200);
      resourceManager.add('energy', 100);
    });

    it('should return buildings adjacent to position', () => {
      buildingManager.place(5, 4, 'miner'); // Above
      buildingManager.place(4, 5, 'miner'); // Left
      buildingManager.place(6, 5, 'miner'); // Right
      buildingManager.place(5, 6, 'miner'); // Below

      const adjacent = buildingManager.getAdjacent(5, 5);

      expect(adjacent.length).toBe(4);
    });

    it('should not include diagonal buildings', () => {
      buildingManager.place(4, 4, 'miner'); // Diagonal
      buildingManager.place(6, 6, 'miner'); // Diagonal

      const adjacent = buildingManager.getAdjacent(5, 5);

      expect(adjacent.length).toBe(0);
    });

    it('should return partial list when not all adjacent tiles have buildings', () => {
      buildingManager.place(5, 4, 'miner'); // Only above
      buildingManager.place(6, 5, 'miner'); // Only right

      const adjacent = buildingManager.getAdjacent(5, 5);

      expect(adjacent.length).toBe(2);
    });
  });

  describe('cost checking with canPlace', () => {
    beforeEach(() => {
      resourceManager.add('scrap', 25);
      resourceManager.add('energy', 15);
    });

    it('should return true when can afford selected building', () => {
      buildingManager.selectBuildingType('miner');

      expect(buildingManager.canPlace(5, 5)).toBe(true);
    });

    it('should return false when cannot afford selected building', () => {
      buildingManager.selectBuildingType('assembler'); // Costs 40 scrap, 5 circuits

      expect(buildingManager.canPlace(5, 5)).toBe(false);
    });

    it('should return false when tile is occupied', () => {
      buildingManager.place(5, 5, 'miner');
      buildingManager.selectBuildingType('generator');

      expect(buildingManager.canPlace(5, 5)).toBe(false);
    });

    it('should return true when no building selected (just checks tile)', () => {
      expect(buildingManager.canPlace(5, 5)).toBe(true);
    });
  });

  describe('serialization', () => {
    beforeEach(() => {
      resourceManager.add('scrap', 200);
      resourceManager.add('energy', 100);
    });

    it('should serialize all buildings', () => {
      buildingManager.place(1, 1, 'miner');
      buildingManager.place(2, 2, 'generator');

      const serialized = buildingManager.serialize();

      expect(serialized.length).toBe(2);
      expect(serialized[0]).toHaveProperty('type');
      expect(serialized[0]).toHaveProperty('gridX');
      expect(serialized[0]).toHaveProperty('gridY');
    });
  });

  describe('getAll method', () => {
    beforeEach(() => {
      resourceManager.add('scrap', 200);
      resourceManager.add('energy', 100);
    });

    it('should return array of all buildings', () => {
      buildingManager.place(1, 1, 'miner');
      buildingManager.place(2, 2, 'generator');
      buildingManager.place(3, 3, 'miner');

      const all = buildingManager.getAll();

      expect(all.length).toBe(3);
      expect(Array.isArray(all)).toBe(true);
    });

    it('should return empty array when no buildings', () => {
      const all = buildingManager.getAll();

      expect(all).toEqual([]);
    });
  });
});
