import { end } from './end.js'

export function buy(building_num, player, playerCounter) {// * * 15 16 17 18 are the landmarks
    if (building_num === 0) {
        player.establishments[0]++;
        player.balance--;
        document.querySelector(`#wheatfield${playerCounter + 1}`).innerHTML = 'Wheat field: ' + player.establishments[0];
    } else if (building_num === 1) {
        player.establishments[1]++;
        player.balance--;
        document.querySelector(`#ranch${playerCounter + 1}`).innerHTML = 'Ranch: ' + player.establishments[1];
    } else if (building_num === 2) {
        player.establishments[2]++;
        player.balance--;
        document.querySelector(`#bakery${playerCounter + 1}`).innerHTML = 'Bakery: ' + player.establishments[2];
    } else if (building_num === 3) {
        
    } else if (building_num === 4) {
        
    } else if (building_num === 5) {
        
    } else if (building_num === 6) {
        
    } else if (building_num === 7) {
        
    } else if (building_num === 8) {
        
    } else if (building_num === 9) {
        
    } else if (building_num === 10) {
        
    } else if (building_num === 11) {
        
    } else if (building_num === 12) {
        
    } else if (building_num === 13) {
        
    } else if (building_num === 14) {
        
    } else if (building_num === 15) {
        
    } else if (building_num === 16) {
        
    } else if (building_num === 17) {
        
    } else if (building_num === 18) {
        
    }
    // check if winner
    if (player.landmarks.every(v => v === true)) {
        document.getElementById('entiregame').style.display = "none";
        end();
    }

    // disable all shop buttons after buying something
    document.getElementById('buywheatfieldbutton').disabled = true;
    document.getElementById('buyranchbutton').disabled = true;
    document.getElementById('buybakerybutton').disabled = true;
    document.getElementById('buycafebutton').disabled = true;
    document.getElementById('buyconveniencestorebutton').disabled = true;
    document.getElementById('buyforestbutton').disabled = true;
    document.getElementById('buystadiumbutton').disabled = true;
    document.getElementById('buytvstationbutton').disabled = true;
    document.getElementById('buybusinesscenterbutton').disabled = true;
    document.getElementById('buycheesefactorybutton').disabled = true;
    document.getElementById('buyfurniturefactorybutton').disabled = true;
    document.getElementById('buyminebutton').disabled = true;
    document.getElementById('buyfamilyrestaurantbutton').disabled = true;
    document.getElementById('buyappleorchardbutton').disabled = true;
    document.getElementById('buyfruitandvegetablemarketbutton').disabled = true;

    document.getElementById('buytrainstationbutton').disabled = true;
    document.getElementById('buyshoppingmallbutton').disabled = true;
    document.getElementById('buyamusementparkbutton').disabled = true;
    document.getElementById('buyradiotowerbutton').disabled = true;
}

export function enableShop(balance) {
    if (balance === 0) {
        document.getElementById('buywheatfieldbutton').disabled = true;
        document.getElementById('buyranchbutton').disabled = true;
        document.getElementById('buybakerybutton').disabled = true;
        document.getElementById('buycafebutton').disabled = true;
        document.getElementById('buyconveniencestorebutton').disabled = true;
        document.getElementById('buyforestbutton').disabled = true;
        document.getElementById('buystadiumbutton').disabled = true;
        document.getElementById('buytvstationbutton').disabled = true;
        document.getElementById('buybusinesscenterbutton').disabled = true;
        document.getElementById('buycheesefactorybutton').disabled = true;
        document.getElementById('buyfurniturefactorybutton').disabled = true;
        document.getElementById('buyminebutton').disabled = true;
        document.getElementById('buyfamilyrestaurantbutton').disabled = true;
        document.getElementById('buyappleorchardbutton').disabled = true;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = true;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    }
    if (balance === 1) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;

        document.getElementById('buycafebutton').disabled = true;
        document.getElementById('buyconveniencestorebutton').disabled = true;
        document.getElementById('buyforestbutton').disabled = true;
        document.getElementById('buystadiumbutton').disabled = true;
        document.getElementById('buytvstationbutton').disabled = true;
        document.getElementById('buybusinesscenterbutton').disabled = true;
        document.getElementById('buycheesefactorybutton').disabled = true;
        document.getElementById('buyfurniturefactorybutton').disabled = true;
        document.getElementById('buyminebutton').disabled = true;
        document.getElementById('buyfamilyrestaurantbutton').disabled = true;
        document.getElementById('buyappleorchardbutton').disabled = true;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = true;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    } else if (balance === 2) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;
        document.getElementById('buycafebutton').disabled = false;
        document.getElementById('buyconveniencestorebutton').disabled = false;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = false;

        document.getElementById('buyforestbutton').disabled = true;
        document.getElementById('buystadiumbutton').disabled = true;
        document.getElementById('buytvstationbutton').disabled = true;
        document.getElementById('buybusinesscenterbutton').disabled = true;
        document.getElementById('buycheesefactorybutton').disabled = true;
        document.getElementById('buyfurniturefactorybutton').disabled = true;
        document.getElementById('buyminebutton').disabled = true;
        document.getElementById('buyfamilyrestaurantbutton').disabled = true;
        document.getElementById('buyappleorchardbutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = true;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    } else if (balance === 3) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;
        document.getElementById('buycafebutton').disabled = false;
        document.getElementById('buyconveniencestorebutton').disabled = false;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = false;
        document.getElementById('buyforestbutton').disabled = false;
        document.getElementById('buyfurniturefactorybutton').disabled = false;
        document.getElementById('buyfamilyrestaurantbutton').disabled = false;
        document.getElementById('buyappleorchardbutton').disabled = false;

        document.getElementById('buystadiumbutton').disabled = true;
        document.getElementById('buytvstationbutton').disabled = true;
        document.getElementById('buybusinesscenterbutton').disabled = true;
        document.getElementById('buycheesefactorybutton').disabled = true;
        document.getElementById('buyminebutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = true;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    } else if (balance === 4) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;
        document.getElementById('buycafebutton').disabled = false;
        document.getElementById('buyconveniencestorebutton').disabled = false;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = false;
        document.getElementById('buyforestbutton').disabled = false;
        document.getElementById('buyfurniturefactorybutton').disabled = false;
        document.getElementById('buyfamilyrestaurantbutton').disabled = false;
        document.getElementById('buyappleorchardbutton').disabled = false;

        document.getElementById('buystadiumbutton').disabled = true;
        document.getElementById('buytvstationbutton').disabled = true;
        document.getElementById('buybusinesscenterbutton').disabled = true;
        document.getElementById('buycheesefactorybutton').disabled = true;
        document.getElementById('buyminebutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = false;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    } else if (balance === 5) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;
        document.getElementById('buycafebutton').disabled = false;
        document.getElementById('buyconveniencestorebutton').disabled = false;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = false;
        document.getElementById('buyforestbutton').disabled = false;
        document.getElementById('buycheesefactorybutton').disabled = false;
        document.getElementById('buyfurniturefactorybutton').disabled = false;
        document.getElementById('buyfamilyrestaurantbutton').disabled = false;
        document.getElementById('buyappleorchardbutton').disabled = false;

        document.getElementById('buystadiumbutton').disabled = true;
        document.getElementById('buytvstationbutton').disabled = true;
        document.getElementById('buybusinesscenterbutton').disabled = true;
        document.getElementById('buyminebutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = false;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    } else if (balance === 6) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;
        document.getElementById('buycafebutton').disabled = false;
        document.getElementById('buyconveniencestorebutton').disabled = false;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = false;
        document.getElementById('buyforestbutton').disabled = false;
        document.getElementById('buystadiumbutton').disabled = false;
        document.getElementById('buycheesefactorybutton').disabled = false;
        document.getElementById('buyfurniturefactorybutton').disabled = false;
        document.getElementById('buyminebutton').disabled = false;
        document.getElementById('buyfamilyrestaurantbutton').disabled = false;
        document.getElementById('buyappleorchardbutton').disabled = false;

        document.getElementById('buytvstationbutton').disabled = true;
        document.getElementById('buybusinesscenterbutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = false;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    } else if (balance === 7) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;
        document.getElementById('buycafebutton').disabled = false;
        document.getElementById('buyconveniencestorebutton').disabled = false;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = false;
        document.getElementById('buyforestbutton').disabled = false;
        document.getElementById('buystadiumbutton').disabled = false;
        document.getElementById('buytvstationbutton').disabled = false;
        document.getElementById('buycheesefactorybutton').disabled = false;
        document.getElementById('buyfurniturefactorybutton').disabled = false;
        document.getElementById('buyminebutton').disabled = false;
        document.getElementById('buyfamilyrestaurantbutton').disabled = false;
        document.getElementById('buyappleorchardbutton').disabled = false;

        document.getElementById('buybusinesscenterbutton').disabled = true;

        document.getElementById('buytrainstationbutton').disabled = false;
        document.getElementById('buyshoppingmallbutton').disabled = true;
        document.getElementById('buyamusementparkbutton').disabled = true;
        document.getElementById('buyradiotowerbutton').disabled = true;
    } else if (balance > 7) {
        document.getElementById('buywheatfieldbutton').disabled = false;
        document.getElementById('buyranchbutton').disabled = false;
        document.getElementById('buybakerybutton').disabled = false;
        document.getElementById('buycafebutton').disabled = false;
        document.getElementById('buyconveniencestorebutton').disabled = false;
        document.getElementById('buyfruitandvegetablemarketbutton').disabled = false;
        document.getElementById('buyforestbutton').disabled = false;
        document.getElementById('buystadiumbutton').disabled = false;
        document.getElementById('buytvstationbutton').disabled = false;
        document.getElementById('buybusinesscenterbutton').disabled = false;
        document.getElementById('buycheesefactorybutton').disabled = false;
        document.getElementById('buyfurniturefactorybutton').disabled = false;
        document.getElementById('buyminebutton').disabled = false;
        document.getElementById('buyfamilyrestaurantbutton').disabled = false;
        document.getElementById('buyappleorchardbutton').disabled = false;

        document.getElementById('buytrainstationbutton').disabled = false;
        
        if (balance >= 10) {
            document.getElementById('buyshoppingmallbutton').disabled = false;
            if (balance >= 16) {
                document.getElementById('buyamusementparkbutton').disabled = false;
                if (balance >= 22) {
                    document.getElementById('buyradiotowerbutton').disabled = false;
                } else {
                    document.getElementById('buyradiotowerbutton').disabled = true;
                }
            } else {
                document.getElementById('buyamusementparkbutton').disabled = true;
                document.getElementById('buyradiotowerbutton').disabled = true;
            }
        } else {
            document.getElementById('buyshoppingmallbutton').disabled = true;
            document.getElementById('buyamusementparkbutton').disabled = true;
            document.getElementById('buyradiotowerbutton').disabled = true;
        }
    }
    
}