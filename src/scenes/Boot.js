export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.setPath('assets');
        this.load.image('GameLogo', 'images/GameLogo.png');
        this.load.image('LoadingBarBkg', 'images/LoadingBarBkg.png');
        this.load.image('LoadingBar10ptFill', 'images/LoadingBar10ptFill.png');
        this.load.image('bkgTexture', 'images/BkgTexture.png');
    }

    create() {
        this.scene.start('Preloader');
    }
}
