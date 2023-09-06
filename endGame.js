export function endGame(playerCounter) {
    document.querySelector('#titletext').innerHTML = `<p> <div> Player ${playerCounter + 1} wins! </div> </p> <div> Thanks for playing! </div>`;
}