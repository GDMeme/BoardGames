import { end } from './end.js'

const currentBuildings = Array(15).fill(6); // 6th, 7th, and 8th indexes never get used

export function buy(building_num, player, playerCounter, buildings) {// * * 15 16 17 18 are the landmarks
    const { name, displayName, cost } = buildings[building_num];
    player.balance -= cost;
    if (building_num < 15) { // bought an establishment
        currentBuildings[building_num]--;
        player.establishments[building_num]++;
        document.querySelector(`#${name}${playerCounter + 1}`).innerHTML = `${displayName}: ${player.establishments[building_num]}`;
    } else { // bought a landmark
        player.landmarks[building_num - 15] = true;
        document.querySelector(`#${name}${playerCounter + 1}`).innerHTML = `${displayName}: Unlocked`;

        // check if winner
        if (player.landmarks.every(v => v === true)) {
            document.getElementById('entiregame').style.display = "none";
            end(playerCounter);
        }
    }
    document.querySelector(`#balance${playerCounter + 1}`).innerHTML = `<font size="5">Balance: ${player.balance}</font>`; // since playerCounter is 0 indexed

    // disable all shop buttons after buying something
    document.querySelectorAll('.shop').forEach(button => button.disabled = true);

    // disable the reroll button
    document.getElementById('rerollbutton').disabled = true;

    // disable the roll 2 dice checkbox
    document.getElementById('roll2dicecheckbox').disabled = true;
}

export function enableShop(player, buildings) {
    for (let i = 0; i < 15; i++) { // establishments
        const { name, cost } = buildings[i];
        if (i === 6 || i === 7 || i === 8) { // 6, 7, 8 are purple establishments
            document.getElementById(`buy${name}button`).disabled = player.balance < cost || player.establishments[i] === 1;
        } else {
            document.getElementById(`buy${name}button`).disabled = player.balance < cost || currentBuildings[i] === 0;
        }
    }
    for (let i = 15; i < 19; i++) { // landmarks
        const { name, cost } = buildings[i];
        document.getElementById(`buy${name}button`).disabled = player.balance < cost || player.landmarks[i - 15];
    }
}