/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUDScene');
    /**
     * @type {Phaser.GameObjects.Text}
     */
    this.timeRemainingText = null;

    /**
     * @type {Phaser.GameObjects.Text}
     */
    this.coinsRetrievedText = null;
  }

  create(): void {
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
   * @param timeRemaining - time remaining to complete a level
   */
  getTimeReaminingText(timeRemaining: number): string {
    return `TIME: ${timeRemaining}`;
  }

  /**
   * @param coinsCollected - amount of coins in a level that was collected
   * @param totalCoins - total coins available in a level
   */
  getCoinsRetrievedText(coinsCollected: number, totalCoins: number): string {
    return `COINS: ${coinsCollected} / ${totalCoins}`;
  }

  updateTime(): void {
    this.timeRemainingText.setText(this.getTimeReaminingText(this.registry.get('timeRemaining')));
  }

  updateCoinsCollected(): void {
    this.coinsRetrievedText.setText(
      this.getCoinsRetrievedText(
        this.registry.get('coinsCollected'),
        this.registry.get('totalCoins')
      )
    );
  }
}
