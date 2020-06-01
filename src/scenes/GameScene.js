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
  getLevelKey,
  TILED_EXIT_DOOR_LAYER,
  TILED_DOOR_KEY,
  TILED_HORIZONTAL_MOVING_PLATFORMS_LAYER,
  TILED_HORIZONTAL_MOVING_PLATFORM_KEY,
  HORIZONTAL_PLATFORM_KEY,
  TILED_PLATFORMS_LAYER,
  TILED_CHECKPOINTS_LAYER,
  TILED_TILESET_NAME,
  TILED_VERTICAL_MOVING_PLATFORMS_LAYER,
  TILED_VERTICAL_MOVING_PLATFORM_KEY,
  VERTICAL_PLATFORM_KEY,
  TILED_PLATFORM_BOUNDARIES_LAYER,
  TILE_SIZE,
  TILE_CORRECTION,
  TILED_SPIKES_LAYER,
  TILED_SPIKES_Key,
  SPIKE_KEY,
  PARTICLE_KEY,
  PARTICLE_COUNT,
  TILED_COINS_LAYER,
  TILED_COIN_KEY,
  COIN_KEY,
  AUDIO_PLAYER_JUMP_KEY,
  AUDIO_PLAYER_DIES_KEY,
  AUDIO_PLAYER_COLLECTS_COIN_KEY,
  AUDIO_LEVEL_COMPLETE_KEY,
} from '../constants';
import { createMovingPlatform } from '../entities/MovingPlatform';
import { createSpike } from '../entities/Spike';
import { createPlayer, PLAYER_SPEED } from '../entities/Player';
import { createCoin } from '../entities/Coin';

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
     * @type {Array<Phaser.Geom.Point>}
     */
    this.levelCheckpoints = [];
    /**
     * @type {number}
     */
    this.timeLimit = 0;
    /**
     * @type {Phaser.Time.TimerEvent}
     */
    this.countDownTimer = null;
    /**
     * @type {boolean}
     */
    this.levelComplete = false;
    /**
     * @type {Phaser.GameObjects.Particles.ParticleEmitterManager}
     */
    this.playerDeathParticles = null;
    /**
     * @type {boolean}
     */
    this.playerRebornAnimation = null;
    /**
     * @type {number}
     */
    this.totalCoinsCollected = 0;
    /**
     * @type {number}
     */
    this.totalPlayerDeaths = 0;
    /**
     * @type {boolean}
     */
    this.finalLevel = false;
    /**
     * @type {boolean}
     */
    this.timeUp = false;
  }

  init(data) {
    this.transitioningLevel = false;
    this.levelComplete = false;
    this.timeUp = false;
    this.level = data.level ? data.level : 1;
    this.playerRebornAnimation = data.died ? data.died : false;
    this.totalCoinsCollected = data.totalCoinsCollected ? data.totalCoinsCollected : 0;
    this.totalPlayerDeaths = data.totalPlayerDeaths ? data.totalPlayerDeaths : 0;
  }

  create() {
    // Setup level
    const [
      tilemap,
      platforms,
      door,
      checkpoints,
      movingPlatforms,
      platformBoundaries,
      spikes,
      coins,
    ] = this.setupLevel(this.level);
    this.levelCheckpoints = checkpoints;
    // Adjust world size based on level
    this.physics.world.bounds.width = tilemap.widthInPixels;
    this.physics.world.bounds.height = tilemap.heightInPixels;

    // Create player
    this.player = createPlayer(checkpoints[0].x, checkpoints[0].y, PLAYER_KEY, this);

    // Setup player collisions with platform tiles
    this.physics.add.collider(this.player, platforms);
    // Setup player collisions with exit door
    this.physics.add.overlap(this.player, door, this.checkLevelComplete, null, this);
    // Setup player collisions with spikes
    this.physics.add.collider(this.player, spikes, this.playerHit, null, this);
    // Setup player collisions with moving platforms
    this.physics.add.collider(this.player, movingPlatforms, this.collideMovingPlatform, null, this);
    // Setup player collisions with coins
    this.physics.add.overlap(this.player, coins, this.collectCoin, null, this);

    // Setup collisions between moving platforms and the invisible platform boundaries
    this.physics.add.collider(
      movingPlatforms,
      platformBoundaries,
      this.collidePlatformBoundaries,
      null,
      this
    );

    // Setup collisions between moving platforms and the static platforms
    this.physics.add.collider(
      movingPlatforms,
      platforms,
      this.collidePlatformBoundaries,
      null,
      this
    );

    // Setup input listener
    this.cursors = this.input.keyboard.createCursorKeys();

    // Setup camera
    this.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBackgroundColor('#cbdbfc');

    // Add particles for player death
    this.playerDeathParticles = this.add.particles(PARTICLE_KEY);

    // Emit particles
    this.playerDeathParticleEmitter = this.playerDeathParticles.createEmitter({
      x: this.player.x,
      y: this.player.y,
      blendMode: 'ADD',
      speed: 50,
      lifespan: 1000,
      scale: { start: 1, end: 0 },
      on: false,
    });

    // Initiate countdown timer for level
    this.countDownTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTime,
      callbackScope: this,
      loop: true,
    });

    if (this.playerRebornAnimation) {
      this.player.setAlpha(0);
      const tw = this.tweens.add({
        targets: this.player,
        alpha: 1,
        duration: 100,
        ease: 'Linear',
        repeat: 10,
      });
    }
  }

  update() {
    if (this.player.y > this.physics.world.bounds.height && !this.player.died) {
      this.playerDieAndReset(false);
      return;
    }

    // If time's up, restart the level
    if (this.timeUp && !this.player.died) {
      this.playerDieAndReset(true);
      return;
    }

    this.movePlayer();
    this.animatePlayer();

    // Reset these flags if a player moved off a platform
    if (
      this.player.onPlatform &&
      !this.player.body.touching.down &&
      !this.player.movingPlatform.body.touching.up
    ) {
      this.player.onPlatform = false;
      this.player.movingPlatform = null;
      this.player.body.setGravityY(0);
    }
  }

  updateTime() {
    const timeRemaining = this.registry.get('timeRemaining');
    if (timeRemaining && !this.levelComplete && !this.player.died && timeRemaining > 0) {
      this.registry.set('timeRemaining', timeRemaining - 1);
    }

    if (timeRemaining <= 0) {
      this.timeUp = true;
    }
  }

  movePlayer() {
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-PLAYER_SPEED.x);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(PLAYER_SPEED.x);
    } else {
      this.player.body.setVelocityX(0);
    }

    if (this.cursors.space.isDown && (this.player.body.onFloor() || this.player.onPlatform)) {
      // Reset platform flags when jumping
      this.player.onPlatform = false;
      this.player.movingPlatform = null;
      this.player.body.setGravityY(0);

      this.sound.play(AUDIO_PLAYER_JUMP_KEY);
      this.player.body.setVelocityY(-PLAYER_SPEED.y);
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
   * Reset level if player hits a spike
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Phaser.Physics.Arcade.Sprite} spike
   */
  playerHit(player, spike) {
    this.playerDieAndReset(false);
  }

  /**
   *
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Phaser.Physics.Arcade.Sprite} coin
   */
  collectCoin(player, coin) {
    this.sound.play(AUDIO_PLAYER_COLLECTS_COIN_KEY);
    // Update count of coins collected this level
    this.registry.set('coinsCollected', this.registry.get('coinsCollected') + 1);
    // TODO: play sound and effect for coin
    coin.disableBody(true, true);
  }

  setupLevel(level) {
    // Add Tiled level
    const tilemap = this.make.tilemap({ key: getLevelKey(level) });

    // Determine whether this is the last level of the game or not
    this.finalLevel = tilemap.properties[0].value;

    // Set time limit for level
    this.registry.set('timeRemaining', tilemap.properties[1].value);

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

    door.setOrigin(0.5, 0.5);
    this.physics.world.enable(door, Phaser.Physics.Arcade.DYNAMIC_BODY);
    door.body.setImmovable(true);
    door.body.setAllowGravity(false);

    // Add checkpoints
    const checkpoints = [];
    const boundaryObjects = [];
    let scene = this;
    tilemap.objects.forEach((objectLayer) => {
      if (objectLayer.name.trim() == TILED_CHECKPOINTS_LAYER) {
        objectLayer.objects.forEach((checkpoint) => {
          checkpoints.push(new Phaser.Geom.Point(checkpoint.x, checkpoint.y));
        });
      } else if (objectLayer.name.trim() == TILED_PLATFORM_BOUNDARIES_LAYER) {
        objectLayer.objects.forEach((boundary) => {
          let rectangle = scene.add.rectangle(boundary.x, boundary.y, TILE_SIZE, TILE_SIZE);

          rectangle.setOrigin(0.5, 0.5);
          scene.physics.world.enable(rectangle, Phaser.Physics.Arcade.STATIC_BODY);
          boundaryObjects.push(rectangle);
        });
      }
    });

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
      createMovingPlatform(platform, this);
    });

    let verticalPlatformObjects = tilemap.createFromObjects(
      TILED_VERTICAL_MOVING_PLATFORMS_LAYER,
      TILED_VERTICAL_MOVING_PLATFORM_KEY,
      { key: VERTICAL_PLATFORM_KEY },
      this
    );

    // If the createFromObjects method fails, it returns null
    // We just set it to an empty array to not deal with errors
    if (!verticalPlatformObjects) {
      verticalPlatformObjects = [];
    }

    verticalPlatformObjects.forEach((platform) => {
      createMovingPlatform(platform, this);
    });

    const movingPlatforms = this.physics.add
      .group(horizontalPlatformObjects)
      .addMultiple(verticalPlatformObjects);

    const platformBoundaries = this.physics.add.staticGroup(boundaryObjects);

    let spikeObjects = tilemap.createFromObjects(
      TILED_SPIKES_LAYER,
      TILED_SPIKES_Key,
      { key: SPIKE_KEY },
      this
    );

    // If the createFromObjects method fails, it returns null
    // We just set it to an empty array to not deal with errors
    if (!spikeObjects) {
      spikeObjects = [];
    }

    spikeObjects.forEach((spike) => {
      createSpike(spike, this);
    });

    const spikes = this.physics.add.group(spikeObjects);

    let coinObjects = tilemap.createFromObjects(
      TILED_COINS_LAYER,
      TILED_COIN_KEY,
      { key: COIN_KEY },
      this
    );

    coinObjects.forEach((coin) => {
      createCoin(coin, this);
    });

    const coins = this.physics.add.group(coinObjects);
    this.registry.set('totalCoins', coinObjects.length);
    this.registry.set('coinsCollected', 0);

    return [
      tilemap,
      platforms,
      door,
      checkpoints,
      movingPlatforms,
      platformBoundaries,
      spikes,
      coins,
    ];
  }

  /**
   * Checks if a player is standing on a moving platform so they could jump
   * @param player {Phaser.Physics.Arcade.Sprite}
   * @param movingPlatform {Phaser.Physics.Arcade.Sprite}
   */
  collideMovingPlatform(player, movingPlatform) {
    if (player.body.touching.down && !player.onPlatform) {
      player.onPlatform = true;
      player.movingPlatform = movingPlatform;
      player.body.setGravityY(10000);
    }
  }

  /**
   * Checks if a player is standing on a moving platform so they could jump
   * @param platform {Phaser.Physics.Arcade.Sprite}
   * @param boundary {Phaser.Physics.Arcade.Sprite}
   */
  collidePlatformBoundaries(platform, boundary) {
    if (!platform.justHitBoundary) {
      platform.body.stop();
      platform.justHitBoundary = true;
      // The movement of the platform makes the player jump when they collide
      // This ensures the player does not go further
      if (this.player.onPlatform) {
        this.player.body.setVelocityY(0);
      }

      // When colliding with other objects, the edges meet. This makes the object
      // look misaligned with other tiles. So we make a correction if a moving
      // platform collides with a body (it's not needed with static tiles)
      if (boundary instanceof Phaser.GameObjects.Rectangle) {
        if (boundary.body.touching.down) {
          platform.y = boundary.body.bottom + TILE_CORRECTION + platform.height / 2;
        } else if (boundary.body.touching.up) {
          platform.y = boundary.body.top - TILE_CORRECTION - platform.height / 2;
        }

        if (boundary.body.touching.right) {
          platform.x = boundary.body.right + TILE_CORRECTION + platform.width / 2;
        } else if (boundary.body.touching.left) {
          platform.x = boundary.body.left - TILE_CORRECTION - platform.width / 2;
        }
      }

      // If we wanted to platform to go back and forth without delay, we would
      // have likely set bounce to 1. Since we have a delay, we use a timer
      let holdTimer = this.time.addEvent({
        delay: platform.getHold(),
        callback: () => {
          platform.toggleSpeed();
          platform.body.setVelocity(platform.getSpeedX(), platform.getSpeedY());
          platform.justHitBoundary = false;
        },
      });
    }
  }

  /**
   * @param {boolean} showTimeUpMessage
   */
  playerDieAndReset(showTimeUpMessage) {
    // Turn on death flag
    this.player.died = true;
    // Play death sound
    this.sound.play(AUDIO_PLAYER_DIES_KEY);
    // Add 1 to the total player death count
    this.totalPlayerDeaths += 1;
    // Emit particles
    this.playerDeathParticles.emitParticleAt(this.player.x, this.player.y, PARTICLE_COUNT);
    // Stop player boyd
    this.player.body.setVelocity(0, 0);
    this.player.disableBody(true, true);

    // Display "Time's Up" message when time reaches 0
    if (showTimeUpMessage) {
      const timeUpText = this.add.text(
        this.cameras.main.worldView.centerX,
        this.cameras.main.worldView.centerY - 100,
        "Time's Up!",
        {
          fontFamily: 'Pixel Inversions',
          fontSize: 44,
          color: '#FFFFFF',
        }
      );
      timeUpText.setOrigin(0.5, 0.5);
    }

    // Fade scene and reset it
    this.fadeToScene(2000, 1000, {
      level: this.level,
      died: true,
      totalPlayerDeaths: this.totalPlayerDeaths,
      totalCoinsCollected: this.totalCoinsCollected,
    });
  }

  /**
   * Fades to another scene, mostly itself
   * @param {number} timerDelay
   * @param {number} cameraFadeTime
   * @param {Object} sceneData
   */
  fadeToScene(timerDelay, cameraFadeTime, sceneData) {
    const hudScene = this.scene.get('hud-scene');

    this.time.addEvent({
      delay: timerDelay,
      callback: () => {
        if (!this.transitioningLevel) {
          this.transitioningLevel = true;
          this.cameras.main.on(
            'camerafadeoutcomplete',
            () => {
              this.scene.restart(sceneData);
              hudScene.scene.restart();
            },
            this
          );

          this.cameras.main.fadeOut(cameraFadeTime, 0, 0, 0, null, this);
          hudScene.cameras.main.fadeOut(cameraFadeTime, 0, 0, 0, null, this);
        }
      },
    });
  }

  /**
   * Verifies if a player completed a level, should be split into two functions
   * @param player {Phaser.Physics.Arcade.Sprite}
   * @param exitDoor {Phaser.Physics.Arcade.Sprite}
   */
  checkLevelComplete(player, exitDoor) {
    if (
      player.body.onFloor() &&
      player.y > exitDoor.y &&
      Phaser.Math.Distance.Between(player.x, player.y, exitDoor.x, exitDoor.y) < 18 &&
      !this.levelComplete
    ) {
      this.levelComplete = true;
      this.sound.play(AUDIO_LEVEL_COMPLETE_KEY);
      this.totalCoinsCollected += this.registry.get('coinsCollected');

      if (this.finalLevel) {
        const hudScene = this.scene.get('hud-scene');
        hudScene.scene.stop();
        this.scene.start('game-complete-scene', {
          totalCoins: 8,
          totalCoinsCollected: this.totalCoinsCollected,
          totalPlayerDeaths: this.totalPlayerDeaths,
        });

        return;
      }

      const levelCompleteText = this.add.text(
        this.cameras.main.worldView.centerX,
        this.cameras.main.worldView.centerY - 100,
        'Level Complete!',
        {
          fontFamily: 'Pixel Inversions',
          fontSize: 44,
          color: '#FFFFFF',
        }
      );
      levelCompleteText.setOrigin(0.5, 0.5);

      this.fadeToScene(1500, 500, {
        level: this.level + 1,
        totalCoinsCollected: this.totalCoinsCollected,
        totalPlayerDeaths: this.totalPlayerDeaths,
      });
    }
  }
}
