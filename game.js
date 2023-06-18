import { Player } from './player.js';

export class Game {
    constructor(numberOfPlayers) {
        this.players = Array(numberOfPlayers);
        for (let i = 0; i < numberOfPlayers; i++) {
            this.players[i] = new Player();
        }
        this.playerCounter = 0; // * * playerCounter is 0 indexed!!
    }
}