import GridManager from "../utils/GridManager";

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.grid = new GridManager(this, 24, 12);
    this.grid.showGrid();

    // Add background
    const background = this.add.image(0, 0, "bkgTexture");
    this.grid.placeInArea(background, 0, 0, 23, 11);

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.sys.game.config.width / background.width,
      this.sys.game.config.height / background.height
    );
    background.setScale(bgScale);

    this.addBackButton();

    this.addGoldScore();

    this.addTimer();

    this.renderMineCells();
  }

  addBackButton() {
    const backButton = this.add
      .image(50, 50, "backButtonLeft")
      .setInteractive();
    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    this.grid.placeAt(backButton, 2, 1);
  }

  addGoldScore() {
    const goldScore = this.add
      .text(0, 0, "2,136", {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(goldScore, 2, 6);
  }

  addTimer() {
    const goldScore = this.add
      .text(0, 0, "-2:30", {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(goldScore, 2, 10);
  }

  renderMineCells() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const mineCell = this.add
          .image(0, 0, "gridCellHidden")
          .setInteractive();
        mineCell.on("pointerdown", () => {
          console.log(`Mine cell clicked at row ${row}, col ${col}`);
        });
        this.grid.placeAt(mineCell, 5 + col * 3, 2.5 + row * 2);
      }
    }
  }
}
