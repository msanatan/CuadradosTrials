/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import { COIN_KEY } from '../constants';

export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = COIN_KEY, frame: number = 0) {
    super(scene, x, y, texture, frame);
    this.setOrigin(0, 1);
    this.scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
    this.scene.add.existing(this);
  }
}
