import Phaser from 'phaser';
import {
  DOOR_KEY,
  PLAYER_KEY,
  TILES_KEY,
  BACKGROUND_KEY,
  getLevelKey,
  TILED_EXIT_DOOR_LAYER,
  TILED_DOOR_KEY,
  TILED_HORIZONTAL_MOVING_PLATFORMS_LAYER,
  TILED_HORIZONTAL_MOVING_PLATFORM_KEY,
  HORIZONTAL_PLATFORM_KEY,
  TILED_PLATFORMS_LAYER,
  TILED_CHECKPOINTS_LAYER,
  TILED_TILESET_NAME,
} from '../constants';

const PLAYER_SPEED = { x: 200, y: 175 };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
    /**
     * @type {Phaser.Physics.Arcade.Sprite}
     */
    this.player = null;
    /**
     * @type {number}
     */
    this.level = null;
    /**
     * @type {boolean}
     */
    this.transitioningLevel = false;
    /**
     * @type {Array}
     */
    this.levelCheckpoints = [];
  }

  init(data) {
    this.level = data.level || 2;
  }

  create() {
    // Setup level
    const [tilemap, platforms, door, checkpoints, horizontalPlatforms] = this.setupLevel(
      this.level
    );
    this.levelCheckpoints = checkpoints;
    // Create player
    this.player = this.createPlayer(checkpoints[0].x, checkpoints[0].y);
    // Setup collisions with world
    this.player.setCollideWorldBounds(true);
    this.physics.world.checkCollision.up = false;
    this.physics.world.checkCollision.down = false;
    this.physics.world.bounds.width = tilemap.widthInPixels;
    this.physics.world.bounds.height = tilemap.heightInPixels;
    // Setup collisions with platform tiles
    this.physics.add.collider(this.player, platforms);
    // Setup collisions with exit door
    this.physics.add.overlap(this.player, door, this.levelComplete, null, this);
    this.physics.add.collider(
      this.player,
      horizontalPlatforms,
      this.collideMovingPlatform,
      null,
      this
    );

    // Setup input listener
    this.cursors = this.input.keyboard.createCursorKeys();

    // Setup camera
    this.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    this.cameras.main.startFollow(this.player);
  }

  update() {
    if (this.gameOver) {
      return;
    }

    if (this.player.y > this.physics.world.bounds.height) {
      this.playerReset(this.levelCheckpoints[0].x, this.levelCheckpoints[0].y);
      return;
    }

    // If a player is not on a moving platform, reset the onPlatform flag
    if (this.player.onPlatform && !this.player.body.touching.down) {
      this.player.onPlatform = false;
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

    if (
      (this.cursors.space.isDown || this.cursors.up.isDown) &&
      (this.player.body.onFloor() || this.player.onPlatform)
    ) {
      this.player.setVelocityY(-PLAYER_SPEED.y);
    }
  }

  animatePlayer() {
    if (
      this.player.body.velocity.x !== 0 &&
      (this.player.body.onFloor() || this.player.onPlatform)
    ) {
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

  /**
   * Creates a new player, accepting it's start coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  createPlayer(x, y) {
    const player = this.physics.add.sprite(x, y, PLAYER_KEY);
    player.onPlatform = false;

    this.anims.create({
      key: 'idle',
      frames: [{ key: PLAYER_KEY, frame: 0 }],
      frameRate: 2,
    });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1,
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

  setupLevel(level) {
    // Add Tiled level
    const tilemap = this.make.tilemap({ key: getLevelKey(level) });
    // Add background image
    const background = this.add.image(
      tilemap.widthInPixels / 2,
      tilemap.heightInPixels / 2,
      BACKGROUND_KEY
    );
    let scaleX = tilemap.widthInPixels / background.width;
    let scaleY = tilemap.heightInPixels / background.height;
    let scale = Math.max(scaleX, scaleY);
    background.setScale(scale).setScrollFactor(0);

    // Display Tiled level
    const tileset = tilemap.addTilesetImage(TILED_TILESET_NAME, TILES_KEY);
    const platforms = tilemap.createStaticLayer(TILED_PLATFORMS_LAYER, tileset, 0, 0);
    platforms.setCollisionByExclusion(-1, true);

    // Add door
    const [door] = tilemap.createFromObjects(
      TILED_EXIT_DOOR_LAYER,
      TILED_DOOR_KEY,
      { key: DOOR_KEY },
      this
    );
    this.physics.world.enable(door, Phaser.Physics.Arcade.DYNAMIC_BODY);
    door.body.setImmovable(true);
    door.body.allowGravity = false;
    door.setOrigin(0.5, 0.5);

    // Add checkpoints
    const checkpoints = [];
    tilemap.objects.forEach((objectLayer) => {
      if (objectLayer.name.trim() == TILED_CHECKPOINTS_LAYER) {
        objectLayer.objects.forEach((checkpoint) => {
          checkpoints.push(new Phaser.Geom.Point(checkpoint.x, checkpoint.y));
        });
      }
    });

    // Initiate moving platforms
    let horizontalPlatformObjects = tilemap.createFromObjects(
      TILED_HORIZONTAL_MOVING_PLATFORMS_LAYER,
      TILED_HORIZONTAL_MOVING_PLATFORM_KEY,
      { key: HORIZONTAL_PLATFORM_KEY },
      this
    );

    // If the createFromObjects method fails, it returns null
    // We just set it to an empty array to not deal with errors
    if (!horizontalPlatformObjects) {
      horizontalPlatformObjects = [];
    }

    horizontalPlatformObjects.forEach((platform) => {
      this.physics.world.enable(platform, Phaser.Physics.Arcade.DYNAMIC_BODY);
      platform.body.setImmovable(true);
      platform.body.allowGravity = false;
      platform.setOrigin(0.5, 0.5);

      // Add tween for their movement
      this.tweens.add({
        targets: platform,
        x: (platform.data.list[0].value * 32) + platform.x,
        y: platform.y,
        ease: 'Linear',
        duration: Math.abs(platform.data.list[0].value * platform.data.list[2].value),
        delay: platform.data.list[1].value, // Initial pause before firing
        repeatDelay: platform.data.list[1].value, // Pause when the tween yoyos (i.e. comes back to original spot)
        hold: platform.data.list[1].value, // Pause when tween reaches destination
        yoyo: true,
        repeat: -1,
      });
    });

    const horizontalPlatforms = this.physics.add.group(horizontalPlatformObjects);

    return [tilemap, platforms, door, checkpoints, horizontalPlatforms];
  }

  /**
   * Checks if a player is standing on a moving platform so they could jump
   * @param player {Phaser.Physics.Arcade.Sprite}
   * @param movingPlatform {Phaser.Physics.Arcade.Sprite}
   */
  collideMovingPlatform(player, movingPlatform) {
    if (player.body.touching.down) {
      player.onPlatform = true;
    }
  }

  /**
   * Resets players to a position in the game world, relative to the tilemap
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  playerReset(x, y) {
    this.player.setVelocity(0, 0);
    this.player.setFlipX(false);
    this.player.setX(x);
    this.player.setY(y);
    this.player.setAlpha(0);
    const tw = this.tweens.add(this.playerDieTween);
  }

  /**
   * Verifies if a player completed a level, should be split into two functions
   * @param player {Phaser.Physics.Arcade.Sprite}
   * @param exitDoor {Phaser.Physics.Arcade.Sprite}
   */
  levelComplete(player, exitDoor) {
    if (
      player.body.onFloor() &&
      player.y > exitDoor.y &&
      Phaser.Math.Distance.Between(player.x, player.y, exitDoor.x, exitDoor.y) < 18
    ) {
      const levelCompleteText = this.add
        .text(
          this.physics.world.bounds.centerX,
          this.physics.world.bounds.centerY + 40,
          'Level Complete!',
          {
            fontFamily: 'Pixel Inversions',
            fontSize: 44,
            color: '#FFFFFF',
          }
        )
        .setOrigin(0.5);

      this.time.addEvent({
        delay: 1500,
        callback: () => {
          if (!this.transitioningLevel) {
            this.transitioningLevel = true;
            this.cameras.main.on(
              'camerafadeoutcomplete',
              () => {
                this.scene.restart({ level: this.level + 1 });
              },
              this
            );

            this.cameras.main.fadeOut(500, 0, 0, 0, null, this);
          }
        },
      });
    }
  }
}
