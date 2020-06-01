/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2020 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('hud-scene');
    /**
     * @type {Phaser.GameObjects.Text}
     */
    this.timeRemainingText = null;

    /**
     * @type {Phaser.GameObjects.Text}
     */
    this.coinsRetrievedText = null;
  }

  create() {
    const hudTextConfig = {
      fontFamily: 'VCR OSD Mono',
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1,
    };

    // Display time remaining text
    this.timeRemainingText = this.add.text(
      640,
      20,
      this.getTimeReaminingText(this.registry.get('timeRemaining')),
      hudTextConfig
    );
    this.timeRemainingText.setOrigin(0, 0);

    // Update time remaining text
    this.registry.events.on('changedata-timeRemaining', this.updateTime, this);

    // Display time remaining text
    this.coinsRetrievedText = this.add.text(
      640,
      50,
      this.getCoinsRetrievedText(
        this.registry.get('coinsCollected'),
        this.registry.get('totalCoins')
      ),
      hudTextConfig
    );
    this.coinsRetrievedText.setOrigin(0, 0);

    // Update coins collected text
    this.registry.events.on('changedata-coinsCollected', this.updateCoinsCollected, this);
  }

  /**
   * @param {number} timeRemaining
   */
  getTimeReaminingText(timeRemaining) {
    return `TIME: ${timeRemaining}`;
  }

  /**
   * @param {number} coinsCollected
   * @param {number} totalCoins
   */
  getCoinsRetrievedText(coinsCollected, totalCoins) {
    return `COINS: ${coinsCollected} / ${totalCoins}`;
  }

  updateTime() {
    this.timeRemainingText.setText(this.getTimeReaminingText(this.registry.get('timeRemaining')));
  }

  updateCoinsCollected() {
    this.coinsRetrievedText.setText(
      this.getCoinsRetrievedText(
        this.registry.get('coinsCollected'),
        this.registry.get('totalCoins')
      )
    );
  }
}
