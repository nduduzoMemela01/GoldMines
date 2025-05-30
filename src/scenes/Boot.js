export class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.image("background", "assets/bg.png");
    this.load.image("GameLogo", "assets/images/GameLogo.png");
    this.load.image("LoadingBarBkg", "assets/images/LoadingBarBkg.png");
    this.load.image(
      "LoadingBar10ptFill",
      "assets/images/LoadingBar10ptFill.png"
    );
  }

  create() {
    this.scene.start("Preloader");
  }
}
