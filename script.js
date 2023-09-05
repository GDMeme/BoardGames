import { queue } from './queue.js';
import { loadGame } from './loadGame.js';

document.getElementById('testbutton').onclick = function() { // TODO: Remember to remove this
    document.getElementById('playerlist').appendChild(document.createElement('li'))
}

// * * Chatting Stuff
document.getElementById('openchatbutton').onclick = function() {
    document.getElementById('chat').style.display = "block";
}

document.getElementById('closemessagebutton').onclick = function() {
    document.getElementById('chat').style.display = "none";
}

document.getElementById('closechat').onmouseover = function () {
    document.getElementById('closechat').style.cursor = "pointer";
}

document.getElementById('closechat').onclick = function() {
    document.getElementById('chat').style.display = "none";
}

// * * Starting the game
let playerName;

document.getElementById('submitplayernamebutton').onclick = function() {
    playerName = document.getElementById(`playernameinput`).value || `Anonymous`;
    document.getElementById('playernametext').style.display = "none";

    document.querySelector('#playername').innerHTML = `Your name: ${playerName}`;
    queue(playerName);
}

// You can press "enter" instead of the submit button when submitting your name
document.getElementById(`playernameinput`).addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById('submitplayernamebutton').click();
    }
})

// loading an existing game
document.getElementById('existinggamefile').addEventListener('change', loadGame);
