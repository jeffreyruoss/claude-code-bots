/**
 * Stage/progression definitions for Claude Code Bots
 */

export const STAGES = [
  {
    id: 'stage1',
    name: 'Boot Sequence',
    objective: 'Build your first Harvester Bot',
    targetType: 'build',
    targetId: 'harvester',
    targetAmount: 1,
    rewards: {
      scrap: 10,
      energy: 5
    },
    tutorialHints: [
      'Click on resource nodes to manually harvest them',
      'Use the toolbar to select a Harvester Bot',
      'Place the Harvester adjacent to a resource node'
    ]
  },
  {
    id: 'stage2',
    name: 'Power Up',
    objective: 'Generate 50 total Energy',
    targetType: 'collect',
    targetId: 'energy',
    targetAmount: 50,
    rewards: {
      scrap: 20,
      circuits: 5
    },
    tutorialHints: [
      'Build a Generator to power your buildings',
      'Harvesters need power to operate automatically',
      'Place Harvesters near Energy nodes'
    ]
  },
  {
    id: 'stage3',
    name: 'Assembly Line',
    objective: 'Craft 10 Circuits',
    targetType: 'craft',
    targetId: 'circuits',
    targetAmount: 10,
    rewards: {
      energy: 20,
      dataCores: 1
    },
    tutorialHints: [
      'Build an Assembler to craft components',
      'Circuits require 5 Scrap and 3 Energy',
      'Make sure you have enough power for the Assembler'
    ]
  },
  {
    id: 'stage4',
    name: 'Research Initiative',
    objective: 'Complete your first Research',
    targetType: 'research',
    targetId: 'any',
    targetAmount: 1,
    rewards: {
      dataCores: 2,
      circuits: 10
    },
    tutorialHints: [
      'Build a Research Terminal',
      'Research requires Data Cores',
      'Click on the Research Terminal to view available tech'
    ]
  },
  {
    id: 'stage5',
    name: 'Expansion',
    objective: 'Have 5 Harvester Bots running simultaneously',
    targetType: 'build',
    targetId: 'harvester',
    targetAmount: 5,
    rewards: {
      scrap: 50,
      energy: 50,
      circuits: 20
    },
    tutorialHints: [
      'Scale up your resource production',
      'Build more Generators to support additional Harvesters',
      'Optimize your layout for efficiency'
    ]
  },
  {
    id: 'stage6',
    name: 'Open Play',
    objective: 'Continue expanding your bot factory',
    targetType: 'sandbox',
    targetId: null,
    targetAmount: 0,
    rewards: {},
    tutorialHints: [
      'You have completed the tutorial stages',
      'Explore the full tech tree',
      'Optimize and expand your factory'
    ]
  }
];
