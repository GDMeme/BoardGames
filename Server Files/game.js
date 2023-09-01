export class Game {
    constructor() {
        this.players; // array containing Player objects 
        this.playerCounter = 0; // * * playerCounter is 0 indexed!!
        this.ID;
        this.name
        this.numberOfPlayers;

        this.state = 0;
        this.TVStationActivatedState = 0; 
        this.businessCenterActivatedState = 0;
        this.businessTargetPlayerIndex = -1;
        this.businessReceiveIndex = -1;
        this.income;
    }
}