import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import { createServer } from 'https';

import { Game } from './game.js';
import { Player } from './player.js';
import { calculateIncome, exchangeCoins } from './calculateIncome.js';

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
    // TODO: Validate that the parameters given are valid; if not, send niceTry
    let roomIndex = findRoomIndex(roomID);
    WStoRoomID.delete(ws);
    let playerIndex = rooms[roomIndex].findIndex(elem => elem === ws);
    rooms[roomIndex].splice(playerIndex, 1);
    sendWebsocketEveryone(roomIndex, {type: 'removePlayer', name: playerName, indexToRemove: playerIndex - 1, newHost: playerIndex === 1});
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

function verifyHostWebsocket(ws, roomIndex) {
    return ws === rooms[roomIndex][1];
}

function validPurchase(game, playerCounter, shopIndex) {
    if (shopIndex < 0 || shopIndex > 18 || game.players[playerCounter].balance < C.buildings[shopIndex].cost) {
        return false;
    }
    if (maximumEstablishments(game.players, shopIndex)) { // TODO: make this account for landmarks
        return false;
    }
    if (shopIndex >= 6 && shopIndex <= 8) {
        return game.players[playerCounter].establishments[shopIndex] !== 1;
    }
    if (shopIndex >= 15) {
        return game.players[playerCounter].landmarks[shopIndex - 15] === false;
    }
    return true;
}

function maximumEstablishments(players, index) { // * * Note: This doesn't account for the purple establishments
    let sum = 0;
    for (let i = 0; i < players.length; i++) {
        sum += players[i].establishments[index];
    }
    return (index === 0 || index === 2) ? sum === 6 + players.length : sum === 6; // start with 1 wheat field and 1 bakery
}

export function sendWebsocketEveryone(roomIndex, messageObj) {
    for (let i = 1; i < rooms[roomIndex].length; i++) { // 1 because ignore the first element (the game)
        rooms[roomIndex][i].send(JSON.stringify(messageObj));
    }
}

function validReceiveIndex(game, receiveIndex) {
    let targetPlayerIndex = game.businessTargetPlayerIndex;
    return !(targetPlayerIndex === -1 || game.players[targetPlayerIndex].establishments[receiveIndex] === 0 || targetPlayerIndex === game.playerCounter);
}

function validGiveIndex(game, giveIndex) {
    return game.players[game.playerCounter].establishments[giveIndex] !== 0;
}

function roll(roomIndex, rollTwoDice, reroll, trainStation, radioTower, game, playerCounter) { // was verified earlier that the player is able to reroll (if they did)
    // * * Disable the save game button
    rooms[roomIndex][1].send(JSON.stringify({type: 'disableSaveGame'}))

    let doubles = false;
    let roll = Math.floor(Math.random() * 6 + 1);

    // * * Roll two dice
    if (rollTwoDice) {
        let secondRoll = Math.floor(Math.random() * 6 + 1);
        if (roll === secondRoll) {
            doubles = true;
        }
        roll += secondRoll;
    }

    // TODO: Remove this
    roll = 6;

    // * * Update every client's HTML
    for (let i = 1; i < rooms[roomIndex].length; i++) { // just to update every client's HTML
        rooms[roomIndex][i].send(JSON.stringify({type: 'rolledDice', roll: roll, playerName: WStoPlayerName.get(rooms[roomIndex][playerCounter + 1]), yourTurn: i === playerCounter + 1, ableToReroll: !reroll && radioTower, trainStation: trainStation}));
    }

    // * * Update game state
    game.state = reroll ? (doubles ? C.state.rerolledDoubles : C.state.rerolled) : (doubles ? C.state.rolledDoubles : C.state.rolled);

    // * * Calculate everyone's income
    game.income = calculateIncome(roll, game, rooms[roomIndex], WStoPlayerName, roomIndex);

    for (let i = 1; i < rooms[roomIndex].length; i++) { // just to update every client's HTML
        rooms[roomIndex][i].send(JSON.stringify({type: 'incomeReceived', income: game.income, yourTurn: i === playerCounter + 1, players: game.players, playerCounter: playerCounter}));
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
            if (!rooms[roomIndex].includes(ws)) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                sendWebsocketEveryone(roomIndex, {type: 'message', message: message.message, name: WStoPlayerName.get(ws)})
            }
        } else if (message.type === 'requestRooms') {
            ws.send(JSON.stringify({type: 'sendRooms', rooms: rooms}));
        } else if (message.type === 'joinedRoom') {
            // * * Check if they are in another room
            if (WStoRoomID.get(ws) !== undefined) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
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
            }
        } else if (message.type === "removePlayer") {
            // * * Server doesn't need to validate, since 'ws' only refers to the client who sent the message; worst case they remove themselves
            if (message.roomID !== -1) { // do nothing if they're not in a room
                removePlayer(ws, message.roomID, message.name); // * * Server needs to validate this though
            }
        } else if (message.type === "createRoom") {
            // * * Check if they are in another room
            if (WStoRoomID.get(ws) !== undefined) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                rooms.push([new Game(), ws]);
                rooms[rooms.length - 1][0].ID = roomIDCounter;
                rooms[rooms.length - 1][0].name = message.roomName;
                ws.send(JSON.stringify({type: 'ID', ID: roomIDCounter}));
                WStoRoomID.set(ws, roomIDCounter);
                roomIDCounter++;
            }
        } else if (message.type === "startGame") {
            let roomIndex = findRoomIndex(message.roomID);
            if (rooms[roomIndex].length === 2 || rooms[roomIndex][1] !== ws) { // 1 because ignore the first element (verify that they are the host)
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                let numberOfPlayers = rooms[roomIndex].length - 1; // 1 because ignore the first element
                rooms[roomIndex][0].numberOfPlayers = numberOfPlayers; // * * Do I need this value? Maybe just for convenience
                rooms[roomIndex][0].players = Array(numberOfPlayers);
                for (let i = 0; i < numberOfPlayers; i++) {
                    rooms[roomIndex][0].players[i] = new Player(WStoPlayerName.get(rooms[roomIndex][i + 1]));
                }

                let playerNamesArray = [];
                for (let i = 0; i < numberOfPlayers; i++) {
                    playerNamesArray.push(WStoPlayerName.get(rooms[roomIndex][i + 1]));
                }

                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    rooms[roomIndex][i].send(JSON.stringify({type: 'startGame', startingPlayer: i === 1, playerNames: playerNamesArray}));
                }
            }
        } else if (message.type === 'kickPlayer') {
            let roomIndex = findRoomIndex(message.roomID);
            if (message.indexToKick < 0 || message.indexToKick > rooms[roomIndex].length - 3 || ws !== rooms[roomIndex][1]) { // verify that indexToKick is a valid number and that they are the host
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    rooms[roomIndex][i].send(JSON.stringify({type: 'kickMessage', kickedName: WStoPlayerName.get(rooms[roomIndex][message.indexToKick + 2]), kicked: i === message.indexToKick + 2}));
                }
                // they are removed from rooms when removePlayer is received
                rooms[roomIndex][message.indexToKick + 2].send(JSON.stringify({type: 'kickedPlayer'})); // add 2 because ignore the first element and the host spot
            }
        } else if (message.type === 'endTurn') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            let TVStationCheck = (game.TVStationActivatedState === C.purpleState.activateFinish) || (game.TVStationActivatedState === C.purpleState.didNotActivate);
            let businessCenterCheck = (game.businessCenterActivatedState === C.purpleState.activateFinish) || (game.TVStationActivatedState === C.purpleState.didNotActivate);
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.state === C.state.newTurn || !TVStationCheck || !businessCenterCheck) { // any other state is OK
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                // * * Update the game state
                game.state = C.state.newTurn;

                // * * Reset the purple establishment states
                game.TVStationActivatedState = C.purpleState.didNotActivate;
                game.businessCenterActivatedState = C.purpleState.didNotActivate;
                game.businessTargetPlayerIndex = -1;
                game.businessReceiveIndex = -1;

                // * * Reset income for next turn
                game.income = undefined;

                // * * Update playerCounter (if applicable)
                if (!(game.state === C.state.rolledDoubles || game.state === C.state.rerolledDoubles)) { // Amusement Park did not activate
                    game.playerCounter++;
                }
                if (game.playerCounter === game.numberOfPlayers) {
                    game.playerCounter = 0;
                }

                // * * Update clients' HTML
                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    rooms[roomIndex][i].send(JSON.stringify({type: 'endedTurn', nextPlayerName: WStoPlayerName.get(rooms[roomIndex][game.playerCounter + 1]), yourTurn: (i === game.playerCounter) || (i === game.playerCounter + game.numberOfPlayers)}));
                }

                // * * Enable the save game button
                rooms[roomIndex][1].send(JSON.stringify({type: 'enableSaveGame'}));

                // * * Tell the next player it's their turn
                rooms[roomIndex][game.playerCounter + 1].send(JSON.stringify({type: 'yourTurn', rollTwoDice: game.players[game.playerCounter].landmarks[0]}));
            }
        } else if (message.type === 'rollDice') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            let businessCenterCheck = (game.businessCenterActivatedState === C.purpleState.didNotActivate) || (game.businessCenterActivatedState === C.purpleState.activated);
            let TVStationCheck = (game.TVStationActivatedState === C.purpleState.didNotActivate) || (game.TVStationActivatedState === C.purpleState.activated);
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.state !== C.state.newTurn || !TVStationCheck || !businessCenterCheck || (message.rollTwoDice && !game.players[playerCounter].landmarks[0])) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                roll(roomIndex, message.rollTwoDice, false, game.players[playerCounter].landmarks[0], game.players[playerCounter].landmarks[3], game, playerCounter);
            }
        } else if (message.type === 'rerollDice') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;

            let alreadyRolled = (game.state === C.state.rolled) || (game.state === C.state.rolledDoubles);
            let businessCenterCheck = (game.businessCenterActivatedState === C.purpleState.didNotActivate) || (game.businessCenterActivatedState === C.purpleState.activated);
            let TVStationCheck = (game.TVStationActivatedState === C.purpleState.didNotActivate) || (game.TVStationActivatedState === C.purpleState.activated);
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || !alreadyRolled || !TVStationCheck || !businessCenterCheck || !game.players[playerCounter].landmarks[3]) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                // * * Reset states
                game.TVStationActivatedState = C.purpleState.didNotActivate;
                game.businessCenterActivatedState = C.purpleState.didNotActivate;

                // * * Subtract income from previous roll
                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    game.players[i - 1].balance -= game.income[i - 1];
                }

                // * * Send message to every client to update balances
                sendWebsocketEveryone(roomIndex, {type: 'updateBalances', newBalances: game.players.map(elem => elem.balance)});

                // * * Roll the dice again!
                roll(roomIndex, message.rollTwoDice, true, game.players[playerCounter].landmarks[0], game.players[playerCounter].landmarks[3], game, playerCounter);
            }
        } else if (message.type === 'buySomething') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            // * * You should be able to buy something while TV Station is activated
            // TODO: You cannot buy something while business center is activated
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.state === C.state.bought || game.state === C.state.newTurn || !validPurchase(game, playerCounter, message.shopIndex)) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                game.players[playerCounter].balance -= C.buildings[message.shopIndex].cost;

                // * * Update game state
                game.state = C.state.bought;

                if (message.shopIndex < 15) { // bought an establishment
                    game.players[playerCounter].establishments[message.shopIndex]++;
                    sendWebsocketEveryone(roomIndex, {type: 'boughtEstablishment', newBalance: game.players[playerCounter].balance, shopIndex: message.shopIndex, playerCounter: playerCounter, quantity: game.players[playerCounter].establishments[message.shopIndex]});
                    ws.send(JSON.stringify({type: 'boughtSomething'}));
                } else { // bought a landmark
                    game.players[playerCounter].landmarks[message.shopIndex - 15] = true; 
                    // TODO: Maybe a message saying that they bought a landmark even though they won?
                    if (game.players[playerCounter].landmarks.every(landmark => landmark === true)) { // Player wins!
                        sendWebsocketEveryone(roomIndex, {type: 'endGame', winnerIndex: playerCounter});
                    } else { // Game continues
                        sendWebsocketEveryone(roomIndex, {type: 'boughtLandmark', newBalance: game.players[playerCounter].balance, shopIndex: message.shopIndex, playerCounter: playerCounter})
                        ws.send(JSON.stringify({type: 'boughtSomething'}));
                    }
                }
            }
        } else if (message.type === 'TVActivate') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.TVStationActivatedState !== C.purpleState.activated || message.targetIndex - 1 === playerCounter || message.targetIndex < 1 || message.targetIndex > rooms[roomIndex].length - 1) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                let numberOfCoins = exchangeCoins(game.players[playerCounter], game.players[message.targetIndex - 1], 5); // since targetIndex is not 0 indexed
                
                // * * Update TVStationActivated state
                game.TVStationActivatedState = C.purpleState.activateFinish;
                
                // * * Update player balances on each client
                let playerBalances = game.players.map(elem => elem.balance);

                // * * targetIndex starts at 1
                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    // * * targetIndex starts at 1
                    rooms[roomIndex][i].send(JSON.stringify({type: 'showFinishedTVText', yourTurn: i === playerCounter + 1, playerCounter: playerCounter, playerBalances: playerBalances, amount: numberOfCoins, receiverName: WStoPlayerName.get(rooms[roomIndex][playerCounter + 1]), giverName: WStoPlayerName.get(rooms[roomIndex][message.targetIndex])}));
                }
            }
        } else if (message.type === 'businessActivate') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || game.businessCenterActivatedState !== C.purpleState.activated || message.targetIndex - 1 === playerCounter) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                game.businessTargetPlayerIndex = message.targetIndex - 1; // * * targetPlayerIndex is 0 indexed

                // * * Update businessCenterActivated state
                game.businessCenterActivatedState = C.purpleState.gotPlayerIndex;

                // * * Send back data to disable establishment buttons that targetPlayer doesn't have
                ws.send(JSON.stringify({type: 'disableBusinessReceiveButtons', disableArray: game.players[message.targetIndex - 1].establishments.map(elem => elem === 0)}));
            }
        } else if (message.type === 'businessReceiveIndex') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || !validReceiveIndex(game, message.receiveIndex) || game.businessCenterActivatedState !== C.purpleState.gotPlayerIndex) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                game.businessReceiveIndex = message.receiveIndex;

                // * * Update businessCenterActivated state
                game.businessCenterActivatedState = C.purpleState.gotReceiveIndex;

                ws.send(JSON.stringify({type: 'disableBusinessGiveButtons', disableArray: game.players[playerCounter].establishments.map(elem => elem === 0)}));
            }
        } else if (message.type === 'businessGiveIndex') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            let playerCounter = game.playerCounter;
            if (!verifyWebsocket(ws, roomIndex, playerCounter) || !validGiveIndex(game, message.giveIndex) || game.businessCenterActivatedState !== C.purpleState.gotReceiveIndex) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                // * * Trade the establishments
                game.players[game.businessTargetPlayerIndex].establishments[message.giveIndex]++;
                game.players[game.businessTargetPlayerIndex].establishments[game.businessReceiveIndex]--;   

                game.players[playerCounter].establishments[message.giveIndex]--;                
                game.players[playerCounter].establishments[game.businessReceiveIndex]++;                

                // * * Update businessCenterActivated state
                game.businessCenterActivatedState = C.purpleState.activateFinish;

                // * * Update every client's HTML
                // * * giveReceive means the number of the establishment you (playerCounter) GAVE to the RECEIVER (playerCounter)
                for (let i = 1; i < rooms[roomIndex].length; i++) {
                    rooms[roomIndex][i].send(JSON.stringify({type: 'updateEstablishments', yourTurn: i === playerCounter + 1, players: game.players, playerCounter: playerCounter, giveIndex: message.giveIndex, receiveIndex: game.businessReceiveIndex, givePlayerIndex: game.businessTargetPlayerIndex, receivePlayerIndex: playerCounter, giveGiveAmount: game.players[game.businessTargetPlayerIndex].establishments[message.giveIndex], giveReceiveAmount: game.players[playerCounter].establishments[message.giveIndex], receiveGiveAmount: game.players[game.businessTargetPlayerIndex].establishments[game.businessReceiveIndex], receiveReceiveAmount: game.players[playerCounter].establishments[game.businessReceiveIndex]}));
                }
            }
        } else if (message.type === 'requestSave') {
            let roomIndex = findRoomIndex(message.roomID);
            let game = rooms[roomIndex][0];
            // * * Only the host can save the game
            if (!verifyHostWebsocket(ws, roomIndex) || game.state !== C.state.newTurn) {
                ws.send(JSON.stringify({type: 'niceTry'}));
            } else {
                ws.send(JSON.stringify({type: 'saveGame', game: game}));

                // TODO: Send a message to everyone saying the game has been saved
            }
        }
    });

    ws.on('close', function () {
        let roomID = WStoRoomID.get(ws);
        if (roomID !== undefined) {
            removePlayer(ws, roomID, WStoPlayerName.get(ws)); // WStoRoomID gets deleted here
            if (rooms.length === 0) {
                roomIDCounter = 0;
            }
        }
        WStoPlayerName.delete(ws);
    });
});