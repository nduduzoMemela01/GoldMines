import GridManager from "../utils/GridManager";

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.grid = new GridManager(this, 24, 12);
    this.grid.showGrid();

    // Game state
    this.gameState = {
      betAmount: 1,
      coals: 3,
      stakes: 3,
      goldAmount: 2136,
      revealedCells: [],
      selectedCells: [],
      timeRemaining: 150,
      gameActive: true,
    };

    // Create game board with 4x4 cells
    this.gameBoard = [];
    for (let i = 0; i < 4; i++) {
      this.gameBoard[i] = [];
      for (let j = 0; j < 4; j++) {
        // 25% chance for gold, 75% for coal
        this.gameBoard[i][j] = Math.random() < 0.25 ? "gold" : "coal";
      }
    }

    // Add background
    const background = this.add.image(0, 0, "bkgTexture");
    this.grid.placeInArea(background, 0, 0, 23, 11);

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.sys.game.config.width / background.width,
      this.sys.game.config.height / background.height
    );
    background.setScale(bgScale);

    // Load and configure sound effects
    this.sounds = {
      dig: [
        this.sound.add("dig1"),
        this.sound.add("dig3"),
        this.sound.add("dig4"),
        this.sound.add("dig5"),
      ],
      goldReveal: this.sound.add("gold_reveal"),
      coalReveal: this.sound.add("coal_reveal"),
      buttonPress: this.sound.add("button_press"),
      tickingClock: this.sound.add("ticking_clock", {
        loop: true,
        volume: 0.5,
      }),
    };

    this.addBackButton();

    this.addGoldScore();

    this.addTimer();

    this.renderMineCells();

    this.createBettingInterface();

    // Start the countdown timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Play ticking clock sound
    this.sounds.tickingClock.play();
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
    // Add coin icon
    const coinIcon = this.add.image(0, 0, "coinIcon");
    // display the firt 1/4 of the sprite
    coinIcon.setCrop(0, 0, coinIcon.width / 4, coinIcon.height);
    coinIcon.setSize(coinIcon.width / 4, coinIcon.height);
    this.grid.placeAt(coinIcon, 2, 6);

    // Add score text
    this.goldScoreText = this.add
      .text(0, 0, this.formatNumber(this.gameState.goldAmount), {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.goldScoreText, 2, 5.5);
  }

  addTimer() {
    // Add clock icon
    const clockIcon = this.add.image(0, 0, "clockIcon");
    this.grid.placeAt(clockIcon, 2, 8);

    // Add timer text
    this.timerText = this.add
      .text(0, 0, this.formatTime(this.gameState.timeRemaining), {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.timerText, 2, 10);
  }

  updateTimer() {
    if (!this.gameState.gameActive) return;

    this.gameState.timeRemaining--;

    if (this.gameState.timeRemaining <= 0) {
      this.gameState.timeRemaining = 0;
      this.gameState.gameActive = false;
      this.timerEvent.remove();
      this.sounds.tickingClock.stop();
      // TODO: Handle game over
    }

    this.timerText.setText(this.formatTime(this.gameState.timeRemaining));
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `-${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  formatNumber(num) {
    return num.toLocaleString();
  }

  renderMineCells() {
    this.cells = [];

    for (let row = 0; row < 4; row++) {
      this.cells[row] = [];
      for (let col = 0; col < 4; col++) {
        const mineCell = this.add
          .image(0, 0, "gridCellHidden")
          .setInteractive();
        this.grid.placeAt(mineCell, 5 + col * 3, 3 + row * 2);

        mineCell.cellData = {
          row,
          col,
          type: this.gameBoard[row][col],
          revealed: false,
          selected: false,
        };

        mineCell.on("pointerdown", () => {
          this.handleCellClick(mineCell);
        });

        this.cells[row][col] = mineCell;
      }
    }
  }

  handleCellClick(cell) {
    if (!this.gameState.gameActive || cell.cellData.revealed) return;

    const { row, col } = cell.cellData;

    if (cell.cellData.selected) {
      // Deselect cell
      cell.cellData.selected = false;
      this.gameState.selectedCells = this.gameState.selectedCells.filter(
        (c) => !(c.row === row && c.col === col)
      );

      // Remove purple border
      if (cell.selectionBorder) {
        cell.selectionBorder.destroy();
        cell.selectionBorder = null;
      }
    } else {
      // Select cell
      cell.cellData.selected = true;
      this.gameState.selectedCells.push({ row, col });

      // Add purple border
      cell.selectionBorder = this.add.image(
        cell.x,
        cell.y,
        "gridCellSelectedBorder"
      );
    }
  }

  createBettingInterface() {
    // Create a panel background
    const panelBkg = this.add.image(0, 0, "buttonPanelBkg");
    this.grid.placeInArea(panelBkg, 17, 3, 22, 9);

    // Bet Amount label
    const betAmountLabel = this.add
      .text(0, 0, "Bet Amount", {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(betAmountLabel, 17, 4);

    // Create bet amount input field
    const betInputField = this.add.image(0, 0, "largeInputTextBkg");
    this.grid.placeAt(betInputField, 18, 5);

    // Create bet amount input text
    this.betAmountText = this.add
      .text(0, 0, this.gameState.betAmount.toString(), {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.betAmountText, 18, 4);

    // Create bet multiplier buttons
    const divideButton = this.createTextButton("x½", 17.9, 8);
    const multiplyButton = this.createTextButton("x2", 17.9, 9);

    divideButton.on("pointerdown", () => {
      this.sounds.buttonPress.play();
      this.setBetAmount(this.gameState.betAmount / 2);
    });

    multiplyButton.on("pointerdown", () => {
      this.sounds.buttonPress.play();
      this.setBetAmount(this.gameState.betAmount * 2);
    });

    // Create Coals and Stakes fields
    this.add
      .text(0, 0, "Coals", {
        fontFamily: "KdamThmorPro",
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(
      this.add.displayList.list[this.add.displayList.list.length - 1],
      19,
      3
    );

    const coalsInput = this.add.image(0, 0, "textInputBkg");
    this.grid.placeAt(coalsInput, 20, 4.25);

    this.coalsText = this.add
      .text(0, 0, this.gameState.coals.toString(), {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.coalsText, 20, 4);

    this.add
      .text(0, 0, "Stakes", {
        fontFamily: "KdamThmorPro",
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(
      this.add.displayList.list[this.add.displayList.list.length - 1],
      19,
      7
    );

    const stakesInput = this.add.image(0, 0, "textDisplayBkg");
    this.grid.placeAt(stakesInput, 20, 8);

    this.stakesText = this.add
      .text(0, 0, this.gameState.stakes.toString(), {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.stakesText, 20, 8);

    // Create the BET button
    const betButton = this.add.image(0, 0, "textButtonBkg").setInteractive();
    this.grid.placeAt(betButton, 22, 6);

    const betText = this.add
      .text(0, 0, "BET", {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(betText, 22, 6);

    betButton.on("pointerdown", () => {
      this.sounds.buttonPress.play();
      this.placeBet();
    });
  }

  createTextButton(text, row, col) {
    const button = this.add.image(0, 0, "smallTextButton").setInteractive();
    this.grid.placeAt(button, row, col);

    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(buttonText, row, col);

    return button;
  }

  setBetAmount(amount) {
    // Ensure bet amount stays within reasonable limits
    amount = Math.max(0.00001, Math.min(100, amount));
    // Format to 5 decimal places
    this.gameState.betAmount = Number(amount.toFixed(5));
    this.betAmountText.setText(this.gameState.betAmount.toString());
  }

  placeBet() {
    if (!this.gameState.gameActive || this.gameState.selectedCells.length === 0)
      return;

    // Check if we have enough coals and stakes
    if (this.gameState.coals <= 0 || this.gameState.stakes <= 0) return;

    // Reduce coals and stakes
    this.gameState.coals--;
    this.gameState.stakes--;
    this.coalsText.setText(this.gameState.coals.toString());
    this.stakesText.setText(this.gameState.stakes.toString());

    // Process selected cells
    this.gameState.selectedCells.forEach(({ row, col }) => {
      this.revealCell(this.cells[row][col]);
    });

    // Clear selected cells
    this.gameState.selectedCells = [];
  }

  revealCell(cell) {
    if (cell.cellData.revealed) return;

    cell.cellData.revealed = true;

    // Play random digging sound
    const randomDigSound = Phaser.Math.RND.pick(this.sounds.dig);
    randomDigSound.play();

    // Remove selection border if it exists
    if (cell.selectionBorder) {
      cell.selectionBorder.destroy();
      cell.selectionBorder = null;
    }

    // Reveal the cell content with small delay for better effect
    this.time.delayedCall(300, () => {
      if (cell.cellData.type === "gold") {
        // Show gold cell
        cell.setTexture("goldGridCell");
        // Play gold reveal sound
        this.sounds.goldReveal.play();
        // Add gold to score
        this.updateGoldScore(100 * this.gameState.betAmount);
      } else {
        // Show coal cell
        cell.setTexture("coalGridCell");
        // Play coal reveal sound
        this.sounds.coalReveal.play();
      }
    });
  }

  updateGoldScore(amount) {
    this.gameState.goldAmount += amount;
    this.goldScoreText.setText(this.formatNumber(this.gameState.goldAmount));
  }
}
