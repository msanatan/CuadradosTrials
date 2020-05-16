import Phaser from 'phaser';

const PLAYER_KEY = 'player';
const DOOR_KEY = 'door';
const TILES_KEY = 'tiles';
const TILEMAP_KEY = 'tilemap';
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
    this.load.image(DOOR_KEY, 'assets/images/door.png');
    this.load.tilemapTiledJSON(TILEMAP_KEY, 'assets/tilemaps/level1.json');
  }

  create() {
    this.level = this.make.tilemap({ key: TILEMAP_KEY });
    const tileset = this.level.addTilesetImage('Cuadrado Tiles', TILES_KEY);
    const platforms = this.level.createStaticLayer('Platforms', tileset, 0, 0);
    platforms.setCollisionByExclusion(-1, true);

    // Add door
    const [door] = this.level.createFromObjects(
      'DoorLayer', 3, { key: DOOR_KEY }, this);
    this.physics.world.enable(door, Phaser.Physics.Arcade.STATIC_BODY);

    // Create player
    this.player = this.createPlayer();
    this.player.setCollideWorldBounds(true);
    this.physics.world.checkCollision.up = false;
    this.physics.world.checkCollision.down = false;
    this.physics.add.collider(this.player, platforms);

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
    this.player.setY(672);
    this.player.setAlpha(0);
    const tw = this.tweens.add(this.playerDieTween);
  }
}
