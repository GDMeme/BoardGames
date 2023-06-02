import { start } from './start.js'

document.getElementById('numberofplayersselect').onchange = function() {
    document.getElementById('submitplayersbutton').disabled = false;
}

// this is the whole game
document.getElementById('submitplayersbutton').onclick = function() {
    let numberOfPlayers = parseInt(document.getElementById('numberofplayersselect').value);
    document.getElementById(`tvplayer3button`).style.display = numberOfPlayers >= 3 ? "inline" : "none";
    document.getElementById(`tvplayer4button`).style.display = numberOfPlayers === 4 ? "inline" : "none";

    document.getElementById(`businessplayer3button`).style.display = numberOfPlayers >= 3 ? "inline" : "none";
    document.getElementById(`businessplayer4button`).style.display = numberOfPlayers === 4 ? "inline" : "none";
    
    start(numberOfPlayers);
}