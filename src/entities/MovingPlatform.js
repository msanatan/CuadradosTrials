import Phaser from 'phaser';

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

  platform.getHold = function () {
    return platform.data.list[0].value;
  };

  platform.getSpeedX = function () {
    return platform.data.list[1].value;
  };

  platform.getSpeedY = function () {
    return platform.data.list[2].value;
  };

  platform.toggleSpeed = function () {
    platform.data.list[1].value = -platform.data.list[1].value;
    platform.data.list[2].value = -platform.data.list[2].value;
  };

  // Add property for when it hit boundary
  platform.justHitBoundary = false;

  // Configure physics
  scene.physics.world.enable(platform, Phaser.Physics.Arcade.DYNAMIC_BODY);
  platform.body.setFrictionX(1);
  platform.body.setImmovable(true);
  platform.body.setAllowGravity(false);
  platform.body.setVelocity(platform.getSpeedX(), platform.getSpeedY());
};
