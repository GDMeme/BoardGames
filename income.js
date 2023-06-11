import { enableShop } from './shop.js'

function redActivate(players, playerCounter, flag, redIncome) { // if flag, rolled 3
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

        // don't even try to understand this line but it works
        let moneyOwed = flag ? (players[index].landmarks[1] ? (2 * numberOfRed) : numberOfRed) : (players[index].landmarks[1] ? (3 * numberOfRed) : (2 * numberOfRed));
        let moneyExchanged = exchangeCoins(players[index], players[playerCounter], moneyOwed);
        redIncome[index] += moneyExchanged;
        redIncome[playerCounter] -= moneyExchanged;
    }
    return redIncome;
}

function exchangeCoins(player, targetPlayer, amount) { // returns the positive amount of coins exchanged
    // "player" receives the money
    // accounts for balance not being able to go negative
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

export function updateBalances(players) {
    for (let i = 0; i < players.length; i++) {
        document.querySelector(`#balance${i + 1}`).innerHTML = `<font size="5">Balance: ${players[i].balance}</font>`;
    }
}

export function income(roll, players, playerCounter, buildings) {
    let redIncome = Array(players.length).fill(0);
    let greenBlueIncome = Array(players.length).fill(0);
    let purpleIncome = Array(players.length).fill(0);
    if (roll === 3 || roll === 10) {
        redIncome = redActivate(players, playerCounter, roll === 3, redIncome);
    } else if (roll === 6) { // shouldn't make a difference if purple goes before green/blue
        let currentPlayer = players[playerCounter];
        if (currentPlayer.establishments[6]) { 
            document.getElementById('stadiumbreak').style.display = "inline";

            for (let i = 0; i < players.length; i++) {
                if (i !== playerCounter) {  
                    purpleIncome[i] = exchangeCoins(currentPlayer, players[i], 2);
                    document.getElementById(`stadiumtext${i + 1}`).style.display = "inline";
                    document.querySelector(`#stadiumtext${i + 1}`).innerHTML = `<div>Player ${i + 1} gave ${purpleIncome[i]} coins to Player ${playerCounter + 1}.</div>`;
                }
            }
            purpleIncome[playerCounter] = purpleIncome.reduce((total, item) => total + item);

            document.getElementById(`stadiumtext${playerCounter + 1}`).style.display = "inline";
            document.querySelector(`#stadiumtext${playerCounter + 1}`).innerHTML = `<div>Player ${playerCounter + 1} received ${purpleIncome[playerCounter]} coins from Stadium.</div>`;
        }
        if (currentPlayer.establishments[7]) {
            document.getElementById('tvstationbreak').style.display = "inline";

            document.getElementById('tvplayertextbuttons').style.display = "inline";
            document.getElementById('tvplayerbuttons').style.display = "inline";
            document.querySelector('#tvplayertext').innerHTML = "Who would you like to take 5 coins from?";
            document.getElementById('endturnbutton').disabled = true;
            document.getElementById(`tvplayer${playerCounter + 1}button`).disabled = true; // disable taking 5 coins from yourself

            for (let i = 1; i <= players.length; i++) {     
                document.getElementById(`tvplayer${i}button`).onclick = function() {
                    let numberOfCoins = exchangeCoins(currentPlayer, players[i - 1], 5); // since i is not 0 indexed
                    document.querySelector('#tvplayertext').innerHTML = `<div>Player ${playerCounter + 1} received ${numberOfCoins} coins.</div> <div>Player ${i} lost ${numberOfCoins} coins.</div>`;
                    updateBalances(players);
                    purpleIncome[playerCounter] += numberOfCoins;
                    purpleIncome[i - 1] -= numberOfCoins; // since i is not 0 indexed

                    document.getElementById('endturnbutton').disabled = false;
                    document.getElementById('tvplayerbuttons').style.display = "none";
                    document.getElementById(`tvplayer${playerCounter + 1}button`).disabled = false; // enable the button that you disabled (taking 5 coins from yourself)

                    document.getElementById('incomesummary').style.display = "inline";
                    document.getElementById('rerollbutton').disabled = true; // disable rerolling after stealing 5 coins
                }
            }

        }
        if (currentPlayer.establishments[8]) {
            document.getElementById('businessbreak').style.display = "inline";

            const buttonIDs = buildings.map(building => building.name);
            const displayNames = buildings.map(building => building.displayName);

            document.getElementById('endturnbutton').disabled = true;
            document.getElementById(`businessplayer${playerCounter + 1}button`).disabled = true; // disable trading with yourself
        
            document.getElementById('businessplayerbuttons').style.display = "inline";
            document.getElementById('businesstext1').style.display = "inline";
            let targetPlayer = players[0]; // temporary value in order for button to work as intended
            let targetPlayerIndex;
            for (let i = 1; i <= players.length; i++) {
                document.getElementById(`businessplayer${i}button`).onclick = function() {
                    targetPlayer = players[i - 1];
                    targetPlayerIndex = i - 1; //* * targetPlayerIndex is 0 indexed

                    document.getElementById('businesstext1').style.display = "none";
                    document.getElementById('businesstext2').style.display = "inline";
                    document.getElementById('businessplayerbuttons').style.display = "none";

                    document.getElementById('receiveindex').style.display = "inline";

                    document.getElementById('rerollbutton').disabled = true; // disable rerolling after choosing a player to trade with
                }
            }
            
            let receiveIndex;
            let giveIndex;

            for (let i = 0; i < 15; i++) {
                if (i !== 6 && i !== 7 && i !== 8) { // cannot trade purple establishments
                    document.getElementById(`receive${buttonIDs[i]}button`).disabled = targetPlayer.establishments[i] === 0;
                    document.getElementById(`receive${buttonIDs[i]}button`).onclick = function() {
                        receiveIndex = i;

                        document.getElementById('businesstext2').style.display = "none";
                        document.getElementById('businesstext3').style.display = "inline";
                        document.getElementById('receiveindex').style.display = "none";
                        document.getElementById('giveindex').style.display = "inline";
                    }
                }
            }

            for (let i = 0; i < 15; i++) {

                if (i !== 6 && i !== 7 && i !== 8) { // cannot trade purple establishments
                    document.getElementById(`give${buttonIDs[i]}button`).disabled = currentPlayer.establishments[i] === 0;
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

                        document.getElementById(`businessplayer${playerCounter + 1}button`).disabled = false; // enable the button that you disabled (trading with yourself)

                        // text for what establishments were traded
                        document.getElementById('businesstext').style.display = "inline";
                        document.querySelector('#businesstext4').innerHTML = `Player ${playerCounter + 1} received ${buttonIDs[receiveIndex]} and lost ${buttonIDs[giveIndex]}`;
                        document.querySelector('#businesstext5').innerHTML = `Player ${targetPlayerIndex + 1} lost ${buttonIDs[receiveIndex]} and received ${buttonIDs[giveIndex]}`;
                    }
                }
            }
        }
    }
    let activated_buildings;
    let playerCycleIndex = 0;
    for (const player of players) {
        if (playerCycleIndex === playerCounter) {
            // will only return green and blue buildings
            activated_buildings = buildings.map((building, buildingIndex) => building.trigger?.includes(roll) ? buildingIndex : undefined).filter(x => x !== undefined); 
        } else {
            // will only return blue buildings
            activated_buildings = buildings.map((building, buildingIndex) => (building.trigger?.includes(roll) && building.colour === 'blue') ? buildingIndex : undefined).filter(x => x !== undefined);
        }
        let currentIncome = 0;
        for (const buildingIndex of activated_buildings) {
            if (Array.isArray(buildings[buildingIndex].income)) { // shopping mall doesn't apply here
                let numberOfSpecial = 0;
                for (const incomeIndex of buildings[buildingIndex].income) {
                    numberOfSpecial += player.establishments[incomeIndex];
                }
                const buildingIncome = buildings[buildingIndex].multiplier * numberOfSpecial;
                currentIncome += buildingIncome;
                player.balance += buildingIncome;
            } else {
                if (buildings[buildingIndex].shopping === true && player.landmarks[1]) { // shopping mall
                    const buildingIncome = player.establishments[buildingIndex] * (buildings[buildingIndex].income + 1);
                    currentIncome += buildingIncome
                    player.balance += buildingIncome;
                } else {
                    const buildingIncome = player.establishments[buildingIndex] * buildings[buildingIndex].income;
                    currentIncome += buildingIncome;
                    player.balance += buildingIncome;
                }
            }
        }
        document.querySelector(`#balance${playerCycleIndex + 1}`).innerHTML = `<font size="5">Balance: ${player.balance}</font>`;
        greenBlueIncome[playerCycleIndex] = currentIncome;
        playerCycleIndex++;
    }

    // red income text
    if (!redIncome.every(income => income === 0)) {
        document.getElementById('redincomebreak').style.display = "inline";
        for (let i = 0; i < players.length; i++) {
            document.getElementById(`redincome${i + 1}`).style.display = redIncome[i] === 0 ? "none" : "flex";
            document.querySelector(`#redincome${i + 1}`).innerHTML = `Player ${i + 1} ${redIncome[i] > 0 ? 'received' : 'lost'} ${redIncome[i] > 0 ? redIncome[i] : -redIncome[i]} ${(redIncome[i] > 1 || redIncome[i] < -1) ? 'coins' : 'coin'} from red establishments.`;
        }
    }

    // green/blue income text
    if (!greenBlueIncome.every(income => income === 0)) {
        document.getElementById('greenblueincomebreak').style.display = "inline";
        for (let i = 0; i < players.length; i++) {
            document.getElementById(`greenblueincome${i + 1}`).style.display = greenBlueIncome[i] === 0 ? "none" : "flex";
            document.querySelector(`#greenblueincome${i + 1}`).innerHTML = `Player ${i + 1} received ${greenBlueIncome[i]} ${(greenBlueIncome[i] > 1 || greenBlueIncome[i] < -1) ? 'coins' : 'coin'} from green/blue establishments.`;
        }
    }
    
    let totalIncome = Array(players.length).fill(0);
    for (let i = 0; i < players.length; i++) {
        totalIncome[i] = purpleIncome[i] + redIncome[i] + greenBlueIncome[i];
    }
    return totalIncome;
}