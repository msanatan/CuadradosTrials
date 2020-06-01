/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2020 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import { CERTIFICATE_BACKGROUND_KEY, CUADRADO_BIG_KEY } from '../constants';

export default class GameCompleteScene extends Phaser.Scene {
  constructor() {
    super('game-complete-scene');
  }

  init(data) {
    this.totalCoins = data.totalCoins;
    this.totalCoinsCollected = data.totalCoinsCollected;
    this.totalPlayerDeaths = data.totalPlayerDeaths;
  }

  create() {
    // Load background with borders
    const backgroundImage = this.add.image(0, 0, CERTIFICATE_BACKGROUND_KEY);
    backgroundImage.setOrigin(0, 0);

    // Add certificate text
    const certificateText = this.add.text(400, 150, 'CERTIFICATE', {
      fontFamily: 'Minecraft',
      fontSize: '84px',
      color: '#d95763',
    });
    certificateText.setOrigin(0.5, 0.5);

    const subtitleText = this.add.text(
      400,
      200,
      'Congratulations little Cuadrado on Completion of the Super Robot Trials!',
      {
        fontFamily: 'Minecraft',
        fontSize: '16px',
        color: '#000000',
      }
    );
    subtitleText.setOrigin(0.5, 0.5);

    // Image of Cuadrado on the left
    const bigCuadradoImage = this.add.image(200, 375, CUADRADO_BIG_KEY);
    bigCuadradoImage.setOrigin(0.5, 0.5);

    // Total number of coins collected and deaths on the right
    const totalCoinsText = this.add.text(
      350,
      350,
      `COINS COLLECTED: ${this.totalCoinsCollected} / ${this.totalCoins}`,
      {
        fontFamily: 'Minecraft',
        fontSize: '24px',
        color: '#000000',
      }
    );
    totalCoinsText.setOrigin(0, 0);

    const totalDeathsText = this.add.text(350, 380, `# OF DEATHS: ${this.totalPlayerDeaths}`, {
      fontFamily: 'Minecraft',
      fontSize: '24px',
      color: '#000000',
    });
    totalDeathsText.setOrigin(0, 0);
  }
}
