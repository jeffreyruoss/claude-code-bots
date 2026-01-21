/**
 * Research tree definitions for Claude Code Bots
 */

export const RESEARCH = [
  {
    id: 'efficiencyI',
    name: 'Efficiency I',
    cost: {
      dataCores: 1
    },
    effect: {
      type: 'harvesterSpeed',
      bonus: 0.25
    },
    requires: [],
    description: 'Harvesters +25% speed'
  },
  {
    id: 'storageUpgrade',
    name: 'Storage Upgrade',
    cost: {
      dataCores: 1
    },
    effect: {
      type: 'storageCapacity',
      bonus: 50
    },
    requires: [],
    description: '+50 capacity all resources'
  },
  {
    id: 'advancedAssembly',
    name: 'Advanced Assembly',
    cost: {
      dataCores: 2
    },
    effect: {
      type: 'unlockRecipe',
      recipeId: 'advancedCircuit'
    },
    requires: [],
    description: 'Advanced Circuit recipe'
  },
  {
    id: 'efficiencyII',
    name: 'Efficiency II',
    cost: {
      dataCores: 3
    },
    effect: {
      type: 'allBuildingsSpeed',
      bonus: 0.25
    },
    requires: ['efficiencyI'],
    description: 'All buildings +25% speed'
  },
  {
    id: 'autoRepair',
    name: 'Auto-Repair',
    cost: {
      dataCores: 2
    },
    effect: {
      type: 'unlockBuilding',
      buildingId: 'repairStation'
    },
    requires: [],
    description: 'Repair Stations unlock'
  }
];
