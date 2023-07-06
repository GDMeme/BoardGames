import { Player } from './player.js';

export class Game {
    constructor(numberOfPlayers, playerNames) {
        console.log('playerNames is ', playerNames);
        this.players = Array(numberOfPlayers);
        this.playerNames = Array(numberOfPlayers);
        for (let i = 0; i < numberOfPlayers; i++) {
            this.players[i] = new Player();
            this.playerNames[i] = playerNames[i];
        }
        console.log('now playerNames is ', this.playerNames);
        this.playerCounter = 0; // * * playerCounter is 0 indexed!!
        this.numberOfPlayers = numberOfPlayers;
    }
}