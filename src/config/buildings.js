/**
 * Building definitions for Claude Code Bots
 */

export const BUILDINGS = {
  GENERATOR: {
    id: 'generator',
    name: 'Generator',
    cost: {
      scrap: 10
    },
    powerConsumption: 0,
    productionTime: 1000,
    description: 'Produces power for all buildings',
    size: { width: 1, height: 1 }
  },
  HARVESTER: {
    id: 'harvester',
    name: 'Harvester Bot',
    cost: {
      scrap: 15,
      energy: 5
    },
    powerConsumption: 1,
    productionTime: 2000,
    description: 'Extracts resources from adjacent node',
    size: { width: 1, height: 1 }
  },
  ASSEMBLER: {
    id: 'assembler',
    name: 'Assembler',
    cost: {
      scrap: 20,
      energy: 10
    },
    powerConsumption: 2,
    productionTime: 3000,
    description: 'Crafts circuits and components',
    size: { width: 1, height: 1 }
  },
  RESEARCH_TERMINAL: {
    id: 'researchTerminal',
    name: 'Research Terminal',
    cost: {
      scrap: 30,
      circuits: 15
    },
    powerConsumption: 3,
    productionTime: 5000,
    description: 'Unlocks new tech using Data Cores',
    size: { width: 1, height: 1 }
  },
  STORAGE_BAY: {
    id: 'storageBay',
    name: 'Storage Bay',
    cost: {
      scrap: 25
    },
    powerConsumption: 0,
    productionTime: 0,
    description: 'Increases resource capacity',
    size: { width: 1, height: 1 }
  },
  REPAIR_STATION: {
    id: 'repairStation',
    name: 'Repair Station',
    cost: {
      scrap: 20,
      circuits: 10
    },
    powerConsumption: 2,
    productionTime: 4000,
    description: 'Keeps bots efficient, reduces decay',
    size: { width: 1, height: 1 }
  }
};
