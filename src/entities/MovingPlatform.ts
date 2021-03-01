/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';

export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  startX: number;
  startY: number;
  justHitBoundary: boolean = false;
  hold: number;
  speedX: number;
  speedY: number;

  constructor(scene: Phaser.Scene, tileObject: Phaser.Types.Tilemaps.TiledObject, texture: string, frame: number = 0) {
    super(scene, tileObject.x, tileObject.y, texture, frame);
    this.setOrigin(0, 1);
    this.startX = this.x;
    this.startY = this.y;
    this.hold = tileObject.properties[0].value;
    this.speedX = tileObject.properties[1].value;
    this.speedY = tileObject.properties[2].value;

    this.scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.body.setFriction(1, 1);
    this.body.setBounce(0, 0);
    this.body.setVelocity(this.speedX, this.speedY);
    this.scene.add.existing(this);
  }

  toggleSpeed() {
    this.speedX = -this.speedX;
    this.speedY = -this.speedY;
  }
}
