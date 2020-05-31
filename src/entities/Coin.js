/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2020 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import { COIN_KEY } from '../constants';

/**
 *
 * @param {Phaser.Physics.Arcade.Sprite} spike
 * @param {Phaser.Scene} scene
 */
export const createCoin = (coin, scene) => {
  coin.setOrigin(0.5, 0.5);
  scene.physics.world.enable(coin, Phaser.Physics.Arcade.DYNAMIC_BODY);
  coin.body.setImmovable(true);
  coin.body.setAllowGravity(false);

  scene.anims.create({
    key: 'shine',
    frames: scene.anims.generateFrameNumbers(COIN_KEY, { start: 0, end: 5 }),
    frameRate: 8,
    repeat: -1,
  });

  coin.anims.play('shine', true);
};
