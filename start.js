import { Player } from './player.js';

import { buy } from './shop.js';

import { playerTurn } from './playerturn.js';

import { updateBalances } from './income.js';

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

export function start(numberOfPlayers) {
    document.getElementById('beforegametext').style.display = "none";
    document.getElementById('startgametext').style.display = "inline";
    document.getElementById('endturnbutton').style.display = "inline"; // show the end turn button
    document.getElementById('player12inventory').style.display = "flex";
    document.getElementById('player34inventory').style.display = "flex";
    if (numberOfPlayers === 4) {
        document.getElementById('player3inventory').style.visibility = "visible";
        document.getElementById('player4inventory').style.visibility = "visible";
    } else if (numberOfPlayers === 3) {
        document.getElementById('player3inventory').style.visibility = "visible";
    } else {
        document.getElementById('player3inventory').style.visibility = "hidden";
        document.getElementById('player4inventory').style.visibility = "hidden";
    }

    const players = Array(numberOfPlayers);

    for (let i = 0; i < numberOfPlayers; i++) {
        players[i] = new Player();
    }

    let playerCounter = 0; // * * playerCounter is 0 indexed!!!

    let income;
    document.getElementById('rerollbutton').onclick = function () {
        document.getElementById('rerollbutton').disabled = true;
        document.getElementById('rolldoubles').style.display = "none";

        // subtract the income they got from the original roll
        for (let i = 0; i < players.length; i++) {
            players[i].balance -= income[i];
        }
        updateBalances(players);

        endTurn(players, playerCounter, numberOfPlayers, true);
        playerTurn(players, playerCounter, false, buildings, income);
    }

    document.getElementById('rolldicebutton').onclick = function () {
        income = playerTurn(players, playerCounter, true, buildings); // need to keep track of income to account for rerolling
    }

    const buttonIDs = buildings.map(building => building.name);
    for (let i = 0; i < buttonIDs.length; i++) {
        const id = buttonIDs[i];
        document.getElementById(`buy${id}button`).onclick = function() {
            buy(i, players[playerCounter], playerCounter, buildings);
        }
    }

    document.getElementById('endturnbutton').onclick = function() {
        endTurn(players, playerCounter, numberOfPlayers, false);
    }
}