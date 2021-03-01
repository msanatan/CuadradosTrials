/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import {
  DOOR_KEY,
  PLAYER_KEY,
  TILES_KEY,
  getLevelKey,
  TILED_EXIT_DOOR_LAYER,
  TILED_HORIZONTAL_MOVING_PLATFORMS_LAYER,
  HORIZONTAL_PLATFORM_KEY,
  TILED_PLATFORMS_LAYER,
  TILED_CHECKPOINTS_LAYER,
  TILED_TILESET_NAME,
  TILED_VERTICAL_MOVING_PLATFORMS_LAYER,
  VERTICAL_PLATFORM_KEY,
  TILED_PLATFORM_BOUNDARIES_LAYER,
  TILE_SIZE,
  TILED_SPIKES_LAYER,
  SPIKE_KEY,
  PARTICLE_KEY,
  PARTICLE_COUNT,
  TILED_COINS_LAYER,
  COIN_KEY,
  AUDIO_PLAYER_JUMP_KEY,
  AUDIO_PLAYER_DIES_KEY,
  AUDIO_PLAYER_COLLECTS_COIN_KEY,
  AUDIO_LEVEL_COMPLETE_KEY,
} from '../constants';
import MovingPlatform from '../entities/MovingPlatform';
import Spike from '../entities/Spike';
import Player from '../entities/Player';
import Coin from '../entities/Coin';

export default class GameScene extends Phaser.Scene {
  finalLevel: boolean = false;
  level: number = 1;
  levelComplete: boolean = false;
  totalCoinsCollected: number = 0;
  totalPlayerDeaths: number = 0;
  timeLimit: number = 0;
  transitioningLevel: boolean = false;
  timeUp: boolean = false;
  playerRebornAnimation: boolean = false;
  player: Player = null;
  PLAYER_SPEED = { x: 200, y: 200 };
  levelCheckpoints: Array<Phaser.Geom.Point> = [];
  countDownTimer: Phaser.Time.TimerEvent = null;
  playerDeathParticles: Phaser.GameObjects.Particles.ParticleEmitterManager = null;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys = null;

  constructor() {
    super('game-scene');
  }

  init(data: object): void {
    this.transitioningLevel = false;
    this.levelComplete = false;
    this.timeUp = false;
    this.level = data.level ? data.level : 1;
    this.playerRebornAnimation = data.died ? data.died : false;
    this.totalCoinsCollected = data.totalCoinsCollected ? data.totalCoinsCollected : 0;
    this.totalPlayerDeaths = data.totalPlayerDeaths ? data.totalPlayerDeaths : 0;
  }

  create(): void {
    this.setupAnimations();

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
    this.physics.world.checkCollision.up = false;
    this.physics.world.checkCollision.down = false;

    // Create player
    this.player = new Player(this, checkpoints[0].x, checkpoints[0].y, PLAYER_KEY);

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

  update(): void {
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

  updateTime(): void {
    const timeRemaining = this.registry.get('timeRemaining');
    if (timeRemaining && !this.levelComplete && !this.player.died && timeRemaining > 0) {
      this.registry.set('timeRemaining', timeRemaining - 1);
    }

    if (timeRemaining <= 0) {
      this.timeUp = true;
    }
  }

  movePlayer(): void {
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-this.PLAYER_SPEED.x);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(this.PLAYER_SPEED.x);
    } else {
      this.player.body.setVelocityX(0);
    }

    if (this.cursors.space.isDown && (this.player.body.onFloor() || this.player.onPlatform)) {
      // Reset platform flags when jumping
      this.player.onPlatform = false;
      this.player.movingPlatform = null;
      this.player.body.setGravityY(0);

      this.sound.play(AUDIO_PLAYER_JUMP_KEY);
      this.player.body.setVelocityY(-this.PLAYER_SPEED.y);
    }
  }

  animatePlayer(): void {
    if (
      this.player.body.velocity.x !== 0 &&
      (this.player.body.onFloor() || this.player.onPlatform)
    ) {
      this.player.play({ key: 'playerWalk' });
    } else {
      this.player.play({ key: 'playerIdle' });
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
   * @param player
   * @param spike
   */
  playerHit(player: Player, spike: Spike): void {
    this.playerDieAndReset(false);
  }

  /**
   *
   * @param player
   * @param coin
   */
  collectCoin(player: Player, coin: Coin): void {
    this.sound.play(AUDIO_PLAYER_COLLECTS_COIN_KEY);
    // Update count of coins collected this level
    this.registry.set('coinsCollected', this.registry.get('coinsCollected') + 1);
    // TODO: play sound and effect for coin
    coin.disableBody(true, true);
  }

  setupLevel(level: number): any[] {
    // Add Tiled level
    const tilemap = this.make.tilemap({ key: getLevelKey(level) });

    // Determine whether this is the last level of the game or not
    this.finalLevel = tilemap.properties[0].value;

    // Set time limit for level
    this.registry.set('timeRemaining', tilemap.properties[1].value);

    // Display Tiled level
    const tileset = tilemap.addTilesetImage(TILED_TILESET_NAME, TILES_KEY);
    const platforms = tilemap.createLayer(TILED_PLATFORMS_LAYER, tileset, 0, 0);
    platforms.setCollisionByExclusion([-1], true);

    // Add door
    let door = null;
    tilemap.getObjectLayer(TILED_EXIT_DOOR_LAYER)?.objects.forEach((doorObject) => {
      const tiledWorldPositions = platforms.tileToWorldXY(doorObject.x, doorObject.y);
      door = this.physics.add.sprite(doorObject.x, doorObject.y, DOOR_KEY);
    });
    door.setOrigin(0, 1);
    door.body.setImmovable(true);
    door.body.setAllowGravity(false);

    // Add checkpoints
    const checkpoints = [];
    tilemap.getObjectLayer(TILED_CHECKPOINTS_LAYER)?.objects.forEach((checkpoint) => {
      checkpoints.push(new Phaser.Geom.Point(checkpoint.x, checkpoint.y));
    });

    const boundaryObjects = [];
    tilemap.getObjectLayer(TILED_PLATFORM_BOUNDARIES_LAYER)?.objects.forEach((boundary) => {
      let rectangle = this.add.rectangle(boundary.x, boundary.y, TILE_SIZE, TILE_SIZE);
      rectangle.setOrigin(0.5, 0.5);
      this.physics.world.enable(rectangle, Phaser.Physics.Arcade.STATIC_BODY);
      boundaryObjects.push(rectangle);
    });

    // Add moving platforms, if any
    const movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true,
      classType: MovingPlatform,
      frictionX: 1,
      frictionY: 1,
      bounceX: 0,
      bounceY: 0
    });

    tilemap.getObjectLayer(TILED_HORIZONTAL_MOVING_PLATFORMS_LAYER)?.objects.forEach((platformObject) => {
      movingPlatforms.add(new MovingPlatform(this, platformObject, HORIZONTAL_PLATFORM_KEY));
    });

    tilemap.getObjectLayer(TILED_VERTICAL_MOVING_PLATFORMS_LAYER)?.objects.forEach((platformObject) => {
      movingPlatforms.add(new MovingPlatform(this, platformObject, VERTICAL_PLATFORM_KEY));
    });

    // Set velocity in this loop as it's different for every moving platform
    Phaser.Actions.Call(movingPlatforms.getChildren(), (mp) => {
      let platform = mp as MovingPlatform;
      platform.body.setVelocity(platform.speedX, platform.speedY);
    }, this);

    const platformBoundaries = this.physics.add.staticGroup(boundaryObjects);

    // Add spikes
    const spikes = this.physics.add.group({
      allowGravity: false,
      immovable: true,
      classType: Spike
    });

    spikes.addMultiple(tilemap.createFromObjects(TILED_SPIKES_LAYER, {
      key: SPIKE_KEY
    }));

    // Add coins
    const coins = this.physics.add.group({
      allowGravity: false,
      immovable: true,
      classType: Coin
    });

    tilemap.getObjectLayer(TILED_COINS_LAYER).objects.forEach((coinObject) => {
      coins.create(coinObject.x, coinObject.y, COIN_KEY);
    });
    coins.playAnimation('coinShine');

    this.registry.set('totalCoins', coins.getChildren().length);
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
   * @param player
   * @param movingPlatform
   */
  collideMovingPlatform(player: Player, movingPlatform: MovingPlatform): void {
    if (player.body.touching.down && !player.onPlatform) {
      player.onPlatform = true;
      player.movingPlatform = movingPlatform;
      player.body.setGravityY(10000);
    }
  }

  /**
   * Checks if a player is standing on a moving platform so they could jump
   * @param platform
   * @param boundary
   */
  collidePlatformBoundaries(platform: MovingPlatform, boundary: Phaser.GameObjects.Rectangle): void {
    if (!platform.justHitBoundary) {
      platform.body.stop();
      platform.justHitBoundary = true;
      // The movement of the platform makes the player jump when they collide
      // This ensures the player does not go further
      if (this.player.onPlatform) {
        this.player.body.setVelocityY(0);
      }

      // If we wanted to platform to go back and forth without delay, we would
      // have likely set bounce to 1. Since we have a delay, we use a timer
      let holdTimer = this.time.delayedCall(platform.hold, () => {
        platform.toggleSpeed();
        platform.body.setVelocity(platform.speedX, platform.speedY);
        platform.justHitBoundary = false;
      }, [], this);
    }
  }

  /**
   * @param showTimeUpMessage
   */
  playerDieAndReset(showTimeUpMessage: boolean): void {
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
          fontSize: '4em',
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
   * @param timerDelay
   * @param cameraFadeTime
   * @param sceneData
   */
  fadeToScene(timerDelay: number, cameraFadeTime: number, sceneData: object): void {
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
   * @param player
   * @param exitDoor
   */
  checkLevelComplete(player: Player, exitDoor: Phaser.Physics.Arcade.Sprite): void {
    if (
      player.body.onFloor() &&
      Phaser.Math.Distance.Between(player.x, player.y, exitDoor.x, exitDoor.y) < 26 &&
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
          fontSize: '4em',
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

  setupAnimations(): void {
    this.anims.create({
      key: 'coinShine',
      frames: this.anims.generateFrameNumbers(COIN_KEY, { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'playerIdle',
      frames: [{ key: PLAYER_KEY, frame: 0 }],
      frameRate: 2
    });

    this.anims.create({
      key: 'playerWalk',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
  }
}
