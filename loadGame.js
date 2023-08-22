export function loadGame(event) {
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
                    start(result.numberOfPlayers, result); // TODO: Shouldn't start the game right away, but pre-load the game until the host clicks 'Start'
                } else {
                    showInvalidText();
                }
            });
        }
    } else {
        showInvalidText();
    }
}

function showInvalidText() {
    document.getElementById('invalidfiletext').style.display = "inline";
}

function templateMatch(result) {// TODO: Will probably need to update this once the game actually works
    if (Object.keys(result).length !== 5) { // ensure there are no extra properties
        return false;
    }
    // * * The game ID doesn't really matter since a new one will be assigned, don't need to validate
    if (typeof(result?.name) !== 'string') {
        return false;
    }
    if (!Number.isInteger(result?.numberOfPlayers)) { // checks for missing numberOfPlayers
        return false;
    }
    if (result.numberOfPlayers < 2 || result.numberOfPlayers > 4) { // won't get here if numberOfPlayers doesn't exist
        return false;
    }
    if (!Number.isInteger(result?.playerCounter) || (result.playerCounter < 0 || result.playerCounter >= result.numberOfPlayers)) { // verify playerCounter is within the bounds of numberOfPlayers
        return false;
    }
    let maxEstablishments = Array(15).fill(0); // to check each building limit
    if (!Array.isArray(result?.players) || result.players.length !== result.numberOfPlayers) { // verify the player array
        return false;
    }
    for (let i = 0; i < result.numberOfPlayers; i++) { // still verifying the player array
        if (typeof(result.players[i]) !== 'object') {
            return false;
        } 
        if (typeof(result.players[i]?.name !== 'string')) {
            return false;
        }
        if (!Number.isInteger(result.players[i]?.balance) || result.players[i].balance < 0) { // verify each player is an object and balance is an integer
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
    if (!maxEstablishments.every(numberOfBuildings => numberOfBuildings <= 6)) { // check total number of each establishment
        return false;
    }
    return true;
}