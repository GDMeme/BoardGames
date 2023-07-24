import { income } from './income.js';

import { enableShop } from './shop.js'

export function playerTurn(game, flag) { // flag true means regular turn, not reroll   
    document.getElementById('rolldicebutton').style.display = "none";

    document.getElementById('savegametext').style.display = "none";
    document.getElementById('savegamebutton').disabled = true; // disable the save game button 
    
    // rolling stuff
    document.getElementById('rollnumber').style.display = "inline";
    let tempFirst = Math.floor(Math.random() * 6 + 1);
    let tempSecond = Math.floor(Math.random() * 6 + 1);
    document.querySelector('#rollnumber').innerHTML = document.getElementById('roll2dicecheckbox').checked ? `<u> You rolled a ${tempFirst} + ${tempSecond} = ${tempFirst + tempSecond}! </u>` : `<u> You rolled a ${tempFirst}! </u>`;
    return setTimeout(rollDice, 100, document.getElementById('roll2dicecheckbox').checked, 0, document.getElementById('roll2dicecheckbox').checked ? 7 : 1, game, flag);
}

function rollDice(checked, counter, rollNumber, game, flag) { // checked means roll two dice
    let newRollNumber;
    let currentPlayer = game.players[game.playerCounter];
    if (counter !== 10) {
        counter++;
        if (checked) {
            let firstRoll = Math.floor(Math.random() * 6 + 1);
            let secondRoll = Math.floor(Math.random() * 6 + 1);
            newRollNumber = firstRoll + secondRoll;
            if (firstRoll === secondRoll && currentPlayer.landmarks[2] && counter === 10) {
                document.getElementById('rolldoubles').style.display = "inline";
            }
            document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${firstRoll} + ${secondRoll} = ${newRollNumber}! </u>`;
        } else {
            newRollNumber = Math.floor(Math.random() * 6 + 1);
            document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${newRollNumber}! </u>`;
        }
        setTimeout(rollDice, counter !== 10 ? 100 : 0, checked, counter, newRollNumber, game, flag); // poll until counter reaches 10
    } else {
        document.getElementById('endturnbutton').disabled = false; // enable the end turn button
        
        document.getElementById('roll2dicecheckbox').disabled = !(flag && currentPlayer.landmarks[3] && currentPlayer.landmarks[0]); // able to roll two dice if rerolling, radio tower and train station
        document.getElementById('rerollbutton').disabled = !(currentPlayer.landmarks[3] && flag);
        // everyone collects income
        let currentIncome = income(rollNumber, game);
        if (!currentIncome.every(income => income === 0)) {
            document.getElementById('incomesummary').style.display = "inline";
        }

        // buy establishment/landmark
        if (!(rollNumber === 6 && currentPlayer.establishments[8])) {
            document.getElementById('buysomething').style.display = "inline";
            enableShop(game);
        }
        return currentIncome;
    }
}