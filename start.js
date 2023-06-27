import { Game } from './game.js';

import { buy } from './shop.js';

import { playerTurn } from './playerturn.js';

import { updateBalances, updateEstablishmentsLandmarks } from './income.js';

import { endTurn } from './endturn.js';

const buildings = [
    {name: 'wheatfield', displayName: 'Wheat Field', cost: 1, income: 1, shopping: false, colour: 'blue', trigger: [1]},
    {name: 'ranch', displayName: 'Ranch', cost: 1, income: 1, shopping: false, colour: 'blue', trigger: [2]},
    {name: 'bakery', displayName: 'Bakery', cost: 1, income: 1, shopping: true, trigger: [2, 3]}, // if colour is not blue, it must be green
    {name: 'cafe', displayName: 'Cafe', cost: 2}, // red is special case
    {name: 'conveniencestore', displayName: 'Convenience Store', cost: 2, income: 3, shopping: true, trigger: [4]},
    {name: 'forest', displayName: 'Forest', cost: 3, income: 1, shopping: false, colour: 'blue', trigger: [5]},
    {name: 'stadium', displayName: 'Stadium', cost: 6}, // purples are special case
    {name: 'tvstation', displayName: 'TV Station', cost: 7},
    {name: 'businesscenter', displayName: 'Business Center', cost: 8},
    {name: 'cheesefactory', displayName: 'Cheese Factory', cost: 5, income: [1], multiplier: 3, trigger: [7]}, // don't need shopping since income is array
    {name: 'furniturefactory', displayName: 'Furniture Factory', cost: 3, income: [5, 11], multiplier: 3, trigger: [8]},
    {name: 'mine', displayName: 'Mine', cost: 6, income: 5, shopping: false, colour: 'blue', trigger: [9]},
    {name: 'familyrestaurant', displayName: 'Family Restaurant', cost: 3}, // red is special case
    {name: 'appleorchard', displayName: 'Apple Orchard', cost: 3, income: 3, shopping: false, colour: 'blue', trigger: [10]},
    {name: 'fruitandvegetablemarket', displayName: 'Fruit and Vegetable Market', cost: 2, income: [0, 13], multiplier: 2, trigger: [11, 12]},
    {name: 'trainstation', displayName: 'Train Station', cost: 4},
    {name: 'shoppingmall', displayName: 'Shopping Mall', cost: 10},
    {name: 'amusementpark', displayName: 'Amusement Park', cost: 16},
    {name: 'radiotower', displayName: 'Radio Tower', cost: 22}
];

export function start(numberOfPlayers, existingGame) { // existingGame could also represent the player names
    document.getElementById('startgametext').style.display = "inline";
    document.querySelector('#titletext').innerHTML = "<u>Machi Koro</u>";
    document.getElementById('endturnbutton').style.display = "inline"; // show the end turn button
    document.getElementById('player12inventory').style.display = "flex";
    document.getElementById('player34inventory').style.display = "flex";
    document.getElementById('savegamebutton').style.display = "inline"; // show the save game button
    document.getElementById('invalidfiletext').style.display = "inline";
    if (numberOfPlayers === 4) {
        document.getElementById('player3inventory').style.visibility = "visible";
        document.getElementById('player4inventory').style.visibility = "visible";
    } else if (numberOfPlayers === 3) {
        document.getElementById('player3inventory').style.visibility = "visible";
    } else {
        document.getElementById('player3inventory').style.visibility = "hidden";
        document.getElementById('player4inventory').style.visibility = "hidden";
    }

    let game;
    if (Array.isArray(existingGame)) { // existingGame represents the player names
        game = new Game(numberOfPlayers, existingGame);
        for (let i = 0; i < numberOfPlayers; i++) {
            document.querySelector(`#player${i + 1}text`).innerHTML = `<u><font size="6"> ${existingGame[i]} </font></u>`
        }
    } else if (existingGame) { // existingGame represents the saved game
        game = Object.assign(game, existingGame);
        updateBalances(game.players);
        updateEstablishmentsLandmarks(game.players, buildings);

        document.querySelector('#playerturn').innerHTML = `Player ${game.playerCounter + 1}'s turn!`; // since playerCounter is 0 indexed
    }

    const buttonIDs = buildings.map(building => building.name);
    for (let i = 0; i < numberOfPlayers; i++) {
        for (let j = 0; j < 19; j++) { // establishments
            document.getElementById(`${buttonIDs[j]}${i + 1}`).onmouseout = function () {
                document.getElementById(`${buttonIDs[j]}${(j < 19 && j > 14) ? (game.players[game.playerCounter].landmarks[j - 15] ? 'unlocked' : 'locked') : ''}image`).style.display = "none";
            }
            document.getElementById(`${buttonIDs[j]}${i + 1}`).onmouseover = function () {
                document.getElementById(`${buttonIDs[j]}${(j < 19 && j > 14) ? (game.players[game.playerCounter].landmarks[j - 15] ? 'unlocked' : 'locked') : ''}image`).style.display = "inline";
            }
        }
    }

    let income;
    document.getElementById('rerollbutton').onclick = function () {
        document.getElementById('rerollbutton').disabled = true;
        document.getElementById('rolldoubles').style.display = "none";

        // subtract the income they got from the original roll
        for (let i = 0; i < players.length; i++) {
            game.players[i].balance -= income[i];
        }
        updateBalances(game.players);

        game.playerCounter = endTurn(game.players, game.playerCounter, numberOfPlayers, true);
        playerTurn(game.players, game.playerCounter, false, buildings);
    }

    document.getElementById('rolldicebutton').onclick = function () {
        income = playerTurn(game.players, game.playerCounter, true, buildings); // need to keep track of income to account for rerolling
    }

    for (let i = 0; i < buttonIDs.length; i++) {
        const id = buttonIDs[i];
        document.getElementById(`buy${id}button`).onclick = function() {
            buy(i, game.players[game.playerCounter], game.playerCounter, buildings);
        }
    }

    document.getElementById('endturnbutton').onclick = function() {
        game.playerCounter = endTurn(game.players, game.playerCounter, numberOfPlayers, false);
    }

    document.getElementById('savegamebutton').onclick = function() {
        document.getElementById('savegametext').style.display = "inline";
        document.querySelector('#temporarysavegametext').innerHTML = JSON.stringify(game);
        document.getElementById('savegamebutton').disabled = true; // disable the save button
    }
}
