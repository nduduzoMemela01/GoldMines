import { Boot } from './scenes/Boot.js';
import { GameScene } from './scenes/Game.js';
import { HomeScene } from './scenes/HomeScene.js';
import { Preloader } from './scenes/Preloader.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 540,  // Mobile portrait aspect ratio (9:16)
    height: 960,
    parent: 'game-container',
    backgroundColor: '#342e1c',  // Dark gold/brown color as seen in screenshots
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        HomeScene,
        GameScene
    ]
};

new Phaser.Game(config);
