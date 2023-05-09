import { buy } from './shop.js';

(function() {
    console.log('hi!');
    document.querySelector('#test').innerHTML = 'injected';
})();

document.querySelector('#buywheatfieldbutton').addEventListener('click', () => buy(1));