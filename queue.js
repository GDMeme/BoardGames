import { startGameLayout } from './startgamelayout.js';
import { playerTurnLayout } from './playerturnlayout.js';
import { enableShop } from './shop.js';
import { end } from './end.js';

import * as C from './constants.js';

let currentRoomID = -1;
let host = false;
let playerName; // need this in case they have to reconnect
let ws;
let numberOfPlayers;

const displayNames = C.buildings.map(building => building.displayName);
const buttonIDs = C.buildings.map(building => building.name);

// TODO: Show when someone is typing?

// TODO: Ability to ban players from your room if you are the host (They can't join back)

// TODO: password protected room (can change password too)

// TODO: Ability to change player name (until the game starts)
// https://www.w3schools.com/icons/tryit.asp?filename=tryicons_fa-edit
// https://stackoverflow.com/questions/12945825/adding-an-onclick-event-to-a-div-element
// TODO: Account for start game while someone is changing their name (only client side)

// TODO: Ability to change room name (until the game starts)

// TODO: Have an action history of what happened in the bottom left or something

// TODO: Do something if player disconnects while in middle of a game


// * * GAMEPLAY STUFF
// TODO: Make sure UI recognizes that you are not able to buy something while TV Station is activated

// TODO: When business center activates, should be able to go back and change who you want to trade with / what you want to receive

// TODO: x at the top right of the chat to close it

// TODO: income summary text spacing is not right

// TODO: income summary shows 'player 1' instead of the actual player's name

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
                ws.send(JSON.stringify({type: 'message', roomID: currentRoomID, message: document.getElementById('sendmessage').value}));
                document.getElementById('sendmessage').value = "";
            }
        });

        document.getElementById('startgamebutton').onclick = function() {
            ws.send(JSON.stringify({type: 'startGame', roomID: currentRoomID}));
        }

        document.getElementById('endturnbutton').onclick = function() {
            ws.send(JSON.stringify({type: 'endTurn', roomID: currentRoomID}));
        }

        // * * Set up buy establishment/landmark buttons
        for (let i = 0; i < buttonIDs.length; i++) {
            const id = buttonIDs[i];
            document.getElementById(`buy${id}button`).onclick = function() {
                ws.send(JSON.stringify({type: 'buySomething', roomID: currentRoomID, shopIndex: i}));
            }
        }

        // * * Set up TV Station player-buttons
        for (let i = 1; i <= 4; i++) {     
            document.getElementById(`tvplayer${i}button`).onclick = function() {
                ws.send(JSON.stringify({type: 'TVActivate', roomID: currentRoomID, targetIndex: i}));
            }
        }

        // * * Set up Business Center player-buttons
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`businessplayer${i}button`).onclick = function() {
                ws.send(JSON.stringify({type: 'businessActivate', roomID: currentRoomID, targetIndex: i}));
            }
        }

        // * * Set up Business Center receive establishment buttons
        for (let i = 0; i < 15; i++) {
            if (i !== 6 && i !== 7 && i !== 8) { // cannot trade purple establishments
                document.getElementById(`receive${buttonIDs[i]}button`).onclick = function() {
                    document.querySelectorAll('.receiveEstablishment').disabled = false;
                    
                    ws.send(JSON.stringify({type: 'businessReceiveIndex', roomID: currentRoomID, receiveIndex: i}));
                }
            }
        }

        // * * Set up Business Center give establishment buttons
        for (let i = 0; i < 15; i++) {
            if (i !== 6 && i !== 7 && i !== 8) { // cannot trade purple establishments
                document.getElementById(`give${buttonIDs[i]}button`).onclick = function() {
                    document.querySelectorAll('.giveEstablishment').disabled = false;

                    ws.send(JSON.stringify({type: 'businessGiveIndex', roomID: currentRoomID, giveIndex: i}));
                }
            }
        }

        // * * Set up save game button 
        document.getElementById('savegamebutton').onclick = function() {
            ws.send(JSON.stringify({type: 'requestSave', roomID: currentRoomID}));
        }

        // * * Set up reroll button
        document.getElementById('rerollbutton').onclick = function () {
            ws.send(JSON.stringify({type: 'rerollDice', roomID: currentRoomID, rollTwoDice: document.getElementById('roll2dicecheckbox').checked}));

            // TODO: Put this stuff when you receive the message back that the reroll was valid
            document.getElementById('rerollbutton').disabled = true;
            document.getElementById('rolldoubles').style.display = "none";
    
            // subtract the income they got from the original roll

            updateBalances(game.players);
    
            game.playerCounter = endTurn(game, true); // true means player rerolled
            playerTurnLayout(game, false);
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

                        document.querySelector('#roomnamelabel').innerHTML = `Room Name: ${roomName}`;
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
                if (host) { // this is fine because the server verifies if they are the host before kicking
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
                numberOfPlayers = document.getElementById('playerlist').children.length - 1;
                for (let i = 0; i < numberOfPlayers; i++) {
                    document.getElementById(`player${i + 1}text`).innerHTML = `<u>${message.playerNames[i]}</u>`;
                }
                startGameLayout(numberOfPlayers, ws, currentRoomID);
                document.getElementById('beforestartgame').style.display = "none";
                document.getElementById('playerturntext').style.display = "block";
                if (message.startingPlayer) {
                    // * * Only the host can save game
                    document.getElementById('savegame').style.display = "block";

                    playerTurnLayout(false, ws, currentRoomID); // TODO: If they loaded a game, this might not always be false
                }
            } else if (message.type === 'kickedPlayer') {
                document.getElementById('goback').click();
            } else if (message.type === 'kickMessage') {
                sendMessage(`${message.kicked ? 'You were' : `${message.kickedName} was`} kicked from the room!`);
            } else if (message.type === 'endedTurn') {
                document.querySelector('#playerturntext').innerHTML = `${message.nextPlayerName}'s turn!`; // since playerCounter is 0 indexed
                for (let i = 0; i < numberOfPlayers; i++) {
                    document.getElementById(`stadiumtext${i + 1}`).style.display = "none";
                    document.getElementById(`redincome${i + 1}`).style.display = "none";
                    document.getElementById(`greenblueincome${i + 1}`).style.display = "none";
                }
                document.getElementById('tvplayertextbuttons').style.display = "none";
                document.getElementById('businesstext').style.display = "none";
                document.getElementById('incomesummary').style.display = "none";
                console.log('message.yourturn', message.yourTurn);
                if (message.yourTurn) {
                    document.getElementById('endturn').style.display = "none";
                    document.getElementById('endturn').disabled = true;
                    document.getElementById('rolldicetext').style.display = "none";
                    document.getElementById('rolldicebutton').disabled = false;
                    document.getElementById('endturnbutton').disabled = true;
                    document.getElementById('rollnumber').style.display = "none";
                    document.getElementById('roll2dicecheckbox').checked = false;
                    document.getElementById('buysomething').style.display = "none";
                    document.getElementById('rolldoubles').style.display = "none";
                    document.getElementById('roll2dicecheckbox').style.display = "inline";
                }
            } else if (message.type === 'yourTurn') {
                playerTurnLayout(message.rollTwoDice, ws, currentRoomID);
            } else if (message.type === 'rolledDice') {
                document.querySelector('#rollnumber').innerHTML = `<u> ${message.yourTurn ? 'You' : message.playerCounter + 1} rolled a ${message.roll} </u>`;
                if (message.yourTurn) {
                    document.getElementById('endturnbutton').disabled = false; // enable the end turn button
        
                    document.getElementById('roll2dicecheckbox').disabled = !(message.trainStation && message.ableToReroll); // able to roll two dice if rerolling, radio tower and train station
                    document.getElementById('rerollbutton').disabled = !message.ableToReroll;
                }
            } else if (message.type === 'boughtEstablishment') {
                const { name, displayName } = C.buildings[message.shopIndex];
                document.querySelector(`#${name}${message.playerCounter + 1}`).innerHTML = `${displayName}: ${message.quantity}`;
                console.log('newbalance', message.newBalance);
                document.querySelector(`#balance${message.playerCounter + 1}`).innerHTML = `<font size="5">Balance: ${message.newBalance}</font>`;
            } else if (message.type === 'boughtLandmark') {
                const { name, displayName } = C.buildings[message.shopIndex];
                document.querySelector(`#${name}${message.playerCounter + 1}`).innerHTML = `${displayName}: Unlocked`;
                document.querySelector(`#balance${message.playerCounter + 1}`).innerHTML = `<font size="5">Balance: ${message.newBalance}</font>`;
            } else if (message.type === 'showStadiumText') {
                document.getElementById(`stadiumtext${message.index}`).style.display = "block";
                document.querySelector(`#stadiumtext${message.index}`).innerHTML = `${message.giverName} gave ${message.amount} coins to Player ${message.receiverName}.`;
            } else if (message.type === 'stadiumTotal') {
                document.getElementById(`stadiumtext${message.index}`).style.display = "inline";
                document.querySelector(`#stadiumtext${message.index}`).innerHTML = `Player ${message.receiverName} received ${message.amount} coins from Stadium.`;
            } else if (message.type === 'showTVText') { 
                document.getElementById('tvplayertextbuttons').style.display = "inline";
                document.getElementById('tvplayerbuttons').style.display = "inline";
                document.querySelector('#tvplayertext').innerHTML = "<u>Who would you like to take 5 coins from?</u>";
                document.getElementById('endturnbutton').disabled = true;
                document.getElementById(`tvplayer${message.playerCounter + 1}button`).disabled = true; // disable taking 5 coins from yourself
            } else if (message.type === 'showFinishedTVText') {
                if (yourTurn) {
                    document.getElementById('endturnbutton').disabled = false;
                    document.getElementById('tvplayerbuttons').style.display = "none";
                    document.getElementById(`tvplayer${game.playerCounter + 1}button`).disabled = false; // enable the button that you disabled (taking 5 coins from yourself)
                    document.getElementById('rerollbutton').disabled = true; // disable rerolling after stealing 5 coins (verified on server)
                }
                document.getElementById('incomesummary').style.display = "inline";
                document.querySelector('#tvplayertext').innerHTML = `<div>${message.receiverName} received ${message.amount} coins.</div> <div>Player ${message.giverName} lost ${message.amount} coins.</div>`;
                updateBalances(message.playerBalances);
            } else if (message.type === 'showBusinessText') {
                document.getElementById('endturnbutton').disabled = true;
                document.getElementById(`businessplayer${message.playerCounter + 1}button`).disabled = true; // disable trading with yourself
            
                document.getElementById('businessplayerbuttons').style.display = "inline";
                document.getElementById('businesstext1').style.display = "inline";
            } else if (message.type === 'disableBusinessReceiveButtons') {
                document.getElementById('businesstext1').style.display = "none";
                document.getElementById('businesstext2').style.display = "inline";
                document.getElementById('businessplayerbuttons').style.display = "none";

                document.getElementById('receiveindex').style.display = "inline";

                document.getElementById('rerollbutton').disabled = true; // disable rerolling after choosing a player to trade with
                
                // * * Disable receive establishment buttons that the other player does not have
                for (let i = 0; i < 15; i++) {
                    if (i !== 6 && i !== 7 && i !== 8) {
                        document.getElementById(`receive${displayNames[i]}button`).disabled = message.disableArray[i];
                    }
                }
            } else if (message.type === 'disableBusinessGiveButtons') {
                document.getElementById('businesstext2').style.display = "none";
                document.getElementById('businesstext3').style.display = "inline";
                document.getElementById('receiveindex').style.display = "none";
                document.getElementById('giveindex').style.display = "inline";

                // * * Disable give establishment buttons that you do not have
                for (let i = 0; i < 15; i++) {
                    if (i !== 6 && i !== 7 && i !== 8) {
                        document.getElementById(`give${displayNames[i]}button`).disabled = message.disableArray[i];
                    }
                }
            } else if (message.type === 'updateEstablishments') {
                // * * The "receive" establishment    
                document.querySelector(`#${displayNames[message.receiveIndex]}${message.givePlayerIndex + 1}`).innerHTML = `${displayNames[message.receiveIndex]}: ${message.receiveGiveAmount}`;
                document.querySelector(`#${displayNames[message.receiveIndex]}${message.receivePlayerIndex + 1}`).innerHTML = `${displayNames[message.receiveIndex]}: ${message.receiveReceiveAmount}`;
                
                // * * The "give" establishment
                document.querySelector(`#${displayNames[message.giveIndex]}${message.givePlayerIndex + 1}`).innerHTML = `${displayNames[message.giveIndex]}: ${message.giveGiveAmount}`;
                document.querySelector(`#${displayNames[message.giveIndex]}${message.receivePlayerIndex + 1}`).innerHTML = `${displayNames[message.giveIndex]}: ${message.giveReceiveAmount}`;
                
                if (message.yourTurn) {
                    document.getElementById('businesstext3').style.display = "none";

                    document.getElementById('giveindex').style.display = "none";

                    // * * Enable shop buttons
                    document.getElementById('buysomething').style.display = "inline";
                    enableShop(message.players, message.playerCounter);

                    document.getElementById(`businessplayer${game.playerCounter + 1}button`).disabled = false; // enable the button that you disabled (trading with yourself)

                    // text for what establishments were traded
                    document.getElementById('businesstext').style.display = "inline";
                    document.querySelector('#businesstext4').innerHTML = `Player ${game.playerCounter + 1} received ${displayNames[receiveIndex]} and lost ${displayNames[giveIndex]}.`;
                    document.querySelector('#businesstext5').innerHTML = `Player ${targetPlayerIndex + 1} lost ${displayNames[receiveIndex]} and received ${displayNames[giveIndex]}.`;

                    document.getElementById('endturnbutton').disabled = false;
                }
            } else if (message.type === 'updateBalance') {
                document.querySelector(`#balance${message.playerIndex + 1}`).innerHTML = `<font size="5">Balance: ${message.newBalance}</font>`;
            } else if (message.type === 'showRedIncome') {
                for (let i = 0; i < numberOfPlayers; i++) {
                    document.getElementById(`redincome${i + 1}`).style.display = message.redIncome[i] === 0 ? "none" : "flex";
                    document.querySelector(`#redincome${i + 1}`).innerHTML = `Player ${i + 1} ${message.redIncome[i] > 0 ? 'received' : 'lost'} ${message.redIncome[i] > 0 ? message.redIncome[i] : -message.redIncome[i]} ${(message.redIncome[i] > 1 || message.redIncome[i] < -1) ? 'coins' : 'coin'} from red establishments.`;
                }
            } else if (message.type === 'showGreenBlueIncome') {      
                for (let i = 0; i < numberOfPlayers; i++) {
                    document.getElementById(`greenblueincome${i + 1}`).style.display = message.greenBlueIncome[i] === 0 ? "none" : "flex";
                    document.querySelector(`#greenblueincome${i + 1}`).innerHTML = `Player ${i + 1} received ${message.greenBlueIncome[i]} ${(message.greenBlueIncome[i] > 1 || message.greenBlueIncome[i] < -1) ? 'coins' : 'coin'} from green/blue establishments.`;
                }
            } else if (message.type === 'incomeReceived') {
                if (!message.income.every(income => income === 0)) {
                    document.getElementById('incomesummary').style.display = "inline";
                }
        
                // Buy establishment/landmark
                // * * Must trade before buying an establishment/landmark
                if (message.yourTurn) {
                    if (!message.businessActivated) {
                        document.getElementById('buysomething').style.display = "inline";
                        enableShop(message.players, message.playerCounter);
                    }
                }
            } else if (message.type === 'endGame') {
                document.getElementById('entiregame').style.display = "none";

                // TODO: Make the end screen
                end(message.winnerIndex);
            } else if (message.type === 'boughtSomething') {
                // disable all shop buttons after buying something
                document.querySelectorAll('.shop').forEach(button => button.disabled = true);

                // disable the reroll button
                document.getElementById('rerollbutton').disabled = true;

                // disable the roll 2 dice checkbox
                document.getElementById('roll2dicecheckbox').disabled = true;
            } else if (message.type === 'saveGame') {
                document.getElementById('savegametext').style.display = "inline";
                document.querySelector('#temporarysavegametext').innerHTML = JSON.stringify(message.game);
                document.getElementById('savegamebutton').disabled = true; // disable the save button
            } else if (message.type === 'enableSaveGame') {
                // Enable the save game button
                document.getElementById('savegamebutton').disabled = false;
            } else if (message.type === 'disableSaveGame') {
                // Disable the save game button
                // TODO: Only the host should be able to see this button, and they should always be able to see it (disabled or not)
                document.getElementById('savegamebutton').disabled = true;
            } else if (message.type === 'updateBalances') {
                updateBalances(message.newBalances);
            }
        });

    }).catch(function(err) {
        console.error(err);
    });
};

function addNewPlayer(name, bold) {
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

function sendMessage(message) {
    document.querySelector('#chathistory').innerHTML += `${document.getElementById('chathistory').value === '' ? '' : '\n'}${message}`;
    document.getElementById('chathistory').scrollTop = document.getElementById('chathistory').scrollHeight;
}

function updateBalances(playerBalances) {
    for (let i = 0; i < numberOfPlayers; i++) {
        document.querySelector(`#balance${i + 1}`).innerHTML = `<font size="5">Balance: ${playerBalances[i]}</font>`;
    }
}

function connect() {
    return new Promise(function(resolve, reject) {
        var ws = new WebSocket('wss://8.tcp.ngrok.io:16216');
        document.getElementById('connectionfailed').style.display = "none";
        document.getElementById('loader').style.display = "inline";
        document.getElementById('waitingforserver').style.display = "block";
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