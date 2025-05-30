import GridManager from "../utils/GridManager";

export class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.grid = new GridManager(this, 24, 12);
    // Add background
    const background = this.add.image(0, 0, "bkgTexture");
    this.grid.placeInArea(background, 0, 0, 23, 11);

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.sys.game.config.width / background.width,
      this.sys.game.config.height / background.height
    );
    background.setScale(bgScale);

    // Add logo
    const logo = this.add.image(0, 0, "logo");
    this.grid.placeAt(logo, 6, 6); // Place in upper third of screen

    // Add title text
    const mainMenuText = this.add
      .text(0, 0, "Main Menu", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(mainMenuText, 12, 6); // Place in middle section

    // Add start button
    const startButton = this.add.image(0, 0, "textButtonBkg");
    this.grid.placeAt(startButton, 18, 6); // Place in lower third

    const startText = this.add
      .text(0, 0, "Start Game", {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(startText, 18, 6); // Place at same position as button

    // Make the button interactive
    startButton.setInteractive();
    startButton.on("pointerdown", () => {
      this.scene.start("Game");
    });

    // Alternative: Keep the existing click anywhere functionality
    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
