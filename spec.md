# Claude Code Bots - Game Specification

A web-based Factorio-lite strategy game featuring Claude-themed bots. Focus on resource collection, crafting, and automation with a clean, addictive loop.

## Tech Stack

- **Phaser 3** for game engine
- **Vite** for build tooling
- **JavaScript** (ES modules)

## Game Theme: Claude Code Bots

You manage a fleet of friendly bots inspired by the Claude logo. Build and automate a bot factory on an infinite grid world.

### Resources

| Resource | Source | Description |
|----------|--------|-------------|
| **Scrap** | Debris piles | Basic metal for building |
| **Energy Cells** | Energy nodes | Powers buildings and bots |
| **Circuits** | Crafted | Advanced component (scrap + energy) |
| **Data Cores** | Rare nodes | Used for research unlocks |

- Resources go to a **global inventory** (no conveyor logistics)
- Resource nodes are **mostly finite** with **slow regeneration** (prevents soft-lock)

### Buildings

| Building | Function | Cost |
|----------|----------|------|
| **Generator** | Produces power for all buildings | 10 Scrap |
| **Harvester Bot** | Extracts resources from adjacent node | 15 Scrap, 5 Energy |
| **Assembler** | Crafts circuits and components | 20 Scrap, 10 Energy |
| **Research Terminal** | Unlocks new tech using Data Cores | 30 Scrap, 15 Circuits |
| **Storage Bay** | Increases resource capacity | 25 Scrap |
| **Repair Station** | Keeps bots efficient, reduces decay | 20 Scrap, 10 Circuits |

- All buildings **require power** to operate
- Buildings draw from global inventory, output to global inventory

### Recipes

| Output | Inputs | Building |
|--------|--------|----------|
| Circuit | 5 Scrap + 3 Energy | Assembler |
| Advanced Circuit | 3 Circuits + 5 Energy | Assembler |
| Bot Frame | 10 Scrap + 2 Circuits | Assembler |
| Power Core | 5 Energy + 2 Circuits | Assembler |
| Data Core | 10 Circuits + 10 Energy | Research Terminal |

### Research Tree

Unlocks are purchased at Research Terminals using Data Cores:

| Research | Cost | Unlocks |
|----------|------|---------|
| Efficiency I | 1 Data Core | Harvesters +25% speed |
| Storage Upgrade | 1 Data Core | +50 capacity all resources |
| Advanced Assembly | 2 Data Cores | Advanced Circuit recipe |
| Efficiency II | 3 Data Cores | All buildings +25% speed |
| Auto-Repair | 2 Data Cores | Repair Stations unlock |

## Progression: Stages

The game is divided into stages with specific objectives. Each stage teaches mechanics progressively.

### Stage 1: Boot Sequence (Tutorial)
- **Objective:** Build your first Harvester Bot
- Map has pre-placed scrap pile and energy node nearby
- Teaches: clicking nodes, placement, basic UI

### Stage 2: Power Up
- **Objective:** Generate 50 total Energy
- Introduces: Generator requirement, power mechanics

### Stage 3: Assembly Line
- **Objective:** Craft 10 Circuits
- Introduces: Assembler, crafting recipes

### Stage 4: Research Initiative
- **Objective:** Complete your first Research
- Introduces: Research Terminal, Data Cores, tech tree

### Stage 5: Expansion
- **Objective:** Have 5 Harvester Bots running simultaneously
- Introduces: Scaling, efficiency optimization

### Stage 6+: Open Play
- Procedurally generated objectives
- Optimization and expansion sandbox

## Visual Style

### Color Palette (Claude Brand)
- **Primary accent:** `#d97757` (warm rust/terra-cotta)
- **Secondary accent:** `#da7756`
- **Background:** `#faf9f5` (warm off-white)
- **Grid/subtle:** `#eeece2`
- **Text/outlines:** `#141413` (near-black)

### Graphics (Code-Generated)
All graphics drawn with Phaser primitives - no external assets needed.

- **Bots:** Rounded rectangles with orange circular "eye" (Claude logo style)
- **Buildings:** Modular boxes with status lights (green=running, red=no power, yellow=blocked)
- **Resource nodes:** Distinct shapes per type
  - Scrap: Irregular polygon cluster (grays)
  - Energy: Glowing circle (yellow/orange pulse)
  - Data Core: Hexagon (blue/purple)
- **Grid:** Subtle circuit-trace pattern on tiles
- **UI:** Clean panels with rounded corners, minimal text

### Visual Feedback
- Building placement preview (green=valid, red=invalid)
- Production animations (small particles, pulsing)
- Resource floating numbers when collected (+5 Scrap)

## Controls

Mouse-first (keyboard shortcuts optional):

| Input | Action |
|-------|--------|
| Left click (empty) | Place selected building |
| Left click (building) | Select/inspect building |
| Left click (node) | Manual harvest (early game) |
| Right click | Remove building (refund partial cost) |
| Mouse wheel | Zoom in/out |
| Click + drag | Pan camera |
| Number keys 1-6 | Quick-select building type |
| ESC | Deselect / close panel |

## Map

- **Infinite scrolling grid** with camera pan/zoom
- Tile size: 64x64 pixels
- Resource nodes spawn in clusters
- Starting area guaranteed to have scrap + energy nearby
- Fog of war optional (unexplored areas dimmed)

## Architecture

```
src/
├── main.js                 # Phaser game config, entry point
├── config/
│   ├── constants.js        # Colors, sizes, timing values
│   ├── resources.js        # Resource definitions
│   ├── buildings.js        # Building definitions
│   ├── recipes.js          # Crafting recipes
│   ├── research.js         # Tech tree definitions
│   └── stages.js           # Stage objectives
├── scenes/
│   ├── BootScene.js        # Asset loading
│   ├── GameScene.js        # Main gameplay
│   └── UIScene.js          # HUD overlay (runs parallel)
├── systems/
│   ├── ResourceManager.js  # Global inventory
│   ├── BuildingManager.js  # Building placement/updates
│   ├── ProductionSystem.js # Tick-based production logic
│   ├── ResearchManager.js  # Tech tree state
│   └── StageManager.js     # Objectives and progression
├── entities/
│   ├── Building.js         # Building base class
│   ├── ResourceNode.js     # Harvestable nodes
│   └── Bot.js              # Visual bot representation
├── ui/
│   ├── Toolbar.js          # Building selection
│   ├── ResourcePanel.js    # Resource counts display
│   ├── InfoPanel.js        # Selected building details
│   ├── ResearchPanel.js    # Tech tree UI
│   └── StageOverlay.js     # Objective display
├── graphics/
│   └── SpriteFactory.js    # Procedural sprite generation
└── services/
    └── StorageService.js   # Save/load abstraction
```

## Persistence

### StorageService Interface
```javascript
class StorageService {
  async loadGame()           // Returns saved state or null
  async saveGame(state)      // Persists current state
  async resetGame()          // Clears saved data
}
```

### Auto-save Triggers
- Every 30 seconds during gameplay
- On stage completion
- On browser tab blur / page unload

### Saved State Includes
- Resource inventory
- Building positions and states
- Research unlocks
- Current stage and objective progress
- Camera position

## Audio

Silent for initial prototype. Audio system hooks can be added later.

## Build Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (hot reload)
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

## Implementation Notes

### Production Tick
- Game runs production every 1 second (configurable)
- Each building checks: has power? has inputs? → produce output
- Power consumed proportionally by active buildings

### Adding New Content
To add a new resource:
1. Add definition to `config/resources.js`
2. Add sprite generation to `graphics/SpriteFactory.js`
3. Update `ResourceManager.js` if special behavior needed

To add a new building:
1. Add definition to `config/buildings.js`
2. Add production logic to `ProductionSystem.js`
3. Add to toolbar in `ui/Toolbar.js`

### Future: Supabase Migration
Replace `StorageService` implementation:
- `loadGame()` → `supabase.from('saves').select().eq('user_id', id)`
- `saveGame()` → `supabase.from('saves').upsert(state)`
- `resetGame()` → `supabase.from('saves').delete().eq('user_id', id)`

No other files need changes if StorageService interface is maintained.
