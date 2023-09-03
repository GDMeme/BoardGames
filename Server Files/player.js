export class Player {
    constructor(name) {
        this.name = name;
        this.balance = 50;
        this.establishments = Array(15).fill(0);
        this.landmarks = Array(4).fill(false);
        this.establishments[0] = 1; // 1 wheat field
        this.establishments[2] = 1; // 1 bakery
    }
}