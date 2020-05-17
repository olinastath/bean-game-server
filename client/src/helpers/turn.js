let cardsPlayed = 0;
let deck = [];

export default class Turn {
    constructor(scene) {
        let self = this;

        scene.input.on('dragstart', function(pointer, gameObject) {
            gameObject.setTint(0x7a7a7a);
            scene.children.bringToTop(gameObject);
        });

        scene.input.on('dragend', function(pointer, gameObject, dropped) {
            gameObject.setTint();
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        scene.input.on('drag', function(pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.removeFromOpenCards = function(gameObject) {
            let index = scene.openCards.findIndex( card => (card === gameObject));
            if (index !== -1) {
                scene.openCards.splice(index, 1);
                // do i need to destroy card?
                scene.socket.emit('updateOpenCards', scene.openCards);
            }
        }
        
        this.dropOnField = function(gameObject, traded) {
            let allowed = false;
            let fieldTypes = scene.player.fields.map( field => field.fieldType );
            let cardPlanted = traded ? gameObject.textureKey : gameObject.texture.key;
            let playerFields = scene.player.fields;
            let fieldToBePlanted = null;
            
            // go through fields
            // if at least one field is empty, pick the first empty one and fill it
            // if not empty, check if one of them has the fieldtype
            for (let field in playerFields) {
                if (playerFields[field].fieldType === 'empty' && playerFields[field].cards === 0 
                    && fieldTypes.findIndex( fieldType => (fieldType === cardPlanted) === -1)) {
                    playerFields[field].fieldType = cardPlanted;
                    allowed = true;
                } else if (playerFields[field].fieldType === cardPlanted) {
                    allowed = true;
                }

                if (allowed) {
                    playerFields[field].cards++;
                    fieldToBePlanted = playerFields[field];
                    playerFields[field].counterText.setText(playerFields[field].cards);
                    break;
                }
            }
        
            if (allowed) {
                if (traded) {
                    scene.add.image(fieldToBePlanted.x, fieldToBePlanted.y, cardPlanted).setOrigin(0, 0.5).setScale(0.25);
                } else if (scene.phase < 2) {
                    gameObject.x = fieldToBePlanted.x;
                    gameObject.y = fieldToBePlanted.y;
                    gameObject.disableInteractive();
                    if (scene.phase === 0) {
                        cardsPlayed++;
                        scene.player.hand.splice(0, 1);
                        scene.dealer.shiftHand(0, 1);
            
                        let nextCard = scene.player.hand[0];
                        if (nextCard) {
                            let plantNext = fieldTypes.findIndex( fieldType => (fieldType === nextCard.texture.key || fieldType === 'empty')) != -1
                            if (plantNext && cardsPlayed < 2) {
                                nextCard.setInteractive();
                                scene.input.setDraggable(nextCard);
                            } else {
                                scene.phase++;
                            }
                        } else {
                            scene.phase++;
                        }
                        
                        scene.socket.emit('enableFlipCards');
                    } else if (scene.phase === 1) {
                        // delete from scene.openCards
                        self.removeFromOpenCards(gameObject);
            
                        // if you click "trade" button OR scene.openCards === 0 then increment phase
                        if (scene.openCards.length === 0) {
                            scene.phase++;
                        }
                    }
                }
                scene.socket.emit('cardPlayed', gameObject, scene.player);

                if (scene.phase === 2) {
                    scene.socket.emit('enableTrades', scene.player.id);
                    scene.socket.emit('enableTakeThree');
                    scene.phase++;
                }
            } else {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        }
        
        this.dropOnDiscard = function(gameObject) {
            let allowed = false;
            let playerFields = scene.player.fields;

            for (let field in playerFields) {
                if (scene.phase === 1 && playerFields[field].fieldType === 'empty' && playerFields[field].cards === 0) {
                    allowed = true;
                    break;
                }
            }
        
            if (allowed) {
                gameObject.x = scene.discardPile.image.x;
                gameObject.y = scene.discardPile.image.y;
                gameObject.disableInteractive();
                self.removeFromOpenCards(gameObject);
                    
                if (scene.openCards.length === 0) {
                    scene.phase++;
                }

                scene.socket.emit('cardDiscarded', gameObject, scene.player);

                if (scene.phase === 2) {
                    scene.socket.emit('enableTrades', scene.player.id);
                    scene.socket.emit('enableTakeThree');
                    scene.phase++;
                }
            } else {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        }
        
        this.dropToTradeFromDeck = function(gameObject, player) {
            if (scene.phase === 1) {
                scene.socket.emit('tradeCard', gameObject, player);
                self.removeFromOpenCards(gameObject);
                if (scene.openCards.length === 0) {
                    scene.phase++;
                }
                gameObject.destroy();
                
                if (scene.phase === 2) {
                    scene.socket.emit('enableTrades', scene.player.id);
                    scene.socket.emit('enableTakeThree');
                    scene.phase++;
                }
            } else {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        }

        this.dropToTradeFromHand = function(gameObject, player) {
            // check if it can be traded with that player
            let playerFields = scene.otherPlayers[player].fields;
            let allowed = false;
            let cardPlanted = gameObject.texture.key;
            let fieldTypes = playerFields.map( field => field.fieldType );

            for (let field in playerFields) {
                if ( (playerFields[field].fieldType === 'empty' && playerFields[field].cards === 0 
                    && fieldTypes.findIndex( fieldType => (fieldType === cardPlanted) === -1)) 
                    || (playerFields[field].fieldType === cardPlanted)) {
                    allowed = true;
                }
            }

            if (allowed) {
                scene.socket.emit('tradeCard', gameObject, player);
                let index = scene.player.hand.indexOf(gameObject);
                scene.player.hand.splice(index, 1);
                scene.dealer.shiftHand(index, 1);
                gameObject.destroy();
            } else {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        }

        scene.input.on('drop', function(pointer, gameObject, dropZone) {
            if (scene.phase < 2 && dropZone.name === scene.player.fieldZone.name) {
                self.dropOnField(gameObject, false);
            } else if (scene.phase === 1 && dropZone.name === scene.discardPile.dropZone.name) {
                self.dropOnDiscard(gameObject);
            } else if (scene.phase === 3 && dropZone.name === scene.playerTurn.id) {
                self.dropToTradeFromHand(gameObject, dropZone.name);
            } else {
                self.dropToTradeFromDeck(gameObject, dropZone.name);
            }
        });

        this.plant = function() {
            let firstCard = scene.player.hand[0];
            if (firstCard) {
                firstCard.setInteractive();
                scene.input.setDraggable(firstCard);
            } else {
                scene.phase++;
                scene.socket.emit('enableFlipCards');
            }
            // add check, if no cards then move on to flipping without planting
        }

        this.flipCards = function(deckToFlip) {
            scene.deck.setInteractive();
            scene.deck.on('pointerdown', function() {
                if (scene.phase === 0) scene.phase++;
                if (scene.player.hand.length) scene.player.hand[0].disableInteractive();
                deck = deckToFlip;
                scene.dealer.flipCards(deck);
            });
        }

        this.disableFlipCards = function() {
            scene.deck.disableInteractive();
            scene.deck.removeAllListeners();
        }

        this.enableTradeFromHand = function() {
            scene.phase = 3;
            scene.player.hand.forEach( function(card) {
                card.setInteractive();
                scene.input.setDraggable(card);
            });
        }

        this.disableTradeFromHand = function() {
            scene.player.hand.forEach( function(card) {
                card.disableInteractive();
            });
        }

        this.takeThree = function(deck) {
            scene.deck.setInteractive();
            scene.deck.on('pointerdown', function() {
                scene.socket.emit('disableTrades');
                scene.dealer.takeThree(deck);
            });
        }
    };
}