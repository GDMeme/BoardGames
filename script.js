import { start } from './start.js';

document.getElementById('numberofplayersselect').onchange = function() {
    document.getElementById('submitplayersbutton').disabled = false;
}

let numberOfPlayers;
let playerNames = Array(numberOfPlayers);

// this is the whole game
document.getElementById('submitplayersbutton').onclick = function() {
    numberOfPlayers = parseInt(document.getElementById('numberofplayersselect').value);
    document.getElementById(`tvplayer3button`).style.display = numberOfPlayers >= 3 ? "inline" : "none";
    document.getElementById(`tvplayer4button`).style.display = numberOfPlayers === 4 ? "inline" : "none";

    document.getElementById(`businessplayer3button`).style.display = numberOfPlayers >= 3 ? "inline" : "none";
    document.getElementById(`businessplayer4button`).style.display = numberOfPlayers === 4 ? "inline" : "none";
    
    // getting player names
    document.getElementById('beforegametext').style.display = "none";
    document.getElementById('playernametext').style.display = "inline";
    
    document.getElementById(`player3name`).style.display = numberOfPlayers >= 3 ? "inline" : "none";
    document.getElementById(`player4name`).style.display = numberOfPlayers === 4 ? "inline" : "none";

    document.getElementById('submitplayernamesbutton').style.display = "inline";
}

for (let i = 0; i < 3; i++) {
    document.getElementById(`player${i + 2}nameinput`).addEventListener("keypress", function(event) {
        if (event.key === "Enter" && i + 2 === numberOfPlayers) {
            event.preventDefault();
            document.getElementById('submitplayernamesbutton').click();
        }
    })
}

document.getElementById('submitplayernamesbutton').onclick = function() {
    // processing player names
    for (let i = 0; i < numberOfPlayers; i++) {
        playerNames[i] = document.getElementById(`player${i + 1}nameinput`).value || `Player ${i + 1}`;
    }

    document.getElementById('playernametext').style.display = "none";
    start(numberOfPlayers, playerNames); // guaranteed to have a value when the button is visible
}

// loading an existing game
document.getElementById('existinggamefile').addEventListener('change', loadGame);

function loadGame(event) {
	const input = event.target;
    if (input.files[0].name.lastIndexOf(".txt") !== -1) { // file has to end in .txt
        const reader = new FileReader();
        if ('files' in input && input.files.length > 0) { // check for empty file
            let promise = new Promise(function(resolve, reject) {
                reader.onload = event => resolve(event.target.result);
                reader.onerror = error => reject(error);
                reader.readAsText(input.files[0]);
            });
            promise.then((result) => {
                try {
                    result = JSON.parse(result);
                    // make sure the object properties line up
                } catch (e) {
                    showInvalidText();
                }
                if (templateMatch(result)) {
                    document.getElementById('beforegametext').style.display = "none";
                    start(result.numberOfPlayers, result);  
                } else {
                    showInvalidText();
                }
            });
        }
    } else {
        showInvalidText();
    }
}

function templateMatch(result) {
    if (Object.keys(result).length !== 4) { // ensure there are no extra properties
        return false;
    }
    if (!Number.isInteger(result?.numberOfPlayers)) { // checks for missing numberOfPlayers
        return false;
    }
    if (result.numberOfPlayers < 2 || result.numberOfPlayers > 4) { // won't get here if numberOfPlayers doesn't exist
        return false;
    }
    if (!Array.isArray(result?.playerNames) || result.playerNames.length !== result.numberOfPlayers) { // checks playerName property
        return false;
    }
    let maxEstablishments = Array(15).fill(0); // to check each building limit
    if (Array.isArray(result?.players) && result.players.length === result.numberOfPlayers) {
        for (let i = 0; i < result.numberOfPlayers; i++) {
            if (typeof(result.players[i]) !== 'object' || !Number.isInteger(result.players[i]?.balance) || result.players[i].balance < 0) { // verify each player is an object and balance is an integer
                return false;
            }
            if (!Array.isArray(result.players[i]?.establishments) || result.players[i].establishments.length !== 15) { // verify their establishments
                return false;
            }
            for (let j = 0; j < 15; j++) { // verify individual establishments
                if (!Number.isInteger(result.players[i].establishments[j]) || result.players[i].establishments[j] < 0) { // checks for negative number of establishments
                    return false;
                }
               if (j === 6 || j === 7 || j === 8) {
                    if (result.players[i].establishments[j] > 1) { // check if more than 1 purple establishment
                        return false;
                    }
                }
               maxEstablishments[j] += result.players[i].establishments[j];
            }
            if (!Array.isArray(result.players[i]?.landmarks) || result.players[i].landmarks.length !== 4) { // verify their landmarks
                return false;
            }
            for (let j = 0; j < 4; j++) { // verify individual landmarks are booleans
                if (typeof(result.players[i].landmarks[j]) !== "boolean") {
                    return false;
                }
            }
        }
    } else {
        return false;
    }
    if (!maxEstablishments.every(numberOfBuildings => numberOfBuildings <= 6)) { // check total number of each establishment
        return false;
    }
    if (!Number.isInteger(result?.playerCounter) || (result.playerCounter < 0 || result.playerCounter >= result.numberOfPlayers)) { // verify playerCounter is within the bounds of numberOfPlayers
        return false;
    }
    return true;
}

function showInvalidText() {
    document.getElementById('invalidfiletext').style.display = "inline";
}
