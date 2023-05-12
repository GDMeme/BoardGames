import { Player } from './player.js'

export function start(numberofplayers) {
    document.getElementById('beforegametext').style.display = "none";
    document.getElementById('startgametext').style.display = "inline";
    const players = [];
    for (let i = 0; i < numberofplayers; i++) {
        players.push(new Player());
    }

    let playerCounter = 1;

    document.getElementById('rolldicebutton').onclick = function () {
        document.getElementById('rolldicebutton').disabled = true;
        document.getElementById('endturnbutton').disabled = false;
    }

    document.getElementById('endturnbutton').onclick = function() {
        playerCounter++;
        document.getElementById('rolldicebutton').disabled = false;
        document.getElementById('endturnbutton').disabled = true;
    }
    document.querySelector('#buywheatfieldbutton').addEventListener('click', () => buy(0));

    console.log(players);
}