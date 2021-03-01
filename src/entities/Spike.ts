/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import { SPIKE_KEY } from '../constants';

export default class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = SPIKE_KEY, frame: number = 0) {
    super(scene, x, y, texture, frame);
    this.setOrigin(0, 1);
    this.scene.physics.world.enable(this);
    this.body.setSize(32, 30);
    this.scene.add.existing(this);
  }
}
