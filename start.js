import { Player } from './player.js';

import { buy } from './shop.js';

import { playerTurn } from './playerturn.js'

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
]

const buttonIDs = buildings.map(building => building.name);

// TODO: implement income (+ business center), shopping mall interaction

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
        income = playerTurn(players, playerCounter, false, buildings);
    }

    document.getElementById('rolldicebutton').onclick = function () {
        playerTurn(players, playerCounter, true, buildings, income);
    }

    for (let i = 0; i < buttonIDs.length; i++) {
        const id = buttonIDs[i];
        document.getElementById(`buy${id}button`).onclick = function() {
            buy(i, players[playerCounter], playerCounter, buildings);
        }
    }

    document.getElementById('endturnbutton').onclick = function() {
        if (document.getElementById('rolldoubles').style.display !== "inline") { // amusement park did not activate
            playerCounter++;
        } // otherwise, don't increment playerCounter
        if (playerCounter === numberOfPlayers) {
            playerCounter = 0;
        }
        document.querySelector('#playerturn').innerHTML = `Player ${playerCounter + 1}'s turn!`; // since playerCounter is 0 indexed
        document.getElementById('rolldicebutton').disabled = false;
        document.getElementById('endturnbutton').disabled = true;
        document.getElementById('rollnumber').style.display = "none";
        document.getElementById('roll2dicecheckbox').checked = false;
        document.getElementById('buysomething').style.display = "none";
        document.getElementById('rolldoubles').style.display = "none";
        document.getElementById('roll2dicecheckbox').style.display = "inline";
        document.getElementById('rerollbutton').disabled = true;
        for (let i = 0; i < players.length; i++) {
            document.getElementById(`stadiumtext${i + 1}`).style.display = "none";
            document.getElementById(`redincome${i + 1}`).style.display = "none";
            document.getElementById(`greenblueincome${i + 1}`).style.display = "none";
        }
        document.getElementById('tvplayertextbuttons').style.display = "none";
        document.getElementById('businesstext').style.display = "none";
        document.getElementById('incomesummary').style.display = "none";
        document.getElementById('redincomebreak').style.display = "none";

        // check landmarks
        document.getElementById('roll2dicecheckbox').disabled = !players[playerCounter].landmarks[0];
    }
}