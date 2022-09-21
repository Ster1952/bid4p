import Card from './card.js';

export default class Dealer {
    constructor(scene) {
        this.dealCards = (hands) => {
            //console.log('cards', hands);
            let playerSprite;
            let localHand = [];
            let len = 0
            if (scene.isPlayerA) {
                 playerSprite = hands[0];
                 len = hands[0].length
            } 
            if (scene.isPlayerB) {
                playerSprite = hands[1];
                len = hands[1].length
            }
            if (scene.isPlayerC) {
                playerSprite = hands[2];
                len = hands[2].length
           } 
            if (scene.isPlayerD) {
               playerSprite = hands[3];
               len = hands[3].length
           }

            for (let i = 0; i < len; i++) {
                let playerCard = new Card(scene);
                let objt = playerCard.render(325 + (i * 50), 475, 'cards', playerSprite[i]);
                localHand.push(objt); 
                //console.log('dealer output', localHand);
             
            }
            return localHand;
       }
    }
}
