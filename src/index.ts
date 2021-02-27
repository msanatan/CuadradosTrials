/**
 * @author       Marcus Sanatan <msanatan@gmail.com>
 * @copyright    2021 Marcus Sanatan
 * @description  Cuadrado's Trials
 */
import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import PreloadScene from './scenes/PreloadScene';
import HUDScene from './scenes/HUDScene';
import GameCompleteScene from './scenes/GameCompleteScene';
import TitleScene from './scenes/TitleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  render: {
    pixelArt: true
  },
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      gravity: {
        y: 350
      },
    },
  },
  scene: [PreloadScene, TitleScene, GameScene, HUDScene, GameCompleteScene],
};

export default new Phaser.Game(config);
