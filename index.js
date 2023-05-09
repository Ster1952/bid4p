import MainGame from "/game.js";
import TitleScene from '/TitleScene.js';
import InstructionScene from '/InstructionScene.js';

let TitlePage = new TitleScene();
let InstructionPage = new InstructionScene();
let playGame = new MainGame();

var scene = new Phaser.Scene("game");

const config = {
    type: Phaser.CANVAS,
    parent: 'divId',
    width: 1366,
    height: 768,
    backgroundColor: '#004C99',
    scale: {
        mode: Phaser.Scale.FIT
    },
    dom: {
        createContainer: true
    },
    title: 'Bid Euchre',
    scene: [TitleScene, MainGame, InstructionScene]
};

export default new Phaser.Game(config);
