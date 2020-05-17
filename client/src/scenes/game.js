import Zone from '../helpers/zone';
import Dealer from '../helpers/dealer';
import Turn from '../helpers/turn';
import Harvest from '../helpers/harvest'
import io from 'socket.io-client';

const getPlayersExcept = function(playersObject, playerToExclude) {
    let players = {};
    for (let player in playersObject) {
        if (player !== playerToExclude) {
            players[player] = playersObject[player];
        }
    }
    return players;
}

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });
    }

    preload() {
        this.load.image('cocoaBean', 'src/assets/images/4-cocoa.png');
        this.load.image('gardenBean', 'src/assets/images/6-garden.png');
        this.load.image('redBean', 'src/assets/images/8-red.png');
        this.load.image('blackEyedBean', 'src/assets/images/10-black-eyed.png');
        this.load.image('soyBean', 'src/assets/images/12-soy.png');
        this.load.image('greenBean', 'src/assets/images/14-green.png');
        this.load.image('stinkBean', 'src/assets/images/16-stink.png');
        this.load.image('chiliBean', 'src/assets/images/18-chili.png');
        this.load.image('blueBean', 'src/assets/images/20-blue.png');
        this.load.image('waxBean', 'src/assets/images/22-wax.png');
        this.load.image('coffeeBean', 'src/assets/images/24-coffee.png');

        this.load.image('field', 'src/assets/images/field.png');
        this.load.image('coin', 'src/assets/images/coin.png');
        this.load.image('cardBack', 'src/assets/images/card-back.png');
        this.load.image('drawnFirst', 'src/assets/images/1st-drawn.png');
        this.load.image('drawnSecond', 'src/assets/images/2nd-drawn.png');
        this.load.image('discardPile', 'src/assets/images/discard-pile.png');
        this.load.image('deck', 'src/assets/images/deck.png');
        this.load.image('table', 'src/assets/images/table.jpg');

        this.load.html('nameform', 'src/assets/html/name-form.html');
        this.load.html('dashboard', 'src/assets/html/dashboard.html');
        this.load.html('harvestPopup', 'src/assets/html/harvest-popup.html');

    }

    create() {
        let self = this;
        this.add.image(0, 0, 'table').disableInteractive();
        for (let i = 1; i < 8; i++) {
            this['isPlayer' + i] = false;
        }
        
        this.zone = new Zone(this);
        this.dealer = new Dealer(this);
        this.turn = new Turn(this);
        this.harvest = new Harvest(this);

        this.player = {
            name: '',
            id: '',
            coins: 0,
            hand: [],
            fieldZone: this.zone.renderZone(170, window.innerHeight / 2, 330, 240, 'fieldZone'),
            fields: [
                {fieldType: 'empty', cardCount: 0, x: 50, y: window.innerHeight / 2, counterText: null, cards: []},
                {fieldType: 'empty', cardCount: 0, x: 175, y: window.innerHeight / 2, counterText: null, cards: []}
            ],
            order: 0
        }

        // this.fieldZoneOutline = this.zone.renderOutline(this.player.fieldZone);
        
        this.rounds = 0;
        this.numberOfPlayers = 0;
        this.otherPlayers = {};
        this.openCards = [];
        this.playerTurn;
        this.phases = ['plant', 'flip cards', 'trade from deck', 'receive cards'];
        this.phase = 0;

        this.playerCountText = this.add.text(window.innerWidth / 2, window.innerHeight / 2 - 25, [this.numberOfPlayers + ' players ready']).setOrigin(0.5).setFontSize(25).setFontFamily('Bodoni Highlight').setColor('#fad550').setInteractive().setVisible(false);
        this.startText = this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 25, ['START GAME']).setOrigin(0.5).setFontSize(25).setFontFamily('Bodoni Highlight').setColor('#fad550').setInteractive().setVisible(false);

        // SOCKET STUFF
        this.socket = io('http://localhost:2000');
        this.socket.on('connect', function() {
            console.log('Connected: ' + self.socket.id);
            self.player.id = self.socket.id;
        });

        // LANDING PAGE
        let nameForm = this.add.dom(window.innerWidth / 2, window.innerHeight / 2 - 25).createFromCache('nameform');
        document.getElementById('goButton').addEventListener('click', function() {
            let name = document.getElementById('nameField').value;
            if (name.length > 0) {
                self.player.name = name;
                self.playerCountText.setVisible(true);
                self.startText.setVisible(true);
                nameForm.destroy();
                self.socket.emit('newPlayerName', self.socket.id, self.player);
            } else {
                document.querySelector('#inputDiv h1').style.color = '#dc201f';
            }
        });

        this.startText.on('pointerdown', function() {
            self.socket.emit('startGame');
        });

        this.startText.on('pointerover', function() {
            self.startText.setColor('#dc201f');
        });

        this.startText.on('pointerout', function() {
            self.startText.setColor('#fad550');
        });

        this.socket.on('newPlayer', function(playerNumber) {
            self['isPlayer' + playerNumber] = true;
            self.player.order = playerNumber;
        })
        
        this.socket.on('playerChange', function(numberOfPlayers, playersObject) {
            self.numberOfPlayers = numberOfPlayers;
            self.playerCountText.setText(self.numberOfPlayers + ' players ready');
            self.otherPlayers = getPlayersExcept(playersObject, self.socket.id);
        });

        this.socket.on('enableFlipCards', function(deck) {
            self.turn.flipCards(deck);
        });

        this.socket.on('disableFlipCards', function() {
            self.turn.disableFlipCards();
        })

        this.socket.on('enableTakeThree', function(deck) {
            self.turn.takeThree(deck);
        });

        this.socket.on('updateOpenCards', function(openCards) {
            self.dealer.updateOpenCards(openCards);
        });

        this.socket.on('startGame', function(deck) {
            self.dealer.setup(deck, 0);
        });

        this.socket.on('dealCards', function(deck, nextPlayerIndex) {
            self.dealer.dealCards(deck);
            self.socket.emit('dealNextPlayer', nextPlayerIndex);
        });

        this.socket.on('startTurn', function(nextPlayerIndex) {
            console.log('turn started');
            self.turn.plant();
            // emit to end turn
        });

        this.socket.on('updatePlayerTurn', function(playerId) {
            console.log('updating player turn');
            self.phase = 0;
            if (self.otherPlayers[playerId]) {
                self.playerTurn = self.otherPlayers[playerId];
                document.querySelector('#dashboard h1').innerHTML = self.playerTurn.name + '\'s turn';
                document.querySelector('#dashboard h1').style.color = '#ffffff';
            } else {
                self.playerTurn = self.player;
                document.querySelector('#dashboard h1').innerHTML = 'YOUR TURN';
                document.querySelector('#dashboard h1').style.color = '#fad550';
            }
        });

        this.socket.on('cardPlayed', function(gameObject, player) {
            let cardPlayed = gameObject.textureKey;
            if (player.id !== self.player.id) {
                let field = self.otherPlayers[player.id].fields.filter((field) => field.fieldType === cardPlayed || field.fieldType === 'empty')[0];
                if (field) {
                    field.cardCount++;
                    field.counterText.setText(field.cardCount);
                    if (field.fieldType === 'empty') {
                        field.fieldType = cardPlayed;
                        self.add.image(field.x, field.y, cardPlayed).setOrigin(0, 0).setScale(0.15);
                    }
                }
            }
        });

        this.socket.on('cardDiscarded', function(gameObject, player) {
            let cardDiscarded = gameObject.textureKey;
            if (player.id !== self.player.id) {
                self.discardPile.list.push(self.add.image(window.innerWidth / 2 + 200, window.innerHeight / 2, cardDiscarded).setOrigin(0, 0.5).setScale(0.25));
            }
        });

        this.socket.on('cardTraded', function(gameObject) {
            self.turn.dropOnField(gameObject, true);
        });

        this.socket.on('enableTradingWithPlayer', function(player) {
            self.turn.enableTradeFromHand(player);
        });

        this.socket.on('disableTradingWithPlayer', function() {
            self.turn.disableTradeFromHand();
        });
    }

    // updated every frame
    // if you want to detect input or do things that happen all the time or want the computer to be watching for actions throughout the game
    update() {

    }

}