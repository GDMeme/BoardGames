import { Player } from './player.js'

export function start(numberofplayers) {
    document.getElementById('beforegametext').style.display = "none";
    document.getElementById('startgametext').innerHTML = "Number of players: " + numberofplayers;
    const players = [];
    for (let i = 0; i < numberofplayers; i++) {
        players.push(new Player());
    }
    console.log(players);
}