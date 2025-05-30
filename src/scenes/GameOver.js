import GridManager from "../utils/GridManager";

export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.grid = new GridManager(this, 24, 12);
    this.cameras.main.setBackgroundColor(0xff0000);

    // Add background with grid positioning
    const background = this.add.image(0, 0, "background").setAlpha(0.5);
    this.grid.placeInArea(background, 0, 0, 23, 11); // Cover the entire grid area

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.sys.game.config.width / background.width,
      this.sys.game.config.height / background.height
    );
    background.setScale(bgScale);

    // Game over text
    const gameOverText = this.add
      .text(0, 0, "Game Over", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(gameOverText, 8, 6); // Place in upper section

    // Score display (in a real game, you'd get the actual score)
    const scoreText = this.add
      .text(0, 0, "Score: 0", {
        fontFamily: "Arial Black",
        fontSize: 36,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(scoreText, 12, 6); // Place in middle section

    // Replay button
    const replayButton = this.add.image(0, 0, "textButtonBkg");
    this.grid.placeAt(replayButton, 18, 6); // Place in lower section

    const replayText = this.add
      .text(0, 0, "Play Again", {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(replayText, 18, 6); // Place at same position as button

    // Make the button interactive
    replayButton.setInteractive();
    replayButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    // Alternative: Keep the existing click anywhere functionality
    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
