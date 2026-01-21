import Phaser from 'phaser';
import { COLORS, GAME_CONFIG } from './config/constants.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: COLORS.BACKGROUND,
  scene: [BootScene, GameScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};

const game = new Phaser.Game(config);

// Handle page unload for auto-save
window.addEventListener('beforeunload', () => {
  game.events.emit('save-game');
});

// Handle tab visibility change for auto-save
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.events.emit('save-game');
  }
});
