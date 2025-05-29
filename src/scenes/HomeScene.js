export class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Background
        this.add.image(0, 0, 'bkgTexture').setOrigin(0);

        // UI Background Panel (semi-transparent black)
        const panelWidth = gameWidth * 0.6;
        const panelHeight = gameHeight * 0.5;
        const panelX = gameWidth / 2;
        const panelY = gameHeight / 2 + 50; // Shifted down a bit

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7); // Black with 70% opacity
        graphics.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 20); // Rounded corners

        // Safe Icon and Score
        this.add.image(panelX, panelY - panelHeight / 2 - 100, 'safeIcon').setOrigin(0.5).setScale(0.8); // Adjust scale as needed
        this.add.text(panelX + 100, panelY - panelHeight / 2 - 100, '2,136', {
            fontFamily: 'KdamThmorPro', // Ensure this font is loaded
            fontSize: '48px',
            color: '#FFFFFF',
            align: 'left'
        }).setOrigin(0, 0.5);


        // Play Button
        const playButton = this.add.image(panelX, panelY - panelHeight / 4, 'textButtonBkg').setInteractive().setScale(1.2);
        this.add.text(playButton.x, playButton.y, 'PLAY', {
            fontFamily: 'KdamThmorPro',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        playButton.on('pointerdown', () => {
            this.sound.play('button_press');
            this.scene.start('GameScene');
        });

        // Exit Button
        const exitButton = this.add.image(panelX, panelY + panelHeight / 4, 'textButtonBkg').setInteractive().setScale(1.2);
        this.add.text(exitButton.x, exitButton.y, 'EXIT', {
            fontFamily: 'KdamThmorPro',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        exitButton.on('pointerdown', () => {
            this.sound.play('button_press');
            // Handle exit logic if needed, e.g., close window for desktop app
            // For web, it might just go to a blank page or do nothing.
            console.log('Exit button clicked');
        });
    }
}
