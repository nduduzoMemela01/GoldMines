/*
* The game asset are taken from: https://taftcreates.itch.io/2048-assets
*
*/

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Background for the loading screen
        this.cameras.main.setBackgroundColor(0x000000);

        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;        // Display Game Logo - Mining cart with gold and pickaxe
        this.add.image(gameWidth / 2, gameHeight / 2 - 100, 'GameLogo').setOrigin(0.5);

        // Add "GoldMines" text with a default font
        this.add.text(gameWidth / 2, gameHeight / 2, 'GoldMines', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Progress bar background
        this.add.image(gameWidth / 2, gameHeight / 2 + 100, 'LoadingBarBkg').setOrigin(0.5);

        // Progress bar fill (purple)
        const bar = this.add.image(gameWidth / 2, gameHeight / 2 + 100, 'LoadingBar10ptFill').setOrigin(0.5);
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
    }    preload() {
        //  Load the assets for the game - basic ones were loaded in Boot already
        this.load.setPath('assets');
        
        // Load fonts - using CSS to preload web fonts properly
        const fontStyles = `
            @font-face {
                font-family: 'KdamThmorPro';
                src: url('assets/fonts/KdamThmorPro-Regular.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
            }
        `;
        
        const element = document.createElement('style');
        element.innerHTML = fontStyles;
        document.head.appendChild(element);
        
        // UI & General Images
        this.load.image('textButtonBkg', 'images/TextButtonBkg.png');
        this.load.image('backButtonLeft', 'images/BackButtonLeft.png');
        this.load.image('clockIcon', 'images/ClockIcon.png');
        this.load.image('textDisplayBkg', 'images/TextDisplayBkg.png');
        this.load.image('largeInputTextBkg', 'images/LargeInputTextBkg.png');
        this.load.image('textInputBkg', 'images/TextInputBkg.png');
        this.load.image('uiBackgroundTexture', 'images/10x10UIBackgroundTexture.png'); 
        this.load.image('safeIcon', 'images/GoldSafeIcon.png');
        this.load.image('coinIcon', 'images/GoldChucksSprite.png'); // Use as coin icon

        // Game Specific Images
        this.load.image('coalGridCell', 'images/CoalGridCell.png');
        this.load.image('goldGridCell', 'images/GoldGridCell.png');
        this.load.image('gridCellHidden', 'images/GridCellHidden.png');
        this.load.image('gridCellSelectedBorder', 'images/GridCellSelectedBorder.png');

        // Audio
        this.load.audio('dig1', 'sfx/dig1.mp3');
        this.load.audio('dig3', 'sfx/dig3.mp3');
        this.load.audio('dig4', 'sfx/dig4.mp3');
        this.load.audio('dig5', 'sfx/dig5.mp3');
        this.load.audio('button_press', 'sfx/button_press.mp3');
        this.load.audio('gold_reveal', 'sfx/gold_reveal.wav');
        this.load.audio('coal_reveal', 'sfx/coal_reveal.wav');
        this.load.audio('ticking_clock', 'sfx/ticking_clock.wav');
        
        // Create animations
        this.load.once('complete', () => {
            // Any animations we need to create can go here
        });
    }

    create() {
        //  Move to the HomeScene.
        this.scene.start('HomeScene');
    }
}
