import { Game } from './game.js';

import { buy } from './shop.js';

import { playerTurn } from './playerturn.js';

import { updateBalances, updateEstablishmentsLandmarks } from './income.js';

import { endTurn } from './endturn.js';

import * as C from './constants.js'

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
        // to remove the scroll bar
        document.querySelector('#player3inventory').innerHTML = ""; 
        document.querySelector('#player4inventory').innerHTML = "";
        
        document.getElementById('player3inventory').style.visibility = "hidden";
        document.getElementById('player4inventory').style.visibility = "hidden";
    }

    let game = new Game(numberOfPlayers, existingGame); // this is fine (if saved game, game.playerNames will be undefined but won't produce undefined behaviour)
    if (Array.isArray(existingGame)) { // existingGame represents the player names
        for (let i = 0; i < numberOfPlayers; i++) {
            document.querySelector(`#player${i + 1}text`).innerHTML = `<u><font size="6"> ${existingGame[i]} </font></u>`
        }
    } else { // existingGame represents the saved game
        game = Object.assign(game, existingGame);
        updateBalances(game.players);
        updateEstablishmentsLandmarks(game); // TODO: fix this line so that updateEstablishmentsLandmarks directly accesses the constant

        for (let i = 0; i < numberOfPlayers; i++) {
            document.querySelector(`#player${i + 1}text`).innerHTML = `<u><font size="6"> ${game.playerNames[i]} </font></u>`
        }   

        document.querySelector('#playerturn').innerHTML = `Player ${game.playerCounter + 1}'s turn!`; // since playerCounter is 0 indexed
    }

    const buttonIDs = C.buildings.map(building => building.name);
    for (let i = 0; i < numberOfPlayers; i++) {
        for (let j = 0; j < 19; j++) { // establishments
            document.getElementById(`${buttonIDs[j]}${i + 1}`).onmouseout = function () {
                document.getElementById(`${buttonIDs[j]}${(j < 19 && j > 14) ? (game.players[game.playerCounter].landmarks[j - 15] ? 'unlocked' : 'locked') : ''}image`).style.display = "none";
                document.getElementById('cardexplanation').style.display = "none";
                document.getElementById('cardexplanation2').style.display = "none";
                document.getElementById('dicerollexplanation').style.display = "none";
            }
            document.getElementById(`${buttonIDs[j]}${i + 1}`).onmouseover = function () {
                document.getElementById(`${buttonIDs[j]}${(j < 19 && j > 14) ? (game.players[game.playerCounter].landmarks[j - 15] ? 'unlocked' : 'locked') : ''}image`).style.display = "inline";
                document.getElementById('cardexplanation').style.display = "flex";
                document.getElementById('cardexplanation2').style.display = "flex";
                document.getElementById('dicerollexplanation').style.display = j > 14 ? "none" : "flex";
                document.getElementById('extraindent').style.display = j > 14 ? "flex" : "none";
                document.getElementById('imgWrap').style.margin = '0px ' + (j < 15 ? '-200px' : '-150px') + ' auto';
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

        game.playerCounter = endTurn(game, true); // true means player rerolled
        playerTurn(game, false);
    }

    document.getElementById('rolldicebutton').onclick = function () {
        income = playerTurn(game, true); // need to keep track of income to account for rerolling
    }

    for (let i = 0; i < buttonIDs.length; i++) {
        const id = buttonIDs[i];
        document.getElementById(`buy${id}button`).onclick = function() {
            buy(i, game); // TODO: fix this line so that updateEstablishmentsLandmarks directly accesses the constant
        }
    }

    document.getElementById('endturnbutton').onclick = function() {
        game.playerCounter = endTurn(game, false);
    }

    document.getElementById('savegamebutton').onclick = function() {
        document.getElementById('savegametext').style.display = "inline";
        document.querySelector('#temporarysavegametext').innerHTML = JSON.stringify(game);
        document.getElementById('savegamebutton').disabled = true; // disable the save button
    }
}
