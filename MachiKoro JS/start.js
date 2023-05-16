import { Player } from './player.js'

import { buy } from './shop.js';

import { end } from './end.js'

export function start(numberofplayers) {
    numberofplayers = parseInt(numberofplayers);
    document.getElementById('beforegametext').style.display = "none";
    document.getElementById('startgametext').style.display = "inline";
    document.getElementById('endturnbutton').style.display = "inline"; // show the end turn button
    const players = [];
    for (let i = 0; i < numberofplayers; i++) {
        players.push(new Player());
    }

    let playerCounter = 0; // * * playerCounter is 0 indexed!!!

    document.getElementById('roll1dicebutton').onclick = function () {
        document.getElementById('roll1dicebutton').disabled = true; // disable the roll dice button
        document.getElementById('roll2dicebutton').disabled = true; // disable the other roll dice button
        document.getElementById('endturnbutton').disabled = false; // enable the end turn button

        let rollNumber = Math.floor(Math.random() * 6 + 1); // generates number between 1 and 6 inclusive
        document.querySelector('#rollnumber').innerHTML = 'You rolled a ' + rollNumber;
        document.getElementById('rollnumber').style.display = "inline";
        document.getElementById('buyestablishment').style.display = "inline";
    }

    document.getElementById('roll2dicebutton').onclick = function () {
        document.getElementById('roll1dicebutton').disabled = true; // disable the roll dice button
        document.getElementById('roll2dicebutton').disabled = true; // disable the other roll dice button
        document.getElementById('endturnbutton').disabled = false; // enable the end turn button

        let rollNumber = Math.floor(Math.random() * 12 + 1); // generates number between 1 and 12 inclusive
        document.querySelector('#rollnumber').innerHTML = 'You rolled a ' + rollNumber;
        document.getElementById('rollnumber').style.display = "inline";
        document.getElementById('buyestablishment').style.display = "inline"; // let player buy an establishment
    }

    document.getElementById('endturnbutton').onclick = function() {
        playerCounter++;
        if (playerCounter === numberofplayers) {
            playerCounter = 0;
        }
        document.querySelector('#playerturn').innerHTML = 'Player ' + (playerCounter + 1) + '\'s turn!';
        document.getElementById('roll1dicebutton').disabled = false;
        document.getElementById('endturnbutton').disabled = true;
        document.getElementById('rollnumber').style.display = "none";
        
        console.log(players[playerCounter].establishments);
        for (let i = 0; i < 4; i++) {
            players[playerCounter].landmarks[i] = true;
        }
    }
    document.querySelector('#buywheatfieldbutton').addEventListener('click', () => buy(0));

    console.log(players);




    document.getElementById('buywheatfieldbutton').onclick = function() { // * * wrong logic but just wanted to test
            // check if winner
        if (players[playerCounter].landmarks.every(v => v === true)) {
            end();
    }
    }
}