export class Player {
    constructor() {
        this.balance = 10000; // TODO: change this back to 0
        this.establishments = Array(15).fill(0);
        this.landmarks = Array(4).fill(false);
        this.establishments[0] = 1; // 1 wheat field
        this.establishments[2] = 1; // 1 bakery
    }
}