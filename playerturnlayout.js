export function playerTurnLayout() {  
    document.getElementById('rolldicetext').style.display = "inline";

    // * * Check Train Station
    document.getElementById('roll2dicecheckbox').disabled = !message.rollTwoDice;

    // enable the save game button
    document.getElementById('savegamebutton').disabled = false;

    document.getElementById('rolldicebutton').onclick = function () {
        document.getElementById('rolldicebutton').style.display = "none";

        document.getElementById('savegametext').style.display = "none";
        document.getElementById('savegamebutton').disabled = true; // disable the save game button 
        
        // rolling stuff
        document.getElementById('rollnumber').style.display = "inline";

        // * * Client side rolling until the actual roll is sent back
        let tempFirst = Math.floor(Math.random() * 6 + 1);
        let tempSecond = Math.floor(Math.random() * 6 + 1);
        document.querySelector('#rollnumber').innerHTML = document.getElementById('roll2dicecheckbox').checked ? `<u> You rolled a ${tempFirst} + ${tempSecond} = ${tempFirst + tempSecond}! </u>` : `<u> You rolled a ${tempFirst}! </u>`;
        return setTimeout(rollDice, 100, document.getElementById('roll2dicecheckbox').checked, 0);
    }

}

function rollDice(rollTwoDice, counter) {
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
        setTimeout(rollDice, counter !== 10 ? 100 : 0, rollTwoDice, counter); // poll until counter reaches 10
    } else {
        ws.send(JSON.stringify({type: 'rollDice', roomID: roomID, rollTwoDice: document.getElementById('roll2dicecheckbox').checked}));
    }
}