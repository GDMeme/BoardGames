import { income } from './income.js';

import { enableShop } from './shop.js'

export function playerTurn(players, playerCounter, flag, buildings) { // flag true means regular turn, not reroll
    document.getElementById('rolldicebutton').disabled = true; // disable the roll dice button
    document.getElementById('endturnbutton').disabled = false; // enable the end turn button
    
    let currentPlayer = players[playerCounter];
    document.getElementById('roll2dicecheckbox').disabled = !(flag && currentPlayer.landmarks[3]) && currentPlayer.landmarks[0]; // able to roll two dice if rerolling,  radio tower, train station
    document.getElementById('rerollbutton').disabled = !(currentPlayer.landmarks[3] && flag);
    
    // rolling stuff
    let rollNumber;
    if (document.getElementById('roll2dicecheckbox').checked) {
        let firstRoll = Math.floor(Math.random() * 6 + 1);
        let secondRoll = Math.floor(Math.random() * 6 + 1);
        rollNumber = firstRoll + secondRoll;
        if (firstRoll === secondRoll && currentPlayer.landmarks[2]) {
            document.getElementById('rolldoubles').style.display = "inline";
        }
        document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${firstRoll} + ${secondRoll} = ${rollNumber}! </u>`;
    } else {
        rollNumber = Math.floor(Math.random() * 6 + 1);
        document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${rollNumber}! </u>`;
    }
    document.getElementById('rollnumber').style.display = "inline";

    // everyone collects income
    let currentIncome = income(rollNumber, players, playerCounter, buildings);
    if (!currentIncome.every(income => income === 0)) {
        document.getElementById('incomesummary').style.display = "inline";
    }

    // buy establishment/landmark
    if (!(rollNumber === 6 && currentPlayer.establishments[8])) {
        document.getElementById('buysomething').style.display = "inline";
        enableShop(currentPlayer, buildings);
    }
    return currentIncome;
}