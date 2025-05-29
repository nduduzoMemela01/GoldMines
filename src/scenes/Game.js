export class GameScene extends Phaser.Scene { // Renamed from Game to GameScene to avoid conflict with Phaser.Game
    constructor() {
        super({ key: 'GameScene' }); // Updated key

        this.gridSize = { rows: 4, cols: 4 };
        this.cellSize = 80; // Smaller cell size for mobile layout
        this.cellSpacing = 5;
        this.gridCells = [];
        this.selectedCells = [];
        this.betAmount = 0.00001;
        this.numCoals = 3;
        this.numStakes = 3; // Same as numCoals in the UI based on screenshots
        this.revealedCoals = 0;
        this.revealedGold = 0;
        this.isGameOver = false;
        this.timerValue = 150; // 2:30 in seconds
        this.timerEvent = null;
        this.score = 2136; // Initial score from image

        this.firstBetPlacedThisSession = true; 
        this.backgroundTickingSound = null; 
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Background
        this.add.image(0, 0, 'bkgTexture').setOrigin(0).setDisplaySize(gameWidth, gameHeight);

        // --- Top Bar UI ---
        const topBarY = 70;
        
        // Back Button (purple square with < symbol)
        const backButton = this.add.image(40, topBarY, 'textButtonBkg').setInteractive().setScale(0.6);
        this.add.text(backButton.x, backButton.y, '<', {
            fontFamily: 'KdamThmorPro',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        backButton.on('pointerdown', () => {
            this.sound.play('button_press');
            if (this.backgroundTickingSound) {
                this.backgroundTickingSound.stop();
            }
            this.scene.start('HomeScene');
        });

        // Score Display (using safe icon)
        const coinIcon = this.add.image(gameWidth / 2 - 40, topBarY, 'safeIcon').setScale(0.4);
        this.scoreText = this.add.text(gameWidth / 2 + 50, topBarY, this.score.toString(), {
            fontFamily: 'KdamThmorPro',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        // Timer Display
        this.add.image(gameWidth - 90, topBarY, 'clockIcon').setScale(0.4);
        this.timerText = this.add.text(gameWidth - 40, topBarY, this.formatTime(this.timerValue), {
            fontFamily: 'KdamThmorPro',
            fontSize: '28px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        // this.startTimer(); // Timer starts on first bet

        // --- Game Grid ---
        const gridWidth = this.gridSize.cols * (this.cellSize + this.cellSpacing) - this.cellSpacing;
        const gridHeight = this.gridSize.rows * (this.cellSize + this.cellSpacing) - this.cellSpacing;
        const gridStartX = (gameWidth - gridWidth) / 2;
        const gridStartY = topBarY + 80; // Below top bar

        for (let row = 0; row < this.gridSize.rows; row++) {
            this.gridCells[row] = [];
            for (let col = 0; col < this.gridSize.cols; col++) {
                const x = gridStartX + col * (this.cellSize + this.cellSpacing) + this.cellSize / 2;
                const y = gridStartY + row * (this.cellSize + this.cellSpacing) + this.cellSize / 2;

                const cell = this.add.image(x, y, 'gridCellHidden').setInteractive();
                cell.setScale(this.cellSize / cell.width);
                
                cell.setData('row', row);
                cell.setData('col', col);
                cell.setData('isRevealed', false);
                cell.setData('isGold', false); // Will be set later
                cell.setData('isSelected', false);

                // Purple border for selected cells
                const border = this.add.image(x, y, 'gridCellSelectedBorder').setVisible(false);
                border.setScale(this.cellSize / border.width * 1.05); // Slightly larger for border effect
                cell.setData('border', border);

                cell.on('pointerdown', () => this.onCellClicked(cell));
                this.gridCells[row][col] = cell;
            }
        }

        // --- Bottom Controls UI ---
        const controlsY = gridStartY + gridHeight + 40;
        
        // Black panel for controls at bottom
        const bottomPanel = this.add.graphics();
        bottomPanel.fillStyle(0x000000, 0.7);
        bottomPanel.fillRect(0, controlsY - 20, gameWidth, gameHeight - controlsY + 20);

        // Bet Amount
        this.add.text(gameWidth / 2, controlsY, 'Bet Amount', { 
            fontFamily: 'KdamThmorPro',
            fontSize: '24px', 
            color: '#FFFFFF' 
        }).setOrigin(0.5);
        
        // Black bet input background with purple border
        const betInputBkg = this.add.graphics();
        betInputBkg.lineStyle(3, 0x800080, 1);
        betInputBkg.fillStyle(0x000000, 1);
        const betInputX = gameWidth / 2 - 150;
        const betInputY = controlsY + 40;
        betInputBkg.fillRect(betInputX, betInputY - 20, 300, 40);
        betInputBkg.strokeRect(betInputX, betInputY - 20, 300, 40);
        
        this.betAmountText = this.add.text(gameWidth / 2 - 60, betInputY, this.betAmount.toFixed(5), {
            fontFamily: 'KdamThmorPro', 
            fontSize: '28px', 
            color: '#FFFFFF', 
            align: 'right'
        }).setOrigin(0.5);

        // x1/2 | x2 buttons
        const betControlsBg = this.add.graphics();
        betControlsBg.fillStyle(0x800080, 1);
        betControlsBg.fillRect(gameWidth / 2 + 50, betInputY - 20, 100, 40);
        
        this.add.text(gameWidth / 2 + 70, betInputY, 'x1⁄2', { 
            fontFamily: 'KdamThmorPro', 
            fontSize: '20px', 
            color: '#FFFFFF' 
        }).setOrigin(0.5).setInteractive()
        .on('pointerdown', () => {
            this.betAmount /= 2;
            if (this.betAmount < 0.00001) this.betAmount = 0.00001;
            this.updateBetAmountDisplay();
            this.sound.play('button_press');
        });
        
        this.add.text(gameWidth / 2 + 100, betInputY, '|', { 
            fontFamily: 'KdamThmorPro', 
            fontSize: '20px', 
            color: '#FFFFFF' 
        }).setOrigin(0.5);
        
        this.add.text(gameWidth / 2 + 130, betInputY, 'x2', { 
            fontFamily: 'KdamThmorPro', 
            fontSize: '20px', 
            color: '#FFFFFF' 
        }).setOrigin(0.5).setInteractive()
        .on('pointerdown', () => {
            this.betAmount *= 2;
            this.updateBetAmountDisplay();
            this.sound.play('button_press');
        });

        // Coals and Stakes inputs side by side
        const inputsY = controlsY + 100;
        
        // Coals input (left)
        this.add.text(gameWidth / 4, inputsY - 30, 'Coals', { 
            fontFamily: 'KdamThmorPro', 
            fontSize: '24px', 
            color: '#FFFFFF' 
        }).setOrigin(0.5);
        
        const coalsInputBg = this.add.graphics();
        coalsInputBg.lineStyle(3, 0x800080, 1);
        coalsInputBg.fillStyle(0x000000, 1);
        coalsInputBg.fillRect(gameWidth / 4 - 30, inputsY - 20, 60, 40);
        coalsInputBg.strokeRect(gameWidth / 4 - 30, inputsY - 20, 60, 40);
        
        this.coalsText = this.add.text(gameWidth / 4, inputsY, this.numCoals.toString(), {
            fontFamily: 'KdamThmorPro', 
            fontSize: '28px', 
            color: '#FFFFFF', 
            align: 'center'
        }).setOrigin(0.5);

        // Stakes input (right)
        this.add.text(gameWidth * 3/4, inputsY - 30, 'Stakes', { 
            fontFamily: 'KdamThmorPro', 
            fontSize: '24px', 
            color: '#FFFFFF' 
        }).setOrigin(0.5);
        
        const stakesInputBg = this.add.graphics();
        stakesInputBg.lineStyle(3, 0x800080, 1);
        stakesInputBg.fillStyle(0x000000, 1);
        stakesInputBg.fillRect(gameWidth * 3/4 - 30, inputsY - 20, 60, 40);
        stakesInputBg.strokeRect(gameWidth * 3/4 - 30, inputsY - 20, 60, 40);
        
        this.stakesText = this.add.text(gameWidth * 3/4, inputsY, this.numStakes.toString(), {
            fontFamily: 'KdamThmorPro', 
            fontSize: '28px', 
            color: '#FFFFFF', 
            align: 'center'
        }).setOrigin(0.5);

        // BET Button (big purple button)
        const betButtonY = gameHeight - 70;
        const betButton = this.add.image(gameWidth / 2, betButtonY, 'textButtonBkg').setInteractive().setScale(1.2, 0.8);
        this.add.text(betButton.x, betButton.y, 'BET', {
            fontFamily: 'KdamThmorPro',
            fontSize: '36px',
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
        if (this.isGameOver && !this.firstBetPlacedThisSession) return; 
        if (this.selectedCells.length > 0) return; 

        this.sound.play('button_press');
        this.score -= this.betAmount;
        this.scoreText.setText(this.score.toFixed(5)); 

        this.resetGridForNewBet(); 
        
        if (this.firstBetPlacedThisSession) {
            this.startTimer();
            if (!this.backgroundTickingSound) {
                this.backgroundTickingSound = this.sound.add('ticking_clock', { loop: true, volume: 0.5 });
            }
            if (!this.backgroundTickingSound.isPlaying) {
                this.backgroundTickingSound.play();
            }
            this.firstBetPlacedThisSession = false; 
        }
        
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
        // Do not stop the background ticking sound here, let it continue unless navigating away

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
            // Restart timer for the next round if game is not completely over (e.g. time ran out)
            if (this.timerValue > 0) { 
                this.startTimer();
            } else {
                 if (this.backgroundTickingSound && this.backgroundTickingSound.isPlaying) {
                    this.backgroundTickingSound.stop();
                }
            }
        });
    }

    update() {
        // Any continuous game logic if needed
    }
}