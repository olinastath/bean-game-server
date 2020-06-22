const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use(express.static('public'));

const generateDeck = function(numberOfPlayers) {
    let deck = [];
    if (3 < numberOfPlayers < 6) {
        deck = deck.concat(Array.from({length:4}, i => 'cocoaBean'));
    }
    
    if (numberOfPlayers < 6) {
        deck = deck.concat(Array.from({length:6}, i => 'gardenBean'));
    }

    deck = deck.concat(Array.from({length:8}, i => 'redBean'));
    deck = deck.concat(Array.from({length:10}, i => 'blackEyedBean'));
    deck = deck.concat(Array.from({length:12}, i => 'soyBean'));
    deck = deck.concat(Array.from({length:14}, i => 'greenBean'));
    deck = deck.concat(Array.from({length:16}, i => 'stinkBean'));
    deck = deck.concat(Array.from({length:18}, i => 'chiliBean'));
    deck = deck.concat(Array.from({length:20}, i => 'blueBean'));
    deck = deck.concat(Array.from({length:22}, i => 'waxBean'));

    if (numberOfPlayers < 4 || numberOfPlayers > 5) {
        deck = deck.concat(Array.from({length:24}, i => 'coffeeBean'));
    }

    return deck;
}

const shuffleDeck = function(deck) {
    var j, x, i;
    for (i = deck.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = deck[i];
        deck[i] = deck[j];
        deck[j] = x;
    }
    return deck;
}

const getPlayersExcept = function(playerToExclude) {
    let players = {};
    for (let player in playersObject) {
        if (player !== playerToExclude) {
            players[player] = playersObject[player];
        }
    }
    return players;
}

let playersArray = [];
let playersObject = {};
let rounds = 0;
let gameEndingWarning = false;
let gameEnded = false;
let reshuffleWarning = false;
let reshuffleSuccess = false;
let deck = [];
let discardPile = [];
let tradeAlertsOn = false;

io.on('connection', function(socket) {
    console.log('A user connected: ' + socket.id);
    playersArray.push(socket.id);
    playersObject[socket.id] = {
        id: socket.id,
        name: '',
        coins: 0,
        fieldZone: null,
        fields: [
            {fieldType: 'empty', cardCount: 0, x: 0, y: 0, counterText: null, cards: []},
            {fieldType: 'empty', cardCount: 0, x: 0, y: 0, counterText: null, cards: []}
        ],
        order: playersArray.length
    }

    io.to(playersArray[0]).emit('vipPlayer');

    if (0 < playersArray.length < 8) {
        socket.emit('newPlayer', playersArray.length);
        io.emit('playerChange', playersArray.length, playersObject);
        console.log(playersArray);
    }

    socket.on('newPlayerName', function(socketId, player) {
        playersObject[socketId].name = player.name;

        io.emit('playerChange', playersArray.length, playersObject);
    });

    socket.on('startGame', function() {
        deck = shuffleDeck(generateDeck(playersArray.length));
        io.emit('startGame', deck);
        io.to(playersArray[0]).emit('dealCards', deck, 1);
        rounds = 1;
    });

    socket.on('updateDeck', function(updatedDeck) {
        console.log("updated deck length:", updatedDeck.length);
        console.log(updatedDeck);
        console.log("\n");
        deck = updatedDeck;
        if (rounds === 3 && deck.length <= (playersArray.length * 5) && !gameEndingWarning) {
            // this is the last round, check length and send warning
            io.emit('gameEndingWarning');
            gameEndingWarning = true;
        } else if (rounds === 3 && deck.length === 0 && !gameEnded) {
            io.emit('gameEnded');
            gameEnded = true;
        } else if (rounds < 3 && deck.length < 10 && !reshuffleWarning) {
            io.emit('reshuffleWarning');
            reshuffleWarning = true;
            reshuffleSuccess = false;
        } else if (rounds < 3 && deck.length < 5 && !reshuffleSuccess) {
            rounds++;
            deck = shuffleDeck(deck.concat(discardPile));
            discardPile = [];
            io.emit('reshuffleSuccess', 3 - rounds);
            reshuffleSuccess = true;
            reshuffleWarning = false;
        }
    });

    socket.on('dealNextPlayer', function(playerIndex) {
        if (playersArray[playerIndex]) {
            io.to(playersArray[playerIndex]).emit('dealCards', deck, playerIndex + 1);
        } else {
            io.to(playersArray[0]).emit('startTurn', 1);
            io.emit('updatePlayerTurn', playersArray[0]);
        }
    });

    socket.on('endTurn', function(playerIndex) {
        if (playerIndex === playersArray.length) playerIndex = 0;
        if (!gameEnded) {
            io.to(playersArray[playerIndex]).emit('startTurn', playerIndex + 1);
            io.emit('updatePlayerTurn', playersArray[playerIndex]);
        }
    });

    socket.on('enableFlipCards', function() {
        io.to(socket.id).emit('enableFlipCards', deck);
    });

    socket.on('disableFlipCards', function() {
        io.to(socket.id).emit('disableFlipCards');
    });

    socket.on('enableTakeThree', function() {
        io.to(socket.id).emit('enableTakeThree', deck);
    });

    socket.on('updateOpenCards', function(openCards) {
        socket.broadcast.emit('updateOpenCards', openCards);
    });

    socket.on('updateCoinStack', function(player) {
        let asset;
        if (player.coins > 24) {
            asset = 'coin-stack-4';
        } else if (player.coins > 16) {
            asset = 'coin-stack-3';
        } else if (player.coins > 8) {
            asset = 'coin-stack-2';
        } else if (player.coins > 0) {
            asset = 'coin-stack-1';
        } else {
            return;
        }
        socket.broadcast.emit('updateCoinStack', player.id, `../src/assets/images/${asset}.png`);
    });

    socket.on('cardPlayed', function(gameObject, player) {
        socket.broadcast.emit('cardPlayed', gameObject, player);
    });

    socket.on('cardDiscarded', function(cardDiscarded, player, entryPoint = null, addToDiscardPile = true, fieldIndex, emptyField) {
        if (addToDiscardPile) discardPile.push(cardDiscarded);
        console.log("discard pile length:", discardPile.length);
        console.log(discardPile);
        console.log("\n");
        socket.broadcast.emit('cardDiscarded', cardDiscarded, player, entryPoint, addToDiscardPile, fieldIndex, emptyField);
    });

    if (tradeAlertsOn) {
        socket.on('tradeCard', function(gameObject, playerInitiatingTrade, playerAcceptingTrade, fromDeck, fromHand, index) {
            io.to(playerAcceptingTrade).emit('requestTrade', gameObject, playerInitiatingTrade, fromDeck, fromHand, index);
        });
    
        socket.on('rejectTrade', function(playerRejectingTrade, playerInitiatingTrade, gameObject, fromDeck, fromHand, index) {
            io.to(playerInitiatingTrade).emit('tradeRejected', playerRejectingTrade, gameObject, fromDeck, fromHand, index);
        });
    
        socket.on('acceptTrade', function(playerAcceptingTrade, gameObject) {
            io.to(playerAcceptingTrade).emit('cardTraded', gameObject);
        });
    } else {
        socket.on('tradeCard', function(gameObject, playerInitiatingTrade, playerAcceptingTrade, fromDeck, fromHand, index) {
            io.to(playerAcceptingTrade).emit('cardTraded', gameObject);
        });
    }

    socket.on('enableTrades', function(player) {
        // emit to everyone else that they can now trade with player 
        socket.broadcast.emit('enableTradingWithPlayer', player);
    });

    socket.on('disableTrades', function() {
        // emit to everyone else that they can now trade with player 
        socket.broadcast.emit('disableTradingWithPlayer');
    });

    socket.on('gameEndedForPlayer', function(playerId, score) {
        socket.broadcast.emit('gameEndedForPlayer', playerId, score);
    });

    socket.on('disconnect', function() {
        console.log('A user disconnected: ' + socket.id);
        playersArray = playersArray.filter(player => player != socket.id);
        playersObject = getPlayersExcept(socket.id);
        io.emit('playerChange', playersArray.length, playersObject);
    });
});

const PORT = process.env.PORT || 2000;
server.listen(PORT, function() {
    console.log(`Listening on port ${PORT}`);
});
