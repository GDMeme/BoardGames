import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import { createServer } from 'https';

const server = createServer({
    cert: readFileSync('cert.pem'),
    key: readFileSync('key.pem'),
    passphrase: 'fdsa'
})

server.listen(8080);

const wss = new WebSocketServer({ server });

// TODO: NEEDS ID AND ROOMNAME
let rooms = []; // * * array of array of objects in here (all websockets + 0th index: ID of room + 1st index: name of room) ID of room is a number

// * * Don't need to JSON.stringify all objects in the map (idk why but it works)
// * * Actually do I even need this??? YES because when they disconnect, can't send a message right before they disconnect
let WStoRoomID = new Map; // add to this when they join/change rooms, know where to find their websocket when they leave the room

let WStoPlayerName = new Map; // when someone new joins a room, need a way to fetch the names of the other players in the room
let roomIDCounter = 0;

function findRoomIndex(ID) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i][0] === ID) {
            return i;
        }
    }
}

wss.on('connection', function (ws) {

    ws.on('error', console.error);

    ws.on('message', function (message) {
        try {
            message = JSON.parse(message);
        } catch (e) {
            ws.send(JSON.stringify({type: 'niceTry'}));
        }
        if (message.type === 'first') {
            WStoPlayerName.set(ws, message.name);
        } else if (message.type === 'message') {
            for (let i = 2; i < rooms[findRoomIndex(message.roomID)].length; i++) { // 2 because ignore the first two elements (ID and name)
                rooms[findRoomIndex(message.roomID)][i].send(JSON.stringify({type: 'message', message: message.message, name: message.name}));
            }
        } else if (message.type === 'requestRooms') {
            ws.send(JSON.stringify({type: 'sendRooms', rooms: rooms}));
        } else if (message.type === 'joinedRoom') {
            let roomIndex = findRoomIndex(message.roomID);
            WStoRoomID.set(ws, message.roomID);
            for (let i = 2; i < rooms[roomIndex].length; i++) { // 2 because ignore the first two elements
                // send message to original person as well
                rooms[roomIndex][i].send(JSON.stringify({type: 'playerJoined', newName: message.name}));
                ws.send(JSON.stringify({type: 'addPlayer', name: WStoPlayerName.get(rooms[roomIndex][i])}));
            }
            rooms[roomIndex].push(ws);
            ws.send(JSON.stringify({type: 'addYourself', name: message.name}));
        } else if (message.type === "removePlayer") {
            if (message.roomID !== -1) {
                let roomIndex = findRoomIndex(message.roomID);
                WStoRoomID.delete(ws);
                let playerIndex = rooms[roomIndex].findIndex(elem => elem === ws);
                console.log('player index: ', playerIndex);
                rooms[roomIndex].splice(playerIndex, 1);

                // TODO: update playerlist for each player
                for (let i = 2; i < rooms[roomIndex].length; i++) {
                    rooms[roomIndex][i].send(JSON.stringify({type: 'removePlayer', name: message.name, newHost: playerIndex === 2}))
                }
                if (rooms[roomIndex].length === 2) { // They were the last one to leave
                    rooms.splice(roomIndex, 1); // remove the room
                }
            }
        } else if (message.type === "createRoom") {
            rooms.push([roomIDCounter, message.roomName, ws]);
            ws.send(JSON.stringify({type: 'ID', ID: roomIDCounter}));
            WStoRoomID.set(ws, roomIDCounter);
            roomIDCounter++;
        }
    });

    ws.on('close', function () {
        // TODO: Send a message in chat saying that they left
        // TODO: Update playerlist
        let roomID = WStoRoomID.get(ws);
        if (roomID !== undefined) {
            let roomIndex = findRoomIndex(roomID);
            rooms[roomIndex].splice(rooms[roomIndex].findIndex(elem => elem === ws), 1); // TODO: test this
            if (rooms[roomIndex].length === 2) { // 2 because ignore the first two elements
                rooms.splice(roomIndex, 1);
            }
            WStoRoomID.delete(ws);
        }
    });
});