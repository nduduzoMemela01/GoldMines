import GridManager from "../utils/GridManager";

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.grid = new GridManager(this, 24, 12);

    this.cameras.main.setBackgroundColor(0x00ff00);

    // Add background with grid positioning
    const background = this.add.image(0, 0, "background").setAlpha(0.5);
    this.grid.placeInArea(background, 0, 0, 23, 11); // Cover the entire grid area

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.sys.game.config.width / background.width,
      this.sys.game.config.height / background.height
    );
    background.setScale(bgScale);

    // Create a game board with hidden grid cells (6x6 grid)
    this.createGameBoard(8, 16, 6, 6);

    // Add UI elements with grid positioning
    const instructionsText = this.add
      .text(
        0,
        0,
        "Make something fun!\nand share it with us:\nsupport@phaser.io",
        {
          fontFamily: "Arial Black",
          fontSize: 28,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.grid.placeAt(instructionsText, 4, 6); // Place in top section

    // Create UI for score and timer
    this.createGameUI();

    // Add event handler for clicking on grid cells
    this.input.once("pointerdown", () => {
      this.scene.start("GameOver");
    });
  }

  createGameBoard(startRow, startCol, rows, cols) {
    // Create a game board grid of cells
    const cellSize = Math.min(
      this.grid.getCellSize().width * 0.9,
      this.grid.getCellSize().height * 0.9
    );

    const scale = cellSize / 64; // Assuming grid cell images are 64x64 pixels

    this.gameBoard = [];

    for (let row = 0; row < rows; row++) {
      this.gameBoard[row] = [];
      for (let col = 0; col < cols; col++) {
        // Create a grid cell
        const cell = this.add.image(0, 0, "gridCellHidden");

        // Place it in the grid
        this.grid.placeAt(cell, startRow + row, startCol + col, { scale });

        // Make it interactive
        cell.setInteractive();
        cell.on("pointerdown", () => {
          this.revealCell(row, col);
        });

        this.gameBoard[row][col] = {
          sprite: cell,
          revealed: false,
          type: Math.random() > 0.7 ? "gold" : "coal", // 30% chance of gold
        };
      }
    }
  }

  createGameUI() {
    // Score display
    const scoreDisplay = this.add.image(0, 0, "textDisplayBkg");
    this.grid.placeAt(scoreDisplay, 20, 3);

    const scoreText = this.add
      .text(0, 0, "Score: 0", {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(scoreText, 20, 3);

    // Timer display
    const timerDisplay = this.add.image(0, 0, "textDisplayBkg");
    this.grid.placeAt(timerDisplay, 20, 9);

    const clockIcon = this.add.image(0, 0, "clockIcon");
    this.grid.placeAt(clockIcon, 20, 8, { scale: 0.6 });

    const timerText = this.add
      .text(0, 0, "30", {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.grid.placeAt(timerText, 20, 9);
  }

  revealCell(row, col) {
    const cell = this.gameBoard[row][col];

    if (cell.revealed) return;

    cell.revealed = true;

    // Show the appropriate cell type
    const newTexture = cell.type === "gold" ? "goldGridCell" : "coalGridCell";
    cell.sprite.setTexture(newTexture);

    // Play appropriate sound
    const sound = cell.type === "gold" ? "gold_reveal" : "coal_reveal";
    this.sound.play(sound);

    // In a real game, you'd update score, check win conditions, etc.
  }
}
