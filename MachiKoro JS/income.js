// TODO: remember to include shopping mall

// TODO: remember to add/change html stuff

export function income(roll, players, playerCounter, buildings) {
    // red activate
    if (roll === 3) {
        let index = playerCounter; // * * index is 0 indexed!!
        while (players[playerCounter].balance > 0) {
            index--;
            if (index === -1) {
                index = players.length - 1;
            } 
            if (index === playerCounter) {
                break;
            }
            let numberOfCafe = players[index].establishments[3]
            let moneyOwed = players[index].landmarks[1] ? (2 * numberOfCafe) : numberOfCafe; // shopping mall
            if (moneyOwed > players[playerCounter].balance) {
                moneyOwed = players[playerCounter].balance
            }
            players[playerCounter].balance -= moneyOwed;
            players[index].balance += moneyOwed;
        }
    } else if (roll === 10) {

    }

    // TODO: purple activate

    let activated_buildings;
    let currentPlayer = 0;
    for (const player of players) {
        if (currentPlayer === playerCounter) {
            // will only return green and blue buildings
            activated_buildings = buildings.map((building, buildingIndex) => building.trigger?.includes(roll) ? buildingIndex : undefined).filter(x => x !== undefined); 
        } else {
            activated_buildings = buildings.map((building, buildingIndex) => (building.trigger?.includes(roll) && building.colour === 'blue') ? buildingIndex : undefined).filter(x => x !== undefined);
        }
        for (const buildingIndex of activated_buildings) {
            if (Array.isArray(buildings[buildingIndex].income)) { // shopping mall doesn't apply here
                let numberOfSpecial = 0;
                for (const incomeIndex of buildings[buildingIndex.income]) {
                    numberOfSpecial += player.establishments[incomeIndex];
                }
                player.balance += buildings[buildingIndex].multiplier * numberOfSpecial;
            } else {
                if (buildings[buildingIndex].shopping === true && player.landmarks[1]) { // shopping mall
                player.balance += player.establishments[buildingIndex] * (buildings[buildingIndex].income + 1);
                } else {
                player.balance += player.establishments[buildingIndex] * buildings[buildingIndex].income;
                }
            }
        }
        currentPlayer++;
    }
}