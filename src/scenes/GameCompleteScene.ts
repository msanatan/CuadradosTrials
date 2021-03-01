/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import {
  CERTIFICATE_BACKGROUND_KEY,
  CUADRADO_BIG_KEY,
  AUDIO_GAME_COMPLETE_KEY,
  AUDIO_MENU_SELECT_KEY,
} from '../constants';

export default class GameCompleteScene extends Phaser.Scene {
  constructor() {
    super('game-complete-scene');
  }

  init(data: object): void {
    this.totalCoins = data.totalCoins;
    this.totalCoinsCollected = data.totalCoinsCollected;
    this.totalPlayerDeaths = data.totalPlayerDeaths;
    this.transitioningScene = false;
  }

  create(): void {
    // Load background with borders
    const backgroundImage = this.add.image(0, 0, CERTIFICATE_BACKGROUND_KEY);
    backgroundImage.setOrigin(0, 0);

    // Add certificate text
    const certificateText = this.add.text(400, 150, 'CERTIFICATE', {
      fontFamily: 'Minecraft',
      fontSize: '7em',
      color: '#d95763',
    });
    certificateText.setOrigin(0.5, 0.5);

    const subtitleText = this.add.text(
      400,
      200,
      'Congratulations little Cuadrado on Completion of the Super Robot Trials!',
      {
        fontFamily: 'Minecraft',
        fontSize: '1.75em',
        color: '#000000',
      }
    );
    subtitleText.setOrigin(0.5, 0.5);

    // Image of Cuadrado on the left
    const bigCuadradoImage = this.add.image(200, 375, CUADRADO_BIG_KEY);
    bigCuadradoImage.setOrigin(0.5, 0.5);

    // Total number of coins collected and deaths on the right
    const totalCoinsText = this.add.text(
      350,
      350,
      `COINS COLLECTED: ${this.totalCoinsCollected} / ${this.totalCoins}`,
      {
        fontFamily: 'Minecraft',
        fontSize: '2.5em',
        color: '#000000',
      }
    );
    totalCoinsText.setOrigin(0, 0);

    const totalDeathsText = this.add.text(350, 380, `# OF DEATHS: ${this.totalPlayerDeaths}`, {
      fontFamily: 'Minecraft',
      fontSize: '2.5em',
      color: '#000000',
    });
    totalDeathsText.setOrigin(0, 0);

    // Add text to restart game
    const beginText = this.add.text(400, 552, 'PRESS <SPACE> TO RETURN TO TITLE SCREEN', {
      fontFamily: 'Minecraft',
      fontSize: '2em',
      color: '#0000000',
    });
    beginText.setOrigin(0.5, 0.5);

    // Make text blink to attract attention
    beginText.setAlpha(0);
    const tw = this.tweens.add({
      targets: beginText,
      alpha: 1,
      duration: 1000,
      ease: 'Linear',
      repeat: -1,
      yoyo: true,
    });

    // Setup input listener
    this.cursors = this.input.keyboard.createCursorKeys();

    // Play game complete song
    this.sceneMusic = this.sound.add(AUDIO_GAME_COMPLETE_KEY, {
      loop: true,
    });
    this.sceneMusic.play();
  }

  update(): void {
    if (this.cursors.space.isDown && !this.transitioningScene) {
      this.transitioningScene = true;
      this.sceneMusic.stop();
      this.sound.play(AUDIO_MENU_SELECT_KEY);
      this.restartGame();
    }
  }

  restartGame(): void {
    this.cameras.main.fadeOut(1000, 0, 0, 0, null, this);
    this.cameras.main.on(
      'camerafadeoutcomplete',
      () => {
        this.scene.start('title-scene');
      },
      this
    );
  }
}
