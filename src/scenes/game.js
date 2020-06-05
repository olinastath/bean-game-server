import Zone from '../helpers/zone';
import Dealer from '../helpers/dealer';
import Turn from '../helpers/turn';
import Harvest from '../helpers/harvest'
import config from '../helpers/config';
import utils from '../helpers/utils';
import io from 'socket.io-client';

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
                {fieldType: config.CONSTANTS.EMPTY_FIELD, cardCount: 0, x: 50, y: window.innerHeight / 2, counterText: null, cards: []},
                {fieldType: config.CONSTANTS.EMPTY_FIELD, cardCount: 0, x: 175, y: window.innerHeight / 2, counterText: null, cards: []}
            ],
            order: 0
        }
        
        this.rounds = 0;
        this.numberOfPlayers = 0;
        this.otherPlayers = {};
        this.openCards = [];
        this.playerTurn;
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
                document.querySelector('#inputContainer h1').style.color = '#dc201f';
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
            self.otherPlayers = utils.getPlayersExcept(playersObject, self.socket.id);
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
            self.turn.plant();
        });

        this.socket.on('updatePlayerTurn', function(playerId) {
            let dashboardHeader = document.querySelector('#dashboard h1');
            self.phase = 0;
            if (self.otherPlayers[playerId]) {
                self.playerTurn = self.otherPlayers[playerId];
                dashboardHeader.innerHTML = self.playerTurn.name + '\'s turn';
                dashboardHeader.style.color = '#ffffff';
            } else {
                self.playerTurn = self.player;
                dashboardHeader.innerHTML = 'YOUR TURN';
                dashboardHeader.style.color = '#fad550';
            }
        });

        this.socket.on('cardPlayed', function(gameObject, player) {
            let cardPlayed = gameObject.textureKey;
            if (player.id !== self.player.id) {
                let field = utils.getAvailableField(self.otherPlayers[player.id].fields, cardPlayed);
                if (field) {
                    field.cardCount++;
                    field.counterText.setText(field.cardCount);
                    if (utils.isFieldEmpty(field)) {
                        field.fieldType = cardPlayed;
                        field.cards.push(self.add.image(field.x, field.y, cardPlayed).setOrigin(0, 0).setScale(0.15));
                    }
                }
            }
        });

        // need event to update view for other players when fields are harvested (similar to cardPlayed)
        this.socket.on('cardDiscarded', function(cardDiscarded, player, entryPoint, addToDiscardPile, fieldIndex, emptyField) {
            // adding to discardPile list so we can destroy images when we shuffle
            if (player.id !== self.player.id) {
                if (addToDiscardPile) {
                    self.discardPile.list.push(self.add.image(window.innerWidth / 2 + 200, window.innerHeight / 2, cardDiscarded).setOrigin(0, 0.5).setScale(0.25));
                }
                
                if (entryPoint === config.CONSTANTS.ENTRY_POINTS.FIELD) {
                    // need to broadcast to other players that your field has changed
                    // remove gameObject from your field
                    // this is where we discard the fields for other players
                    let field = self.otherPlayers[player.id].fields[fieldIndex];
                    if (field) {
                        field.cardCount--;
                        field.counterText.setText(field.cardCount);

                        if (emptyField) {
                            let cardDeleted = field.cards.splice(0, 1)[0];
                            if (cardDeleted) cardDeleted.destroy();
                        }
                        
                        if (field.cardCount === 0) {
                            field.fieldType = config.CONSTANTS.EMPTY_FIELD;
                        }
                    }
                }
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

        this.socket.on('reshuffleWarning', function() {
            window.alert(config.CONSTANTS.ALERT_MESSAGES.RESHUFFLE_WARNING);
        });

        this.socket.on('reshuffleSuccess', function(roundsRemaining) {
            let replaceText;
            if (roundsRemaining === 1) {
                replaceText = '1 round remaining';
            } else if (roundsRemaining === 0) {
                replaceText = 'last round';
            }
            
            window.alert(config.CONSTANTS.ALERT_MESSAGES.RESHUFFLE_SUCCESS.replace('REPLACE_TEXT', replaceText));
            self.discardPile.list.forEach( (discardedCard) => discardedCard.destroy());
            self.discardPile.list = [];
        });

        this.socket.on('gameEndingWarning', function() {
            window.alert(config.CONSTANTS.ALERT_MESSAGES.GAME_ENDING_WARNING);
        });

        this.socket.on('gameEnded', function() {
            window.alert(config.CONSTANTS.ALERT_MESSAGES.GAME_ENDED);
            utils.toggleDisplay(self.dashboard.getChildByID('endGameButton'));
            self.dashboard.getChildByID('endGameButton').addEventListener('click', function() {
                console.log('game ended for player', self.player.id);
                self.player.hand.forEach(card => card.destroy());
                self.player.hand = [];
                self.dashboard.destroy();
                self.socket.emit('gameEndedForPlayer', self.player.id, self.player.coins);
            });
        });

        this.socket.on('gameEndedForPlayer', function(playerId, score) {
            console.log(self.otherPlayers[playerId]);
            self.otherPlayers[playerId].fields.forEach(field => {
                field.placemat.destroy();
                field.counterText.destroy();
                field.cards.forEach(card => card.destroy());
            });
            self.add.image(self.otherPlayers[playerId].fields[0].x + 70, 70, 'coin').setOrigin(0.5, 0).setScale(0.15);
            self.add.text(self.otherPlayers[playerId].fields[0].x + 70, 150, [score]).setOrigin(0.5).setFontSize(18).setFontFamily('Bodoni Highlight').setColor('#fad550');
        });
    }
}
