import GridManager from "../utils/GridManager.js";

export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.grid = new GridManager(this, 24, 12);

    // Background for the loading screen
    this.cameras.main.setBackgroundColor(0x000000);

    // Display Game Logo - Mining cart with gold and pickaxe
    const logo = this.add.image(0, 0, "GameLogo").setOrigin(0.5);
    this.grid.placeAt(logo, 8, 6); // Place in the upper section of the screen

    // Progress bar background
    const barBkg = this.add.image(0, 0, "LoadingBarBkg").setOrigin(0.5);
    this.grid.placeAt(barBkg, 16, 6); // Place in the middle section

    // Progress bar fill - we'll adjust its width based on progress
    const bar = this.add.image(0, 0, "LoadingBar10ptFill").setOrigin(0);

    // Get the position for our loading bar
    const barPosition = this.grid.getPosition(16, 6);

    // Position the fill bar at the left edge of the background
    bar.setPosition(
      barPosition.x - barBkg.width / 2,
      barPosition.y - bar.height / 2
    );

    // Initially set the fill to zero width
    bar.scaleX = 0;

    // Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress) => {
      // Scale the fill bar from 0 to full width based on loading progress
      bar.scaleX = progress;
    });
  }

  preload() {
    //  Load the assets for the game - basic ones were loaded in Boot already
    this.load.setPath("assets");

    this.load.image("logo", "logo.png");

    // UI & General Images
    this.load.image("bkgTexture", "images/BkgTexture.png");
    this.load.image("buttonPanelBkg", "images/ButtonPanelBkg.png");
    this.load.image("textButtonBkg", "images/TextButtonBkg.png");
    this.load.image("backButtonLeft", "images/BackButtonLeft.png");
    this.load.image("clockIcon", "images/ClockIcon.png");
    this.load.image("textDisplayBkg", "images/TextDisplayBkg.png");
    this.load.image("largeInputTextBkg", "images/LargeInputTextBkg.png");
    this.load.image("smallTextButton", "images/SmallTextButton.png");
    this.load.image("textInputBkg", "images/TextInputBkg.png");
    this.load.image(
      "uiBackgroundTexture",
      "images/10x10UIBackgroundTexture.png"
    );
    this.load.image("safeIcon", "images/GoldSafeIcon.png");
    this.load.image("coinIcon", "images/GoldChucksSprite.png"); // Use as coin icon

    // Game Specific Images
    this.load.image("coalGridCell", "images/CoalGridCell.png");
    this.load.image("goldGridCell", "images/GoldGridCell.png");
    this.load.image("gridCellHidden", "images/GridCellHidden.png");
    this.load.image(
      "gridCellSelectedBorder",
      "images/GridCellSelectedBorder.png"
    );

    // Audio
    this.load.audio("dig1", "sfx/dig1.mp3");
    this.load.audio("dig3", "sfx/dig3.mp3");
    this.load.audio("dig4", "sfx/dig4.mp3");
    this.load.audio("dig5", "sfx/dig5.mp3");
    this.load.audio("button_press", "sfx/button_press.mp3");
    this.load.audio("gold_reveal", "sfx/gold_reveal.wav");
    this.load.audio("coal_reveal", "sfx/coal_reveal.wav");
    this.load.audio("ticking_clock", "sfx/ticking_clock.wav");

    // Create animations
    this.load.once("complete", () => {
      // Any animations we need to create can go here
    });
  }

  create() {
    this.checkFontLoaded(() => {
      //  Move to the MainMenu.
      this.scene.start("MainMenu");
      // this.scene.start("GameOver");
    });
  }
  
  checkFontLoaded(callback) {
    // Create a test element using the KdamThmorPro font
    const testText = this.add.text(0, 0, "Font Test", { 
      fontFamily: 'KdamThmorPro',
      fontSize: 24,
      color: '#ffffff' 
    });
    testText.visible = false;
    
    // Use the Phaser timer to check periodically if the font is loaded
    let attempts = 0;
    const maxAttempts = 20; // Prevent infinite loop
    
    const checkFont = () => {
      attempts++;
      
      // Check if the font has been applied (this is a basic check)
      if (document.fonts && document.fonts.check('24px KdamThmorPro')) {
        console.log('KdamThmorPro font loaded!');
        if (callback) callback();
        return;
      } else if (attempts >= maxAttempts) {
        console.warn('Maximum attempts reached. Proceeding even if font not loaded.');
        if (callback) callback();
        return;
      }
      
      // Check again after a short delay
      this.time.delayedCall(100, checkFont);
    };
    
    // Start checking
    checkFont();
  }
}
