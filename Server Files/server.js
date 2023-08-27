import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import { createServer } from 'https';

import { Game } from './game.js';
import { Player } from './player.js';
import { calculateIncome } from './calculateIncome.js';

import * as C from './constants.js';

const server = createServer({
    cert: readFileSync('cert.pem'),
    key: readFileSync('key.pem'),
    passphrase: 'fdsa'
})

server.listen(8080);

const wss = new WebSocketServer({ server });

let rooms = []; // * * array of array of objects in here (all websockets + 0th index: game object)

// * * Don't need to JSON.stringify all objects in the map (idk why but it works)
// * * Actually do I even need this??? YES because when they disconnect, can't send a message right before they disconnect
let WStoRoomID = new Map; // add to this when they join/change rooms, know where to find their websocket when they leave the room

let WStoPlayerName = new Map; // when someone new joins a room, need a way to fetch the names of the other players in the room
let roomIDCounter = 0;

function findRoomIndex(ID) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i][0].ID === ID) {
            return i;
        }
    }
}

function removePlayer(ws, roomID, playerName) {
    // TODO: Should validate that the parameters given are valid; if not, send niceTry
    let roomIndex = findRoomIndex(roomID);
    WStoRoomID.delete(ws);
    let playerIndex = rooms[roomIndex].findIndex(elem => elem === ws);
    rooms[roomIndex].splice(playerIndex, 1);
    for (let i = 1; i < rooms[roomIndex].length; i++) { // 1 because ignore the first element
        rooms[roomIndex][i].send(JSON.stringify({type: 'removePlayer', name: playerName, indexToRemove: playerIndex - 1, newHost: playerIndex === 1})); // 1 because ignore the first element
    }
    if (playerIndex === 1 && rooms[roomIndex].length > 1) { // 1 because ignore the first element
        rooms[roomIndex][1].send(JSON.stringify({type: 'newHost'})); // 1 because ignore the first element; tell the new host
    }
    if (rooms[roomIndex].length === 1) { // 1 because ignore the first element; they were the last one to leave
        rooms.splice(roomIndex, 1); // remove the room
    }
}

function verifyWebsocket(ws, roomIndex, playerCounter) {
    return ws === rooms[roomIndex][playerCounter + 1]; // 1 because 0th index is the game
}

function validPurchase(game, playerCounter, shopIndex) {
    // TODO: Verify that they have not already bought that landmark
    if (shopIndex < 0 || shopIndex > 18 || game.players[playerCounter].balance < C.buildings[shopIndex].cost) {
        return false;
    }
    if (maximumEstablishments(game.players, shopIndex)) {
        return false;
    }
    if (shopIndex >= 6 && shopIndex <= 8) {
        return game.players[playerCounter].establishments[shopIndex] !== 1;
    }
    if (shopIndex >= 15) {
        return game.players[playerCounter].landmarks[shopIndex] === false;
    }
    return true;
}

function maximumEstablishments(players, index) {
    let sum = 0;
    for (let i = 0; i < players.length; i++) {
        sum += players[i].establishments[index];
    }
    return (index === 0 || index === 2) ? sum === 8 : sum === 6; // start with 1 wheat field and 1 bakery
}

function sendWebsocketEveryone(roomIndex, messageObj) { // TODO: Use this
    for (let i = 1; i < rooms[roomIndex].length; i++) { // 1 because ignore the first element
        rooms[roomIndex][i].send(JSON.stringify(messageObj));
    }
}

// TODO: Can't join a full room (4 players)

wss.on('connection', function (ws) {

    ws.on('error', console.error);

    ws.on('message', function (message) {
        try {
            message = JSON.parse(message);
        } catch (e) {
            ws.send(JSON.stringify({type: 'niceTry'}));
        }
        if (message.type === 'setPlayerName') {
            // TODO: Server should verify that they have not already set their name (unless they are changing it)
            WStoPlayerName.set(ws, message.name);
        } else if (message.type === 'message') {
            let roomIndex = findRoomIndex(message.roomID);
            for (let i = 1; i < rooms[roomIndex].length; i++) { // 1 because ignore the first element
                // TODO: Server should verify that they are in that room
                rooms[roomIndex][i].send(JSON.stringify({type: 'message', message: message.message, name: message.name}));
            }
        } else if (message.type === 'requestRooms') {
            ws.send(JSON.stringify({type: 'sendRooms', rooms: rooms}));
        } else if (message.type === 'joinedRoom') {
            // TODO: Server should verify that they are not in another room before joining this one
            let roomIndex = findRoomIndex(message.roomID);
            WStoRoomID.set(ws, message.roomID);
            for (let i = 1; i < rooms[roomIndex].length; i++) { // 1 because ignore the first element
                // send message to original person as well
                // index includes all players (including host)
                rooms[roomIndex][i].send(JSON.stringify({type: 'playerJoined', newName: message.name, index: rooms[roomIndex].length - 2})); 
                ws.send(JSON.stringify({type: 'addPlayer', name: WStoPlayerName.get(rooms[roomIndex][i]), index: rooms[roomIndex].length - 2}));
            }
            rooms[roomIndex].push(ws);
            ws.send(JSON.stringify({type: 'addYourself', name: message.name, hostName: WStoPlayerName.get(rooms[roomIndex][1])}));
        } else if (message.type === "removePlayer") {
            // * * Server doesn't need to validate, since 'ws' only refers to the client who sent the message; worst case they remove themselves
            if (message.roomID !== -1) { // do nothing if they're not in a room
                removePlayer(ws, message.roomID, message.name); // * * Server needs to validate this though
            }
        } else if (message.type === "createRoom") {
            // TODO: Server should validate that they are not in another room before creating a new room
            rooms.push([new Game(), ws]);
            rooms[rooms.length - 1][0].ID = roomIDCounter;
            rooms[rooms.length - 1][0].name = message.roomName;
            ws.send(JSON.stringify({type: 'ID', ID: roomIDCounter}));
            WStoRoomID.set(ws, roomIDCounter);
            roomIDCounter++;
        } else if (message.type === "startGame") {
            let roomIndex = findRoomIndex(message.roomID);
            if (rooms[roomIndex][1].length === 2 || rooms[roomIndex][1] !== ws) { // 1 because ignore the first element (verify that they are the host)
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                let numberOfPlayers = rooms[roomIndex].length - 1; // 1 because ignore the first element
                rooms[roomIndex][0].numberOfPlayers = numberOfPlayers; // * * Do I need this value? Maybe just for convenience
                rooms[roomIndex][0].players = Array(numberOfPlayers);
                for (let i = 0; i < numberOfPlayers; i++) {
                    rooms[roomIndex][0].players[i] = new Player(WStoPlayerName.get(rooms[roomIndex][i + 1]));
                }
                for (let i = 1; i < rooms[roomIndex].length; i++) { // 1 because ignore the first element
                    ws.send(JSON.stringify({type: 'startGame', startingPlayer: i === 1}));
                }
            }
        } else if (message.type === 'kickPlayer') {
            let roomIndex = findRoomIndex(message.roomID);
            if (message.indexToKick < 0 || message.indexToKick > rooms[roomIndex].length - 3 || ws !== rooms[roomIndex][1]) { // verify that indexToKick is a valid number and that they are the host
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                // they are removed from rooms when removePlayer is received
                rooms[roomIndex][message.indexToKick + 2].send(JSON.stringify({type: 'kickedPlayer'})); // add 2 because ignore the first element and the host spot
                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    rooms[roomIndex][i].send(JSON.stringify({type: 'kickMessage', kickedName: WStoPlayerName.get(rooms[roomIndex][message.indexToKick + 2]), kicked: i === message.indexToKick + 2}));
                }
            }
        } else if (message.type === 'endTurn') {
            let roomIndex = findRoomIndex(roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.state === C.state.newTurn || game.state === C.state.TVStation) { // any other state is OK
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                // * * Update playerCounter (if applicable)
                if (!(game.state === C.state.rolledDoubles || game.state === C.state.rerolledDoubles)) { // Amusement Park did not activate
                    game.playerCounter++;
                }
                if (game.playerCounter === game.numberOfPlayers) {
                    game.playerCounter = 0;
                }

                // * * Update the game state
                game.state = C.state.newTurn;

                // * * Reset income for next turn
                game.income = undefined;

                // * * Tell the next player it's their turn
                rooms[roomIndex][playerCounter + 1].send(JSON.stringify({type: 'yourTurn'}));
            }
        } else if (message.type === 'rollDice') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;

            // * * Verify they have not already rolled/Radio Tower stuff
            let alreadyRolled = (game.state === C.state.rerolled) || (game.state === C.state.rerolledDoubles);
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || alreadyRolled || game.state === C.state.bought || game.state === C.state.TVStation || ((game.state === C.state.rolled || game.state === C.state.rolledDoubles) && !game.players[playerCounter].landmarks[3])) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                let doubles = false;
                let roll = Math.floor(Math.random() * 6 + 1);

                // * * Roll two dice
                if (message.rollTwoDice && game.players[playerCounter].landmarks[0]) {
                    let secondRoll = Math.floor(Math.random() * 6 + 1);
                    if (roll === secondRoll) {
                        doubles = true;
                    }
                    roll += secondRoll;
                }
                
                for (let i = 1; i < rooms[roomIndex].length; i++) { // just to update every client's HTML
                    rooms[roomIndex][i].send(JSON.stringify({type: 'rolledDice', roll: roll, playerCounter: playerCounter, yourTurn: i === playerCounter + 1}));
                }

                // * * Update game state
                game.state = alreadyRolled ? (game.state = doubles ? C.state.rerolledDoubles : C.state.rerolled) : (game.state = doubles ? C.state.rolledDoubles : C.state.rolled);
                // Checked Radio Tower above

                // * * Update previous game state
                game.previousState = undefined;

                game.income = calculateIncome(roll, game, rooms[roomIndex], WStoPlayerName);
                // TODO: Calculate everyone's income here
            }
        } else if (message.type === 'buySomething') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            // * * You are not able to buy something while TV Station is activated
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.state === C.state.bought || game.state === C.state.newTurn || game.state === C.state.TVStation || !validPurchase(game, playerCounter, message.shopIndex)) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                game.players[playerCounter].balance -= C.buildings[message.shopIndex].cost;

                // * * Update game state
                game.state = C.state.bought;

                // * * Update previous game state
                game.previousState = undefined;

                if (message.index < 15) {
                    game.players[playerCounter].establishments[message.shopIndex]++;
                    for (let i = 1; i < rooms[roomIndex].length; i++) {
                        rooms[roomIndex][i].send(JSON.stringify({type: 'boughtEstablishment', shopIndex: message.shopIndex, playerCounter: playerCounter, quantity: game.players[playerCounter].establishments[message.shopIndex]}));
                    }
                } else {
                    game.players[playerCounter].landmarks[message.shopIndex - 15] = true;
                    if (game.players[playerCounter].landmarks.every(v => v === true)) { // Player wins!
                        // TODO: Make the end screen 
                    } else { // Game continues
                        // TODO: Make this into a function 'sendWebsocketEveryone' or something
                        for (let i = 1; i < rooms[roomIndex].length; i++) {
                            rooms[roomIndex][i].send(JSON.stringify({type: 'boughtLandmark', shopIndex: message.shopIndex, playerCounter: playerCounter}));
                        }
                    }
                }
            }
        } else if (message.type === 'TVActivate') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.state !== C.state.TVStation) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                // TODO: Verify that message.index is a valid number
                let numberOfCoins = exchangeCoins(currentPlayer, game.players[message.targetIndex - 1], 5); // since i is not 0 indexed
                purpleIncome[playerCounter] += numberOfCoins;
                purpleIncome[message.targetIndex - 1] -= numberOfCoins; // since i is not 0 indexed
                
                // * * Update game state; VERY IMPORTANT: must finish the TV Station interaction before buying something
                game.state = (game.previousState === C.state.rolled) ? C.state.rerolled : game.previousState;
                game.state = (game.previousState === C.state.rolledDoubles) ? C.state.rerolledDoubles : game.previousState; // * * So they cannot reroll after TV Station interaction
                game.previousState = undefined;
                
                let playerBalances = game.players.map(elem => elem.balance).splice(0, 1); // remove the 0th index (the game);
                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    // * * targetIndex starts at 1
                    rooms[roomIndex][i].send(JSON.stringify({type: 'showFinishedTVText', playerBalances: playerBalances, yourTurn: i === playerCounter + 1, amount: numberOfCoins, receiverName: WStoPlayerName.get(rooms[roomIndex][playerCounter + 1]), giverName: WStoPlayerName.get(rooms[roomIndex][message.targetIndex])}));
                }
            }
        }
    });

    ws.on('close', function () {
        let roomID = WStoRoomID.get(ws);
        if (roomID !== undefined) {
            removePlayer(ws, roomID, WStoPlayerName.get(ws)); // WStoRoomID gets deleted here
        }
        WStoPlayerName.delete(ws);
    });
});