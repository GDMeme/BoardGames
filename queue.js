let playerName;
let roomsToDelete = [];
let joined = false;
let currentRoomID = -1;
let playerList = [];

// TODO: Can't send own websocket over unless JSON.stringify but I don't think I need to send the websocket

// TODO: Show the user's name somewhere in the top left maybe

// TODO: When going back, some stuff remains

export function queue(playerName) {   
    connect().then(function(ws) {
        ws.send(JSON.stringify({type: 'first', ws: ws, name: playerName}));
        document.getElementById('loader').style.display = "none";
        document.getElementById('roombuttons').style.display = "inline";
        document.body.style.backgroundColor = "#CCCCCC";

        document.getElementById('createroombutton').onclick = function() {
            document.getElementById('roombuttons').style.display = "none";

            document.getElementById('roomname').style.display = "inline";
            document.getElementById('submitroomnamebutton').onclick = function() { // TODO: Should be able to press enter as well instead of having to click button
                    document.getElementById('openchatbutton').style.display = "inline";
                    document.getElementById('openchatbutton').click();
                    document.getElementById('roomname').style.display = "none";
                    document.getElementById('waiting').style.display = "inline";
                    document.getElementById('playerlist').style.display = "inline";
                    addNewPlayer(playerName);
                    ws.send(JSON.stringify({type: 'createRoom', roomName: document.getElementById('roomnameinput').value || `${playerName}'s Room`}));
            }

            document.getElementById('roomnameinput').addEventListener("keypress", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    document.getElementById('submitroomnamebutton').click();
                }
            });
        }

        document.getElementById('joinroombutton').onclick = function() {
            document.getElementById('roombuttons').style.display = "none";
            document.getElementById('goback').style.display = "inline";
            document.getElementById('loader').style.display = "inline";
            document.body.style.backgroundColor = '#645a5a';
            ws.send(JSON.stringify({type: 'requestRooms'})); // displays all available rooms to join

        }

        document.getElementById('goback').onclick = function() {
            document.getElementById('goback').style.display = "none";
            document.getElementById('roombuttons').style.display = "inline";
            document.getElementById('playerlist').style.display = "none";
            for (const element of playerList) {
                element.remove();
            }
            for (const element of roomsToDelete) {
                element.remove();
            }
            roomsToDelete = [];
            document.getElementById('openchatbutton').style.display = "none";
            joined = false;
            ws.send(JSON.stringify({type: 'removePlayer', roomID: currentRoomID})); // removes player from the room (if they are in one)
            currentRoomID = -1;
        }
        
        document.getElementById('sendmessage').addEventListener("keypress", function(event) {
            if (event.key === "Enter" && document.getElementById('sendmessage').value) {
                event.preventDefault();
                // this is where the message is sent
                ws.send(JSON.stringify({type: 'message', roomID: currentRoomID, message: document.getElementById('sendmessage').value, name: playerName}));
                document.getElementById('sendmessage').value = "";
            }
        });

        // Listen for messages
        ws.addEventListener("message", (message) => {
            message = JSON.parse(message.data); // don't need try/catch because server is sending the message (guaranteed to be valid)
            if (message.type === 'niceTry') {
                document.getElementById('nicetry').style.display = "inline";
                document.getElementById('entiregame').style.display = "none";
                setTimeout(() => {
                    document.getElementById('nicetry').style.display = "none";
                    document.getElementById('entiregame').style.display = "inline";
                }, 1000);
            } else if (message.type === "playerJoined") {
                document.getElementById('waiting').style.display = "none";
                document.getElementById('playerlist').style.display = "inline";
                addNewPlayer(message.newName);
                document.querySelector('#chathistory').innerHTML += `${message.newName} joined your room!\n`; // TODO: If textarea is empty, don't put the newline
                // TODO: have a player list displayed somewhere on the screen
            } else if (message.type === "message") {
                document.querySelector('#chathistory').innerHTML += `${message.name}: ${message.message}\n`;
            } else if (message.type === 'sendRooms') {
                document.getElementById('loader').style.display = "none";
                document.body.style.backgroundColor = '#CCCCCC';
                if (!joined) {
                    document.getElementById('availableroomstext').style.display = "inline";
                    for (const room of message.rooms) {
                        let roomButton = document.createElement("BUTTON");
                        // TODO: On button hover, show who is in that room
                        roomButton.innerHTML = room[1];
                        document.getElementById('availablerooms').appendChild(roomButton);
                        roomButton.onclick = function() {
                            currentRoomID = room[0];
                            ws.send(JSON.stringify({type: 'joinedRoom', roomID: currentRoomID, name: playerName})); // notify other people that you joined
                            for (const element of roomsToDelete) {
                                element.remove();
                            }
                            document.getElementById('openchatbutton').style.display = "inline";
                            document.getElementById('openchatbutton').click();
                            document.getElementById('availableroomstext').style.display = "none";
                            document.getElementById('playerlist').style.display = "inline";
                            joined = true; // TODO: When leaving a room, turn "joined" to false
                        }
                        roomsToDelete.push(roomButton);
                    }
                    setTimeout(() => {
                        for (const element of roomsToDelete) {
                            element.remove();
                        }
                        roomsToDelete = [];
                        ws.send(JSON.stringify({type: 'requestRooms'}));
                    }, 5000);
                }
            } else if (message.type === 'ID') {
                currentRoomID = message.ID;
            } else if (message.type === 'addPlayer') {
                addNewPlayer(message.name);
            }
        });

    }).catch(function(err) {
        console.error(err);
    });
};

function addNewPlayer(name) {
    let newPlayer = document.createElement('li');
    newPlayer.innerHTML = name;
    playerList.push(newPlayer);
    document.getElementById('playerlist').appendChild(newPlayer);
}

function connect() {
    return new Promise(function(resolve, reject) {
        var ws = new WebSocket('wss://localhost:8080'); // TODO: change back to wss later
        ws.onopen = function() {
            // console.log("Established websocket connection!")
            document.getElementById('loader').style.display = "inline";
            document.body.style.backgroundColor = "#645a5a";
            resolve(ws);
        };
        ws.onerror = function(err) {
            reject(err);
        };
    });
}

// TODO: run start() once a "start game" button is pressed

// TODO: UID only needs to be known server-side, must send websocket with every message (this is the identifying factor)