export const buildings = [
    {name: 'wheatfield', displayName: 'Wheat Field', cost: 1, income: 1, shopping: false, colour: 'blue', trigger: [1]},
    {name: 'ranch', displayName: 'Ranch', cost: 1, income: 1, shopping: false, colour: 'blue', trigger: [2]},
    {name: 'bakery', displayName: 'Bakery', cost: 1, income: 1, shopping: true, trigger: [2, 3]}, // if colour is not blue, it must be green
    {name: 'cafe', displayName: 'Cafe', cost: 2}, // red is special case
    {name: 'conveniencestore', displayName: 'Convenience Store', cost: 2, income: 3, shopping: true, trigger: [4]},
    {name: 'forest', displayName: 'Forest', cost: 3, income: 1, shopping: false, colour: 'blue', trigger: [5]},
    {name: 'stadium', displayName: 'Stadium', cost: 6}, // purples are special case
    {name: 'tvstation', displayName: 'TV Station', cost: 7},
    {name: 'businesscenter', displayName: 'Business Center', cost: 8},
    {name: 'cheesefactory', displayName: 'Cheese Factory', cost: 5, income: [1], multiplier: 3, trigger: [7]}, // don't need shopping since income is array
    {name: 'furniturefactory', displayName: 'Furniture Factory', cost: 3, income: [5, 11], multiplier: 3, trigger: [8]},
    {name: 'mine', displayName: 'Mine', cost: 6, income: 5, shopping: false, colour: 'blue', trigger: [9]},
    {name: 'familyrestaurant', displayName: 'Family Restaurant', cost: 3}, // red is special case
    {name: 'appleorchard', displayName: 'Apple Orchard', cost: 3, income: 3, shopping: false, colour: 'blue', trigger: [10]},
    {name: 'fruitandvegetablemarket', displayName: 'Fruit and Vegetable Market', cost: 2, income: [0, 13], multiplier: 2, trigger: [11, 12]},
    {name: 'trainstation', displayName: 'Train Station', cost: 4},
    {name: 'shoppingmall', displayName: 'Shopping Mall', cost: 10},
    {name: 'amusementpark', displayName: 'Amusement Park', cost: 16},
    {name: 'radiotower', displayName: 'Radio Tower', cost: 22}
];

export const state = {
    newTurn: 0,
    rolledState: 1,
    bought: 2
}

export const rollState = {
    didNotRoll: 0,
    rolled: 1,
    rolledDoubles: 2, // * * no reroll
    rerolled: 3, // * * no doubles
    rerolledDoubles: 4,
}

export const purpleState = {
    didNotActivate: 0,
    activated: 1,
    gotPlayerIndex: 2,
    gotReceiveIndex: 3,
    activateFinish: 4 // * * So that they cannot reroll if they finished a purple establishment interaction
}