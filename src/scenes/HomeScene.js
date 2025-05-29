export class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Background
        this.add.image(0, 0, 'bkgTexture').setOrigin(0).setDisplaySize(gameWidth, gameHeight);

        // Center panel with dark background
        const panelWidth = gameWidth * 0.8;
        const panelHeight = gameHeight * 0.3;
        const panelX = gameWidth / 2;
        const panelY = gameHeight / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x232323, 0.9);
        graphics.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 10);

        // Game Logo (Mining cart with gold)
        const logoY = panelY - panelHeight - 100;
        this.add.image(panelX, logoY, 'GameLogo').setOrigin(0.5);
        
        // Gold coin icon and score value (2,136)
        const safeY = panelY - 150;
        this.add.image(panelX - 20, safeY, 'safeIcon').setOrigin(0.5).setScale(0.6);
        this.add.text(panelX + 70, safeY, '2,136', {
            fontFamily: 'KdamThmorPro',
            fontSize: '48px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        // Play Button (purple)
        const playButton = this.add.image(panelX, panelY, 'textButtonBkg').setInteractive().setScale(1.2);
        this.add.text(playButton.x, playButton.y, 'PLAY', {
            fontFamily: 'KdamThmorPro',
            fontSize: '36px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        playButton.on('pointerdown', () => {
            this.sound.play('button_press');
            this.scene.start('GameScene');
        });

        // Exit Button (purple)
        const exitButton = this.add.image(panelX, panelY + 80, 'textButtonBkg').setInteractive().setScale(1.2);
        this.add.text(exitButton.x, exitButton.y, 'EXIT', {
            fontFamily: 'KdamThmorPro',
            fontSize: '36px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        exitButton.on('pointerdown', () => {
            this.sound.play('button_press');
            this.game.destroy(true);
            window.close();
        });
    }
}
