import { Boot } from "./scenes/Boot.js";
import { Game as MainGame } from "./scenes/Game.js";
import { GameOver } from "./scenes/GameOver.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { Preloader } from "./scenes/Preloader.js";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};

const StartGame = (parent) => {
  return new Phaser.Game({ ...config, parent });
};

document.addEventListener("DOMContentLoaded", () => {
  StartGame("game-container");
});
