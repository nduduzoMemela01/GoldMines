import GridManager from "../utils/GridManager.js";
class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {
      buttonPress: scene.sound.add("button_press"),
    };
  }

  playButtonPress() {
    this.sounds.buttonPress.play();
  }
}

export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.soundManager = new SoundManager(this);
    this.grid = new GridManager(this, 24, 12);
    this.cameras.main.setBackgroundColor(0xff0000);

    const background = this.add.image(0, 0, "bkgTexture");
    this.grid.placeInArea(background, 0, 0, 23, 11);

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.sys.game.config.width / background.width,
      this.sys.game.config.height / background.height
    );
    background.setScale(bgScale);

    // Game over text
    const gameOverText = this.add
      .text(0, 0, "Game Over", {
        fontFamily: "KdamThmorPro",
        fontSize: 64,
        align: "center",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.grid.placeAt(gameOverText, 8, 6); // Place in upper section

    // Replay button
    const replayButton = this.add.image(0, 0, "textButtonBkg");
    this.grid.placeAt(replayButton, 18, 6); // Place in lower section

    const replayText = this.add
      .text(0, 0, "Go Home", {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(replayText, 18, 6); // Place at same position as button

    // Make the button interactive
    replayButton.setInteractive();
    replayButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
      this.soundManager.playButtonPress();
    });
  }
}
