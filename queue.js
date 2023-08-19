import { start } from './start.js';

let currentRoomID = -1;
let host = false;
let playerName; // need this in case they have to reconnect
let ws;

// TODO: Show when someone is typing?

// TODO: Ability to ban players from your room if you are the host (They can't join back)

// TODO: Ability to change player name (until the game starts)
// https://www.w3schools.com/icons/tryit.asp?filename=tryicons_fa-edit
// https://stackoverflow.com/questions/12945825/adding-an-onclick-event-to-a-div-element
// TODO: Account for start game while someone is changing their name (only client side)

// TODO: Ability to change room name (until the game starts)

function sendMessage(message) {
    document.querySelector('#chathistory').innerHTML += `${document.getElementById('chathistory').value === '' ? '' : '\n'}${message}`;
    document.getElementById('chathistory').scrollTop = document.getElementById('chathistory').scrollHeight;
}

export function queue(name) {   
    playerName = name;
    connect().then(function(websocket) {
        ws = websocket;
        ws.send(JSON.stringify({type: 'setPlayerName', name: playerName}));
        document.getElementById('roombuttons').style.display = "inline";
        document.body.style.backgroundColor = "#CCCCCC";

        document.getElementById('createroombutton').onclick = function() {
            document.getElementById('roombuttons').style.display = "none";
            document.getElementById('goback').style.display = "inline";

            document.getElementById('roomname').style.display = "inline";

            document.getElementById('roomnameinput').addEventListener("keypress", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    document.getElementById('submitroomnamebutton').click();
                }
            });
        }

        document.getElementById('submitroomnamebutton').onclick = function() {
            document.getElementById('openchatbutton').style.display = "inline";
            document.getElementById('openchatbutton').click();
            document.getElementById('roomname').style.display = "none";
            document.getElementById('waitingplayers').style.display = "inline";
            document.getElementById('playerlist').style.display = "inline";
            addNewPlayer(playerName, true); // -1 because can't kick yourself

            document.getElementById('startgame').style.display = "inline";
            host = true;
            let roomName = document.getElementById('roomnameinput').value || `${playerName}'s Room`;
            document.querySelector('#roomnamelabel').innerHTML = `Room Name: ${roomName}`;
            document.getElementById('roomnamelabel').style.display = "inline";
            ws.send(JSON.stringify({type: 'createRoom', roomName: roomName}));
        }

        document.getElementById('joinroombutton').onclick = function() {
            document.getElementById('roombuttons').style.display = "none";
            document.getElementById('goback').style.display = "inline";
            document.getElementById('loader').style.display = "inline";
            document.body.style.backgroundColor = '#645a5a';
            ws.send(JSON.stringify({type: 'requestRooms'})); // displays all available rooms to join
        }

        document.getElementById('refreshroomsbutton').onclick = function() {
            document.getElementById('noavailablerooms').style.display = "none";
            for (const child of document.getElementById('availablerooms').children) {
                child.remove();
            }
            ws.send(JSON.stringify({type: 'requestRooms'}));
        }

        document.getElementById('goback').onclick = function() {
            document.getElementById('goback').style.display = "none";
            document.getElementById('roombuttons').style.display = "inline";
            document.getElementById('openchatbutton').style.display = "none";
            document.getElementById('playerlist').style.display = "none";
            document.getElementById('waitingplayers').style.display = "none";
            document.getElementById('waitinghost').style.display = "none";
            document.getElementById('availableroomstext').style.display = "none";
            document.getElementById('roomname').style.display = "none";
            document.getElementById('roomnamelabel').style.display = "none";
            document.getElementById('startgame').style.display = "none";
            document.getElementById('noavailablerooms').style.display = "none";
            while (document.getElementById('playerlist').children.length > 1) {
                document.getElementById('playerlist').children[document.getElementById('playerlist').children.length - 1].children[0]?.remove();
                document.getElementById('playerlist').children[document.getElementById('playerlist').children.length - 1].remove();

            }
            for (const child of document.getElementById('availablerooms').children) {
                child.remove();
            }
            document.getElementById('openchatbutton').style.display = "none";
            ws.send(JSON.stringify({type: 'removePlayer', roomID: currentRoomID, name: playerName})); // removes player from the room (if they are in one)
            currentRoomID = -1;
            host = false;
        }
        
        document.getElementById('sendmessage').addEventListener("keypress", function(event) {
            if (event.key === "Enter" && document.getElementById('sendmessage').value) {
                event.preventDefault();
                // this is where the message is sent
                ws.send(JSON.stringify({type: 'message', roomID: currentRoomID, message: document.getElementById('sendmessage').value, name: playerName}));
                document.getElementById('sendmessage').value = "";
            }
        });

        document.getElementById('startgamebutton').onclick = function() {
            ws.send(JSON.stringify({type: 'startGame', roomID: currentRoomID}));
        }

        // Listen for messages
        ws.addEventListener("message", (message) => {
            message = JSON.parse(message.data); // don't need try/catch because server is sending the message (guaranteed to be valid)
            if (message.type === 'niceTry') { // easter egg
                document.getElementById('nicetry').style.display = "inline";
                document.getElementById('entiregame').style.display = "none";
                setTimeout(() => {
                    document.getElementById('nicetry').style.display = "none";
                    document.getElementById('entiregame').style.display = "inline";
                }, 1000);
            } else if (message.type === "playerJoined") {
                document.getElementById('waitingplayers').style.display = "none";
                document.getElementById('playerlist').style.display = "inline";
                addNewPlayer(message.newName, false);
                document.getElementById('startgamebutton').disabled = false;
                sendMessage(`${message.newName} joined your room!`);
            } else if (message.type === "message") {
                sendMessage(`${message.name}: ${message.message}`);
            } else if (message.type === 'sendRooms') {
                document.getElementById('loader').style.display = "none";
                document.body.style.backgroundColor = '#CCCCCC';
                document.getElementById('availableroomstext').style.display = "inline";
                for (const room of message.rooms) {
                    let roomButton = document.createElement('button');
                    // TODO: On button hover, show who is in that room
                    let roomName = room[0].name;
                    roomButton.innerHTML = roomName;
                    document.getElementById('availablerooms').appendChild(roomButton);
                    roomButton.onclick = function() {
                        currentRoomID = room[0].ID;
                        ws.send(JSON.stringify({type: 'joinedRoom', roomID: currentRoomID, name: playerName})); // notify other people that you joined
                        for (const child of document.getElementById('availablerooms').children) {
                            child.remove();
                        }
                        document.getElementById('openchatbutton').style.display = "inline";
                        document.getElementById('openchatbutton').click();
                        document.getElementById('availableroomstext').style.display = "none";
                        document.getElementById('playerlist').style.display = "inline";
                        document.getElementById('waitinghost').style.display = "inline";

                        document.querySelector('#roomnamelabel').innerHTML += roomName;
                        document.getElementById('roomnamelabel').style.display = "inline";
                    }
                }
                if (message.rooms.length === 0) {
                    document.getElementById('noavailablerooms').style.display = "inline";
                }
            } else if (message.type === 'ID') {
                currentRoomID = message.ID;
            } else if (message.type === 'addPlayer') {
                addNewPlayer(message.name, false);
            } else if (message.type === 'addYourself') {
                addNewPlayer(message.name, true); // -1 because can't kick yourself
                sendMessage(`You joined ${message.hostName}'s room!`)
            } else if (message.type === 'removePlayer') {
                sendMessage(`${message.name} left your room!`);
                document.getElementById('playerlist').children[message.indexToRemove + 1].children[0]?.remove();
                document.getElementById('playerlist').children[message.indexToRemove + 1].remove();
                if (host) {
                    removeKickButtons();
                    generateKickButtons();
                }
                if (message.newHost) {
                    sendMessage(`Host has been automatically transferred to ${document.getElementById('playerlist').children[1].innerHTML}!`);
                    document.getElementById('playerlist').children[1].innerHTML += ' (Host)';
                }
                if (document.getElementById('playerlist').children.length === 2) {
                    document.getElementById('waitingplayers').style.display = "inline";
                }
                document.getElementById('startgamebutton').disabled = !(document.getElementById('playerlist').children.length > 2);
            } else if (message.type === 'newHost') {
                host = true;

                // * * Adding kick buttons for each player
                // will never have kick buttons before this
                generateKickButtons();

                document.getElementById('waitinghost').style.display = "none";
                document.getElementById('waitingplayers').style.display = document.getElementById('playerlist').children.length === 2 ? "inline" : "none";

                document.getElementById('startgame').style.display = "inline";
                document.getElementById('startgamebutton').disabled = !(document.getElementById('playerlist').children.length > 2);
            } else if (message.type === 'goBack') {
                document.getElementById('goback').click();
            } else if (message.type === 'startGame') {
                start();
            } else if (message.type === 'kickedPlayer') {
                document.getElementById('goback').click();
            } else if (message.type === 'kickMessage') {
                sendMessage(`${message.kicked ? 'You were' : `${message.kickedName} was`} kicked from the room!`);

            }
        });

    }).catch(function(err) {
        console.error(err);
    });
};

function addNewPlayer(name, bold) { // flag true means don't add kick button
    let newPlayer = document.createElement('li');
    newPlayer.innerHTML = name + (document.getElementById('playerlist').children.length === 1 ? ' (Host)' : '');
    newPlayer.style.fontWeight = bold ? 'bold' : 'normal';
    newPlayer.style.marginBottom = '10px';
    document.getElementById('playerlist').appendChild(newPlayer);
    if (host) {
        removeKickButtons();
        generateKickButtons();
    }
}

function generateKickButtons() {
    for (let i = 2; i < document.getElementById('playerlist').children.length; i++) {
        let kickButton = document.createElement('button');
        kickButton.innerHTML = 'Kick Player';
        kickButton.style.marginLeft = '5px';
        kickButton.onclick = function() {
            ws.send(JSON.stringify({type: 'kickPlayer', indexToKick: i - 2, roomID: currentRoomID})); // index includes all players except host
        }
        document.getElementById('playerlist').children[i].appendChild(kickButton);
    }
}

function removeKickButtons() {
    for (let i = 2; i < document.getElementById('playerlist').children.length; i++) {
        document.getElementById('playerlist').children[i].children[0]?.remove();
       
    }
}

// function addKickButton(parent, ws, index) { 
//     let kickButton = document.createElement('button');
//     kickButton.innerHTML = 'Kick Player';
//     kickButton.style.marginLeft = '5px';
//     kickButton.onclick = function() { // TODO: Flawed; if kick top person, other indexes don't change
        // TODO: Every time someone is kicked or someone leaves, regenerate all the kick buttons
        
//         console.log(kickButton.parentNode.parentNode.children.length);
//         console.log('index is: ', index);
//         ws.send(JSON.stringify({type: 'kickPlayer', indexToKick: index, roomID: currentRoomID}));
//     }
//     parent.appendChild(kickButton);
// }

function connect() {
    return new Promise(function(resolve, reject) {
        var ws = new WebSocket('wss://localhost:8080');
        document.getElementById('connectionfailed').style.display = "none";
        document.getElementById('loader').style.display = "inline";
        document.getElementById('waitingforserver').style.display = "inline";
        document.body.style.backgroundColor = "#645a5a";
        ws.onopen = function() {
            document.getElementById('loader').style.display = "none";
            document.getElementById('waitingforserver').style.display = "none";
            resolve(ws);
        };
        ws.onerror = function(err) {
            document.body.style.backgroundColor = "#CCCCCC";
            document.getElementById('loader').style.display = "none";
            document.getElementById('waitingforserver').style.display = "none";
            document.getElementById('connectionfailed').style.display = "inline";
            reject(err);
        };
    });
}

document.getElementById('tryconnectagain').onclick = function() {
    queue(playerName);
}

// TODO: run start() once a "start game" button is pressed

// TODO: UID only needs to be known server-side, must send websocket with every message (this is the identifying factor)