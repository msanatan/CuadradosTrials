import Phaser from 'phaser';

/**
 *
 * @param {Phaser.Physics.Arcade.Sprite} platform
 */
export const createMovingPlatform = (platform) => {
  platform.deltaX = 0;
  platform.deltaY = 0;
  platform._previousX = 0;
  platform._previousY = 0;
  platform.preUpdate = function () {
    this.deltaX = this.x - this._previousX;
    this.deltaY = this.y - this._previousY;
    this._previousX = this.x;
    this._previousY = this.y;
  };
};
