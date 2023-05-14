let wheat_fields = 0;

export function buy(building_num, player) {
    if (building_num === 0) {
        player.establishments[0]++;
        document.querySelector('#wheatfield').innerHTML = `Wheat fields: ${wheat_fields}`;
    }
}