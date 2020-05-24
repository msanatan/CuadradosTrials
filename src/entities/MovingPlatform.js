import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

/**
 *
 * @param {Phaser.Physics.Arcade.Sprite} platform
 * @param {Phaser.Scene} scene
 */
export const createMovingPlatform = (platform, scene) => {
  // First thing we do is adjust Tiled coordinates to Phaser ones
  // Tiled coordinates are top-left whereas Phaser is at the centre
  platform.setOrigin(0.5, 0.5);

  // Save start coordinates
  platform.startX = platform.x;
  platform.startY = platform.y;

  // Add variables for deltas, we'll use them to update the player's values
  // so they can ride on the platforms
  platform.deltaX = 0;
  platform.deltaY = 0;
  platform._previousX = platform.x;
  platform._previousY = platform.y;

  // Override preUpdate function to calculate deltas
  platform.preUpdate = function () {
    this.deltaX = this.x - this._previousX;
    this.deltaY = this.y - this._previousY;
    this._previousX = this.x;
    this._previousY = this.y;
  };

  // Add some helper functions so I don't have to work with data properties
  platform.getDestinationX = function () {
    return platform.startX + platform.data.list[1].value * TILE_SIZE;
  };

  platform.getDestinationY = function () {
    return platform.startY + platform.data.list[3].value * TILE_SIZE;
  };

  platform.getHold = function () {
    return platform.data.list[0].value;
  };

  platform.getSpeedX = function () {
    return platform.data.list[2].value;
  };

  platform.getSpeedY = function () {
    return platform.data.list[4].value;
  };

  platform.getDuration = function () {
    switch (platform.name.toLowerCase()) {
      case 'horizontal':
        return Math.abs(platform.getSpeedX() * platform.data.list[1].value);
      case 'vertical':
        return Math.abs(platform.getSpeedY() * platform.data.list[3].value);
    }
  };

  // Configure physics
  scene.physics.world.enable(platform, Phaser.Physics.Arcade.DYNAMIC_BODY);
  platform.body.setFriction(1, 1);
  platform.body.setImmovable(true);
  platform.body.setAllowGravity(false);
  scene.add.tween({
    targets: platform,
    x: platform.getDestinationX(),
    y: platform.getDestinationY(),
    duration: platform.getDuration(),
    yoyo: true,
    repeat: -1,
    delay: platform.getHold(), // Initial pause before firing
    repeatDelay: platform.getHold(), // Pause when the tween yoyos (i.e. comes back to original spot)
    hold: platform.getHold(), // Pause when tween reaches destination
  });
};
