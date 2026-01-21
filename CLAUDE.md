# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Claude Code Bots** - A web-based Factorio-lite strategy game featuring Claude-themed bots. Built with Phaser 3 + Vite.

See `spec.md` for full game design specification.

## Build Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (hot reload)
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

## Architecture

```
src/
├── main.js                 # Phaser game config, entry point
├── config/                 # Game data definitions (resources, buildings, recipes, research, stages)
├── scenes/                 # Phaser scenes (Boot, Game, UI)
├── systems/                # Game logic managers (Resource, Building, Production, Research, Stage)
├── entities/               # Game objects (Building, ResourceNode, Bot)
├── ui/                     # HUD components (Toolbar, panels, overlays)
├── graphics/               # Procedural sprite generation
└── services/               # StorageService for persistence
```

## Key Design Decisions

- **Global inventory** - No conveyor logistics, all resources in one pool
- **Power required** - All buildings need power from Generators
- **Stage-based progression** - Tutorial stages teach mechanics, then open play
- **Research tree** - Unlocks via Data Cores at Research Terminals
- **Code-generated graphics** - All visuals drawn with Phaser primitives, no external assets

## Visual Style

Claude brand palette:
- Primary: `#d97757` (rust/terra-cotta)
- Background: `#faf9f5` (warm off-white)
- Grid: `#eeece2`
- Text: `#141413`

## StorageService Interface

```javascript
async loadGame()      // Returns saved state or null
async saveGame(state) // Persists current state
async resetGame()     // Clears saved data
```

Currently uses localStorage. Designed for easy Supabase swap later.
