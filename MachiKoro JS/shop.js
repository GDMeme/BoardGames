import { end } from './end.js'

export function buy(building_num, player, playerCounter, buildings) {// * * 15 16 17 18 are the landmarks
    const { name, displayName, cost } = buildings[building_num];
    player.balance -= cost;
    if (building_num < 15) { // bought an establishment
        // TODO: limit on total number of each establishment
        player.establishments[building_num]++;
        document.querySelector(`#${name}${playerCounter + 1}`).innerHTML = `${displayName}: ${player.establishments[building_num]}`;
    } else { // bought a landmark
        player.landmarks[building_num - 15] = true;
        document.querySelector(`#${name}${playerCounter + 1}`).innerHTML = `${displayName}: Unlocked`;

        // check if winner
        if (player.landmarks.every(v => v === true)) {
            document.getElementById('entiregame').style.display = "none";
            end();
        }
    }
    document.querySelector(`#balance${playerCounter + 1}`).innerHTML = `<font size="5"> Balance: ${player.balance} </font>`;

    // disable all shop buttons after buying something
    document.querySelectorAll('.shop').forEach(button => button.disabled = true);
}

export function enableShop(player) {
    document.getElementById('buywheatfieldbutton').disabled = player.balance < 1;
    document.getElementById('buyranchbutton').disabled = player.balance < 1;
    document.getElementById('buybakerybutton').disabled = player.balance < 1;
    document.getElementById('buycafebutton').disabled = player.balance < 2;
    document.getElementById('buyconveniencestorebutton').disabled = player.balance < 2;
    document.getElementById('buyforestbutton').disabled = player.balance < 3;
    document.getElementById('buystadiumbutton').disabled = player.balance < 6;
    document.getElementById('buytvstationbutton').disabled = player.balance < 7;
    document.getElementById('buybusinesscenterbutton').disabled = player.balance < 8;
    document.getElementById('buycheesefactorybutton').disabled = player.balance < 5;
    document.getElementById('buyfurniturefactorybutton').disabled = player.balance < 3;
    document.getElementById('buyminebutton').disabled = player.balance < 6;
    document.getElementById('buyfamilyrestaurantbutton').disabled = player.balance < 3;
    document.getElementById('buyappleorchardbutton').disabled = player.balance < 3;
    document.getElementById('buyfruitandvegetablemarketbutton').disabled = player.balance < 2;

    document.getElementById('buytrainstationbutton').disabled = player.balance < 4 || player.landmarks[0];
    document.getElementById('buyshoppingmallbutton').disabled = player.balance < 10 || player.landmarks[1];
    document.getElementById('buyamusementparkbutton').disabled = player.balance < 16 || player.landmarks[2];
    document.getElementById('buyradiotowerbutton').disabled = player.balance < 22 || player.landmarks[3];
}