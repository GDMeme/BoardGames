export class Game {
    constructor() {
        let players; // array containing Player objects 
        this.playerCounter = 0; // * * playerCounter is 0 indexed!!
        let ID, name, numberOfPlayers;

        let state = 0;
        let TVStationActivatedState = 0; 
        // * * 0: TV Station did not activate
        // * * 1: TV Station activated, did not steal coins yet
        // * * 2: TV Station activated, already stole coins
        let businessCenterActivatedState = 0;
        let businessTargetPlayerIndex = -1;
        let businessReceiveIndex = -1;
        let income;
    }
}