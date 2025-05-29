export class GameScene extends Phaser.Scene { // Renamed from Game to GameScene to avoid conflict with Phaser.Game
    constructor() {
        super({ key: 'GameScene' }); // Updated key

        this.gridSize = { rows: 4, cols: 4 };
        this.cellSize = 100; // Adjust as needed, make it responsive later
        this.cellSpacing = 10;
        this.gridCells = [];
        this.selectedCells = [];
        this.betAmount = 0.00001;
        this.numCoals = 3;
        this.numStakes = 3; // This seems to be the same as numCoals in the UI, clarify if different
        this.revealedCoals = 0;
        this.revealedGold = 0;
        this.isGameOver = false;
        this.timerValue = 150; // 2:30 in seconds
        this.timerEvent = null;
        this.score = 2136; // Initial score from image
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Background
        this.add.image(0, 0, 'bkgTexture').setOrigin(0);

        // --- Top Bar UI ---
        const topBarY = 50;
        // Back Button
        const backButton = this.add.image(50, topBarY, 'backButtonLeft').setInteractive().setScale(0.8);
        backButton.on('pointerdown', () => {
            this.sound.play('button_press');
            this.scene.start('HomeScene');
        });

        // Score Display (using safe icon)
        this.add.image(gameWidth / 2 - 60, topBarY, 'safeIcon').setScale(0.4);
        this.scoreText = this.add.text(gameWidth / 2, topBarY, this.score.toString(), {
            fontFamily: 'KdamThmorPro',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        // Timer Display
        this.add.image(gameWidth - 120, topBarY, 'clockIcon').setScale(0.8);
        this.timerText = this.add.text(gameWidth - 70, topBarY, this.formatTime(this.timerValue), {
            fontFamily: 'KdamThmorPro',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        this.startTimer();

        // --- Game Grid ---
        const gridWidth = this.gridSize.cols * (this.cellSize + this.cellSpacing) - this.cellSpacing;
        const gridHeight = this.gridSize.rows * (this.cellSize + this.cellSpacing) - this.cellSpacing;
        const gridStartX = (gameWidth - gridWidth) / 2;
        const gridStartY = topBarY + 100; // Below top bar

        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gridCells[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                const x = gridStartX + col * (this.cellSize + this.cellSpacing) + this.cellSize / 2;
                const y = gridStartY + row * (this.cellSize + this.cellSpacing) + this.cellSize / 2;

                const cell = this.add.image(x, y, 'gridCellHidden').setInteractive().setScale(this.cellSize / this.textures.get('gridCellHidden').getSourceImage().width);
                cell.setData('row', row);
                cell.setData('col', col);
                cell.setData('isRevealed', false);
                cell.setData('isGold', false); // Will be set later
                cell.setData('isSelected', false);

                const border = this.add.image(x, y, 'gridCellSelectedBorder').setVisible(false).setScale(this.cellSize / this.textures.get('gridCellSelectedBorder').getSourceImage().width * 1.05); // Slightly larger for border effect
                cell.setData('border', border);

                cell.on('pointerdown', () => this.onCellClicked(cell));
                this.gridCells[row][col] = cell;
            }
        }

        // --- Bottom Controls UI ---
        const controlsY = gridStartY + gridHeight + 80;

        // Bet Amount
        this.add.text(gridStartX, controlsY, 'Bet Amount', { fontFamily: 'KdamThmorPro', fontSize: '24px', color: '#FFFFFF' });
        const betAmountInputBkg = this.add.image(gridStartX + 100, controlsY + 40, 'largeInputTextBkg').setOrigin(0, 0.5).setScale(0.9);
        this.betAmountText = this.add.text(betAmountInputBkg.x + betAmountInputBkg.width * 0.9 / 2, betAmountInputBkg.y, this.betAmount.toFixed(5), {
            fontFamily: 'KdamThmorPro', fontSize: '28px', color: '#000000', align: 'center'
        }).setOrigin(0.5);

        const betHalfButton = this.add.text(gridStartX + 280, controlsY + 40, 'x1/2', { fontFamily: 'KdamThmorPro', fontSize: '28px', color: '#FFFFFF' }).setOrigin(0, 0.5).setInteractive();
        betHalfButton.on('pointerdown', () => {
            this.betAmount /= 2;
            if (this.betAmount < 0.00001) this.betAmount = 0.00001;
            this.updateBetAmountDisplay();
            this.sound.play('button_press');
        });
        this.add.text(gridStartX + 335, controlsY + 40, '|', { fontFamily: 'KdamThmorPro', fontSize: '28px', color: '#FFFFFF' }).setOrigin(0, 0.5);
        const betDoubleButton = this.add.text(gridStartX + 350, controlsY + 40, 'x2', { fontFamily: 'KdamThmorPro', fontSize: '28px', color: '#FFFFFF' }).setOrigin(0, 0.5).setInteractive();
        betDoubleButton.on('pointerdown', () => {
            this.betAmount *= 2;
            // Add a max bet if needed
            this.updateBetAmountDisplay();
            this.sound.play('button_press');
        });

        // Coals Input
        this.add.text(gridStartX, controlsY + 100, 'Coals', { fontFamily: 'KdamThmorPro', fontSize: '24px', color: '#FFFFFF' });
        const coalsInputBkg = this.add.image(gridStartX + 70, controlsY + 140, 'textInputBkg').setOrigin(0, 0.5).setScale(0.9);
        this.coalsText = this.add.text(coalsInputBkg.x + coalsInputBkg.width * 0.9 / 2, coalsInputBkg.y, this.numCoals.toString(), {
            fontFamily: 'KdamThmorPro', fontSize: '28px', color: '#000000', align: 'center'
        }).setOrigin(0.5);
        // Add + / - buttons for coals if desired, or direct input

        // Stakes Input
        this.add.text(gridStartX + 250, controlsY + 100, 'Stakes', { fontFamily: 'KdamThmorPro', fontSize: '24px', color: '#FFFFFF' });
        const stakesInputBkg = this.add.image(gridStartX + 320, controlsY + 140, 'textInputBkg').setOrigin(0, 0.5).setScale(0.9);
        this.stakesText = this.add.text(stakesInputBkg.x + stakesInputBkg.width * 0.9 / 2, stakesInputBkg.y, this.numStakes.toString(), {
            fontFamily: 'KdamThmorPro', fontSize: '28px', color: '#000000', align: 'center'
        }).setOrigin(0.5);
        // Add + / - buttons for stakes if desired

        // Bet Button
        const betButtonY = controlsY + 220;
        const betButton = this.add.image(gameWidth / 2, betButtonY, 'textButtonBkg').setInteractive().setScale(1.5);
        this.add.text(betButton.x, betButton.y, 'BET', {
            fontFamily: 'KdamThmorPro',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        betButton.on('pointerdown', () => this.placeBet());

        // Initialize game state
        this.resetGridForNewBet(); // Initial setup before first bet
    }

    updateBetAmountDisplay() {
        this.betAmountText.setText(this.betAmount.toFixed(5));
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    startTimer() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
        }
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timerValue--;
                this.timerText.setText(this.formatTime(this.timerValue));
                if (this.timerValue <= 0) {
                    this.timerText.setText('-0:00');
                    this.gameOver(false); // Time ran out
                }
            },
            loop: true
        });
    }

    resetGridForNewBet() {
        this.isGameOver = false;
        this.selectedCells = [];
        this.revealedCoals = 0;
        this.revealedGold = 0;

        const allCells = [];
        for (let r = 0; r < this.gridSize.rows; r++) {
            for (let c = 0; c < this.gridSize.cols; c++) {
                const cell = this.gridCells[r][c];
                cell.setTexture('gridCellHidden');
                cell.setData('isRevealed', false);
                cell.setData('isGold', false);
                cell.setData('isSelected', false);
                cell.getData('border').setVisible(false);
                cell.setInteractive(); // Make sure they are interactive
                allCells.push(cell);
            }
        }

        // Shuffle all cells to pick gold locations randomly
        Phaser.Utils.Array.Shuffle(allCells);

        // Assign gold (remaining are coal by default or implicitly)
        // The number of gold cells is total cells - number of coals
        const totalCells = this.gridSize.rows * this.gridSize.cols;
        const numGold = totalCells - this.numCoals;

        for (let i = 0; i < numGold; i++) {
            if (allCells[i]) { // Check if the cell exists
                 allCells[i].setData('isGold', true);
            }
        }
        // The rest of the allCells (from numGold to end) are implicitly coal
    }

    placeBet() {
        if (this.isGameOver) return; // Don't allow betting if game is over from previous round
        if (this.selectedCells.length > 0) return; // Don't allow new bet if cells are already selected/revealed

        this.sound.play('button_press');
        // Deduct bet amount from score or handle insufficient funds
        this.score -= this.betAmount;
        this.scoreText.setText(this.score.toFixed(5)); // Assuming score can be fractional due to bet

        this.resetGridForNewBet(); // Prepare grid for current bet
        // Game is now active, player can click cells
        console.log(`Bet placed. ${this.numCoals} coals hidden. Select ${this.numStakes} cells.`);
    }

    onCellClicked(cell) {
        if (this.isGameOver || cell.getData('isRevealed') || this.selectedCells.length >= this.numStakes) {
            return;
        }
        this.sound.play('dig' + Phaser.Math.Between(1, 6)); // Play a random dig sound

        cell.setData('isRevealed', true);
        cell.setInteractive(false); // Prevent further clicks on this cell

        if (cell.getData('isGold')) {
            cell.setTexture('goldGridCell');
            // Optional: Add gold chuck animation
            // const goldAnim = this.add.sprite(cell.x, cell.y, 'goldChucksSprite');
            // goldAnim.play('gold_reveal_anim'); // Assuming an animation key 'gold_reveal_anim'
            // goldAnim.on('animationcomplete', () => goldAnim.destroy());
            this.revealedGold++;
        } else {
            cell.setTexture('coalGridCell');
            this.revealedCoals++;
        }

        this.selectedCells.push(cell);
        cell.getData('border').setVisible(true); // Show selection

        // Check game conditions
        if (this.revealedCoals > 0) {
            this.gameOver(false); // Clicked a coal
        } else if (this.selectedCells.length === this.numStakes) {
            // All stakes successfully placed on gold
            this.gameOver(true); // Won this round
        }
    }

    gameOver(playerWon) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        if (this.timerEvent) {
            this.timerEvent.remove(false);
        }

        let message = '';
        if (playerWon) {
            // Calculate winnings - this is a placeholder, actual calculation might be complex
            const winnings = this.betAmount * (this.numStakes * 2); // Example: double the stake for each gold
            this.score += winnings;
            this.scoreText.setText(this.score.toFixed(5));
            message = 'YOU WON!\n+ ' + winnings.toFixed(5);
            this.sound.play('button_press'); // Or a win sound
        } else {
            message = 'GAME OVER!';
            if (this.timerValue <= 0) {
                message += '\nTime is up!';
            }
            this.sound.play('rocks_falling');
        }

        // Reveal all cells
        for (let r = 0; r < this.gridSize.rows; r++) {
            for (let c = 0; c < this.gridSize.cols; c++) {
                const currentCell = this.gridCells[r][c];
                if (!currentCell.getData('isRevealed')) {
                    if (currentCell.getData('isGold')) {
                        currentCell.setTexture('goldGridCell');
                    } else {
                        currentCell.setTexture('coalGridCell');
                    }
                }
                currentCell.setInteractive(false);
            }
        }

        // Display game over message
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRect(0, this.sys.game.config.height / 2 - 50, this.sys.game.config.width, 100);

        const gameOverText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, message, {
            fontFamily: 'KdamThmorPro',
            fontSize: '40px',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: this.sys.game.config.width - 40 }
        }).setOrigin(0.5);

        // Add a delay then allow restart or go to home
        this.time.delayedCall(3000, () => {
            gameOverText.destroy();
            graphics.destroy();
            // this.scene.start('HomeScene'); // Or offer a restart button
            this.resetGridForNewBet(); // Reset for a new bet, but keep game over state until BET is clicked
            // Player can click BET to start a new round.
        });
    }

    update() {
        // Any continuous game logic if needed
    }
}