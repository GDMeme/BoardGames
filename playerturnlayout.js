export function playerTurnLayout(rollTwoDice, ws, roomID) {  
    document.getElementById('rolldicetext').style.display = "block";
    document.getElementById('rolldice').style.display = "block";
    document.getElementById('endturn').style.display = "block";

    // * * Check Train Station
    document.getElementById('roll2dicecheckbox').disabled = !rollTwoDice;

    // enable the save game button
    document.getElementById('savegamebutton').disabled = false;

    document.getElementById('rolldicebutton').onclick = function () {
        document.getElementById('rolldice').style.display = "none";

        document.getElementById('savegametext').style.display = "none";
        document.getElementById('savegamebutton').disabled = true; // disable the save game button 
        
        // rolling stuff
        document.getElementById('rollnumber').style.display = "inline";

        // * * Client side rolling until the actual roll is sent back
        let tempFirst = Math.floor(Math.random() * 6 + 1);
        let tempSecond = Math.floor(Math.random() * 6 + 1);
        document.querySelector('#rollnumber').innerHTML = document.getElementById('roll2dicecheckbox').checked ? `<u> You rolled a ${tempFirst} + ${tempSecond} = ${tempFirst + tempSecond}! </u>` : `<u> You rolled a ${tempFirst}! </u>`;
        return setTimeout(rollDice, 100, document.getElementById('roll2dicecheckbox').checked, 0, ws, roomID);
    }

}

function rollDice(rollTwoDice, counter, ws, roomID) {
    let newRollNumber;
    if (counter !== 10) {
        counter++;
        if (rollTwoDice) {
            let firstRoll = Math.floor(Math.random() * 6 + 1);
            let secondRoll = Math.floor(Math.random() * 6 + 1);
            newRollNumber = firstRoll + secondRoll;
            document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${firstRoll} + ${secondRoll} = ${newRollNumber}! </u>`;
        } else {
            newRollNumber = Math.floor(Math.random() * 6 + 1);
            document.querySelector('#rollnumber').innerHTML = `<u> You rolled a ${newRollNumber}! </u>`;
        }
        setTimeout(rollDice, counter !== 10 ? 100 : 0, rollTwoDice, counter, ws, roomID); // poll until counter reaches 10
    } else {
        ws.send(JSON.stringify({type: 'rollDice', roomID: roomID, rollTwoDice: document.getElementById('roll2dicecheckbox').checked}));
    }
}