import { describe, it, expect, beforeEach } from 'vitest';
import ResourceManager from '../systems/ResourceManager.js';
import { createMinimalMockScene } from './mocks/phaserMocks.js';

describe('ResourceManager', () => {
  let resourceManager;
  let mockScene;

  beforeEach(() => {
    mockScene = createMinimalMockScene();
    resourceManager = new ResourceManager(mockScene);
  });

  describe('initialization', () => {
    it('should initialize with zero resources', () => {
      expect(resourceManager.get('scrap')).toBe(0);
      expect(resourceManager.get('energy')).toBe(0);
      expect(resourceManager.get('circuits')).toBe(0);
      expect(resourceManager.get('dataCores')).toBe(0);
    });

    it('should initialize with default capacities', () => {
      expect(resourceManager.getCapacity('scrap')).toBe(100);
      expect(resourceManager.getCapacity('energy')).toBe(100);
      expect(resourceManager.getCapacity('circuits')).toBe(50);
      expect(resourceManager.getCapacity('dataCores')).toBe(25);
    });
  });

  describe('adding resources', () => {
    it('should add resources to inventory', () => {
      const added = resourceManager.add('scrap', 50);

      expect(added).toBe(50);
      expect(resourceManager.get('scrap')).toBe(50);
    });

    it('should emit resources-changed event when adding', () => {
      resourceManager.add('scrap', 25);

      const events = mockScene.events.getEmittedEvents('resources-changed');
      expect(events.length).toBe(1);
      expect(events[0].args[0].scrap).toBe(25);
    });

    it('should track total collected resources', () => {
      resourceManager.add('scrap', 30);
      resourceManager.add('scrap', 20);

      expect(resourceManager.totalCollected.scrap).toBe(50);
    });

    it('should return 0 for unknown resource types', () => {
      const added = resourceManager.add('unknown', 10);

      expect(added).toBe(0);
    });
  });

  describe('capacity limits', () => {
    it('should respect capacity limits when adding', () => {
      const added = resourceManager.add('scrap', 150);

      expect(added).toBe(100); // Capped at capacity
      expect(resourceManager.get('scrap')).toBe(100);
    });

    it('should add only remaining space when partially full', () => {
      resourceManager.add('scrap', 80);
      const added = resourceManager.add('scrap', 50);

      expect(added).toBe(20); // Only 20 space remaining
      expect(resourceManager.get('scrap')).toBe(100);
    });

    it('should return 0 when at capacity', () => {
      resourceManager.add('scrap', 100);
      const added = resourceManager.add('scrap', 10);

      expect(added).toBe(0);
    });

    it('should detect when resource is full', () => {
      expect(resourceManager.isFull('scrap')).toBe(false);

      resourceManager.add('scrap', 100);
      expect(resourceManager.isFull('scrap')).toBe(true);
    });

    it('should calculate fill percentage correctly', () => {
      resourceManager.add('scrap', 50);

      expect(resourceManager.getFillPercent('scrap')).toBe(0.5);
    });

    it('should allow increasing capacity', () => {
      resourceManager.increaseCapacity('scrap', 50);

      expect(resourceManager.getCapacity('scrap')).toBe(150);
    });

    it('should allow increasing all capacities at once', () => {
      resourceManager.increaseAllCapacity(25);

      expect(resourceManager.getCapacity('scrap')).toBe(125);
      expect(resourceManager.getCapacity('energy')).toBe(125);
      expect(resourceManager.getCapacity('circuits')).toBe(75);
      expect(resourceManager.getCapacity('dataCores')).toBe(50);
    });
  });

  describe('removing resources', () => {
    it('should remove resources from inventory', () => {
      resourceManager.add('scrap', 50);
      const result = resourceManager.remove('scrap', 30);

      expect(result).toBe(true);
      expect(resourceManager.get('scrap')).toBe(20);
    });

    it('should emit resources-changed event when removing', () => {
      resourceManager.add('scrap', 50);
      mockScene.events.clearEmittedEvents();

      resourceManager.remove('scrap', 20);

      const events = mockScene.events.getEmittedEvents('resources-changed');
      expect(events.length).toBe(1);
      expect(events[0].args[0].scrap).toBe(30);
    });

    it('should fail when removing more than available', () => {
      resourceManager.add('scrap', 20);
      const result = resourceManager.remove('scrap', 50);

      expect(result).toBe(false);
      expect(resourceManager.get('scrap')).toBe(20); // Unchanged
    });

    it('should return false for unknown resource types', () => {
      const result = resourceManager.remove('unknown', 10);

      expect(result).toBe(false);
    });
  });

  describe('canAfford checks', () => {
    it('should return true when can afford single resource cost', () => {
      resourceManager.add('scrap', 50);

      expect(resourceManager.canAfford({ scrap: 30 })).toBe(true);
    });

    it('should return false when cannot afford single resource cost', () => {
      resourceManager.add('scrap', 20);

      expect(resourceManager.canAfford({ scrap: 30 })).toBe(false);
    });

    it('should return true when can afford multi-resource cost', () => {
      resourceManager.add('scrap', 50);
      resourceManager.add('energy', 30);
      resourceManager.add('circuits', 10);

      expect(resourceManager.canAfford({
        scrap: 40,
        energy: 20,
        circuits: 5
      })).toBe(true);
    });

    it('should return false when cannot afford any part of multi-resource cost', () => {
      resourceManager.add('scrap', 50);
      resourceManager.add('energy', 10);

      expect(resourceManager.canAfford({
        scrap: 40,
        energy: 20 // Not enough energy
      })).toBe(false);
    });

    it('should return true for empty cost object', () => {
      expect(resourceManager.canAfford({})).toBe(true);
    });
  });

  describe('spend method', () => {
    it('should spend resources when affordable', () => {
      resourceManager.add('scrap', 50);
      resourceManager.add('energy', 30);

      const result = resourceManager.spend({ scrap: 20, energy: 10 });

      expect(result).toBe(true);
      expect(resourceManager.get('scrap')).toBe(30);
      expect(resourceManager.get('energy')).toBe(20);
    });

    it('should not spend any resources when unaffordable', () => {
      resourceManager.add('scrap', 50);
      resourceManager.add('energy', 5);

      const result = resourceManager.spend({ scrap: 20, energy: 10 });

      expect(result).toBe(false);
      expect(resourceManager.get('scrap')).toBe(50); // Unchanged
      expect(resourceManager.get('energy')).toBe(5); // Unchanged
    });
  });

  describe('has method', () => {
    it('should return true when has enough resources', () => {
      resourceManager.add('scrap', 50);

      expect(resourceManager.has('scrap', 30)).toBe(true);
      expect(resourceManager.has('scrap', 50)).toBe(true);
    });

    it('should return false when does not have enough', () => {
      resourceManager.add('scrap', 20);

      expect(resourceManager.has('scrap', 30)).toBe(false);
    });
  });

  describe('getAll method', () => {
    it('should return copy of all resources', () => {
      resourceManager.add('scrap', 50);
      resourceManager.add('energy', 30);

      const all = resourceManager.getAll();

      expect(all.scrap).toBe(50);
      expect(all.energy).toBe(30);
      expect(all.circuits).toBe(0);
      expect(all.dataCores).toBe(0);
    });

    it('should return a copy, not reference', () => {
      const all = resourceManager.getAll();
      all.scrap = 999;

      expect(resourceManager.get('scrap')).toBe(0); // Original unchanged
    });
  });

  describe('serialization', () => {
    it('should serialize current state', () => {
      resourceManager.add('scrap', 50);
      resourceManager.add('energy', 25);
      resourceManager.increaseCapacity('scrap', 50);

      const serialized = resourceManager.serialize();

      expect(serialized.resources.scrap).toBe(50);
      expect(serialized.resources.energy).toBe(25);
      expect(serialized.capacity.scrap).toBe(150);
      expect(serialized.totalCollected.scrap).toBe(50);
    });

    it('should deserialize saved state', () => {
      const savedData = {
        resources: { scrap: 75, energy: 40, circuits: 10, dataCores: 5 },
        capacity: { scrap: 200, energy: 150, circuits: 75, dataCores: 50 },
        totalCollected: { scrap: 100, energy: 60, circuits: 15, dataCores: 5 }
      };

      resourceManager.deserialize(savedData);

      expect(resourceManager.get('scrap')).toBe(75);
      expect(resourceManager.get('energy')).toBe(40);
      expect(resourceManager.getCapacity('scrap')).toBe(200);
      expect(resourceManager.totalCollected.scrap).toBe(100);
    });

    it('should emit events after deserialization', () => {
      resourceManager.deserialize({
        resources: { scrap: 50, energy: 30, circuits: 10, dataCores: 5 }
      });

      const resourceEvents = mockScene.events.getEmittedEvents('resources-changed');
      const capacityEvents = mockScene.events.getEmittedEvents('capacity-changed');

      expect(resourceEvents.length).toBeGreaterThan(0);
      expect(capacityEvents.length).toBeGreaterThan(0);
    });
  });
});
