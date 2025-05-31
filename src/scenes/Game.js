import GridManager from "../utils/GridManager.js";

/**
 * GameState class to manage game state data
 */
class GameState {
  constructor(initialData = {}) {
    this.betAmount = initialData.betAmount || 1;
    this.coals = initialData.coals || 3;
    this.stakes = initialData.stakes || 3;
    this.goldAmount = initialData.goldAmount || 2136;
    this.revealedCells = initialData.revealedCells || [];
    this.selectedCells = initialData.selectedCells || [];
    this.timeRemaining = initialData.timeRemaining || 60;
    this.gameActive =
      initialData.gameActive !== undefined ? initialData.gameActive : true;
  }

  updateGold(amount) {
    this.goldAmount += amount;
    return this.goldAmount;
  }

  decrementTime() {
    if (!this.gameActive) return false;

    this.timeRemaining--;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.gameActive = false;
      return false;
    }

    return true;
  }

  useResourcesForBet() {
    if (this.coals <= 0 || this.stakes <= 0) return false;

    this.coals--;
    this.stakes--;

    return true;
  }

  selectCell(row, col) {
    const existingIndex = this.selectedCells.findIndex(
      (cell) => cell.row === row && cell.col === col
    );

    if (existingIndex >= 0) {
      // Deselect cell
      this.selectedCells.splice(existingIndex, 1);
      return false;
    } else {
      // Check if player can select more cells based on available stakes
      if (this.selectedCells.length >= this.stakes) {
        // Player has already selected maximum number of cells
        return null; // Return null to indicate selection limit reached
      }
      // Select cell
      this.selectedCells.push({ row, col });
      return true;
    }
  }

  clearSelectedCells() {
    this.selectedCells = [];
  }
}

/**
 * SoundManager class to handle game sounds
 */
class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {
      dig: [
        scene.sound.add("dig1"),
        scene.sound.add("dig3"),
        scene.sound.add("dig4"),
        scene.sound.add("dig5"),
      ],
      goldReveal: scene.sound.add("gold_reveal"),
      coalReveal: scene.sound.add("coal_reveal"),
      buttonPress: scene.sound.add("button_press"),
      tickingClock: scene.sound.add("ticking_clock", {
        loop: true,
        volume: 0.5,
      }),
    };
  }

  playRandomDigSound() {
    const randomDigSound = Phaser.Math.RND.pick(this.sounds.dig);
    randomDigSound.play();
  }

  playGoldReveal() {
    this.sounds.goldReveal.play();
  }

  playCoalReveal() {
    this.sounds.coalReveal.play();
  }

  playButtonPress() {
    this.sounds.buttonPress.play();
  }

  startTicking() {
    this.sounds.tickingClock.play();
  }

  stopTicking() {
    this.sounds.tickingClock.stop();
  }
}

/**
 * GameBoard class to manage the mine cells
 */
class GameBoard {
  constructor(scene, grid) {
    this.scene = scene;
    this.grid = grid;
    this.cells = [];
    this.boardData = [];

    this.initializeBoardData();
  }

  initializeBoardData() {
    // Create game board with 4x4 cells
    this.boardData = [];
    for (let i = 0; i < 4; i++) {
      this.boardData[i] = [];
      for (let j = 0; j < 4; j++) {
        // 25% chance for gold, 75% for coal
        this.boardData[i][j] = Math.random() < 0.25 ? "gold" : "coal";
      }
    }
  }

  renderMineCells(onCellClick) {
    this.cells = [];

    for (let row = 0; row < 4; row++) {
      this.cells[row] = [];
      for (let col = 0; col < 4; col++) {
        const mineCell = this.scene.add
          .image(0, 0, "gridCellHidden")
          .setInteractive();
        this.grid.placeAt(mineCell, 5 + col * 3, 3 + row * 2);

        mineCell.cellData = {
          row,
          col,
          type: this.boardData[row][col],
          revealed: false,
          selected: false,
        };

        mineCell.on("pointerdown", () => {
          onCellClick(mineCell);
        });

        this.cells[row][col] = mineCell;
      }
    }

    return this.cells;
  }

  toggleCellSelection(cell, isSelected) {
    if (isSelected) {
      // Add purple border
      cell.selectionBorder = this.scene.add.image(
        cell.x,
        cell.y,
        "gridCellSelectedBorder"
      );
    } else {
      // Remove purple border
      if (cell.selectionBorder) {
        cell.selectionBorder.destroy();
        cell.selectionBorder = null;
      }
    }

    cell.cellData.selected = isSelected;
  }

  revealCell(cell, onGoldRevealed) {
    if (cell.cellData.revealed) return;

    cell.cellData.revealed = true;

    // Remove selection border if it exists
    if (cell.selectionBorder) {
      cell.selectionBorder.destroy();
      cell.selectionBorder = null;
    }

    // Return cell type for sound effects and score updates
    return cell.cellData.type;
  }

  setRevealedTexture(cell) {
    if (cell.cellData.type === "gold") {
      cell.setTexture("goldGridCell");
      return true;
    } else {
      cell.setTexture("coalGridCell");
      return false;
    }
  }
}

/**
 * UIManager class to handle UI elements
 */
class UIManager {
  constructor(scene, grid, gameState) {
    this.scene = scene;
    this.grid = grid;
    this.gameState = gameState;
    this.elements = {};
  }

  setupBackground() {
    const background = this.scene.add.image(0, 0, "bkgTexture");
    this.grid.placeInArea(background, 0, 0, 23, 11);

    // Adjust scale to fill screen if needed
    const bgScale = Math.max(
      this.scene.sys.game.config.width / background.width,
      this.scene.sys.game.config.height / background.height
    );
    background.setScale(bgScale);
  }

  addBackButton(onBackClick) {
    const backButton = this.scene.add
      .image(50, 50, "backButtonLeft")
      .setInteractive();
    backButton.on("pointerdown", onBackClick);
    this.grid.placeAt(backButton, 2, 1);
  }

  addGoldScore() {
    // Add coin icon
    const coinIcon = this.scene.add.image(0, 0, "coinIcon");
    // display the first 1/4 of the sprite
    coinIcon.setCrop(0, 0, coinIcon.width / 4, coinIcon.height);
    coinIcon.setSize(coinIcon.width / 4, coinIcon.height);
    this.grid.placeAt(coinIcon, 2, 6);

    // Add score text
    this.elements.goldScoreText = this.scene.add
      .text(0, 0, this.formatNumber(this.gameState.goldAmount), {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.elements.goldScoreText, 2, 5.5);

    return this.elements.goldScoreText;
  }

  addTimer() {
    // Add clock icon
    const clockIcon = this.scene.add.image(0, 0, "clockIcon");
    this.grid.placeAt(clockIcon, 2, 8);

    // Add timer text
    this.elements.timerText = this.scene.add
      .text(0, 0, this.formatTime(this.gameState.timeRemaining), {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.elements.timerText, 2, 10);

    return this.elements.timerText;
  }

  updateGoldDisplay(amount) {
    this.elements.goldScoreText.setText(this.formatNumber(amount));
  }

  updateTimerDisplay(seconds) {
    this.elements.timerText.setText(this.formatTime(seconds));
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `-${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  formatNumber(num) {
    return num.toLocaleString();
  }

  createTextButton(text, row, col) {
    const button = this.scene.add
      .image(0, 0, "smallTextButton")
      .setInteractive();
    this.grid.placeAt(button, row, col);

    const buttonText = this.scene.add
      .text(0, 0, text, {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(buttonText, row, col);

    return button;
  }
}

/**
 * BettingSystem class to handle betting operations
 */
class BettingSystem {
  constructor(scene, grid, gameState, uiManager, soundManager) {
    this.scene = scene;
    this.grid = grid;
    this.gameState = gameState;
    this.uiManager = uiManager;
    this.soundManager = soundManager;
    this.elements = {};
  }

  createBettingInterface(onBetPlaced) {
    // Create a panel background
    const panelBkg = this.scene.add.image(0, 0, "buttonPanelBkg");
    this.grid.placeInArea(panelBkg, 17, 3, 22, 9);

    // Bet Amount label
    const betAmountLabel = this.scene.add
      .text(0, 0, "Bet Amount", {
        fontFamily: "KdamThmorPro",
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(betAmountLabel, 17, 4);

    // Create bet amount input field
    const betInputField = this.scene.add.image(0, 0, "largeInputTextBkg");
    this.grid.placeAt(betInputField, 18, 5);

    // Create bet amount input text
    this.elements.betAmountText = this.scene.add
      .text(0, 0, this.gameState.betAmount.toString(), {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.elements.betAmountText, 18, 4);

    // Create bet multiplier buttons
    const divideButton = this.uiManager.createTextButton("x½", 17.9, 8);
    const multiplyButton = this.uiManager.createTextButton("x2", 17.9, 9);

    divideButton.on("pointerdown", () => {
      this.soundManager.playButtonPress();
      this.setBetAmount(this.gameState.betAmount / 2);
    });

    multiplyButton.on("pointerdown", () => {
      this.soundManager.playButtonPress();
      this.setBetAmount(this.gameState.betAmount * 2);
    });

    // Create Coals and Stakes fields
    this.scene.add
      .text(0, 0, "Coals", {
        fontFamily: "KdamThmorPro",
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(
      this.scene.add.displayList.list[
        this.scene.add.displayList.list.length - 1
      ],
      19,
      3
    );

    const coalsInput = this.scene.add.image(0, 0, "textInputBkg");
    this.grid.placeAt(coalsInput, 20, 4.25);

    this.elements.coalsText = this.scene.add
      .text(0, 0, this.gameState.coals.toString(), {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.elements.coalsText, 20, 4);

    this.scene.add
      .text(0, 0, "Stakes", {
        fontFamily: "KdamThmorPro",
        fontSize: 24,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(
      this.scene.add.displayList.list[
        this.scene.add.displayList.list.length - 1
      ],
      19,
      7
    );

    const stakesInput = this.scene.add.image(0, 0, "textDisplayBkg");
    this.grid.placeAt(stakesInput, 20, 8);

    this.elements.stakesText = this.scene.add
      .text(0, 0, this.gameState.stakes.toString(), {
        fontFamily: "KdamThmorPro",
        fontSize: 32,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(this.elements.stakesText, 20, 8);

    // Create the BET button
    const betButton = this.scene.add
      .image(0, 0, "textButtonBkg")
      .setInteractive();
    this.grid.placeAt(betButton, 22, 6);

    const betText = this.scene.add
      .text(0, 0, "BET", {
        fontFamily: "KdamThmorPro",
        fontSize: 48,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.grid.placeAt(betText, 22, 6);

    betButton.on("pointerdown", () => {
      this.soundManager.playButtonPress();
      onBetPlaced();
    });
  }

  setBetAmount(amount) {
    // Ensure bet amount stays within reasonable limits
    amount = Math.max(0.00001, Math.min(100, amount));
    // Format to 5 decimal places
    this.gameState.betAmount = Number(amount.toFixed(5));
    this.elements.betAmountText.setText(this.gameState.betAmount.toString());
  }

  updateResourcesDisplay() {
    this.elements.coalsText.setText(this.gameState.coals.toString());
    this.elements.stakesText.setText(this.gameState.stakes.toString());
  }
}

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.grid = new GridManager(this, 24, 12);
    // this.grid.showGrid();

    // Initialize game components using OOP
    this.gameState = new GameState();
    this.soundManager = new SoundManager(this);
    this.uiManager = new UIManager(this, this.grid, this.gameState);
    this.gameBoard = new GameBoard(this, this.grid);
    this.bettingSystem = new BettingSystem(
      this,
      this.grid,
      this.gameState,
      this.uiManager,
      this.soundManager
    );

    // Setup UI elements
    this.uiManager.setupBackground();
    this.uiManager.addBackButton(() => {
      this.scene.start("MainMenu");
    });
    this.goldScoreText = this.uiManager.addGoldScore();
    this.timerText = this.uiManager.addTimer();

    // Render game board
    this.cells = this.gameBoard.renderMineCells((cell) => {
      this.handleCellClick(cell);
    });

    // Create betting interface
    this.bettingSystem.createBettingInterface(() => {
      this.placeBet();
    });

    // Start the countdown timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Play ticking clock sound
    this.soundManager.startTicking();
    this.events.on("shutdown", this.shutdown, this);
  }

  shutdown() {
    // Clean up resources
    this.timerEvent.remove();
    this.soundManager.stopTicking();

    // Destroy all game objects
    this.uiManager.elements = {};
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
    const isSelected = this.gameState.selectCell(row, col);

    // Check if selection limit was reached
    if (isSelected === null) {
      // Player tried to select more cells than they have stakes
      // You could add visual or audio feedback here to indicate the limit
      this.showSelectionLimitReached();
      return;
    }

    this.gameBoard.toggleCellSelection(cell, isSelected);
  }

  showSelectionLimitReached() {
    // Play button press sound to indicate rejection
    this.soundManager.playButtonPress();

    // Flash the stakes display to indicate that's the limiting factor
    const stakesText = this.bettingSystem.elements.stakesText;
    const originalColor = stakesText.style.color;

    // Flash the text red
    stakesText.setStyle({ color: "#ff0000" });

    // Reset after a short delay
    this.time.delayedCall(300, () => {
      stakesText.setStyle({ color: originalColor });
    });
  }

  updateTimer() {
    const timeActive = this.gameState.decrementTime();

    if (!timeActive) {
      this.timerEvent.remove();
      this.soundManager.stopTicking();
      // navigate to game over scene or handle end of game
      this.scene.start("GameOver", {
        goldAmount: this.gameState.goldAmount,
        timeRemaining: this.gameState.timeRemaining,
      });
      return;
    }

    this.uiManager.updateTimerDisplay(this.gameState.timeRemaining);
  }

  placeBet() {
    if (!this.gameState.gameActive || this.gameState.selectedCells.length === 0)
      return;

    // Check if we have enough resources
    if (!this.gameState.useResourcesForBet()) return;

    // Update UI
    this.bettingSystem.updateResourcesDisplay();

    // Process selected cells
    this.gameState.selectedCells.forEach(({ row, col }) => {
      this.revealCell(this.cells[row][col]);
    });

    // Clear selected cells
    this.gameState.clearSelectedCells();

    // If not enough resources go to game over
    if (this.gameState.coals <= 0 || this.gameState.stakes <= 0) {
      setTimeout(() => {
        this.scene.start("GameOver", {
          goldAmount: this.gameState.goldAmount,
          timeRemaining: this.gameState.timeRemaining,
        });
      }, 3000);
      return;
    }
  }

  revealCell(cell) {
    // Use GameBoard to handle cell revealing
    const cellType = this.gameBoard.revealCell(cell);
    if (!cellType) return;

    // Play random digging sound
    this.soundManager.playRandomDigSound();

    // Reveal the cell content with small delay for better effect
    this.time.delayedCall(300, () => {
      const isGold = this.gameBoard.setRevealedTexture(cell);

      if (isGold) {
        // Play gold reveal sound
        this.soundManager.playGoldReveal();
        // Add gold to score
        const newGoldAmount = this.gameState.updateGold(
          100 * this.gameState.betAmount
        );
        this.uiManager.updateGoldDisplay(newGoldAmount);
      } else {
        // Play coal reveal sound
        this.soundManager.playCoalReveal();
      }
    });
  }
}
