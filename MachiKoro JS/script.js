import { buy } from './shop.js';

import { start } from './start.js'

import { end } from './end.js'



document.getElementById('numberofplayersselect').onchange = function() {
    document.getElementById('submitplayersbutton').disabled = false;
}

document.getElementById('submitplayersbutton').onclick = function() {
    start(document.getElementById('numberofplayersselect').value);
    end();
}

document.querySelector('#buywheatfieldbutton').addEventListener('click', () => buy(0));

document.getElementById('buywheatfieldbutton').onclick = function() {
    document.querySelector('#test').innerHTML = 'injected';
}

// (function() {
//     console.log('hi!');

// })();