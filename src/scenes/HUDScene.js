/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2020 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('hud-scene');
  }

  create() {
    this.textElements = new Map([
      [
        'TIME',
        this.add
          .text(20, 20, `Time: ${this.registry.get('timeRemaining')}`, {
            fontFamily: 'Courier, Monaco, monospace',
            fontSize: '24px',
            color: '#FFB871',
          })
          .setOrigin(0, 0),
      ],
    ]);

    this.registry.events.on('changedata-timeRemaining', this.updateTime, this);
  }

  updateTime() {
    this.textElements.get('TIME').setText(`Time: ${this.registry.get('timeRemaining')}`);
  }
}
