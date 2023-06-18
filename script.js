import { start } from './start.js'

document.getElementById('numberofplayersselect').onchange = function() {
    document.getElementById('submitplayersbutton').disabled = false;
}

// this is the whole game
document.getElementById('submitplayersbutton').onclick = function() {
    let numberOfPlayers = parseInt(document.getElementById('numberofplayersselect').value);
    document.getElementById(`tvplayer3button`).style.display = numberOfPlayers >= 3 ? "inline" : "none";
    document.getElementById(`tvplayer4button`).style.display = numberOfPlayers === 4 ? "inline" : "none";

    document.getElementById(`businessplayer3button`).style.display = numberOfPlayers >= 3 ? "inline" : "none";
    document.getElementById(`businessplayer4button`).style.display = numberOfPlayers === 4 ? "inline" : "none";
    
    start(numberOfPlayers);
}

// loading an existing game
document.getElementById('existinggamefile').addEventListener('change', loadGame);

function loadGame(event) {
	const input = event.target;
    const reader = new FileReader();
    if ('files' in input && input.files.length > 0) { // if the file exists
	      let promise = new Promise(function(resolve, reject) {
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(input.files[0]);
        });
        promise.then((result) => {
            result = JSON.parse(result);
            // make sure the object properties line up
            if (templateMatch(result)) {
                start(result.numberOfPlayers, result);  
            } else {
                document.getElementById('invalidfiletext').style.display = "inline";
            }
        });
    }
}

function templateMatch(result) {
    if (!Number.isInteger(result?.numberOfPlayers)) { // this checks for missing numberOfPlayers
        return false;
    }
    if (result.numberOfPlayers < 2 || result.numberOfPlayers > 4) { // won't get here if numberOfPlayers doesn't exist
        return false;
    }
    let currentBuildings = Array(15).fill(0);
    if (Array.isArray(result?.players) && result.players.length === result.numberOfPlayers) {
        for (let i = 0; i < result.numberOfPlayers; i++) {
            if (typeof(result.players[i]) !== 'object' || !Number.isInteger(result.players[i]?.balance || result.players[i].balance < 0)) { // verify each player is an object and balance is an integer
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
               currentBuildings[j] += result.players[i].establishments[j];
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
    if (!currentBuildings.every(numberOfBuildings => numberOfBuildings <= 6)) { // check total number of each establishment
        return false;
    }
    if (!Number.isInteger(result?.playerCounter) || (result.playerCounter < 0 || result.playerCounter >= result.numberOfPlayers)) { // verify playerCounter is within the bounds of numberOfPlayers
        return false;
    }
    if (!result.every(key => key === 'players' || key === 'playerCounter' || key === 'numberOfPlayers')) { // check if there is an invalid key
        return false;
    }
    return true;
}