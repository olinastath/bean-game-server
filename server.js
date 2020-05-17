const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use(express.static('public'));

let playersArray = [];
let playersObject = {};

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

let deck = [];
let discardPile = [];

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
        ]
    }

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
    });

    socket.on('updateDeck', function(updatedDeck) {
        deck = updatedDeck;
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
        console.log('turn ended');
        if (playerIndex === playersArray.length) playerIndex = 0;
        io.to(playersArray[playerIndex]).emit('startTurn', playerIndex + 1);
        io.emit('updatePlayerTurn', playersArray[playerIndex]);
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

    socket.on('cardPlayed', function(gameObject, player) {
        socket.broadcast.emit('cardPlayed', gameObject, player);
    });

    socket.on('cardDiscarded', function(gameObject, player) {
        discardPile.push(gameObject.textureKey);
        socket.broadcast.emit('cardDiscarded', gameObject, player);
    });

    socket.on('tradeCard', function(gameObject, player) {
        io.to(player).emit('cardTraded', gameObject);
    });

    socket.on('enableTrades', function(player) {
        // emit to everyone else that they can now trade with player 
        socket.broadcast.emit('enableTradingWithPlayer', player);
    });

    socket.on('disableTrades', function() {
        // emit to everyone else that they can now trade with player 
        socket.broadcast.emit('disableTradingWithPlayer');
    });

    socket.on('disconnect', function() {
        console.log('A user disconnected: ' + socket.id);
        playersArray = playersArray.filter(player => player != socket.id);
        playersObject = getPlayersExcept(socket.id);
        io.emit('playerChange', playersArray.length, playersObject);
    });
});

server.listen(2000, function() {
    console.log("Listening on port 2000");
});