/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import { PLAYER_KEY } from '../constants';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  onPlatform: boolean = false;
  died: boolean = false;
  movingPlatform: Phaser.Physics.Arcade.Sprite = null;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = PLAYER_KEY, frame: number = 0) {
    super(scene, x, y, texture, frame);
    this.scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
    this.setCollideWorldBounds(true);
    this.scene.add.existing(this);
  }
}
