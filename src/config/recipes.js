/**
 * Crafting recipes for Claude Code Bots
 */

export const RECIPES = [
  {
    id: 'circuit',
    name: 'Circuit',
    inputs: [
      { resource: 'scrap', amount: 5 },
      { resource: 'energy', amount: 3 }
    ],
    output: 'circuits',
    outputAmount: 1,
    buildingType: 'assembler',
    productionTime: 3000
  },
  {
    id: 'advancedCircuit',
    name: 'Advanced Circuit',
    inputs: [
      { resource: 'circuits', amount: 3 },
      { resource: 'energy', amount: 5 }
    ],
    output: 'advancedCircuits',
    outputAmount: 1,
    buildingType: 'assembler',
    productionTime: 5000
  },
  {
    id: 'botFrame',
    name: 'Bot Frame',
    inputs: [
      { resource: 'scrap', amount: 10 },
      { resource: 'circuits', amount: 2 }
    ],
    output: 'botFrames',
    outputAmount: 1,
    buildingType: 'assembler',
    productionTime: 4000
  },
  {
    id: 'powerCore',
    name: 'Power Core',
    inputs: [
      { resource: 'energy', amount: 5 },
      { resource: 'circuits', amount: 2 }
    ],
    output: 'powerCores',
    outputAmount: 1,
    buildingType: 'assembler',
    productionTime: 4000
  },
  {
    id: 'dataCore',
    name: 'Data Core',
    inputs: [
      { resource: 'circuits', amount: 10 },
      { resource: 'energy', amount: 10 }
    ],
    output: 'dataCores',
    outputAmount: 1,
    buildingType: 'researchTerminal',
    productionTime: 10000
  }
];
