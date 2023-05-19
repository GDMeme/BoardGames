import { Player } from './player.js';

import { buy, enableShop } from './shop.js';

import { income } from './income.js';

const buildings = [
    {name: 'wheatfield', displayName: 'Wheat Field', cost: 1},
    {name: 'ranch', displayName: 'Ranch', cost: 1},
    {name: 'bakery', displayName: 'Bakery', cost: 1},
    {name: 'cafe', displayName: 'Cafe', cost: 2},
    {name: 'conveniencestore', displayName: 'Convenience Store', cost: 2},
    {name: 'forest', displayName: 'Forest', cost: 3},
    {name: 'stadium', displayName: 'Stadium', cost: 6},
    {name: 'tvstation', displayName: 'TV Station', cost: 7},
    {name: 'businesscenter', displayName: 'Business Center', cost: 8},
    {name: 'cheesefactory', displayName: 'Cheese Factory', cost: 5},
    {name: 'furniturefactory', displayName: 'Furniture Factory', cost: 3},
    {name: 'mine', displayName: 'Mine', cost: 6},
    {name: 'familyrestaurant', displayName: 'Family Restaurant', cost: 3},
    {name: 'appleorchard', displayName: 'Apple Orchard', cost: 3},
    {name: 'fruitandvegetablemarket', displayName: 'Fruit and Vegetable Market', cost: 2},
    {name: 'trainstation', displayName: 'Train Station', cost: 4},
    {name: 'shoppingmall', displayName: 'Shopping Mall', cost: 10},
    {name: 'amusementpark', displayName: 'Amusement Park', cost: 16},
    {name: 'radiotower', displayName: 'Radio Tower', cost: 22}
]

// TODO: implement income (+ business center), landmark interactions, limit on number of establishments

export function start(numberofplayers) {
    numberofplayers = parseInt(numberofplayers); // was a string, turn to int so can use comparison
    document.getElementById('beforegametext').style.display = "none";
    document.getElementById('startgametext').style.display = "inline";
    document.getElementById('endturnbutton').style.display = "inline"; // show the end turn button
    document.getElementById('player12inventory').style.display = "flex";
    document.getElementById('player34inventory').style.display = "flex";
    if (numberofplayers === 4) {
        document.getElementById('player3inventory').style.display = "inline";
        document.getElementById('player4inventory').style.display = "inline";
    } else if (numberofplayers === 3) {
        document.getElementById('player3inventory').style.display = "inline";
    } else {
        document.getElementById('player3inventory').style.visibility = "hidden";
        document.getElementById('player4inventory').style.visibility = "hidden";
        document.getElementById('endturn').style.display = "inline";
    }

    const players = [];
    for (let i = 0; i < numberofplayers; i++) {
        players.push(new Player());
    }

    let playerCounter = 0; // * * playerCounter is 0 indexed!!!

    document.getElementById('rolldicebutton').onclick = function () {
        document.getElementById('rolldicebutton').disabled = true; // disable the roll dice button
        document.getElementById('endturnbutton').disabled = false; // enable the end turn button

        // rolling stuff
        let rollNumber = document.getElementById('roll2dicecheckbox').checked ? Math.floor(Math.random() * 12 + 1) : Math.floor(Math.random() * 6 + 1);
        document.querySelector('#rollnumber').innerHTML = '<u> You rolled a ' + rollNumber + '! </u>';
        document.getElementById('rollnumber').style.display = "inline";

        // everyone collects income
        income(rollNumber, players, playerCounter);

        // buy establishment/landmark
        document.getElementById('buysomething').style.display = "inline";
        enableShop(players[playerCounter], buildings);
    }

    const buttonIDs = buildings.map(building => building.name);

    for (let i = 0; i < buttonIDs.length; i++) {
      const id = buttonIDs[i];
      document.getElementById(`buy${id}button`).onclick = function() {
        buy(i, players[playerCounter], playerCounter, buildings);
      }
    }

    document.getElementById('endturnbutton').onclick = function() {
        playerCounter++;
        if (playerCounter === numberofplayers) {
            playerCounter = 0;
        }
        document.querySelector('#playerturn').innerHTML = 'Player ' + (playerCounter + 1) + '\'s turn!';
        document.getElementById('rolldicebutton').disabled = false;
        document.getElementById('endturnbutton').disabled = true;
        document.getElementById('rollnumber').style.display = "none";
        document.getElementById('roll2dicecheckbox').checked = false;
        document.getElementById('buysomething').style.display = "none";
        
        // check landmarks
        document.getElementById('roll2dicecheckbox').disabled = !players[playerCounter].landmarks[0];
    }
}