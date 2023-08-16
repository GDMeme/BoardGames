import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import { createServer } from 'https';

import { Game } from './game.js';
import { Player } from './player.js';

const server = createServer({
    cert: readFileSync('cert.pem'),
    key: readFileSync('key.pem'),
    passphrase: 'fdsa'
})

server.listen(8080);

const wss = new WebSocketServer({ server });

let rooms = []; // * * array of array of objects in here (all websockets + 0th index: game object: ID, name of room, playerCounter) ID of room is a number

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
            WStoPlayerName.set(ws, message.name);
        } else if (message.type === 'message') {
            for (let i = 1; i < rooms[findRoomIndex(message.roomID)].length; i++) { // 1 because ignore the first element
                rooms[findRoomIndex(message.roomID)][i].send(JSON.stringify({type: 'message', message: message.message, name: message.name}));
            }
        } else if (message.type === 'requestRooms') {
            ws.send(JSON.stringify({type: 'sendRooms', rooms: rooms}));
        } else if (message.type === 'joinedRoom') {
            let roomIndex = findRoomIndex(message.roomID);
            WStoRoomID.set(ws, message.roomID);
            for (let i = 1; i < rooms[roomIndex].length; i++) { // 1 because ignore the first element
                // send message to original person as well
                rooms[roomIndex][i].send(JSON.stringify({type: 'playerJoined', newName: message.name}));
                ws.send(JSON.stringify({type: 'addPlayer', name: WStoPlayerName.get(rooms[roomIndex][i])}));
            }
            rooms[roomIndex].push(ws);
            ws.send(JSON.stringify({type: 'addYourself', name: message.name, hostName: WStoPlayerName.get(rooms[roomIndex][1])}));
        } else if (message.type === "removePlayer") {
            if (message.roomID !== -1) { // do nothing if they're not in a room
                removePlayer(ws, message.roomID, message.name);
            }
        } else if (message.type === "createRoom") {
            rooms.push([new Game(), ws]);
            rooms[rooms.length - 1][0].ID = roomIDCounter;
            rooms[rooms.length - 1][0].name = message.roomName;
            ws.send(JSON.stringify({type: 'ID', ID: roomIDCounter}));
            WStoRoomID.set(ws, roomIDCounter);
            roomIDCounter++;
        } else if (message.type === "startGame") {
            let roomIndex = findRoomIndex(message.roomID);
            if (rooms[roomIndex][1] === ws) { // 1 because ignore the first element
                let numberOfPlayers = rooms[roomIndex].length - 1; // 1 because ignore the first element
                rooms[roomIndex][0].numberOfPlayers = numberOfPlayers; // * * Do I need this value? Maybe just for convenience
                rooms[roomIndex][0].players = Array(numberOfPlayers);
                for (let i = 0; i < numberOfPlayers; i++) {
                    rooms[roomIndex][0].players[i] = new Player(WStoPlayerName.get(rooms[roomIndex][i + 1]));
                }
                for (let i = 1; i < rooms[roomIndex]; i++) { // 1 because ignore the first element
                    ws.send(JSON.stringify({type: 'startGame', startingPlayer: i === 1}));
                }
            } else {
                ws.send(JSON.stringify({type: 'niceTry'}));
            }
        } // TODO: playerCounter has to be server-side, tells the client whose turn it is
    });

    ws.on('close', function () {
        let roomID = WStoRoomID.get(ws);
        if (roomID !== undefined) {
            removePlayer(ws, roomID, WStoPlayerName.get(ws)); // WStoRoomID gets deleted here
        }
        WStoPlayerName.delete(ws);
    });
});