import Phaser from 'phaser';

const PLAYER_KEY = 'player';
const TILES_KEY = 'tiles';
const TILEMAP_KEY = 'tilemap';
const PLAYER_SPEED = { x: 200, y: 175 };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
    /**
     * @type {Phaser.Physics.Arcade. Sprite}
     */
    this.player = null;
    this.gameOver = false;
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
    this.load.tilemapTiledJSON(TILEMAP_KEY, 'assets/tilemaps/level1.json');
  }

  create() {
    const level = this.make.tilemap({ key: TILEMAP_KEY });
    const tileset = level.addTilesetImage('Cuadrado Tiles', TILES_KEY);
    const platforms = level.createStaticLayer('Platforms', tileset, 0, 0);
    platforms.setCollisionByExclusion(-1, true);

    this.player = this.createPlayer();
    this.physics.add.collider(this.player, platforms);

    // Setup input listener
    this.cursors = this.input.keyboard.createCursorKeys();

    // Setup camera
    this.cameras.main.setBounds(0, 0, level.widthInPixels, level.heightInPixels);
    this.cameras.main.startFollow(this.player);
  }

  update() {
    if (this.gameOver) {
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
    const player = this.physics.add.sprite(50, 672, PLAYER_KEY);

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

    return player;
  }
}
