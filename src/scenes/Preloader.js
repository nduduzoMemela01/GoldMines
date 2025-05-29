/*
* The game asset are taken from: https://taftcreates.itch.io/2048-assets
*
*/

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Black background for the loading screen
        this.cameras.main.setBackgroundColor(0x000000);

        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Display Game Logo
        this.add.image(gameWidth / 2, gameHeight / 2 - 100, 'GameLogo').setOrigin(0.5);

        // Progress bar background
        this.add.image(gameWidth / 2, gameHeight / 2, 'LoadingBarBkg').setOrigin(0.5);

        // Progress bar fill
        const bar = this.add.image(gameWidth / 2, gameHeight / 2, 'LoadingBar10ptFill').setOrigin(0.5);
        const barMask = this.make.graphics();
        barMask.fillStyle(0xffffff);
        barMask.beginPath();
        barMask.fillRect(bar.x - bar.width / 2, bar.y - bar.height / 2, 0, bar.height); // Start with 0 width
        bar.setMask(barMask.createGeometryMask());


        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {
            barMask.clear();
            barMask.fillStyle(0xffffff);
            barMask.fillRect(bar.x - bar.width / 2, bar.y - bar.height / 2, bar.width * progress, bar.height);
        });

        this.load.on('complete', () => {
            // Optional: clean up the mask or bar if needed
            // barMask.destroy();
        });
    }

    preload() {
        //  Load the assets for the game
        this.load.setPath('assets');

        // Images for Preloader itself (already loaded in Boot or will be loaded here if Boot is minimal)
        // If GameLogo, LoadingBarBkg, LoadingBar10ptFill are used in init(), they should be loaded in Boot.js
        // For simplicity, assuming Boot.js loads these minimal assets for the preloader screen.
        // If not, they need to be loaded first, then shown, then other assets loaded.
        // Let's assume Boot.js handles these:
        // this.load.image('GameLogo', 'images/GameLogo.png');
        // this.load.image('LoadingBarBkg', 'images/LoadingBarBkg.png');
        // this.load.image('LoadingBar10ptFill', 'images/LoadingBar10ptFill.png');

        // UI & General Images
        this.load.image('bkgTexture', 'images/BkgTexture.png');
        this.load.image('textButtonBkg', 'images/TextButtonBkg.png');
        this.load.image('backButtonLeft', 'images/BackButtonLeft.png');
        this.load.image('clockIcon', 'images/ClockIcon.png');
        this.load.image('textDisplayBkg', 'images/TextDisplayBkg.png');
        this.load.image('largeInputTextBkg', 'images/LargeInputTextBkg.png');
        this.load.image('textInputBkg', 'images/TextInputBkg.png');
        this.load.image('uiBackgroundTexture', 'images/10x10UIBackgroundTexture.png'); 
        this.load.image('safeIcon', 'images/GoldSafeIcon.png');

        // Game Specific Images
        this.load.image('coalGridCell', 'images/CoalGridCell.png');
        this.load.image('goldGridCell', 'images/GoldGridCell.png');
        this.load.image('gridCellHidden', 'images/GridCellHidden.png');
        this.load.image('gridCellSelectedBorder', 'images/GridCellSelectedBorder.png');
        this.load.spritesheet('goldChucksSprite', 'images/GoldChucksSprite.png', { frameWidth: 128, frameHeight: 128 }); // Assuming 128x128, adjust if different

        // Audio
        this.load.audio('dig1', 'sfx/dig1.mp3');
        this.load.audio('dig3', 'sfx/dig3.mp3');
        this.load.audio('dig4', 'sfx/dig4.mp3');
        this.load.audio('dig5', 'sfx/dig5.mp3');
        this.load.audio('button_press', 'sfx/button_press.mp3');
        this.load.audio('gold_reveal', 'sfx/gold_reveal.wav');
        this.load.audio('coal_reveal', 'sfx/coal_reveal.wav');
        this.load.audio('ticking_clock', 'sfx/ticking_clock.wav');
    }

    create() {
        //  Move to the HomeScene.
        this.scene.start('HomeScene');
    }
}
