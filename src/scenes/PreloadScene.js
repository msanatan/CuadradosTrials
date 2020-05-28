import Phaser from 'phaser';
import {
  DOOR_KEY,
  PLAYER_KEY,
  TILES_KEY,
  BACKGROUND_KEY,
  getLevelKey,
  HORIZONTAL_PLATFORM_KEY,
  VERTICAL_PLATFORM_KEY,
  SPIKE_KEY,
} from '../constants';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload-scene');
  }

  preload() {
    this.load.spritesheet(PLAYER_KEY, 'assets/images/cuadrado.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image(TILES_KEY, 'assets/images/tiles.png');
    this.load.image(DOOR_KEY, 'assets/images/door.png');
    this.load.image(BACKGROUND_KEY, 'assets/images/background.png');
    this.load.image(HORIZONTAL_PLATFORM_KEY, 'assets/images/horizontalPlatform.png');
    this.load.image(VERTICAL_PLATFORM_KEY, 'assets/images/verticalPlatform.png');
    this.load.image(SPIKE_KEY, 'assets/images/spike.png');

    for (let i = 1; i < 4; i++) {
      this.load.tilemapTiledJSON(getLevelKey(i), `assets/levels/level${i}.json`);
    }
    // Load Google Font script
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    // Load fonts
    WebFont.load({
      custom: {
        families: ['Pixel Inversions'],
        urls: ['../fonts.css'],
      },
      active: () => {
        console.log('Fonts loaded');
        this.scene.start('game-scene');
      },
    });
  }
}
