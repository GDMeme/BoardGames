import * as C from './constants.js';

// * * Need all players for maximumEstablishments function
export function enableShop(players, playerCounter) {
    let currentPlayer = players[playerCounter];
    for (let i = 0; i < 15; i++) { // establishments
        const { name, cost } = C.buildings[i];
        if (i === 6 || i === 7 || i === 8) { // 6, 7, 8 are purple establishments
            document.getElementById(`buy${name}button`).disabled = currentPlayer.balance < cost || currentPlayer.establishments[i] === 1;
        } else {
            document.getElementById(`buy${name}button`).disabled = currentPlayer.balance < cost || maximumEstablishments(players, i);
        }
    }
    for (let i = 15; i < 19; i++) { // landmarks
        const { name, cost } = C.buildings[i];
        document.getElementById(`buy${name}button`).disabled = currentPlayer.balance < cost || currentPlayer.landmarks[i - 15];
    }
}

function maximumEstablishments(players, index) { // * * Note: This doesn't account for the purple establishments
    let sum = 0;
    for (let i = 0; i < players.length; i++) {
        sum += players[i].establishments[index];
    }
    return (index === 0 || index === 2) ? sum === 6 + players.length : sum === 6; // start with 1 wheat field and 1 bakery
}