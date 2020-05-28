import Phaser from 'phaser';

/**
 *
 * @param {Phaser.Physics.Arcade.Sprite} spike
 * @param {Phaser.Scene} scene
 */
export const createSpike = (spike, scene) => {
  spike.setSize(32, 32);
  spike.setOrigin(0.5, 0.5);
  scene.physics.world.enable(spike, Phaser.Physics.Arcade.DYNAMIC_BODY);
  spike.body.setImmovable(true);
  spike.body.setAllowGravity(false);
};
