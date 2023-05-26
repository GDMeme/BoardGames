// TODO: remember to include shopping mall

// TODO: remember to add/change html stuff

function redActivate(players, playerCounter, flag) { // if flag, rolled 3
    let index = playerCounter; // * * index is 0 indexed!!
    while (players[playerCounter].balance > 0) {
        index--;
        if (index === -1) {
            index = players.length - 1;
        } 
        if (index === playerCounter) {
            break;
        }
        let numberOfRed = players[index].establishments[flag ? 3 : 10];
        let moneyOwed = flag ? (players[index].landmarks[1] ? (2 * numberOfRed) : numberOfRed) : (players[index].landmarks[1] ? (3 * numberOfRed) : (2 * numberOfRed));
        if (moneyOwed > players[playerCounter].balance) {
            moneyOwed = players[playerCounter].balance;
        }
        players[playerCounter].balance -= moneyOwed;
        players[index].balance += moneyOwed;
    }
}

function exchangeCoins(player, targetPlayer, amount) {
    if (targetPlayer.balance >= amount) {
        targetPlayer.balance -= amount;
        player.balance += amount;
    } else {
        player.balance += targetPlayer.balance;
        targetPlayer.balance = 0;
    }
}

export function income(roll, players, playerCounter, buildings) {
    if (roll === 3 || roll === 10) {
        redActivate(players, playerCounter, roll === 3);
    } else if (roll === 6) {
        if (players[playerCounter].establishments[6]) { 
            // TODO: text that money was taken
            let currentPlayer = 0;
            for (const player of players) {
                if (currentPlayer !== playerCounter) {  
                    exchangeCoins(players[playerCounter], player, 2)
                }
                currentPlayer++;
            }
        }
        if (players[playerCounter].establishments[7]) {
            document.getElementById('tvplayerbuttons').style.display = "inline";
            document.getElementById('endturnbutton').disabled = true;
            document.getElementById(`tvplayer${playerCounter + 1}button`).disabled = true; // disable taking 5 coins from yourself
            for (let i = 1; i <= players.length; i++) {     
                document.getElementById(`tvplayer${i}button`).style.display = "inline";
                document.getElementById(`tvplayer${i}button`).onclick = function() {
                    // TODO: text that money was exchanged
                    exchangeCoins(players[playerCounter], players[i - 1], 5); // since i is not 0 indexed

                    // update balances
                    let counter = 1;
                    for (const player of players) {
                        document.querySelector(`#balance${counter}`).innerHTML = `<font size="5"> Balance: ${player.balance} </font>`;
                        counter++;
                    }

                    document.getElementById('endturnbutton').disabled = false;
                    document.getElementById('tvplayerbuttons').style.display = "none";
                }
            }

        }
        if (players[playerCounter].establishments[8]) {
            // TODO: enable a button to target someone

            // TODO: enable buttons to choose what to trade
            players[playerCounter].establishments[giveIndex]--;
            targetPlayer.establishments[giveIndex]++;
            
            players[playerCounter].establishments[receiveIndex]++;
            targetPlayer.establishments[receiveIndex]--;
        }
    }
    let activated_buildings;
    let currentPlayer = 0;
    for (const player of players) {
        if (currentPlayer === playerCounter) {
            // will only return green and blue buildings
            activated_buildings = buildings.map((building, buildingIndex) => building.trigger?.includes(roll) ? buildingIndex : undefined).filter(x => x !== undefined); 
        } else {
            activated_buildings = buildings.map((building, buildingIndex) => (building.trigger?.includes(roll) && building.colour === 'blue') ? buildingIndex : undefined).filter(x => x !== undefined);
        }
        for (const buildingIndex of activated_buildings) {
            if (Array.isArray(buildings[buildingIndex].income)) { // shopping mall doesn't apply here
                let numberOfSpecial = 0;
                for (const incomeIndex of buildings[buildingIndex].income) {
                    numberOfSpecial += player.establishments[incomeIndex];
                }
                player.balance += buildings[buildingIndex].multiplier * numberOfSpecial;
            } else {
                if (buildings[buildingIndex].shopping === true && player.landmarks[1]) { // shopping mall
                    player.balance += player.establishments[buildingIndex] * (buildings[buildingIndex].income + 1);
                } else {
                    player.balance += player.establishments[buildingIndex] * buildings[buildingIndex].income;
                }
            }
        }
        document.querySelector(`#balance${currentPlayer + 1}`).innerHTML = `<font size="5">Balance: ${player.balance}</font>`;
        currentPlayer++;
    }
}