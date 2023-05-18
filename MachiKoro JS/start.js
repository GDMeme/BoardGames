import { Player } from './player.js';

import { buy, enableShop } from './shop.js';

import { income } from './income.js';

// TODO: implement income (+ business center), landmark interactions, limit on number of establishments

export function start(numberofplayers) {
    numberofplayers = parseInt(numberofplayers); // was a string, turn to int so can use comparison
    document.getElementById('beforegametext').style.display = "none";
    document.getElementById('startgametext').style.display = "inline";
    document.getElementById('endturnbutton').style.display = "inline"; // show the end turn button
    document.getElementById('player12inventory').style.display = "flex";
    if (numberofplayers === 4) {
        document.getElementById('player34inventory').style.display = "flex";
        document.getElementById('player3inventory').style.display = "inline";
        document.getElementById('player4inventory').style.display = "inline";
    } else if (numberofplayers === 3) {
        document.getElementById('player34inventory').style.display = "flex";
        document.getElementById('player3inventory').style.display = "inline";

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
        enableShop(players[playerCounter].balance);
    }

    document.getElementById('buywheatfieldbutton').onclick = function () {
        buy(0, players[playerCounter], playerCounter);
    }
    document.getElementById('buyranchbutton').onclick = function () {
        buy(1, players[playerCounter], playerCounter);
    }
    document.getElementById('buybakerybutton').onclick = function () {
        buy(2, players[playerCounter], playerCounter);
    }
    document.getElementById('buycafebutton').onclick = function () {
        buy(3, players[playerCounter], playerCounter);
    }
    document.getElementById('buyconveniencestorebutton').onclick = function () {
        buy(4, players[playerCounter], playerCounter);
    }
    document.getElementById('buyforestbutton').onclick = function () {
        buy(5, players[playerCounter], playerCounter);
    }
    document.getElementById('buystadiumbutton').onclick = function () {
        buy(6, players[playerCounter], playerCounter);
    }
    document.getElementById('buytvstationbutton').onclick = function () {
        buy(7, players[playerCounter], playerCounter);
    }
    document.getElementById('buybusinesscenterbutton').onclick = function () {
        buy(8, players[playerCounter], playerCounter);
    }
    document.getElementById('buycheesefactorybutton').onclick = function () {
        buy(9, players[playerCounter], playerCounter);
    }
    document.getElementById('buyfurniturefactorybutton').onclick = function () {
        buy(10, players[playerCounter], playerCounter);
    }
    document.getElementById('buyminebutton').onclick = function () {
        buy(11, players[playerCounter], playerCounter);
    }
    document.getElementById('buyfamilyrestaurantbutton').onclick = function () {
        buy(12, players[playerCounter], playerCounter);
    }
    document.getElementById('buyappleorchardbutton').onclick = function () {
        buy(13, players[playerCounter], playerCounter);
    }
    document.getElementById('buyfruitandvegetablemarketbutton').onclick = function () {
        buy(14, players[playerCounter], playerCounter);
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
        
        for (let i = 0; i < 4; i++) {
            players[playerCounter].landmarks[i] = true;
        }
    }
}