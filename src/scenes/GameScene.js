import Phaser from 'phaser';
import { DOOR_KEY, PLAYER_KEY, TILES_KEY, BACKGROUND_KEY, getLevelKey } from './constants';

const PLAYER_SPEED = { x: 200, y: 175 };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
    /**
     * @type {Phaser.Physics.Arcade.Sprite}
     */
    this.player = null;
    /**
     * @type {Phaser.Tilemaps.Tilemap}
     */
    this.level = null;
  }

  create() {
    // Add Tiled level
    this.level = this.make.tilemap({ key: getLevelKey(1) });
    // Add background image
    const background = this.add.image(
      this.level.widthInPixels / 2,
      this.level.heightInPixels / 2,
      BACKGROUND_KEY
    );
    let scaleX = this.level.widthInPixels / background.width;
    let scaleY = this.level.heightInPixels / background.height;
    let scale = Math.max(scaleX, scaleY);
    background.setScale(scale).setScrollFactor(0);

    // Display Tiled level
    const tileset = this.level.addTilesetImage('Cuadrado\'s Tiles', TILES_KEY);
    const platforms = this.level.createStaticLayer('Platforms', tileset, 0, 0);
    platforms.setCollisionByExclusion(-1, true);

    // Add door
    const [door] = this.level.createFromObjects(
      'ExitDoor', 'Door', { key: DOOR_KEY }, this);
    this.physics.world.enable(door, Phaser.Physics.Arcade.DYNAMIC_BODY);
    door.body.setImmovable(true);
    door.body.allowGravity = false;
    door.setOrigin(0.5, 0.5);

    // Create player
    this.player = this.createPlayer();
    // Setup collisions with world
    this.player.setCollideWorldBounds(true);
    this.physics.world.checkCollision.up = false;
    this.physics.world.checkCollision.down = false;
    // Setup collisions with platform tiles
    this.physics.add.collider(this.player, platforms);
    // Setup collisions with exit door
    this.physics.add.overlap(this.player, door, this.levelComplete,
      null, this);

    // Setup input listener
    this.cursors = this.input.keyboard.createCursorKeys();

    // Setup camera
    this.cameras.main.setBounds(0, 0, this.level.widthInPixels, this.level.heightInPixels);
    this.cameras.main.startFollow(this.player);
  }

  update() {
    if (this.gameOver) {
      return;
    }

    if (this.player.y > this.level.heightInPixels) {
      this.playerReset();
      return;
    }

    this.movePlayer();
    this.animatePlayer();
  }

  movePlayer() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED.x);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED.x);
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.space.isDown || this.cursors.up.isDown) &&
      this.player.body.onFloor()) {
      this.player.setVelocityY(-PLAYER_SPEED.y);
    }
  }

  animatePlayer() {
    if (this.player.body.velocity.x !== 0 && this.player.body.onFloor()) {
      this.player.anims.play('walk', true);
    } else {
      this.player.anims.play('idle', true);
    }

    // Check direction of animations
    if (this.player.body.velocity.x > 0) {
      this.player.setFlipX(false);
    } else if (this.player.body.velocity.x < 0) {
      this.player.setFlipX(true);
    }
  }

  createPlayer() {
    const player = this.physics.add.sprite(50, 656, PLAYER_KEY);

    this.anims.create({
      key: 'idle',
      frames: [{ key: PLAYER_KEY, frame: 0 }],
      frameRate: 2
    });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.playerDieTween = {
      targets: player,
      alpha: 1,
      duration: 100,
      ease: 'Linear',
      repeat: 10,
    };

    return player;
  }

  playerReset() {
    this.player.setVelocity(0, 0);
    this.player.setFlipX(false);
    this.player.setX(50);
    this.player.setY(656);
    this.player.setAlpha(0);
    const tw = this.tweens.add(this.playerDieTween);
  }

  /**
     * @param player {Phaser.Physics.Arcade.Sprite}
     * @param exitDoor {Phaser.Physics.Arcade.Sprite}
     */
  levelComplete(player, exitDoor) {
    if (player.body.onFloor() &&
      player.y > exitDoor.y &&
      Phaser.Math.Distance.Between(player.x, player.y, exitDoor.x, exitDoor.y) < 18) {
      this.scene.pause();

      const levelCompleteText = this.add.text(
        this.physics.world.bounds.centerX,
        this.physics.world.bounds.centerY + 40,
        'Level Complete!',
        {
          fontFamily: 'Pixel Inversions',
          fontSize: 44,
          color: '#FFFFFF',
        }
      ).setOrigin(0.5);
    }
  }
}
