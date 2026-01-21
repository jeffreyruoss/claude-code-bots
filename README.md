# Claude Code Bots

A Factorio-lite strategy game built with Phaser 3 featuring Claude-themed bots, procedural graphics, and stage-based progression.

![Phaser 3](https://img.shields.io/badge/Phaser-3.90-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **6 Building Types**: Generator, Harvester, Assembler, Research Terminal, Storage Bay, Repair Station
- **4 Resource Types**: Scrap, Energy, Circuits, Data Cores
- **Power System**: Generators produce power, other buildings consume it
- **Automated Harvesting**: Place harvesters adjacent to resource nodes
- **Crafting Recipes**: Transform raw resources into advanced components
- **Research Tree**: Unlock speed bonuses, storage upgrades, and new recipes
- **6-Stage Progression**: Tutorial-style objectives guide you through the game
- **100% Procedural Graphics**: All visuals generated via code (no external assets)
- **Claude Brand Colors**: Orange (#d97757), cream (#faf9f5), and dark (#141413)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/jeffreyruoss/claude-code-bots.git
cd claude-code-bots

# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown in terminal (typically http://localhost:5173)

## How to Play

### Controls
- **Click** toolbar buttons or press **1-6** to select buildings
- **Click** on grid to place selected building
- **Click** resource nodes to manually harvest (when no building selected)
- **ESC** to deselect building
- **Mouse wheel** to zoom
- **Drag** to pan camera
- **Right-click** building to remove (50% resource refund)

### Buildings

| Building | Cost | Power | Description |
|----------|------|-------|-------------|
| Generator | 10 Scrap | +10 | Produces power for all buildings |
| Harvester | 15 Scrap, 5 Energy | -1 | Extracts from adjacent resource nodes |
| Assembler | 20 Scrap, 10 Energy | -2 | Crafts circuits and components |
| Research Terminal | 30 Scrap, 15 Circuits | -3 | Unlocks tech using Data Cores |
| Storage Bay | 25 Scrap | 0 | Increases resource capacity |
| Repair Station | 20 Scrap, 10 Circuits | -2 | Boosts efficiency of nearby buildings |

### Stage Objectives

1. **Boot Sequence** - Build your first Harvester
2. **Power Up** - Generate 50 total Energy
3. **Assembly Line** - Craft 10 Circuits
4. **Research Initiative** - Complete 1 research
5. **Expansion** - Build 5 Harvesters
6. **Open Play** - Sandbox mode, expand freely!

## Tech Stack

- **[Phaser 3](https://phaser.io/)** - Game framework
- **[Vite](https://vitejs.dev/)** - Build tool
- **ES Modules** - Modern JavaScript
- **localStorage** - Game save persistence

## Project Structure

```
src/
├── config/          # Game configuration (buildings, recipes, stages, etc.)
├── entities/        # Game objects (Building, ResourceNode, Bot)
├── graphics/        # Procedural sprite generation
├── scenes/          # Phaser scenes (Boot, Game, UI)
├── services/        # Storage service for save/load
├── systems/         # Game systems (Resources, Production, Research, Stages)
└── main.js          # Entry point
```

## Development

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
```

## License

MIT

---

Built with [Claude Code](https://claude.ai/claude-code)
