# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Claude Code Bots** - A web-based Factorio-lite strategy game featuring Claude-themed bots. Built with Phaser 3 + Vite. Players manage automated resource harvesting, crafting, and progression through 6 stages.

See `spec.md` for full game design specification.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (hot reload) at http://localhost:3000
npm run dev

# Production build to dist/
npm run build

# Preview production build
npm run preview

# Run unit tests (vitest)
npm test

# Run e2e tests (Playwright)
npm run test:e2e
```

## Architecture Overview

### Core Systems Pattern

The game follows a **systems-based architecture** where managers handle specific domains and communicate through Phaser's event system:

- **ResourceManager** - Global inventory, capacity tracking, spend/add operations
- **BuildingManager** - Building placement, removal, state queries, grid collision
- **ProductionSystem** - Tick-based production loop (1 second intervals), power distribution, harvester/assembler logic
- **ResearchManager** - Tech tree unlocks, applying research bonuses
- **StageManager** - Objective tracking, progression through 6 tutorial stages

### Scene Structure

```
BootScene.js       # Procedural sprite generation (no external assets)
GameScene.js       # Main game loop, systems initialization, input handling
UIScene.js         # HUD overlay (runs parallel to GameScene)
```

### Data Flow

1. **User Input** → GameScene handlers → BuildingManager/ResourceManager
2. **Production Tick** (every 1s) → ProductionSystem.processTick() → Power calculation → Building updates → Resource changes
3. **Resource/State Changes** → Event emission → UI updates in UIScene
4. **Stage Objectives** → StageManager polls systems → Stage completion → Next stage unlock

### Key Design Patterns

- **Global Inventory** - No conveyor logistics, all resources in one pool managed by ResourceManager
- **Power System** - Generators produce +10 power, other buildings consume 1-3 power. If total consumption exceeds generation, ALL non-generator buildings stop working
- **Grid-Based Placement** - 64x64px tiles, buildings check adjacent cells for resource nodes or other buildings
- **Event-Driven UI** - Systems emit events (`resources-changed`, `power-updated`, `building-placed`, etc.), UI listens and updates

## Important Implementation Details

### Power Mechanics
Power is calculated globally each tick in ProductionSystem:
- Total generated = # of generators × 10 × speedMultiplier
- If generated >= consumed, ALL buildings are powered
- If generated < consumed, ALL non-generator buildings lose power (binary on/off)

### Harvester Logic
Harvesters check 4 adjacent cells (orthogonal only) for resource nodes:
- Must be powered
- Must have adjacent harvestable node (node.canHarvest() returns true)
- Must have inventory space (resourceManager.isFull() check)
- Harvest rate: 2 per tick × speedMultiplier

### Building Placement Rules
- Can only place on empty grid cells (BuildingManager checks collision)
- Must afford the cost (ResourceManager.canAfford())
- Right-click removes buildings with 50% resource refund
- Storage Bay buildings increase ALL resource capacity by +50 when placed

### Research System
Research unlocks stored in ResearchManager and persisted in save:
- "Efficiency I" → +25% harvester speed
- "Storage Upgrade" → +50 capacity all resources
- "Efficiency II" → +25% speed to ALL buildings
- Research bonuses apply via event emission: `scene.events.emit('apply-speed-bonus', bonus)`

### Production Tick Phases
ProductionSystem.processTick() runs in strict order:
1. Calculate total power generation
2. Distribute power to buildings (sets building.powered flag)
3. Process generators (always active)
4. Process harvesters (check adjacent nodes)
5. Process assemblers (check recipes and inputs)
6. Process research terminals
7. Process repair stations

### Save/Load System
StorageService uses localStorage currently. State includes:
- Resource inventory and capacity
- Building positions and types
- Research unlocks
- Current stage number
- Total collected resources (for stats)

Auto-save triggers:
- Every 30 seconds (timer in GameScene)
- Stage completion
- Browser tab blur/unload (window.addEventListener in main.js)

## Visual Style

Claude brand palette:
- Primary: `#d97757` (rust/terra-cotta)
- Background: `#faf9f5` (warm off-white)
- Grid: `#eeece2`
- Text: `#141413`

All graphics are **procedurally generated** in `graphics/SpriteFactory.js` using Phaser Graphics primitives. No external image assets.

## Testing

### Unit Tests
Located in `src/__tests__/` using Vitest. Test files include Phaser mocks in `__tests__/mocks/phaserMocks.js`.

### E2E Tests
Located in `e2e/` using Playwright:
- `game-loads.spec.js` - Basic game initialization
- `building-placement.spec.js` - Placement mechanics
- `manual-harvest.spec.js` - Manual harvesting flow

Playwright dev server runs on http://localhost:5173 (configured in playwright.config.js).

## Common Tasks

### Adding a New Resource Type
1. Add definition to `src/config/resources.js`
2. Update ResourceManager initial state (resources, capacity, totalCollected objects)
3. Add sprite generation in `graphics/SpriteFactory.js`
4. Update UI to display the new resource

### Adding a New Building Type
1. Add definition to `src/config/buildings.js` with id, name, cost, powerConsumption
2. Add production logic method to `systems/ProductionSystem.js` (e.g., processNewBuilding())
3. Call new method in ProductionSystem.processTick() phase order
4. Add to toolbar in UIScene or ui/Toolbar.js
5. Add sprite generation in `graphics/SpriteFactory.js`

### Adding a New Recipe
1. Add to `src/config/recipes.js` with inputs, output, building type
2. ProductionSystem.processAssemblers() automatically picks up new recipes

### Modifying Production Timing
Change `TIMING.PRODUCTION_TICK` in `src/config/constants.js` (default: 1000ms)

## File Organization

```
src/
├── config/          # Static game data (buildings, recipes, stages, research)
├── entities/        # Game objects (Building, ResourceNode, Bot classes)
├── graphics/        # SpriteFactory - procedural sprite generation
├── scenes/          # Phaser scenes (Boot, Game, UI)
├── services/        # StorageService for persistence
├── systems/         # Game logic managers (Resources, Production, Research, etc.)
├── ui/              # HUD components (if separated from UIScene)
└── main.js          # Entry point, Phaser config, auto-save listeners
```

## Stage Progression

The game is tutorial-based with 6 stages:
1. **Boot Sequence** - Build first Harvester
2. **Power Up** - Generate 50 total Energy
3. **Assembly Line** - Craft 10 Circuits
4. **Research Initiative** - Complete 1 research
5. **Expansion** - Build 5 Harvesters
6. **Open Play** - Sandbox mode

Stage objectives are checked in StageManager.update() which polls the relevant systems for progress.
