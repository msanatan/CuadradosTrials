/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2020 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
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
  PARTICLE_KEY,
  COIN_KEY,
  COIN_ICON_KEY,
} from '../constants';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload-scene');
  }

  preload() {
    // Add progress bars
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'LOADING',
      style: {
        font: '32px "Courier New"',
        fill: '#ffffff',
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff',
      },
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      percentText.setText(parseInt(String(value * 100)) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

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
    this.load.image(PARTICLE_KEY, 'assets/images/particle.png');
    this.load.spritesheet(COIN_KEY, 'assets/images/coin.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image(COIN_ICON_KEY, 'assets/images/coin-icon.png');

    for (let i = 1; i < 5; i++) {
      this.load.tilemapTiledJSON(getLevelKey(i), `assets/levels/level${i}.json`);
    }
    // Load Google Font script
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    // Load fonts
    WebFont.load({
      custom: {
        families: ['Pixel Inversions', 'VCR OSD Mono'],
        urls: ['../fonts.css'],
      },
      active: () => {
        console.log('Fonts loaded');
        this.scene.start('game-scene');
        this.scene.start('hud-scene');
        this.scene.bringToTop('hud-scene');
      },
    });
  }
}
