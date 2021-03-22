/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import { TITLE_BACKGROUND_KEY, PLAYER_KEY, AUDIO_MENU_SELECT_KEY } from '../constants';
import Player from '../entities/Player';

export default class TitleScene extends Phaser.Scene {
  transitioningScene: boolean = false;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys = null;

  constructor() {
    super('title-scene');
  }

  create(): void {
    const backgroundImage = this.add.image(0, 0, TITLE_BACKGROUND_KEY);
    backgroundImage.setOrigin(0, 0);

    // Add title text
    const certificateText = this.add.text(400, 75, "CUADRADO'S TRIALS", {
      fontFamily: 'Minecraft',
      fontSize: '6em',
      color: '#d95763',
    });
    certificateText.setOrigin(0.5, 0.5);

    // Add play moving animation
    const player = new Player(this, 400, 328, PLAYER_KEY);
    this.anims.create({
      key: 'playerWalk',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 1 }),
      frameRate: 10
    });
    player.body.setAllowGravity(false);
    player.anims.play({ key: 'playerWalk', repeat: -1 }, true);

    // Add text to tell player to press Spacebar to start
    const beginText = this.add.text(400, 554, 'PRESS <SPACE> TO BEGIN', {
      fontFamily: 'Minecraft',
      fontSize: '2em',
      color: '#FFFFFF',
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
  }

  update(): void {
    if (this.cursors.space.isDown && !this.transitioningScene) {
      this.transitioningScene = true;
      this.sound.play(AUDIO_MENU_SELECT_KEY);
      this.startGame();
    }
  }

  startGame(): void {
    this.cameras.main.fadeOut(1000, 0, 0, 0, null, this);
    this.cameras.main.on(
      'camerafadeoutcomplete',
      () => {
        this.scene.start('game-scene');
        this.scene.start('hud-scene');
        this.scene.bringToTop('hud-scene');
      },
      this
    );
  }
}
