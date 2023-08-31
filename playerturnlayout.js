import { income } from './Server Files/calculateIncome.js';

import { enableShop } from './shop.js'

export function playerTurnLayout(game, notReroll) {  
    document.getElementById('rolldicetext').style.display = "inline";

    document.getElementById('rolldicebutton').onclick = function () {
        document.getElementById('rolldicebutton').style.display = "none";

        document.getElementById('savegametext').style.display = "none";
        document.getElementById('savegamebutton').disabled = true; // disable the save game button 
        
        // rolling stuff
        document.getElementById('rollnumber').style.display = "inline";

        // client side rolling until the actual roll is sent back
        let tempFirst = Math.floor(Math.random() * 6 + 1);
        let tempSecond = Math.floor(Math.random() * 6 + 1);
        document.querySelector('#rollnumber').innerHTML = document.getElementById('roll2dicecheckbox').checked ? `<u> You rolled a ${tempFirst} + ${tempSecond} = ${tempFirst + tempSecond}! </u>` : `<u> You rolled a ${tempFirst}! </u>`;
        return setTimeout(rollDice, 100, document.getElementById('roll2dicecheckbox').checked, 0, document.getElementById('roll2dicecheckbox').checked ? 7 : 1, game, notReroll);
    }

}

function rollDice(rollTwoDice, counter, rollNumber, game, notReroll) { // checked means roll two dice
    let newRollNumber;
    let currentPlayer = game.players[game.playerCounter];
    if (counter !== 10) {
        counter++;
        if (rollTwoDice) {
            let firstRoll = Math.floor(Math.random() * 6 + 1);
            let secondRoll = Math.floor(Math.random() * 6 + 1);
            newRollNumber = firstRoll + secondRoll;
            // if (firstRoll === secondRoll && currentPlayer.landmarks[2] && counter === 10) {
            //     document.getElementById('rolldoubles').style.display = "inline";
            // }
            document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${firstRoll} + ${secondRoll} = ${newRollNumber}! </u>`;
        } else {
            newRollNumber = Math.floor(Math.random() * 6 + 1);
            document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${newRollNumber}! </u>`;
        }
        setTimeout(rollDice, counter !== 10 ? 100 : 0, rollTwoDice, counter, newRollNumber, game, notReroll); // poll until counter reaches 10
    } else {
        ws.send(JSON.stringify({type: 'rollDice', roomID: roomID, rollTwoDice: document.getElementById('roll2dicecheckbox').checked}));
    }
}