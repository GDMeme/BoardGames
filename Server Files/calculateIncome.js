import * as C from './constants.js';

import { sendWebsocketEveryone } from './server.js';

function redActivate(game, flag, redIncome) { // if flag, rolled 3
    let index = game.playerCounter; // * * index is 0 indexed!!
    let numberOfRed, moneyOwed, moneyExchanged;
    while (game.players[game.playerCounter].balance > 0) {
        index--;
        if (index === -1) {
            index = game.players.length - 1;
        } 
        if (index === game.playerCounter) {
            break;
        }
        numberOfRed = game.players[index].establishments[flag ? 3 : 10];

        // don't even try to understand this line but it works
        // accounts for shopping mall
        moneyOwed = flag ? (game.players[index].landmarks[1] ? (2 * numberOfRed) : numberOfRed) : (game.players[index].landmarks[1] ? (3 * numberOfRed) : (2 * numberOfRed));
        moneyExchanged = exchangeCoins(game.players[index], game.players[game.playerCounter], moneyOwed);
        redIncome[index] += moneyExchanged;
        redIncome[game.playerCounter] -= moneyExchanged;
    }
    return redIncome;
}

export function exchangeCoins(player, targetPlayer, amount) { // returns the positive amount of coins exchanged
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

export function updateEstablishmentsLandmarks(game) {
    for (let i = 0; i < game.players.length; i++) {
        for (let j = 0; j < 15; j++) {
            document.querySelector(`#${C.buildings[j].name}${i + 1}`).innerHTML = `${C.buildings[j].displayName}: ${game.players[i].establishments[j]}`;
        }
        for (let j = 15; j < 19; j++) {
            document.querySelector(`#${C.buildings[j].name}${i + 1}`).innerHTML = `${C.buildings[j].displayName}: ${game.players[i].landmarks[j - 15] ? 'Unlocked' : 'Locked'}`;
        }
    }
}

export function calculateIncome(roll, game, room, WStoPlayerName, roomIndex) { // roomIndex is needed for sendWebsocketEveryone
    let redIncome = Array(game.players.length).fill(0);
    let greenBlueIncome = Array(game.players.length).fill(0);
    let purpleIncome = Array(game.players.length).fill(0);
    let playerCounter = game.playerCounter;
    let players = game.players;
    if (roll === 3 || roll === 10) {
        redIncome = redActivate(game, roll === 3, redIncome);
    } else if (roll === 6) { // TODO: IT MAKES A DIFFERENCE IF PURPLE GOES BEFORE GREEN/BLUE (only stadium is affected)
        let currentPlayer = players[playerCounter];
        if (currentPlayer.establishments[6]) { 
            for (let i = 0; i < players.length; i++) {
                if (i !== playerCounter) {  
                    purpleIncome[i] = exchangeCoins(currentPlayer, players[i], 2);
                }
            }
            purpleIncome[playerCounter] = purpleIncome.reduce((total, item) => total + item);

            // * * Send a message to each client; each player gets 4 messages at a time
            for (let i = 1; i < room.length; i++) {
                for (let j = 1; j < room.length; j++) {
                    room[i].send(JSON.stringify({type: (j !== game.playerCounter + 1) ? 'showStadiumText' : 'stadiumTotal', index: j, giverName: WStoPlayerName.get(room[j]), receiverName: WStoPlayerName.get(room[playerCounter + 1]), amount: purpleIncome[j]}));
                }
            }
        }
        if (currentPlayer.establishments[7]) {
            // * * Update TVStationActivated state
            game.TVStationActivatedState = C.purpleState.activated;

            room[playerCounter + 1].send(JSON.stringify({type: 'showTVText', playerCounter: playerCounter}));
        }
        if (currentPlayer.establishments[8]) {
            // * * Update businessCenterActivated state
            game.businessCenterActivatedState = C.purpleState.activated;

            room[playerCounter + 1].send(JSON.stringify({type: 'showBusinessText', playerCounter: playerCounter}));
        }
    }
    let activated_buildings;
    let playerCycleIndex = 0;
    for (const player of game.players) {
        if (playerCycleIndex === game.playerCounter) {
            // will only return green and blue buildings
            activated_buildings = C.buildings.map((building, buildingIndex) => building.trigger?.includes(roll) ? buildingIndex : undefined).filter(x => x !== undefined); 
        } else {
            // will only return blue buildings
            activated_buildings = C.buildings.map((building, buildingIndex) => (building.trigger?.includes(roll) && building.colour === 'blue') ? buildingIndex : undefined).filter(x => x !== undefined);
        }
        let currentIncome = 0;
        for (const buildingIndex of activated_buildings) {
            // * * Establishments that have a multiplier effect
            if (Array.isArray(C.buildings[buildingIndex].income)) { // shopping mall will never apply here
                let numberOfSpecial = 0;
                for (const incomeIndex of C.buildings[buildingIndex].income) {
                    numberOfSpecial += player.establishments[incomeIndex];
                }
                const buildingIncome = C.buildings[buildingIndex].multiplier * numberOfSpecial;
                currentIncome += buildingIncome;
                player.balance += buildingIncome;
            } else {
                if (C.buildings[buildingIndex].shopping === true && player.landmarks[1]) { // shopping mall
                    const buildingIncome = player.establishments[buildingIndex] * (C.buildings[buildingIndex].income + 1);
                    currentIncome += buildingIncome
                    player.balance += buildingIncome;
                } else { // no shopping mall
                    const buildingIncome = player.establishments[buildingIndex] * C.buildings[buildingIndex].income;
                    currentIncome += buildingIncome;
                    player.balance += buildingIncome;
                }
            }
        }
        // * * Update balance for each client's HTML 
        sendWebsocketEveryone(roomIndex, {type: 'updateBalance', playerIndex: playerCycleIndex, newBalance: player.balance});

        greenBlueIncome[playerCycleIndex] = currentIncome;
        playerCycleIndex++;
    }

    // red income text
    if (!redIncome.every(income => income === 0)) {
        // * * Show red income text for each client's HTML
        sendWebsocketEveryone(roomIndex, {type: 'showRedIncome', redIncome: redIncome, players: game.players});
    }

    // green/blue income text
    if (!greenBlueIncome.every(income => income === 0)) {
        // * * Show green/blue income text for each client's HTML
        sendWebsocketEveryone(roomIndex, {type: 'showGreenBlueIncome', greenBlueIncome: greenBlueIncome, players: game.players});
    }
    
    let totalIncome = Array(game.players.length);
    for (let i = 0; i < game.players.length; i++) {
        totalIncome[i] = purpleIncome[i] + redIncome[i] + greenBlueIncome[i];
    }
    return totalIncome;
}