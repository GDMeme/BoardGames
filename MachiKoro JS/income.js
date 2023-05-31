import { enableShop } from './shop.js'

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

function exchangeCoins(player, targetPlayer, amount) { // returns the amount of coins exchanged
    if (targetPlayer.balance >= amount) {
        targetPlayer.balance -= amount;
        player.balance += amount;
        return amount;
    } else {
        let temp = targetPlayer.balance;
        player.balance += targetPlayer.balance;
        targetPlayer.balance = 0;
        return temp;
    }
}

function updateBalances(players) {
    let counter = 1;
    for (const player of players) {
        document.querySelector(`#balance${counter}`).innerHTML = `<font size="5">Balance: ${player.balance}</font>`; // update player balances
        counter++;
    }
}

export function income(roll, players, playerCounter, buildings) {
    if (roll === 3 || roll === 10) {
        redActivate(players, playerCounter, roll === 3);
    } else if (roll === 6) {
        let currentPlayer = players[playerCounter];
        if (currentPlayer.establishments[6]) { 
            // TODO: text that money was taken
            let currentIndex = 0;
            for (const player of players) {
                if (currentIndex !== playerCounter) {  
                    exchangeCoins(currentPlayer, player, 2);
                }
                currentIndex++;
            }
            updateBalances(players);
        }
        if (currentPlayer.establishments[7]) {
            document.getElementById('tvplayertextbuttons').style.display = "inline";
            document.querySelector('#tvplayertext').innerHTML = "Who would you like to take 5 coins from?";
            document.getElementById('endturnbutton').disabled = true;
            document.getElementById(`tvplayer${playerCounter + 1}button`).disabled = true; // disable taking 5 coins from yourself

            for (let i = 1; i <= players.length; i++) {     
                document.getElementById(`tvplayer${i}button`).onclick = function() {
                    
                    // TODO: make sure that text that money was exchanged works
                    let numberOfCoins = exchangeCoins(currentPlayer, players[i - 1], 5); // since i is not 0 indexed
                    document.querySelector('#tvplayertext').innerHTML = `Player ${playerCounter + 1} received ${numberOfCoins} coins. Player ${i} lost ${numberOfCoins} coins.`;
                    updateBalances(players);

                    document.getElementById('endturnbutton').disabled = false;
                    document.getElementById('tvplayertextbuttons').style.display = "none";
                }
            }
            document.getElementById(`tvplayer${playerCounter + 1}button`).disabled = false; // enable the button that you disabled (taking 5 coins from yourself)
        }
        if (currentPlayer.establishments[8]) {
            const buttonIDs = buildings.map(building => building.name);
            const displayNames = buildings.map(building => building.displayName);

            document.getElementById('businesstextbuttons').style.display = "inline";

            document.getElementById('endturnbutton').disabled = true;
            document.getElementById(`businessplayer${playerCounter + 1}button`).disabled = true; // disable trading with yourself
        
            document.getElementById('businessplayerbuttons').style.display = "inline";
            document.getElementById('businesstext1').style.display = "inline";
            let targetPlayer;
            let targetPlayerIndex;
            for (let i = 1; i <= players.length; i++) {
                document.getElementById(`businessplayer${i}button`).onclick = function() {
                    targetPlayer = players[i - 1];
                    targetPlayerIndex = i - 1; //* * targetPlayerIndex is 0 indexed

                    document.getElementById('businesstext1').style.display = "none";
                    document.getElementById('businesstext2').style.display = "inline";
                    document.getElementById('businessplayerbuttons').style.display = "none";

                    document.getElementById('receiveindex').style.display = "inline";
                }
            }
            
            let receiveIndex;
            let giveIndex;

            for (let i = 0; i < 15; i++) {
                document.getElementById(`receive${buttonIDs[i]}button`).onclick = function() {
                    receiveIndex = i;

                    document.getElementById('businesstext2').style.display = "none";
                    document.getElementById('businesstext3').style.display = "inline";
                    document.getElementById('receiveindex').style.display = "none";
                    document.getElementById('giveindex').style.display = "inline";
                }
            }

            for (let i = 0; i < 15; i++) {
                document.getElementById(`give${buttonIDs[i]}button`).onclick = function() {
                    giveIndex = i;

                    currentPlayer.establishments[giveIndex]--; // giving away
                    document.querySelector(`#${buttonIDs[giveIndex]}${playerCounter + 1}`).innerHTML = `${displayNames[giveIndex]}: ${currentPlayer.establishments[giveIndex]}`;
                    targetPlayer.establishments[giveIndex]++;
                    document.querySelector(`#${buttonIDs[giveIndex]}${targetPlayerIndex + 1}`).innerHTML = `${displayNames[giveIndex]}: ${targetPlayer.establishments[giveIndex]}`;
                    
                    currentPlayer.establishments[receiveIndex]++; // receiving
                    document.querySelector(`#${buttonIDs[receiveIndex]}${playerCounter + 1}`).innerHTML = `${displayNames[receiveIndex]}: ${currentPlayer.establishments[receiveIndex]}`;
                    targetPlayer.establishments[receiveIndex]--;
                    document.querySelector(`#${buttonIDs[receiveIndex]}${targetPlayerIndex + 1}`).innerHTML = `${displayNames[receiveIndex]}: ${targetPlayer.establishments[receiveIndex]}`;

                    document.getElementById('businesstext3').style.display = "none";

                    document.getElementById('giveindex').style.display = "none";

                    // enable shop buttons
                    document.getElementById('buysomething').style.display = "inline";
                    enableShop(currentPlayer, buildings);
                }
            }
            document.getElementById(`businessplayer${playerCounter + 1}button`).disabled = false; // enable the button that you disabled (trading with yourself)
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