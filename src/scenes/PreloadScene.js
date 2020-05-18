import Phaser from 'phaser';
import { DOOR_KEY, PLAYER_KEY, TILEMAP_KEY, TILES_KEY, BACKGROUND_KEY } from './keys';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload-scene');
  }

  preload() {
    this.load.spritesheet(
      PLAYER_KEY,
      'assets/images/cuadrado.png',
      {
        frameWidth: 32,
        frameHeight: 32
      }
    );
    this.load.image(TILES_KEY, 'assets/images/tiles.png');
    this.load.image(DOOR_KEY, 'assets/images/door.png');
    this.load.image(BACKGROUND_KEY, 'assets/images/background.png');
    this.load.tilemapTiledJSON(TILEMAP_KEY, 'assets/tilemaps/level1.json');
    // Load Google Font script
    this.load.script('webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    // Load fonts
    WebFont.load({
      custom: {
        families: ['Pixel Inversions'],
        urls: ['../fonts.css']
      },
      active: () => {
        console.log('Fonts loaded');
        this.scene.start('game-scene');
      }
    });
  }
}
