export default class Card {
    constructor(scene) {
        this.render = (x, y, sprite, frame) => {
            //console.log('card render', sprite, frame);
            let card = scene.add.sprite(x, y, sprite, frame).setInteractive();
            scene.input.setDraggable(card);
            return card;
        }
    }
}