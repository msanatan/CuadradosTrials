/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2020 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';

// Define speed of player
export const PLAYER_SPEED = { x: 200, y: 200 };

/**
 * Creates a new player, accepting it's start coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Phaser.Scene} scene
 */
export const createPlayer = (x, y, imageKey, scene) => {
  const player = scene.physics.add.sprite(x, y, imageKey);
  player.onPlatform = false;

  scene.anims.create({
    key: 'idle',
    frames: [{ key: imageKey, frame: 0 }],
    frameRate: 2,
  });

  scene.anims.create({
    key: 'walk',
    frames: scene.anims.generateFrameNumbers(imageKey, { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });

  // Setup collisions with world
  player.setCollideWorldBounds(true);
  scene.physics.world.checkCollision.up = false;
  scene.physics.world.checkCollision.down = false;

  return player;
};
