"use strict"
import Dealer from "/src/helpers/dealer.js";
import Card from '/src/helpers/card.js';
import Zone from '/src/helpers/zone.js';

class MainGame extends Phaser.Scene {
    constructor() {
        super('playGame');
    }

    init(data) {
        this.text = data;
    }

    preload() {
        this.load.atlas('cards', 'src/assets/cards.png', 'src/assets/cards.json');
        this.load.image('background', 'src/assets/test.jpg');
        this.load.bitmapFont('claredon', 'src/assets/clarendon.png', 'src/assets/clarendon.xml');

        //this.load.image('xmas', 'src/assets/xmas.png');
    }

    create() {

        let self = this;
        let add = this.add;
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        // let xx1 = this.add.sprite(1200,600,'xmas').setScale(0.3,0.3);
        // xx1.alpha = 0.7;
        let c1 = this.add.circle(35, 65, 10, 0x000000);
        let c2 = this.add.circle(65, 65, 10, 0x000000);
        let c3 = this.add.circle(95, 65, 10, 0x000000);
        let c4 = this.add.circle(125, 65, 10, 0x000000);
        let s1 = this.add.rectangle(425, 175, 350, 250);
        let s2 = this.add.rectangle(825, 175, 350, 250);
        s1.setStrokeStyle(6, 0x01cdfe);
        //s2.setStrokeStyle(6, 0x01cdfe);

        this.isPlayerA = false;
        this.isPlayerB = false;
        this.isPlayerC = false;
        this.isPlayerD = false;
        this.hand1 = [];
        this.hand2 = [];
        this.hand3 = [];
        this.hand4 = [];
        this.recoverhand1 = []
        this.recoverhand2 = []
        this.recoverhand3 = []
        this.recoverhand4 = []
        this.pp1 = false
        this.pp2 = false
        this.pp3 = false
        this.pp4 = false
        this.us_click = 0;
        this.them_click = 0;
        this.us_total_click = 0;
        this.them_total_click = 0;
        this.playerctr = 1;
        this.bidnumberctr = 0;
        this.trumpctr = 0;
        this.specialbidctr = 0;
        this.trick = [];
        this.placeHolder = " ";
        this.Holder = ' ';
        this.callarea = []; //-- cards held in call area
        let playersHand = [];
        this.trickCounter = 0;
        this.dealer = new Dealer(this);
        this.zone = new Zone(this);
        this.callzone = new Zone(this);
        this.dropZone = this.zone.renderZone(425, 175, 350, 250);
        this.dropZone1 = this.callzone.renderZone(825, 175, 350, 250);
        let scene = this.scene;
        this.nameText = this.add.text(25, 25, [''], { color: '#fffb96', fontSize: 'bold 22px' });
        this.teamA = this.add.text(225, 700, '', {fontSize: 24})
        this.teamB = this.add.text(225, 730, '', {fontSize: 24})

        this.teamplayer1 = ''
        this.teamplayer2 = ''
        this.teamplayer3 = ''
        this.teamplayer4 = ''

        const TABLE_ID = self.text;

        this.socket = io({ "forceWebsockets": true });

        // self.socket.io.on('ping', () => {
        //     console.log('ping ping ')
        // })

        self.socket.on('disconnection_info', function (person, reason) {
            console.log('Player ' + person + ' disconnected because  ' + reason)
            self.errormsg.text = 'Player ' + person + ' disconnected because ' + reason
        })

    
        let play = true;

        while (play) {
            this.player_name = prompt("Please enter your FIRST NAME")
            if (self.player_name === null){
                play = false;
                self.socket.disconnect();
                scene.start('TitlePage');
            } else if (self.player_name.length > 0) {
                    play = false;
                    self.player_name = self.player_name.substring(0,9)
                    
                    console.log('name length', self.player_name.length)
                } 
            }
           

        self.socket.on('connect', async function () {
            self.socket.emit('roominfo', TABLE_ID, self.player_name);
            console.log('Connected to game', TABLE_ID, self.player_name);
        })

        self.socket.on('PlayerInfo', function (data) {

            let roomsConnected = data.map(p => p.player);
            
            let pp1 = roomsConnected.some(p => p === 1)
            let pp2 = roomsConnected.some(p => p === 2)
            let pp3 = roomsConnected.some(p => p === 3)
            let pp4 = roomsConnected.some(p => p === 4)

            data.forEach(id_for_Player)
            data.forEach(name_of_player)
            self.nameText.text = self.player_name 
        
            self.socket.emit('connectedPlayers', pp1, pp2, pp3, pp4, self.teamplayer1, self.teamplayer2, self.teamplayer3, self.teamplayer4);
        })

        self.socket.on('connectedPlayers', function (p1, p2, p3, p4, player1, player2, player3, player4) {

            p1 ? c1.fillColor = 0x00ff00 : c1.fillColor = 0x000000;
            p2 ? c2.fillColor = 0x00ff00 : c2.fillColor = 0x000000;
            p3 ? c3.fillColor = 0x00ff00 : c3.fillColor = 0x000000;
            p4 ? c4.fillColor = 0x00ff00 : c4.fillColor = 0x000000;
            let x1 = 9 - player1.length
            let x2 = 9 - player2.length
            let x3 = 9 - player3.length
            let x4 = 9 - player4.length

            self.teamplayer1 = ' '.repeat(x1) + player1
            self.teamplayer2 = ' '.repeat(x2) + player2
            self.teamplayer3 = ' '.repeat(x3) + player3
            self.teamplayer4 = ' '.repeat(x4) + player4

            self.playerText.text = self.teamplayer1 
            self.who_is_dealing_text.text = `${self.teamplayer1}\'s deal`

            let team_A = 'Team A: ' + player1 + ' and ' + player3
            let team_B = 'Team B: ' + player2 + ' and ' + player4

            p1 || p3 ? self.teamA.text = team_A : self.teamA.text = ''
            p2 || p4 ? self.teamB.text = team_B : self.teamB.text = ''


        })

        self.socket.on('PlayerWarning', function () {
            alert("This game has four players already. Please choose another game name.");
            self.socket.disconnect();
            scene.start('TitlePage');

        })

        self.socket.on('syncBoard', function (who, h1, h2, h3, h4, trick, text1, zone, zone1, text2, text3, text4, text5, text6, text7, text8, n1, n2, n3, n4,
            text9, text10, text11, text12, text13, text14, text15, text16, text17, text18, text19, text20, text21, text22, text23, n5, n6, c1, t1, t2, t3, t4, ct1, ct2, ct3, ct4) {
            //console.log('sync info recieved',who,h1,h2,h3,h4,trick,zone,zone1,text2,text3,text4,text5,text6,text7,text8,n1,n2,n3,n4,
            //text9,text10,text11,text12,text13,text14,text15,text16,text17,text18,text19,text20,text21,text22,text23,n5,n6,c1,,t1,t2,t3,t4)


            if ((self.isPlayerA && who === "A") || (self.isPlayerB && who === "B") || (self.isPlayerC && who === "C") || (self.isPlayerD && who === "D")) {

                self.who_is_dealing_text.text = text1
                self.dropZone.data.values.cards = zone
                self.dropZone1.data.values.cards = zone1
                self.playArea.text = text2
                self.bidText.text = text3
                self.callhandPlayer = text4
                self.usScore.text = text5
                self.usTotalScore.text = text6
                self.themScore.text = text7
                self.themTotalScore.text = text8
                self.us_click = n1
                self.us_total_click = n2
                self.them_click = n3
                self.them_total_click = n4
                self.playerText.text = text9
                self.bidnumberText.text = text10
                self.trumpText.text = text11
                self.specialBid.text = text12
                //self.doneBid.text = text13  //** */
                self.bidderpasses.text = text14
                self.dealText.text = text15
                self.countTrick.text = text16
                self.callHand.text = text17
                //self.call1.text = text18 //** */
                //self.call2.text = text19
                //self.call3.text = text20
                //self.call4.text = text21
                self.placeHolder = text22
                self.Holder = text23
                self.playerctr = n5
                self.bidnumberctr = n6
                self.pp1 = t1
                self.pp2 = t2
                self.pp3 = t3
                self.pp4 = t4
                self.playerctr = ct1
                self.bidnumberctr = ct2
                self.trumpctr = ct3
                self.specialbidctr = ct4

                destroyCards(self.callarea)
                playbox()


                // --  Draw box in call area
                if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerA || self.isPlayerC) && self.specialBid.text === 'CALL 1 HAND') {
                    self.callHand.text = "Discard 1 card each";
                    s2.setStrokeStyle(6, 0xfffb96);
                    for (let i = 0; i < c1.length; i++) {
                        let card = new Card(self);
                        let obj = card.render(((self.dropZone1.x - 75) + (i * 50)), (self.dropZone1.y), "cards", c1[i].obj.frameKey);
                        obj.disableInteractive();
                        let cardPlayedbyPlayer = c1[i].cardPlayedbyPlayer
                        let Zone = c1[i].Zone
                        self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
                    }
                }
                else if ((self.playerText.text === `${self.teamplayer2}` || self.playerText.text === `${self.teamplayer4}`) && (self.isPlayerB || self.isPlayerD) && self.specialBid.text === 'CALL 1 HAND') {
                    self.callHand.text = "Discard 1 card each";
                    s2.setStrokeStyle(6, 0xfffb96);
                    for (let i = 0; i < c1.length; i++) {
                        let card = new Card(self);
                        let obj = card.render(((self.dropZone1.x - 75) + (i * 50)), (self.dropZone1.y), "cards", c1[i].obj.frameKey);
                        obj.disableInteractive();
                        let cardPlayedbyPlayer = c1[i].cardPlayedbyPlayer
                        let Zone = c1[i].Zone
                        self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
                    }
                }
                else if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerA || self.isPlayerC) && self.specialBid.text === 'CALL 2 HAND') {
                    self.callHand.text = "Discard 2 cards each";
                    s2.setStrokeStyle(6, 0xfffb96);
                    for (let i = 0; i < c1.length; i++) {
                        let card = new Card(self);
                        let obj = card.render(((self.dropZone1.x - 75) + (i * 50)), (self.dropZone1.y), "cards", c1[i].obj.frameKey);
                        obj.disableInteractive();
                        let cardPlayedbyPlayer = c1[i].cardPlayedbyPlayer
                        let Zone = c1[i].Zone
                        self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
                    }
                }
                else if ((self.playerText.text === `${self.teamplayer2}` || self.playerText.text === `${self.teamplayer4}`) && (self.isPlayerB || self.isPlayerD) && self.specialBid.text === 'CALL 2 HAND') {
                    self.callHand.text = "Discard 2 cards each";
                    s2.setStrokeStyle(6, 0xfffb96);
                    for (let i = 0; i < c1.length; i++) {
                        let card = new Card(self);
                        let obj = card.render(((self.dropZone1.x - 75) + (i * 50)), (self.dropZone1.y), "cards", c1[i].obj.frameKey);
                        obj.disableInteractive();
                        let cardPlayedbyPlayer = c1[i].cardPlayedbyPlayer
                        let Zone = c1[i].Zone
                        self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
                    }
                }
                //------------ other stuff
                destroyCards(self.trick)
                //console.log('sync trick status', self.trick,h1,h2,h3,h4)
                self.trick = [];

                for (let i = 0; i < trick.length; i++) {
                    let card = new Card(self);
                    let obj = card.render(((self.dropZone.x - 75) + (i * 50)), (self.dropZone.y), "cards", trick[i].obj.frameKey);
                    let cardPlayedbyPlayer = trick[i].cardPlayedbyPlayer
                    let Zone = trick[i].Zone
                    obj.disableInteractive();
                    self.trick.push({ obj, cardPlayedbyPlayer, Zone });
                }

                destroyCards(playersHand)

                if (self.isPlayerA) {
                    for (let i = 0; i < h1.length; i++) {
                        let playerCard = new Card(self);
                        let objt = playerCard.render(325 + (i * 50), 650, 'cards', h1[i]);
                        self.recoverhand1.push(objt)
                    }
                }
                else if (self.isPlayerB) {
                    for (let i = 0; i < h2.length; i++) {
                        let playerCard = new Card(self);
                        let objt = playerCard.render(325 + (i * 50), 650, 'cards', h2[i]);
                        self.recoverhand2.push(objt)
                    }
                }
                else if (self.isPlayerC) {
                    for (let i = 0; i < h3.length; i++) {
                        let playerCard = new Card(self);
                        let objt = playerCard.render(325 + (i * 50), 650, 'cards', h3[i]);
                        self.recoverhand3.push(objt)
                    }
                }
                else if (self.isPlayerD) {
                    for (let i = 0; i < h4.length; i++) {
                        let playerCard = new Card(self);
                        let objt = playerCard.render(325 + (i * 50), 650, 'cards', h4[i]);
                        self.recoverhand4.push(objt)
                    }
                }


            } //-- end of if statement

        })

        self.socket.on('bidderpasses', function (whoisdealing) {
            console.log('bidderpasses', whoisdealing)
            if (whoisdealing === `${self.teamplayer1}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer2}\'s Bid`;
                bid_passes_counter++;
            }
            else if (whoisdealing === `${self.teamplayer2}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer3}\'s Bid`;
                bid_passes_counter++;
            }
            else if (whoisdealing === `${self.teamplayer3}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer4}\'s Bid`;
                bid_passes_counter++;
            }
            else if (whoisdealing === `${self.teamplayer4}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer1}\'s Bid`;
                bid_passes_counter++;
            }
            //console.log('bidding done --->>>', bid_passes_counter);
            if (bid_passes_counter === 4) {
                self.doneBid.text = 'Bidding Done'
                self.placeHolder = self.who_is_dealing_text.text;
                self.Holder = self.placeHolder;
                self.bidderpasses.text = '';
                self.who_is_dealing_text.text = '';
            }

        });

        self.socket.on('dealCards', function (hand, dealing, bidding) {
            self.hand1 = hand[0]
            self.hand2 = hand[1]
            self.hand3 = hand[2]
            self.hand4 = hand[3]
            self.us_click = 0;
            self.them_click = 0;
            self.usScore.text = "Team A     " + self.us_click;
            self.themScore.text = "Team B     " + self.them_click;
            self.trumpText.text = "No Trump";
            self.playerText.text = bidding;
            self.who_is_dealing_text.text = dealing;
            self.callarea.length = 0;
            playersHand = self.dealer.dealCards(hand);
            self.dealText.text = '';
            self.bidText.text = 'Bid Here -->';
            self.dealText.disableInteractive();
            self.bidderpasses.text = 'Bidder Done';
        })

        self.socket.on('playerText', function () {
            self.playerctr++;
            let lookup_player = { 1 : `${self.teamplayer2}`, 2 : `${self.teamplayer3}`, 3 : `${self.teamplayer4}`, 4 : `${self.teamplayer1}`}
            self.playerText.text = lookup_player[self.playerctr]
            if (self.playerctr === 4) {
                self.playerctr = 0;
            }
        })

        self.socket.on('bidnumberText', function () {
            self.bidnumberctr++;
            if (self.bidnumberctr === 9){
                self.bidnumberctr = 0;
            }
            self.bidnumberText.text = self.bidnumberctr;
           

        })

        self.socket.on('doneBid', function (status, placeHold) {
            console.log('donebid - 252', status, placeHold );
            self.doneBid.text = '';
            self.Holder = placeHold;
            self.placeHolder = placeHold;
            self.who_is_dealing_text.text = '';
            self.callhandPlayer = self.playerText.text;
            self.playArea.text = self.playerText.text + "'s turn";
            console.log('done bid on', self.playArea.text)
            if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerB || self.isPlayerD) && self.specialBid.text === 'CALL 1 HAND') {
                self.syncGame.text = ''
            }
            else if ((self.playerText.text === `${self.teamplayer2}` || self.playerText.text === `${self.teamplayer4}`) && (self.isPlayerA || self.isPlayerC) && self.specialBid.text === 'CALL 1 HAND') {
                self.syncGame.text = ''
            }
            else if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerB || self.isPlayerD) && self.specialBid.text === 'CALL 2 HAND') {
                self.syncGame.text = ''
            }
            else if ((self.playerText.text === `${self.teamplayer2}` || self.playerText.text === `${self.teamplayer4}`) && (self.isPlayerA || self.isPlayerC) && self.specialBid.text === 'CALL 2 HAND') {
                self.syncGame.text = ''
            }

            if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerA || self.isPlayerC) && self.specialBid.text === 'CALL 1 HAND') {
                self.callHand.text = "Discard 1 card each";
                self.bidText.text = 'Change Bid';
                s2.setStrokeStyle(6, 0xfffb96);

            }
            else if ((self.playerText.text === `${self.teamplayer2}` || self.playerText.text === `${self.teamplayer4}`) && (self.isPlayerB || self.isPlayerD) && self.specialBid.text === 'CALL 1 HAND') {
                self.callHand.text = "Discard 1 card each";
                self.bidText.text = 'Change Bid';
                s2.setStrokeStyle(6, 0xfffb96);
            }
            else if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerA || self.isPlayerC) && self.specialBid.text === 'CALL 2 HAND') {
                self.callHand.text = "Discard 2 cards each";
                self.bidText.text = 'Change Bid';
                s2.setStrokeStyle(6, 0xfffb96);
            }
            else if ((self.playerText.text === `${self.teamplayer2}` || self.playerText.text === `${self.teamplayer4}`) && (self.isPlayerB || self.isPlayerD) && self.specialBid.text === 'CALL 2 HAND') {
                self.callHand.text = "Discard 2 cards each";
                self.bidText.text = 'Change Bid';
                s2.setStrokeStyle(6, 0xfffb96);
            }
            else if (self.playerText.text === `${self.teamplayer1}` && self.specialBid.text === 'MOONSHOT' && self.isPlayerC) {
                destroyCards(playersHand)
            }
            else if (self.playerText.text === `${self.teamplayer3}` && self.specialBid.text === 'MOONSHOT' && self.isPlayerA) {
                destroyCards(playersHand)
            }
            else if (self.playerText.text === `${self.teamplayer2}` && self.specialBid.text === 'MOONSHOT' && self.isPlayerD) {
                destroyCards(playersHand)
            }
            else if (self.playerText.text === `${self.teamplayer4}` && self.specialBid.text === 'MOONSHOT' && self.isPlayerB) {
                destroyCards(playersHand)
            }

            //console.log('done bid', self.specialBid.text, status);
            if (status === 'Card Selection Done') {
                //console.log('card selection done ............>>> ',self.callhandPlayer, self.recoverhand1,self.isPlayerA)
                self.bidText.text = "Play";
                self.callHand.text = '';
                self.call1.text = '';
                self.call2.text = '';
                self.call3.text = '';
                self.call4.text = '';
                s2.setStrokeStyle(0);
                self.syncGame.text = 'Recover'

                if (self.callhandPlayer === `${self.teamplayer1}` && self.isPlayerC) {
                    destroyCards(playersHand)
                    destroyCards(self.recoverhand3)
                    destroycallareaCards(self.callarea)
                }
                else if (self.callhandPlayer === `${self.teamplayer3}` && self.isPlayerA) {
                    destroyCards(playersHand)
                    destroyCards(self.recoverhand1)
                    destroycallareaCards(self.callarea)
                }
                else if (self.callhandPlayer === `${self.teamplayer4}` && self.isPlayerB) {
                    destroyCards(playersHand)
                    destroyCards(self.recoverhand2)
                    destroycallareaCards(self.callarea)
                }
                else if (self.callhandPlayer === `${self.teamplayer2}` && self.isPlayerD) {
                    destroyCards(playersHand)
                    destroyCards(self.recoverhand4)
                    destroycallareaCards(self.callarea)
                }
                playbox();
            }
            else if (status === 'Bidding Done' && (self.specialBid.text === 'Special Bids' || self.specialBid.text === 'MOONSHOT')) {
                self.bidText.text = "Change Bid";
                playbox();

            }

        })

        self.socket.on('trumpText', function () {
            self.trumpctr++;

            let lookupTrump = { 1 : 'HEARTS', 2 : 'DIAMONDS', 3 : 'CLUBS', 4 : 'SPADES', 5 : 'No Trump'}

            self.trumpText.text = lookupTrump[self.trumpctr];

            if (self.trumpctr === 5) {
                self.trumpctr = 0;
            }

        })

        self.socket.on('specialBid', function () {
            self.specialbidctr++

            let lookupBid = { 1 : 'CALL 1 HAND', 2 : 'CALL 2 HAND', 3 : 'MOONSHOT', 4 : 'Special Bids'}
            let lookupctr = { 1 : 8 , 2 : 8, 3 : 8, 4 : 0}

            self.specialBid.text = lookupBid[self.specialbidctr]
            self.bidnumberctr = lookupctr[self.specialbidctr]
            self.bidnumberText.text = self.bidnumberctr;

            if (self.specialbidctr === 4) {
                self.specialbidctr = 0;
            }
        })

        self.socket.on('changebid', function () {
            self.bidText.text = "Bid Here -->";
            self.doneBid.text = "Bidding Done"
            self.callHand.text = '';
            self.call1.text = '';
            self.call2.text = '';
            self.call3.text = '';
            self.call4.text = '';
            self.dropZone1.data.values.cards = 0;
            s2.setStrokeStyle(0);
            let spacer = 800;
            for (let i = 0; i < self.callarea.length; i++) {
                spacer = spacer + 50;
                if (self.callarea[i].cardPlayedbyPlayer === 0 && self.isPlayerA) {
                    let card = new Card(self);
                    card.render(spacer, 650, "cards", self.callarea[i].obj.frame.name);
                }
                else if (self.callarea[i].cardPlayedbyPlayer === 2 && self.isPlayerC) {
                    let card = new Card(self);
                    card.render(spacer, 650, "cards", self.callarea[i].obj.frame.name);
                }
                else if (self.callarea[i].cardPlayedbyPlayer === 1 && self.isPlayerB) {
                    let card = new Card(self);
                    card.render(spacer, 650, "cards", self.callarea[i].obj.frame.name);
                }
                else if (self.callarea[i].cardPlayedbyPlayer === 3 && self.isPlayerD) {
                    let card = new Card(self);
                    card.render(spacer, 650, "cards", self.callarea[i].obj.frame.name);
                }

            }
            for (let i = 0; i < self.callarea.length; i++) {
                self.callarea[i].obj.destroy();
            }
            self.callarea.length = 0;
        })

        self.socket.on('clearTrick', function (dealing) {
            self.errormsg.text = ''
            console.log('clear Trick ---- ', self.playerctr);
            let cloneTrick = JSON.parse(JSON.stringify(self.trick));
            //++++++ NO Trump ++++++
            if (self.trumpText.text === 'No Trump') {
                let suit = self.trick[0].obj.frame.name.charAt(1);
                let winner = self.trick[0].obj.frame.name;
                for (let i = 1; i < self.trick.length; i++) {
                    if (suit === self.trick[i].obj.frame.name.charAt(1)) {
                        winner = results(winner, self.trick[i].obj.frame.name);
                    }
                }
                let pos = self.trick.map(function (e) { return e.obj.frame.name; }).indexOf(winner);
                playersTurn(pos);
                playbox();

            }  //end of no trump if statement
            //+++  Hearts, Diamonds, Spades, Clubs and Moonshot
            if (self.trumpText.text !== 'No Trump') {
                if (self.trumpText.text === 'HEARTS') {
                    for (let i = 0; i < 2; i++) {
                        let objIndex1 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'jh'));
                        let objIndex2 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'jd'));
                        if (objIndex1 !== -1) {
                            cloneTrick[objIndex1].obj.frameKey = "Br";
                        }
                        if (objIndex2 !== -1) {
                            cloneTrick[objIndex2].obj.frameKey = "bl";
                        }
                    }
                    let winner = cloneTrick[0].obj.frameKey;
                    let nontrumpwinner = winner;
                    for (let i = 1; i < cloneTrick.length; i++) {
                        winner = outcome(winner, cloneTrick[i].obj.frameKey, 'h', nontrumpwinner);
                    }
                    let pos = cloneTrick.map(function (e) { return e.obj.frameKey; }).indexOf(winner);
                    //console.log('the winning heart is ', winner, pos,  cloneTrick);
                    playersTurn(pos);
                    playbox();

                }
                else if (self.trumpText.text === 'SPADES') {
                    for (let i = 0; i < 2; i++) {
                        let objIndex1 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'js'));
                        let objIndex2 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'jc'));
                        if (objIndex1 !== -1) {
                            cloneTrick[objIndex1].obj.frameKey = "Br";
                        }
                        if (objIndex2 !== -1) {
                            cloneTrick[objIndex2].obj.frameKey = "bl";
                        }
                    }
                    let winner = cloneTrick[0].obj.frameKey;
                    let nontrumpwinner = winner;
                    for (let i = 1; i < cloneTrick.length; i++) {
                        winner = outcome(winner, cloneTrick[i].obj.frameKey, 's', nontrumpwinner);
                    }
                    let pos = cloneTrick.map(function (e) { return e.obj.frameKey; }).indexOf(winner);
                    //console.log('the winning spade is ', winner, pos,  cloneTrick);
                    playersTurn(pos);
                    playbox();
                }
                else if (self.trumpText.text === 'CLUBS') {
                    for (let i = 0; i < 2; i++) {
                        let objIndex1 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'jc'));
                        let objIndex2 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'js'));
                        if (objIndex1 !== -1) {
                            cloneTrick[objIndex1].obj.frameKey = "Br";
                        }
                        if (objIndex2 !== -1) {
                            cloneTrick[objIndex2].obj.frameKey = "bl";
                        }
                    }
                    let winner = cloneTrick[0].obj.frameKey;
                    let nontrumpwinner = winner;
                    for (let i = 1; i < cloneTrick.length; i++) {
                        winner = outcome(winner, cloneTrick[i].obj.frameKey, 'c', nontrumpwinner);
                    }
                    let pos = cloneTrick.map(function (e) { return e.obj.frameKey; }).indexOf(winner);
                    //console.log('the winning club is ', winner, pos,  cloneTrick);
                    playersTurn(pos);
                    playbox();
                }
                else if (self.trumpText.text === 'DIAMONDS') {
                    // console.log('Diamonds are trump');
                    for (let i = 0; i < 2; i++) {
                        let objIndex1 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'jd'));
                        let objIndex2 = cloneTrick.findIndex((xx => xx.obj.frameKey === 'jh'));
                        if (objIndex1 !== -1) {
                            cloneTrick[objIndex1].obj.frameKey = "Br";
                        }
                        if (objIndex2 !== -1) {
                            cloneTrick[objIndex2].obj.frameKey = "bl";
                        }
                    }
                    let winner = cloneTrick[0].obj.frameKey;
                    let nontrumpwinner = winner;
                    for (let i = 1; i < cloneTrick.length; i++) {
                        winner = outcome(winner, cloneTrick[i].obj.frameKey, 'd', nontrumpwinner);
                    }
                    let pos = cloneTrick.map(function (e) { return e.obj.frameKey; }).indexOf(winner);
                    playersTurn(pos);
                    playbox();
                }
                //------
                //console.log('trick info counters', self.us_click, self.them_click);


            }

            if (self.trick.length >= 3) {
                for (let i = 0; i < self.trick.length; i++) {
                    self.trick[i].obj.destroy();
                }
                self.trick = [];
                self.trickCounter++

                if (self.trickCounter === 8) {
                    s1.setStrokeStyle(6, 0x01cdfe);
                    //console.log('trick counter', dealing);
                    self.who_is_dealing_text.text = dealing;
                    self.call1.style.backgroundColor = null;
                    self.call2.style.backgroundColor = null;
                    self.call3.style.backgroundColor = null;
                    self.call4.style.backgroundColor = null;
                    self.playArea.text = '';
                    self.dropZone1.data.values.cards = 0;
                    if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click >= 8 && self.specialBid.text === 'MOONSHOT') {
                        self.us_total_click = self.us_total_click + 24;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click <= 7 && self.specialBid.text === 'MOONSHOT') {
                        self.us_total_click = self.us_total_click - 24;
                        self.them_total_click = self.them_total_click + self.them_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click >= 8 && self.specialBid.text === 'CALL 1 HAND') {
                        self.us_total_click = self.us_total_click + 18;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click <= 7 && self.specialBid.text === 'CALL 1 HAND') {
                        self.us_total_click = self.us_total_click - 18;
                        self.them_total_click = self.them_total_click + self.them_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click >= 8 && self.specialBid.text === 'CALL 2 HAND') {
                        self.us_total_click = self.us_total_click + 12;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click <= 7 && self.specialBid.text === 'CALL 2 HAND') {
                        self.us_total_click = self.us_total_click - 12;
                        self.them_total_click = self.them_total_click + self.them_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click >= 8 && self.specialBid.text === 'MOONSHOT') {
                        self.them_total_click = self.them_total_click + 24;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click <= 7 && self.specialBid.text === 'MOONSHOT') {
                        self.them_total_click = self.them_total_click - 24;
                        self.us_total_click = self.us_total_click + self.us_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click >= 8 && self.specialBid.text === 'CALL 1 HAND') {
                        self.them_total_click = self.them_total_click + 18;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click <= 7 && self.specialBid.text === 'CALL 1 HAND') {
                        self.them_total_click = self.them_total_click - 18;
                        self.us_total_click = self.us_total_click + self.us_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click >= 8 && self.specialBid.text === 'CALL 2 HAND') {
                        self.them_total_click = self.them_total_click + 12;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click <= 7 && self.specialBid.text === 'CALL 2 HAND') {
                        self.them_total_click = self.them_total_click - 12;
                        self.us_total_click = self.us_total_click + self.us_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click >= self.bidnumberctr && self.specialBid.text === 'Special Bids') {
                        self.us_total_click = self.us_total_click + self.bidnumberctr;
                        self.them_total_click = self.them_total_click + self.them_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer1}` || self.callhandPlayer === `${self.teamplayer3}`) && self.us_click <= self.bidnumberctr && self.specialBid.text === 'Special Bids') {
                        self.us_total_click = self.us_total_click - self.bidnumberctr;
                        self.them_total_click = self.them_total_click + self.them_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click >= self.bidnumberctr && self.specialBid.text === 'Special Bids') {
                        self.them_total_click = self.them_total_click + self.bidnumberctr;
                        self.us_total_click = self.us_total_click + self.us_click;
                    }
                    else if ((self.callhandPlayer === `${self.teamplayer2}` || self.callhandPlayer === `${self.teamplayer4}`) && self.them_click <= self.bidnumberctr && self.specialBid.text === 'Special Bids') {
                        self.them_total_click = self.them_total_click - self.bidnumberctr;
                        self.us_total_click = self.us_total_click + self.us_click;
                    }
                    self.specialBid.text = 'Special Bids';
                    self.dealText.text = 'Deal Cards';
                    self.bidnumberctr = 0;
                    self.bidnumberText.text = 0;
                    self.dealText.setInteractive();
                    let lookup_player_text = { 1 : `${self.teamplayer2}`, 2 : `${self.teamplayer3}`, 3 : `${self.teamplayer4}`, 4 : `${self.teamplayer1}`}
                    self.playerText.text = lookup_player_text[self.playerctr]
                    self.trumpText.text = "No Trump";
                    self.usTotalScore.text = "Team\'s A total    " + self.us_total_click;
                    self.themTotalScore.text = "Team\'s B total    " + self.them_total_click;
                    self.trickCounter = 0;
                    self.bidderpasses.text = 'Bidder Done'
                    bid_passes_counter = 0;
                    //self.doneBid.text = "Bidding Done";
                    self.trick = [];
                    for (let i = 0; i < playersHand.length; i++) {
                        playersHand[i].destroy();
                    }

                }

                self.dropZone.data.values.cards = 0;
                //self.dropZone1.data.values.cards = 0;
            } else { return false }
        })

        self.socket.on('cardPlayed', function (gameObject, isPlayerA, isPlayerB, isPlayerC, isPlayerD, Zone, h1, h2, h3, h4) {
            self.hand1 = h1;
            self.hand2 = h2;
            self.hand3 = h3;
            self.hand4 = h4;
            self.pp1 = isPlayerA
            self.pp2 = isPlayerB
            self.pp3 = isPlayerC
            self.pp4 = isPlayerD


            if (self.specialBid.text === 'Special Bids') {
                if (self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`;
                    playbox();
                }
                else if (self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`;
                    playbox();
                }
                else if (self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`;
                    playbox();
                }
                else if (self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`;
                    playbox();
                }
            } else if (self.specialBid.text !== 'Special Bids') {
                if (self.callhandPlayer === `${self.teamplayer1}` && self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`;
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer1}` && self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer1}` && self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer2}` && self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer2}` && self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer2}` && self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`
                    playbox();
                }

                else if (self.callhandPlayer === `${self.teamplayer3}` && self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer3}` && self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer3}` && self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer4}` && self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer4}` && self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer4}` && self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`
                    playbox();
                }
            }
            let people = [isPlayerA, isPlayerB, isPlayerC, isPlayerD];

            let cardPlayedbyPlayer = people.indexOf(true);

            if (Zone.x === 825 && isPlayerA !== self.isPlayerB && isPlayerA !== self.isPlayerD && self.playerText.text === `${self.teamplayer3}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }
            else if (Zone.x === 825 && isPlayerA !== self.isPlayerB && isPlayerA !== self.isPlayerD && self.playerText.text === `${self.teamplayer1}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }
            else if (Zone.x === 825 && isPlayerC !== self.isPlayerB && isPlayerC !== self.isPlayerD && self.playerText.text === `${self.teamplayer3}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }
            else if (Zone.x === 825 && isPlayerC !== self.isPlayerB && isPlayerC !== self.isPlayerD && self.playerText.text === `${self.teamplayer1}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }

            if (Zone.x === 825 && isPlayerB !== self.isPlayerA && isPlayerB !== self.isPlayerC && self.playerText.text === `${self.teamplayer4}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }
            else if (Zone.x === 825 && isPlayerB !== self.isPlayerA && isPlayerB !== self.isPlayerC && self.playerText.text === `${self.teamplayer2}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }

            else if (Zone.x === 825 && isPlayerD !== self.isPlayerA && isPlayerD !== self.isPlayerC && self.playerText.text === `${self.teamplayer4}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }
            else if (Zone.x === 825 && isPlayerD !== self.isPlayerA && isPlayerD !== self.isPlayerC && self.playerText.text === `${self.teamplayer2}`) {
                self.dropZone1.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50)), (self.dropZone1.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
            }

            if (Zone.x === 425 && isPlayerA !== self.isPlayerA) {
                self.dropZone.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone.x - 125) + (self.dropZone.data.values.cards * 50)), (self.dropZone.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.trick.push({ obj, cardPlayedbyPlayer, Zone });
                //console.log('dropzone starts here', self.dropZone.x);
            }
            else if (Zone.x === 425 && isPlayerB !== self.isPlayerB) {
                self.dropZone.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone.x - 125) + (self.dropZone.data.values.cards * 50)), (self.dropZone.y), "cards", gameObject.frameKey);
                obj.disableInteractive();
                self.trick.push({ obj, cardPlayedbyPlayer, Zone });
            }
            else if (Zone.x === 425 && isPlayerC !== self.isPlayerC) {
                self.dropZone.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone.x - 125) + (self.dropZone.data.values.cards * 50)), (self.dropZone.y), "cards", gameObject.frameKey);
                self.trick.push({ obj, cardPlayedbyPlayer, Zone });
            }
            else if (Zone.x === 425 && isPlayerD !== self.isPlayerD) {
                self.dropZone.data.values.cards++;
                let card = new Card(self);
                let obj = card.render(((self.dropZone.x - 125) + (self.dropZone.data.values.cards * 50)), (self.dropZone.y), "cards", gameObject.frameKey);
                self.trick.push({ obj, cardPlayedbyPlayer, Zone });
            }

            //console.log('number of cards placed in play area', self.dropZone.data.values.cards, gameObject.frameKey);

            // console.log("contents of self.trick", self.trick);
            //console.log("contents of self.callarea", self.callarea, isPlayerA, self.playerText.text);
            if (isPlayerA && self.playerText.text === `${self.teamplayer3}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.callHand.text = "Select card you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            else if (isPlayerC && self.playerText.text === `${self.teamplayer1}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.callHand.text = "Select card you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            else if (isPlayerA && self.playerText.text === `${self.teamplayer3}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.call3.text = '3';
                self.call4.text = '4';
                self.callHand.text = "Select the cards you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            else if (isPlayerC && self.playerText.text === `${self.teamplayer1}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.call3.text = '3';
                self.call4.text = '4';
                self.callHand.text = "Select the cards you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            else if (isPlayerB && self.playerText.text === `${self.teamplayer4}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.callHand.text = "Select card you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            else if (isPlayerD && self.playerText.text === `${self.teamplayer2}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.callHand.text = "Select card you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            else if (isPlayerB && self.playerText.text === `${self.teamplayer4}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.call3.text = '3';
                self.call4.text = '4';
                self.callHand.text = "Select the cards you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            else if (isPlayerD && self.playerText.text === `${self.teamplayer2}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                self.call1.text = '1';
                self.call2.text = '2';
                self.call3.text = '3';
                self.call4.text = '4';
                self.callHand.text = "Select the cards you are keeping";
                self.doneBid.text = "Card Selection Done";
            }

        })

        this.errormsg = this.add.text(850, 725, '', { font: "18px Arial", fill: "#05ffa1" })
        this.dealText = this.add.text(25, 85, ['Deal Cards'], { font: "26px Arial Black", fill: "#05ffa1" }).setInteractive();
        this.countTrick = this.add.text(25, 190, ['Clear Trick'], { font: "26px Arial Black", fill: "#05ffa1" }).setInteractive();
        this.playArea = this.add.text(320, 25, [''], { font: "24px Arial Black", fill: "#fffb96" }).setStroke('#000000', 4);
        this.callHand = this.add.text(650, 25, ['                   '], { color: 'white', fontSize: '22px' });
        //this.nameText = this.add.text(25, 25, [''], { color: '#fffb96', fontSize: 'bold 22px' });
        this.callhandPlayer = '';
        this.usScore = this.add.text(25, 120, ['Team A     ' + self.us_click]).setFontSize(22).setFontFamily('Trebuchet MS').setColor('#FFFFFF').setInteractive();
        this.themScore = this.add.text(25, 155, ['Team B     ' + self.them_click]).setFontSize(22).setFontFamily('Trebuchet MS').setColor('#FFFFFF').setInteractive();
        this.usTotalScore = this.add.text(25, 225, ["Team A\'s total     " + self.us_total_click])
        .setFontSize(22).setFontFamily('Trebuchet MS')
        .setColor('#FFFFFF')
        .setInteractive();
        this.themTotalScore = this.add.text(25, 260, ["Team B\'s total     " + self.them_total_click])
        .setFontSize(22).setFontFamily('Trebuchet MS')
        .setColor('#FFFFFF')
        .setInteractive();

        this.bidText = this.add.text(25, 320, [''], { color: 'white', fontSize: 'bold 26px' }).setInteractive();
        this.playerText = this.add.text(240, 320, `${self.teamplayer1}`, { color: '#fffb96', fontSize: 'bold 26px', align: 'right' }).setInteractive();
        this.bidnumberText = this.add.text(400, 320, [self.bidnumberctr], { color: '#fffb96', fontSize: 'bold 26px', align: 'right' }).setInteractive();
        this.trumpText = this.add.text(445, 320, ['No Trump'], { color: '#fffb96', fontSize: 'bold 26px', align: 'right' }).setInteractive();
        this.specialBid = this.add.text(590, 320, ['Special Bids'], { color: '#fffb96', fontSize: 'bold 26px', align: 'right' }).setInteractive();
        this.doneBid = this.add.text(820, 315, [''], { font: "26px Bebas Neue", fill: "#00ff00" }).setStroke('#000000', 8).setInteractive();

        this.who_is_dealing_text = this.add.bitmapText(275, 150, 'claredon', '', 30);
        this.bidderpasses = this.add.text(355, 260, '', { fontSize: 'bold 18px' }).setInteractive();

        this.call1 = this.add.text(1050, 100, [''], { color: 'white', fontSize: 'bold 26px' }).setInteractive();
        this.call2 = this.add.text(1050, 150, [''], { color: 'white', fontSize: 'bold 26px' }).setInteractive();
        this.call3 = this.add.text(1050, 200, [''], { color: 'white', fontSize: 'bold 26px' }).setInteractive();
        this.call4 = this.add.text(1050, 250, [''], { color: 'white', fontSize: 'bold 26px' }).setInteractive();


        //-----
        this.syncGame = this.add.text(25, 730, 'Recover', { fontSize: 24 })
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.syncGame.setStyle({ fill: '#ff0000' }))
            .on('pointerout', () => this.syncGame.setStyle({ fill: '#ffffff' }))

        let bid_passes_counter = 0;

        this.syncGame.on('pointerdown', function () {
            let wait = true
            let gamer = ''
            let resyncboard = false
            while (wait) {
                let reply = prompt("Please enter Player's Letter (A,B,C or D) to recover or 'X' to abort")
                gamer = reply.toUpperCase();
                if (gamer === 'A' || gamer === 'B' || gamer === 'C' || gamer === 'D') {
                    wait = false;
                    resyncboard = true
                } else {
                    if (gamer === null) {
                        return false
                    }
                }
            }

            if (resyncboard === true) {

                self.socket.emit('syncBoardclient', gamer, self.hand1, self.hand2, self.hand3, self.hand4, self.trick,
                    self.who_is_dealing_text.text, self.dropZone.data.values.cards, self.dropZone1.data.values.cards,
                    self.playArea.text, self.bidText.text, self.callhandPlayer, self.usScore.text, self.usTotalScore.text,
                    self.themScore.text, self.themTotalScore.text, self.us_click, self.us_total_click, self.them_click, self.them_total_click,
                    self.playerText.text, self.bidnumberText.text, self.trumpText.text, self.specialBid.text, self.doneBid.text,
                    self.bidderpasses.text, self.dealText.text, self.countTrick.text, self.callHand.text, self.call1.text, self.call2.text,
                    self.call3.text, self.call4.text, self.placeHolder, self.Holder, self.playerctr, self.bidnumberctr, self.callarea, self.pp1,
                    self.pp2, self.pp3, self.pp4, self.playerctr, self.bidnumberctr, self.trumpctr, self.specialbidctr)
            }
        })

        this.bidderpasses.on('pointerdown', function () {
            console.log('clicked bidderpasses', self.who_is_dealing_text.text);
            self.socket.emit('bidderpasses', self.who_is_dealing_text.text);
            if (self.who_is_dealing_text.text === `${self.teamplayer1}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer2}\'s Bid`;
                bid_passes_counter++;
            }
            else if (self.who_is_dealing_text.text === `${self.teamplayer2}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer3}\'s Bid`;
                bid_passes_counter++;
            }
            else if (self.who_is_dealing_text.text === `${self.teamplayer3}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer4}\'s Bid`;
                bid_passes_counter++;
            }
            else if (self.who_is_dealing_text.text === `${self.teamplayer4}\'s Bid`) {
                self.who_is_dealing_text.text = `${self.teamplayer1}\'s Bid`;
                bid_passes_counter++;
            }
            //console.log('bidding done --->>>', bid_passes_counter);
            if (bid_passes_counter === 4) {
                self.doneBid.text = 'Bidding Done';
                self.placeHolder = self.who_is_dealing_text.text;
                self.Holder = self.placeHolder;
                self.who_is_dealing_text.text = '';
                self.bidderpasses.text = '';

            }
        })

        this.dealText.on('pointerdown', function () {
            let deck = createHands();
            self.dealText.text = '';
            self.dealText.disableInteractive();
            self.bidText.text = 'Bid Here -->';
            self.bidderpasses.text = 'Bidder Done';
            //self.bid_completed.text = 'Bid Completed';
            console.log('deal text', self.who_is_dealing_text.text)
            console.log('teamplayer1', `${self.teamplayer1}`)
            console.log('teamplayer2', `${self.teamplayer2}`)
            console.log('teamplayer3', `${self.teamplayer3}`)
            console.log('teamplayer4', `${self.teamplayer4}`)
            if (self.who_is_dealing_text.text === `${self.teamplayer1}\'s deal`) {
                self.who_is_dealing_text.text = `${self.teamplayer2}\'s Bid`;
                self.playerText.text = `${self.teamplayer2}`;
            }
            else if (self.who_is_dealing_text.text === `${self.teamplayer2}\'s deal`) {
                self.who_is_dealing_text.text = `${self.teamplayer3}\'s Bid`;
                self.playerText.text = `${self.teamplayer3}`;
            }
            else if (self.who_is_dealing_text.text === `${self.teamplayer3}\'s deal`) {
                self.who_is_dealing_text.text = `${self.teamplayer4}\'s Bid`;
                self.playerText.text = `${self.teamplayer4}`;
            }
            else if (self.who_is_dealing_text.text === `${self.teamplayer4}\'s deal`) {
                self.who_is_dealing_text.text = `${self.teamplayer1}\'s Bid`;
                self.playerText.text = `${self.teamplayer1}`;
            }
            self.socket.emit('dealCards', deck, self.who_is_dealing_text.text, self.playerText.text);
        })

        this.doneBid.on('pointerdown', function () {
            //console.log('Bidding Done+++++', self.who_is_dealing_text.text)
            if (self.doneBid.text === 'Bidding Done' && self.dealText.text !== 'Deal Cards') {
                self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                self.doneBid.text = '';
                self.who_is_dealing_text.text = '';
                self.callhandPlayer = self.playerText.text;
            }
            else if (self.doneBid.text === 'Card Selection Done') {
                if (self.specialBid.text === 'CALL 1 HAND') {
                    if (self.call1.style.backgroundColor === null && self.call2.style.backgroundColor === 'green') {
                        playersHand.push(self.callarea[1].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[1].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';

                    }
                    else if (self.call1.style.backgroundColor === 'green' && self.call2.style.backgroundColor === null) {
                        playersHand.push(self.callarea[0].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[0].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';
                    }
                    else if (self.call1.style.backgroundColor === 'green' && self.call2.style.backgroundColor === 'green') {
                        alert("One selection is needed");
                        self.doneBid.text = "Card Selection Done";
                    }
                    else if (self.call1.style.backgroundColor === null && self.call2.style.backgroundColor === null) {
                        alert("One selection is needed");
                        self.doneBid.text = "Card Selection Done";
                    }

                }
                else if (self.specialBid.text === 'CALL 2 HAND') {
                    if (self.call1.style.backgroundColor === "green" && self.call2.style.backgroundColor === 'green' &&
                        self.call3.style.backgroundColor === null && self.call4.style.backgroundColor === null) {
                        playersHand.push(self.callarea[0].obj);
                        playersHand.push(self.callarea[1].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        self.callarea[2].obj.destroy();
                        self.callarea[3].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[0].obj.frame.name);
                        let card1 = new Card(self);
                        card1.render(850, 650, "cards", self.callarea[1].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';
                    }
                    else if (self.call1.style.backgroundColor === null && self.call2.style.backgroundColor === 'green' &&
                        self.call3.style.backgroundColor === 'green' && self.call4.style.backgroundColor === null) {
                        playersHand.push(self.callarea[1].obj);
                        playersHand.push(self.callarea[2].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        self.callarea[2].obj.destroy();
                        self.callarea[3].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[1].obj.frame.name);
                        let card1 = new Card(self);
                        card1.render(850, 650, "cards", self.callarea[2].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';
                    }
                    else if (self.call1.style.backgroundColor === null && self.call2.style.backgroundColor === null &&
                        self.call3.style.backgroundColor === 'green' && self.call4.style.backgroundColor === 'green') {
                        playersHand.push(self.callarea[2].obj);
                        playersHand.push(self.callarea[3].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        self.callarea[2].obj.destroy();
                        self.callarea[3].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[2].obj.frame.name);
                        let card1 = new Card(self);
                        card1.render(850, 650, "cards", self.callarea[3].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';
                    }
                    else if (self.call1.style.backgroundColor === 'green' && self.call2.style.backgroundColor === null &&
                        self.call3.style.backgroundColor === null && self.call4.style.backgroundColor === 'green') {
                        playersHand.push(self.callarea[0].obj);
                        playersHand.push(self.callarea[3].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        self.callarea[2].obj.destroy();
                        self.callarea[3].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[0].obj.frame.name);
                        let card1 = new Card(self);
                        card1.render(850, 650, "cards", self.callarea[3].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';
                    }
                    else if (self.call1.style.backgroundColor === 'green' && self.call2.style.backgroundColor === null &&
                        self.call3.style.backgroundColor === 'green' && self.call4.style.backgroundColor === null) {
                        playersHand.push(self.callarea[0].obj);
                        playersHand.push(self.callarea[2].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        self.callarea[2].obj.destroy();
                        self.callarea[3].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[0].obj.frame.name);
                        let card1 = new Card(self);
                        card1.render(850, 650, "cards", self.callarea[2].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';
                    }
                    else if (self.call1.style.backgroundColor === null && self.call2.style.backgroundColor === 'green' &&
                        self.call3.style.backgroundColor === null && self.call4.style.backgroundColor === 'green') {
                        playersHand.push(self.callarea[1].obj);
                        playersHand.push(self.callarea[3].obj);
                        self.callarea[0].obj.destroy();
                        self.callarea[1].obj.destroy();
                        self.callarea[2].obj.destroy();
                        self.callarea[3].obj.destroy();
                        let card = new Card(self);
                        card.render(800, 650, "cards", self.callarea[1].obj.frame.name);
                        let card1 = new Card(self);
                        card1.render(850, 650, "cards", self.callarea[3].obj.frame.name);
                        self.placeHolder = self.Holder;
                        self.socket.emit('doneBid', self.doneBid.text, self.placeHolder);
                        self.doneBid.text = '';
                        self.bidText.text = 'Ready';
                    }
                    else {
                        alert("Two selections are needed. Please check your selections.");
                        self.doneBid.text = "Card Selection Done";
                    }
                }
            }
            self.callHand.text = "";

        })

        this.playerText.on('pointerdown', function () {
            self.socket.emit('playerText');
        })

        this.bidnumberText.on('pointerdown', function () {
            self.socket.emit('bidnumberText');
        })

        this.trumpText.on('pointerdown', function () {
            self.socket.emit('trumpText');
        })

        this.specialBid.on('pointerdown', function () {
            self.socket.emit('specialBid');
        })

        this.bidText.on('pointerdown', function () {
            if (self.bidText.text === 'Change Bid') {
                if (confirm('Do you wish to modified the Bid')) {
                    self.bidText.text = "Bid Here -->";
                    self.doneBid.text = "Bidding Done"
                    self.callHand.text = '';
                    self.call1.text = '';
                    self.call2.text = '';
                    self.call3.text = '';
                    self.call4.text = '';
                    self.call1.setBackgroundColor(null);
                    self.call2.setBackgroundColor(null);
                    self.call3.setBackgroundColor(null);
                    self.call4.setBackgroundColor(null);
                    self.dropZone1.data.values.cards = 0;
                    s2.setStrokeStyle(0);

                    let space = 800;
                    //  console.log('pointer done change bid ---->>>>', self.isPlayerA, self.isPlayerC);
                    for (let i = 0; i < self.callarea.length; i++) {
                        space = space + 50;
                        if (self.callarea[i].cardPlayedbyPlayer === 0 && self.isPlayerA) {
                            let card = new Card(self);
                            card.render(space, 650, "cards", self.callarea[i].obj.frame.name);
                        }
                        else if (self.callarea[i].cardPlayedbyPlayer === 2 && self.isPlayerC) {
                            let card = new Card(self);
                            card.render(space, 650, "cards", self.callarea[i].obj.frame.name);
                        }
                        else if (self.callarea[i].cardPlayedbyPlayer === 1 && self.isPlayerB) {
                            let card = new Card(self);
                            card.render(space, 650, "cards", self.callarea[i].obj.frame.name);
                        }
                        else if (self.callarea[i].cardPlayedbyPlayer === 3 && self.isPlayerD) {
                            let card = new Card(self);
                            card.render(space, 650, "cards", self.callarea[i].obj.frame.name);
                        }

                    }
                    for (let i = 0; i < self.callarea.length; i++) {
                        self.callarea[i].obj.destroy();
                    }
                    self.socket.emit('changebid');
                    self.callarea.length = 0;
                }
                else {
                    console.log('do nothing');
                }

            }

        })

        this.usScore.on('pointerdown', function () {
            self.socket.emit('usScore');
        })

        this.themScore.on('pointerdown', function () {
            self.socket.emit('themScore');
        })

        this.usTotalScore.on('pointerdown', function () {
            self.socket.emit('usTotalScore');
        })

        this.themTotalScore.on('pointerdown', function () {
            self.socket.emit('themTotalScore');
        })

        this.countTrick.on('pointerdown', function () {
            // console.log('count tricks', self.placeHolder, self.trickCounter);
            if (self.trickCounter === 7) {
                self.who_is_dealing_text.text = self.placeHolder;
                //console.log('pointer down clear trick', self.who_is_dealing_text.text, self.trickCounter);
                if (self.who_is_dealing_text.text === `${self.teamplayer2}\'s Bid`) {
                    self.who_is_dealing_text.text = `${self.teamplayer2}\'s deal`;
                    self.playerText.text = `${self.teamplayer2}`;
                }
                else if (self.who_is_dealing_text.text === `${self.teamplayer3}\'s Bid`) {
                    self.who_is_dealing_text.text = `${self.teamplayer3}\'s deal`;
                    self.playerText.text = `${self.teamplayer3}`;
                }
                else if (self.who_is_dealing_text.text === `${self.teamplayer4}\'s Bid`) {
                    self.who_is_dealing_text.text = `${self.teamplayer4}\'s deal`;
                    self.playerText.text = `${self.teamplayer4}`;
                }
                else if (self.who_is_dealing_text.text === `${self.teamplayer1}\'s Bid`) {
                    self.who_is_dealing_text.text = `${self.teamplayer1}\'s deal`;
                    self.playerText.text = `${self.teamplayer1}`;
                }
            }

            if (self.trick.length >= 3) {
                // console.log('++++ LOCAL ++++', self.who_is_dealing_text.text, self.playerText.text, self.placeHolder);
                self.socket.emit('clearTrick', self.who_is_dealing_text.text);
            }
            else {
                alert("Play area is not complete.");
            }
        })

        this.call1.on('pointerdown', function () {
            if (self.call1.style.backgroundColor === 'green') {
                self.call1.setBackgroundColor(null);
            }
            else if (self.call1.style.backgroundColor === null) {
                self.call1.setBackgroundColor('green');
            }
        })

        this.call2.on('pointerdown', function () {
            if (self.call2.style.backgroundColor === 'green') {
                self.call2.setBackgroundColor(null);
            }
            else if (self.call2.style.backgroundColor === null) {
                self.call2.setBackgroundColor('green');
            }
        })

        this.call3.on('pointerdown', function () {
            if (self.call3.style.backgroundColor === 'green') {
                self.call3.setBackgroundColor(null);
            }
            else if (self.call3.style.backgroundColor === null) {
                self.call3.setBackgroundColor('green');
            }
        })

        this.call4.on('pointerdown', function () {
            if (self.call4.style.backgroundColor === 'green') {
                self.call4.setBackgroundColor(null);
            }
            else if (self.call4.style.backgroundColor === null) {
                self.call4.setBackgroundColor('green');
            }
        })

        this.dealText.on('pointerover', function () {
            self.dealText.setColor('#ff0000');
        })

        this.dealText.on('pointerout', function () {
            self.dealText.setColor('#05ffa1');
        })

        this.bidderpasses.on('pointerover', function () {
            self.bidderpasses.setColor('#f4b273');
        })

        this.bidderpasses.on('pointerout', function () {
            self.bidderpasses.setColor('#33ff39');
        })

        this.doneBid.on('pointerover', function () {
            self.doneBid.setColor('#f4b273');
        })

        this.doneBid.on('pointerout', function () {
            self.doneBid.setColor('#33ff39');
        })

        this.trumpText.on('pointerover', function () {
            self.trumpText.setColor('#01cdfe');
        })

        this.trumpText.on('pointerout', function () {
            self.trumpText.setColor('#fffb96');
        })

        this.specialBid.on('pointerover', function () {
            self.specialBid.setColor('#01cdfe');
        })

        this.specialBid.on('pointerout', function () {
            self.specialBid.setColor('#fffb96');
        })

        this.bidnumberText.on('pointerover', function () {
            self.bidnumberText.setColor('#01cdfe');
        })

        this.bidnumberText.on('pointerout', function () {
            self.bidnumberText.setColor('#fffb96');
        })

        this.playerText.on('pointerover', function () {
            self.playerText.setColor('#01cdfe');
        })

        this.playerText.on('pointerout', function () {
            self.playerText.setColor('#fffb96');
        })



        this.countTrick.on('pointerover', function () {
            self.countTrick.setColor('#ff0000');
        })

        this.countTrick.on('pointerout', function () {
            self.countTrick.setColor('#05ffa1');
        })


        this.input.on('dragstart', function (pointer, gameObject) {
            self.children.bringToTop(gameObject);
        })

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        })


        this.input.on('drop', function (pointer, gameObject, dropZone) {
            let checked = checkTrump(gameObject);
            //console.log('drop card', self.playArea.text);
            if (self.bidText.text === "Change Bid" && self.specialBid.text !== 'Special Bids' && self.doneBid.text !== 'Card Selection Done' && self.specialBid.text !== "MOONSHOT") {
                //console.log('special bid happening', self.callHand.text,self.playerText.text,self.isPlayerA, self.isPlayerC, dropZone.x );

                if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerC || self.isPlayerA) &&
                    self.callHand.text === "Discard 1 card each" && dropZone.x === 825) {
                    self.dropZone1.data.values.cards++;
                    playCard(gameObject, dropZone);
                }
                else if ((self.playerText.text === `${self.teamplayer4}` || self.playerText.text === `${self.teamplayer2}`) && (self.isPlayerB || self.isPlayerD) &&
                    self.callHand.text === "Discard 1 card each" && dropZone.x === 825) {
                    self.dropZone1.data.values.cards++;
                    playCard(gameObject, dropZone);
                }
                if ((self.playerText.text === `${self.teamplayer1}` || self.playerText.text === `${self.teamplayer3}`) && (self.isPlayerC || self.isPlayerA) &&
                    self.callHand.text === "Discard 2 cards each" && dropZone.x === 825) {
                    self.dropZone1.data.values.cards++;
                    playCard(gameObject, dropZone);
                }
                else if ((self.playerText.text === `${self.teamplayer4}` || self.playerText.text === `${self.teamplayer2}`) && (self.isPlayerB || self.isPlayerD) &&
                    self.callHand.text === "Discard 2 cards each" && dropZone.x === 825) {
                    self.dropZone1.data.values.cards++;
                    playCard(gameObject, dropZone);
                }

            }
            else {

                if ((self.bidText.text === "Change Bid" || self.bidText.text === "Play") && self.playArea.text === `${self.teamplayer1}\'s turn` && self.isPlayerA && dropZone.x === 425 && checked) {
                    self.dropZone.data.values.cards++;
                    playCard(gameObject, dropZone);
                }
                else if ((self.bidText.text === "Change Bid" || self.bidText.text === "Play") && self.playArea.text === `${self.teamplayer2}\'s turn` && self.isPlayerB && dropZone.x === 425 && checked) {
                    self.dropZone.data.values.cards++;
                    playCard(gameObject, dropZone);
                }
                else if ((self.bidText.text === "Change Bid" || self.bidText.text === "Play") && self.playArea.text === `${self.teamplayer3}\'s turn` && self.isPlayerC && dropZone.x === 425 && checked) {
                    self.dropZone.data.values.cards++;
                    playCard(gameObject, dropZone);
                }
                else if ((self.bidText.text === "Change Bid" || self.bidText.text === "Play") && self.playArea.text === `${self.teamplayer4}\'s turn` && self.isPlayerD && dropZone.x === 425 && checked) {
                    self.dropZone.data.values.cards++;
                    playCard(gameObject, dropZone);
                }
                else if (!checked) {
                    alert('You must follow suit. Please select another card.');
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    //self.dropZone.data.values.cards--;
                }
                else {
                    alert("It is not your turn.");
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    //self.dropZone.data.values.cards--;
                }
            }

            //console.log('call area ', self.playerText.text,self.specialBid.text, self.callarea.length);
            if (self.bidText.text === "Change Bid" && self.isPlayerA && self.playerText.text === `${self.teamplayer1}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                callareasetup(self.specialBid.text)
                // self.call1.text = '1';
                // self.call2.text = '2';
                // self.callHand.text = "Select card you are keeping";
                // self.doneBid.text = "Card Selection Done";
            }
            else if (self.bidText.text === "Change Bid" && self.isPlayerC && self.playerText.text === `${self.teamplayer3}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                callareasetup(self.specialBid.text)
            //     self.call1.text = '1';
            //     self.call2.text = '2';
            //     self.callHand.text = "Select card you are keeping";
            //     self.doneBid.text = "Card Selection Done";
            }
            else if (self.bidText.text === "Change Bid" && self.isPlayerA && self.playerText.text === `${self.teamplayer1}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                callareasetup(self.specialBid.text)
                // self.call1.text = '1';
                // self.call2.text = '2';
                // self.call3.text = '3';
                // self.call4.text = '4';
                // self.callHand.text = "Select the cards you are keeping";
                // self.doneBid.text = "Card Selection Done";
            }
            else if (self.bidText.text === "Change Bid" && self.isPlayerC && self.playerText.text === `${self.teamplayer3}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                callareasetup(self.specialBid.text)
                // self.call1.text = '1';
                // self.call2.text = '2';
                // self.call3.text = '3';
                // self.call4.text = '4';
                // self.callHand.text = "Select the cards you are keeping";
                // self.doneBid.text = "Card Selection Done";
            }
            else if (self.bidText.text === "Change Bid" && self.isPlayerB && self.playerText.text === `${self.teamplayer2}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                callareasetup(self.specialBid.text)
                // self.call1.text = '1';
                // self.call2.text = '2';
                // self.callHand.text = "Select card you are keeping";
                // self.doneBid.text = "Card Selection Done";
            }
            else if (self.bidText.text === "Change Bid" && self.isPlayerD && self.playerText.text === `${self.teamplayer4}` && self.specialBid.text === 'CALL 1 HAND' && self.callarea.length === 2) {
                callareasetup(self.specialBid.text)
                // self.call1.text = '1';
                // self.call2.text = '2';
                // self.callHand.text = "Select card you are keeping";
                // self.doneBid.text = "Card Selection Done";
            }
            else if (self.bidText.text === "Change Bid" && self.isPlayerB && self.playerText.text === `${self.teamplayer2}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                callareasetup(self.specialBid.text)
                // self.call1.text = '1';
                // self.call2.text = '2';
                // self.call3.text = '3';
                // self.call4.text = '4';
                // self.callHand.text = "Select the cards you are keeping";
                // self.doneBid.text = "Card Selection Done";
            }
            else if (self.bidText.text === "Change Bid" && self.isPlayerD && self.playerText.text === `${self.teamplayer4}` && self.specialBid.text === 'CALL 2 HAND' && self.callarea.length === 4) {
                callareasetup(self.specialBid.text)
                // self.call1.text = '1';
                // self.call2.text = '2';
                // self.call3.text = '3';
                // self.call4.text = '4';
                // self.callHand.text = "Select the cards you are keeping";
                // self.doneBid.text = "Card Selection Done";
            }

        })

        function callareasetup(type_of_call){
            if (type_of_call === 'CALL 1 HAND'){
                self.call1.text = '1';
                self.call2.text = '2';
                self.callHand.text = "Select the cards you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
            if (type_of_call === 'CALL 2 HAND'){
                self.call1.text = '1';
                self.call2.text = '2';
                self.call3.text = '3';
                self.call4.text = '4';
                self.callHand.text = "Select the cards you are keeping";
                self.doneBid.text = "Card Selection Done";
            }
        }

        function playbox() {
            //console.log('--playbox-- ',self.specialBid.text,self.dropZone.data.values.cards);
            if (self.playArea.text === `${self.teamplayer1}\'s turn` && self.isPlayerA && self.dropZone.data.values.cards !== 2 && self.specialBid.text !== "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
            }
            else if (self.playArea.text === `${self.teamplayer2}\'s turn` && self.isPlayerB && self.dropZone.data.values.cards !== 2 && self.specialBid.text !== "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
            }
            else if (self.playArea.text === `${self.teamplayer3}\'s turn` && self.isPlayerC && self.dropZone.data.values.cards !== 2 && self.specialBid.text !== "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
            }
            else if (self.playArea.text === `${self.teamplayer4}\'s turn` && self.isPlayerD && self.dropZone.data.values.cards !== 2 && self.specialBid.text !== "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
            }



            else if (self.playArea.text === `${self.teamplayer1}\'s turn` && self.isPlayerA && self.dropZone.data.values.cards !== 3 && self.specialBid.text === "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
            }
            else if (self.playArea.text === `${self.teamplayer2}\'s turn` && self.isPlayerB && self.dropZone.data.values.cards !== 3 && self.specialBid.text === "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
            }
            else if (self.playArea.text === `${self.teamplayer3}\'s turn` && self.isPlayerC && self.dropZone.data.values.cards !== 3 && self.specialBid.text === "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
            }
            else if (self.playArea.text === `${self.teamplayer4}\'s turn` && self.isPlayerD && self.dropZone.data.values.cards !== 3 && self.specialBid.text === "Special Bids") {
                s1.setStrokeStyle(6, 0x00ff00);
                // this is green
            }
            else {
                s1.setStrokeStyle(6, 0x01cdfe);
                // this is white
            }
        }

        function playCard(gameObject, Zone) {
            let people = [self.isPlayerA, self.isPlayerB, self.isPlayerC, self.isPlayerD];
            let cardPlayedbyPlayer = people.indexOf(true);
            let obj = gameObject;

            if (Zone.x === 825 && self.specialBid.text === "CALL 1 HAND") {
                gameObject.x = (self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50);
                gameObject.y = self.dropZone1.y;
                //??????????? try later
                //gameObject.input.enabled = false;
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
                gameObject.disableInteractive();
                if (self.isPlayerA) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand1.splice(index, 1);
                    }
                }
                else if (self.isPlayerB) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand2.splice(index, 1);
                    }
                }
                else if (self.isPlayerC) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand3.splice(index, 1);
                    }
                }
                else if (self.isPlayerD) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand4.splice(index, 1);
                    }
                }

            }
            else if (Zone.x === 825 && self.specialBid.text === "CALL 2 HAND") {
                gameObject.x = (self.dropZone1.x - 125) + (self.dropZone1.data.values.cards * 50);
                gameObject.y = self.dropZone1.y;
                self.callarea.push({ obj, cardPlayedbyPlayer, Zone });
                gameObject.disableInteractive();
                if (self.isPlayerA) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand1.splice(index, 1);
                    }
                }
                else if (self.isPlayerB) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand2.splice(index, 1);
                    }
                }
                else if (self.isPlayerC) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand3.splice(index, 1);
                    }
                }
                else if (self.isPlayerD) {
                    let index = playersHand.indexOf(gameObject);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand4.splice(index, 1);
                    }
                }
            }
            else if (Zone.x === 425) {
                gameObject.x = (Zone.x - 125) + (self.dropZone.data.values.cards * 50);
                gameObject.y = Zone.y;
                self.trick.push({ obj, cardPlayedbyPlayer, Zone });
                gameObject.disableInteractive();
                let dummyhand = [];

                if (self.isPlayerA) {
                    for (let i = 0; i < playersHand.length; i++) {
                        let dummycard = playersHand[i].frame.name;
                        dummyhand.push(dummycard);
                    }
                    let index = dummyhand.indexOf(gameObject.frame.name);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand1.splice(index, 1);
                    }
                }
                else if (self.isPlayerB) {
                    for (let i = 0; i < playersHand.length; i++) {
                        let dummycard = playersHand[i].frame.name;
                        dummyhand.push(dummycard);
                    }
                    let index = dummyhand.indexOf(gameObject.frame.name);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand2.splice(index, 1);
                    }
                }
                else if (self.isPlayerC) {
                    for (let i = 0; i < playersHand.length; i++) {
                        let dummycard = playersHand[i].frame.name;
                        dummyhand.push(dummycard);
                    }
                    let index = dummyhand.indexOf(gameObject.frame.name);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand3.splice(index, 1);
                    }
                }
                else if (self.isPlayerD) {
                    for (let i = 0; i < playersHand.length; i++) {
                        let dummycard = playersHand[i].frame.name;
                        dummyhand.push(dummycard);
                    }
                    let index = dummyhand.indexOf(gameObject.frame.name);
                    if (index > -1) {
                        playersHand.splice(index, 1);
                        self.hand4.splice(index, 1);
                    }
                }
            }
            if (self.specialBid.text === 'Special Bids') {
                if (self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`;
                    playbox();
                }
                else if (self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`;
                    playbox();
                }
                else if (self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`;
                    playbox();
                }
                else if (self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`;
                    playbox();
                }
            } else if (self.specialBid.text !== 'Special Bids') {
                if (self.callhandPlayer === `${self.teamplayer1}` && self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`;
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer1}` && self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer1}` && self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer2}` && self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer2}` && self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer2}` && self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`
                    playbox();
                }

                else if (self.callhandPlayer === `${self.teamplayer3}` && self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer3}` && self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer2}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer3}` && self.playArea.text === `${self.teamplayer2}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer4}` && self.playArea.text === `${self.teamplayer4}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer1}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer4}` && self.playArea.text === `${self.teamplayer1}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer3}\'s turn`
                    playbox();
                }
                else if (self.callhandPlayer === `${self.teamplayer4}` && self.playArea.text === `${self.teamplayer3}\'s turn` && Zone.x === 425) {
                    self.playArea.text = `${self.teamplayer4}\'s turn`
                    playbox();
                }
            }

            self.socket.emit('cardPlayed', gameObject, self.isPlayerA, self.isPlayerB, self.isPlayerC, self.isPlayerD,
                Zone, self.hand1, self.hand2, self.hand3, self.hand4);

        }

        function checkTrump(gameCard) {

            if (self.trick.length === 0) {
                return true;
            }
            else if (self.trick.length > 0) {
                let found = false;
                if (self.trumpText.text === 'No Trump') {
                    let trumpcard = self.trick[0].obj.frame.name.charAt(1);
                    let playingcard = gameCard.frame.name.charAt(1);
                    for (let i = 0; i < playersHand.length; i++) {
                        found = playersHand[i].frame.name.charAt(1).includes(trumpcard);

                        if (trumpcard !== playingcard && found) {
                            return false;
                        }
                        //console.log('trump card has not been found in players hand but not played',playersHand[i].frame.name, trumpcard)
                    }
                    return true;
                }
                if (self.trumpText.text === 'HEARTS') {
                    let trumpcard = self.trick[0].obj.frame.name.charAt(1);
                    if (self.trick[0].obj.frame.name === 'jd') {
                        trumpcard = 'h';
                    }

                    let playingcard = gameCard.frame.name.charAt(1);
                    if (gameCard.frame.name === 'jd') {
                        playingcard = "h";
                    }

                    for (let i = 0; i < playersHand.length; i++) {
                        found = playersHand[i].frame.name.charAt(1).includes(trumpcard);
                        // if ace of diamond is first card played then jacket of diamond will not be considered trump
                        if (playersHand[i].frame.name === 'jd' && trumpcard !== 'h') {
                            found = false;
                        }
                        // if trump is played jacket of diamonds will be considered trump
                        if (playersHand[i].frame.name === 'jd' && trumpcard === 'h') {
                            found = true;
                        }
                        if (trumpcard !== playingcard && found) {
                            return false;
                        }
                    }
                    return true;
                }
                if (self.trumpText.text === 'SPADES') {
                    let trumpcard = self.trick[0].obj.frame.name.charAt(1);
                    if (self.trick[0].obj.frame.name === 'jc') {
                        trumpcard = 's';
                    }
                    let playingcard = gameCard.frame.name.charAt(1);
                    if (gameCard.frame.name === 'jc') {
                        playingcard = "s";
                    }
                    for (let i = 0; i < playersHand.length; i++) {
                        found = playersHand[i].frame.name.charAt(1).includes(trumpcard);
                        if (playersHand[i].frame.name === 'jc' && trumpcard !== 's') {
                            found = false;
                        }
                        if (playersHand[i].frame.name === 'jc' && trumpcard === 's') {
                            found = true;
                        }
                        if (trumpcard !== playingcard && found) {
                            return false;
                        }
                    }
                    return true;
                }
                if (self.trumpText.text === 'DIAMONDS') {
                    let trumpcard = self.trick[0].obj.frame.name.charAt(1);
                    if (self.trick[0].obj.frame.name === 'jh') {
                        trumpcard = 'd';
                    }

                    let playingcard = gameCard.frame.name.charAt(1);
                    if (gameCard.frame.name === 'jh') {
                        playingcard = "d";
                    }

                    for (let i = 0; i < playersHand.length; i++) {
                        found = playersHand[i].frame.name.charAt(1).includes(trumpcard);
                        if (playersHand[i].frame.name === 'jh' && trumpcard !== 'd') {
                            found = false;
                        }
                        if (playersHand[i].frame.name === 'jh' && trumpcard === 'd') {
                            found = true;
                        }
                        if (trumpcard !== playingcard && found) {
                            // console.log('A trump was found and should be played',i, trumpcard, playingcard, found);
                            return false;
                        }
                    }
                    return true;
                }
                if (self.trumpText.text === 'CLUBS') {
                    let trumpcard = self.trick[0].obj.frame.name.charAt(1);
                    if (self.trick[0].obj.frame.name === 'js') {
                        trumpcard = 'c';
                    }

                    let playingcard = gameCard.frame.name.charAt(1);
                    if (gameCard.frame.name === 'js') {
                        playingcard = "c";
                    }

                    for (let i = 0; i < playersHand.length; i++) {
                        found = playersHand[i].frame.name.charAt(1).includes(trumpcard);
                        if (playersHand[i].frame.name === 'js' && trumpcard !== 'c') {
                            found = false;
                        }
                        if (playersHand[i].frame.name === 'js' && trumpcard === 'c') {
                            found = true;
                        }
                        if (trumpcard !== playingcard && found) {
                            // console.log('A trump was found and should be played',i, trumpcard, playingcard, found);
                            return false;
                        }
                    }

                    //console.log('tt - - ->>>>', playersHand.length, trumpcard, found);
                    return true;
                }

            }

        }


        function playersTurn(pointer) {
            //console.log('players turn function', pointer,self.trick[pointer].cardPlayedbyPlayer);
            if (self.trick[pointer].cardPlayedbyPlayer === 3) {
                self.playArea.text = `${self.teamplayer4}\'s turn`;
                self.them_click++;
                self.themScore.text = "Team B     " + self.them_click;
            }
            else if (self.trick[pointer].cardPlayedbyPlayer === 2) {
                self.playArea.text = `${self.teamplayer3}\'s turn`;
                self.us_click++;
                self.usScore.text = "Team A     " + self.us_click;
            }
            else if (self.trick[pointer].cardPlayedbyPlayer === 1) {
                self.playArea.text = `${self.teamplayer2}\'s turn`;
                self.them_click++;
                self.themScore.text = "Team B     " + self.them_click;
            }
            else if (self.trick[pointer].cardPlayedbyPlayer === 0) {
                self.playArea.text = `${self.teamplayer1}\'s turn`;
                self.us_click++;
                self.usScore.text = "Team A     " + self.us_click;
            }
        }

        function destroyCards (data){
            data.forEach(item => item.destroy())
        }

        function destroycallareaCards (data){
            data.forEach(item => item.obj.destroy())
        }

        function name_of_player(e){
            if (e.player === 1){ self.teamplayer1 = e.playername}
            if (e.player === 2){ self.teamplayer2 = e.playername}
            if (e.player === 3){ self.teamplayer3 = e.playername}
            if (e.player === 4){ self.teamplayer4 = e.playername}
        }

        function id_for_Player(element){
            let playersnumber = 0;
            if (element.playername === self.player_name){ playersnumber = element.player}
            if (playersnumber === 1){
                self.isPlayerA = true
                console.log('isPlayer A', self.player_name)
            }
            if (playersnumber === 2){
                self.isPlayerB = true
                console.log('isPlayer B', self.player_name)
            }
            if (playersnumber === 3){
                self.isPlayerC = true
                console.log('isPlayer C', self.player_name)
            }
            if (playersnumber === 4){
                self.isPlayerD = true
                console.log('isPlayer D', self.player_name)
            }
        }

        function results(c1, c2) {
            let notrump = ['j', 'q', 'k', 'a'];
            //console.log('results for no trump comming in', c1, c2);
            let input1 = notrump.indexOf(c1.charAt(0));
            let input2 = notrump.indexOf(c2.charAt(0));
            if (input2 > input1) {
                return c2;
            }
            if (input1 > input2) {
                return c1;
            }
            if (input1 === input2) {
                return c1;
            }

        }
        // function for hearts, clubls, spades and diamonds


        function outcome(c1, c2, ss, nt) {
            //console.log('results for suits outcome', c1, c2, ss,nt);
            let trump = ['j', 'q', 'k', 'a', 'b', 'B'];
            let nontrump = nt;
            let cardsuit1 = c1.charAt(1);
            let cardsuit2 = c2.charAt(1);
            let input1 = trump.indexOf(c1.charAt(0));
            let input2 = trump.indexOf(c2.charAt(0));

            if (((cardsuit1 === ss || cardsuit1 === 'l' || cardsuit1 === 'r') && (cardsuit2 === ss || cardsuit2 === 'l' || cardsuit2 === 'r'))) {
                if (input2 > input1) {
                    return c2;
                }
                else if (input1 > input2) {
                    return c1;
                }
                else if (input1 === input2) {
                    return c1;
                }
            }


            if ((cardsuit1 === ss && cardsuit2 !== ss) || cardsuit1 === 'l' || cardsuit1 === 'r') {
                return c1;

            }

            if ((cardsuit1 !== ss && cardsuit2 === ss) || cardsuit2 === 'l' || cardsuit2 === 'r') {
                return c2;
            }

            if (cardsuit1 !== ss && cardsuit2 !== ss) {
                // console.log('nontrump results ', cardsuit1,cardsuit2,nontrump);
                if (cardsuit1 === nontrump.charAt(1) && cardsuit2 === nontrump.charAt(1)) {
                    if (input2 > input1) {
                        return c2;
                    }
                    else if (input1 > input2) {
                        return c1;
                    }
                    else if (input1 === input2) {
                        return c1;
                    }
                }
                if (cardsuit1 === nontrump.charAt(1) && cardsuit2 !== nontrump.charAt(1)) {
                    return c1;
                }
                if (cardsuit1 !== nontrump.charAt(1) && cardsuit2 === nontrump.charAt(1)) {
                    return c2;
                }
            }



        }

        function sortCards(a, b) {
            if (a.charAt(1) > b.charAt(1)) {
                return 1;
            } else if (a.charAt(1) < b.charAt(1)) {
                return -1;
            } else if (a.charAt(1) === b.charAt(1)) {
                return 0;
            }
        }


        function createHands() {
            let originalDeck = ['ac', 'kc', 'qc', 'jc', 'as', 'ks', 'qs', 'js', 'ad', 'kd', 'qd', 'jd', 'ah', 'kh', 'qh', 'jh',
                'ac', 'kc', 'qc', 'jc', 'as', 'ks', 'qs', 'js', 'ad', 'kd', 'qd', 'jd', 'ah', 'kh', 'qh', 'jh'];
            Phaser.Utils.Array.Shuffle(originalDeck);
            let euchreDeck = originalDeck.slice();
            let hand1 = [];
            let hand2 = [];
            let hand3 = [];
            let hand4 = [];
            for (var i = 0; i < 8; i++) {
                hand1.push(euchreDeck[0]);
                euchreDeck.shift();
                hand2.push(euchreDeck[0]);
                euchreDeck.shift();
                hand3.push(euchreDeck[0]);
                euchreDeck.shift();
                hand4.push(euchreDeck[0]);
                euchreDeck.shift();
            }
            return [hand1.sort(sortCards), hand2.sort(sortCards), hand3.sort(sortCards), hand4.sort(sortCards)];
        }

    }  /*end of create function */


    // .setInteractive({ draggable: true});
    update() {

    }
}
export default MainGame;