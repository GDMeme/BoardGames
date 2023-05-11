let wheat_fields = 0;

export function buy(building_num) {
    if (building_num === 0) {
        wheat_fields++;
        document.querySelector('#wfs').innerHTML = `Wheat fields: ${wheat_fields}`;
    }
}