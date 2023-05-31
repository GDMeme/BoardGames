import { start } from './start.js'

document.getElementById('numberofplayersselect').onchange = function() {
    document.getElementById('submitplayersbutton').disabled = false;
}

// this is the whole game
document.getElementById('submitplayersbutton').onclick = function() {
    document.getElementById(`tvplayer3button`).style.display = players.length >= 3 ? "inline" : "none";
    document.getElementById(`tvplayer4button`).style.display = players.length === 4 ? "inline" : "none";

    document.getElementById(`businessplayer3button`).style.display = players.length >= 3 ? "inline" : "none";
    document.getElementById(`businessplayer4button`).style.display = players.length === 4 ? "inline" : "none";
    
    start(document.getElementById('numberofplayersselect').value);
}