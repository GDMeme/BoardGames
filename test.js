function reset(game) {
    game.balance = 0;
}

let myObject = {
    balance: 5
}

reset(myObject);

console.log(myObject.balance)