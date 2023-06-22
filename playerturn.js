import { income } from './income.js';

import { enableShop } from './shop.js'

export function playerTurn(players, playerCounter, flag, buildings) { // flag true means regular turn, not reroll   
    document.getElementById('savegametext').style.display = "none";
    document.getElementById('rolldicebutton').disabled = true; // disable the roll dice button
    document.getElementById('savegamebutton').disabled = true; // disable the save game button 
    let currentPlayer = players[playerCounter];
    
    // rolling stuff
    document.getElementById('rollnumber').style.display = "inline";
    let tempFirst = Math.floor(Math.random() * 6 + 1);
    let tempSecond = Math.floor(Math.random() * 6 + 1);
    document.querySelector('#rollnumber').innerHTML = document.getElementById('roll2dicecheckbox').checked ? `<u> You rolled a ${tempFirst} + ${tempSecond} = ${tempFirst + tempSecond}! </u>` : `<u> You rolled a ${tempFirst}! </u>`;
    return setTimeout(rollDice, 100, document.getElementById('roll2dicecheckbox').checked, 0, document.getElementById('roll2dicecheckbox').checked ? 7 : 1, players, playerCounter, buildings, currentPlayer, flag);
}

function rollDice(checked, counter, rollNumber, players, playerCounter, buildings, currentPlayer, flag) { // checked means roll two dice
    let newRollNumber;
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
        setTimeout(rollDice, counter !== 10 ? 100 : 0, checked, counter, newRollNumber, players, playerCounter, buildings, currentPlayer, flag);
    } else {
        document.getElementById('endturnbutton').disabled = false; // enable the end turn button
        
        document.getElementById('roll2dicecheckbox').disabled = !(flag && currentPlayer.landmarks[3] && currentPlayer.landmarks[0]); // able to roll two dice if rerolling, radio tower and train station
        document.getElementById('rerollbutton').disabled = !(currentPlayer.landmarks[3] && flag);
        // everyone collects income
        let currentIncome = income(rollNumber, players, playerCounter, buildings);
        if (!currentIncome.every(income => income === 0)) {
            document.getElementById('incomesummary').style.display = "inline";
        }

        // buy establishment/landmark
        if (!(rollNumber === 6 && currentPlayer.establishments[8])) {
            document.getElementById('buysomething').style.display = "inline";
            enableShop(players, currentPlayer, buildings);
        }
        return currentIncome;
    }
}