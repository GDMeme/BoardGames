import { start } from './start.js'

document.getElementById('numberofplayersselect').onchange = function() {
    document.getElementById('submitplayersbutton').disabled = false;
}

// this is the whole game
document.getElementById('submitplayersbutton').onclick = function() {
    start(document.getElementById('numberofplayersselect').value);
}

// (function() {
//     console.log('hi!');

// })();