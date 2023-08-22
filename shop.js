import { end } from './end.js';

import * as C from './constants.js';

export function buy(building_num, game) {// * * 15 16 17 18 are the landmarks
    const { name, displayName, cost } = C.buildings[building_num];
    let currentPlayer = game.players[game.playerCounter];
    currentPlayer.balance -= cost;
    if (building_num < 15) { // bought an establishment
        currentPlayer.establishments[building_num]++;
        document.querySelector(`#${name}${game.playerCounter + 1}`).innerHTML = `${displayName}: ${currentPlayer.establishments[building_num]}`;
    } else { // bought a landmark
        currentPlayer.landmarks[building_num - 15] = true;
        document.querySelector(`#${name}${game.playerCounter + 1}`).innerHTML = `${displayName}: Unlocked`;

        // check if winner
        if (currentPlayer.landmarks.every(v => v === true)) {
            document.getElementById('entiregame').style.display = "none";
            end(game.playerCounter);
        }
    }
    document.querySelector(`#balance${game.playerCounter + 1}`).innerHTML = `<font size="5">Balance: ${currentPlayer.balance}</font>`; // since playerCounter is 0 indexed

    // disable all shop buttons after buying something
    document.querySelectorAll('.shop').forEach(button => button.disabled = true);

    // disable the reroll button
    document.getElementById('rerollbutton').disabled = true;

    // disable the roll 2 dice checkbox
    document.getElementById('roll2dicecheckbox').disabled = true;
}

export function enableShop(game) {
    let currentPlayer = game.players[game.playerCounter];
    for (let i = 0; i < 15; i++) { // establishments
        const { name, cost } = C.buildings[i];
        if (i === 6 || i === 7 || i === 8) { // 6, 7, 8 are purple establishments
            document.getElementById(`buy${name}button`).disabled = currentPlayer.balance < cost || currentPlayer.establishments[i] === 1;
        } else {
            document.getElementById(`buy${name}button`).disabled = currentPlayer.balance < cost || maximumEstablishments(game.players, i);
        }
    }
    for (let i = 15; i < 19; i++) { // landmarks
        const { name, cost } = C.buildings[i];
        document.getElementById(`buy${name}button`).disabled = currentPlayer.balance < cost || currentPlayer.landmarks[i - 15];
    }
}