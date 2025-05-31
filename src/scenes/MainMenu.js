import GridManager from "../utils/GridManager.js";

export class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.grid = new GridManager(this, 24, 12);
    // this.grid.showGrid();

    // Add background
    const background = this.add.image(0, 0, "bkgTexture");
    this.grid.placeInArea(background, 0, 0, 23, 11);

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.sys.game.config.width / background.width,
      this.sys.game.config.height / background.height
    );
    background.setScale(bgScale);

    const safeIcon = this.add.image(0, 0, "safeIcon");
    this.grid.placeAt(safeIcon, 6, 3);

    const goldAmountInSafe = this.add
      .text(0, 0, "2,136", {
        fontFamily: "KdamThmorPro",
        fontSize: 64,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.grid.placeAt(goldAmountInSafe, 6, 6);

    const buttonPanelBkg = this.add.image(0, 0, "buttonPanelBkg");
    this.grid.placeAt(buttonPanelBkg, 15, 6);

    // Add PLAY button
    const playButton = this.add.image(0, 0, "textButtonBkg");
    this.grid.placeAt(playButton, 13, 6);

    const startText = this.add
      .text(0, 0, "PLAY", {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(startText, 13, 6);

    // Add EXIT button
    const exitButton = this.add.image(0, 0, "textButtonBkg");
    this.grid.placeAt(exitButton, 16, 6);

    const exitText = this.add
      .text(0, 0, "EXIT", {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(exitText, 16, 6);

    // Make the button interactive
    playButton.setInteractive();
    playButton.on("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
