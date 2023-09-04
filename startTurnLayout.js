export function startTurnLayout(rollTwoDice) {
    document.getElementById('endturn').disabled = true;
    document.getElementById('rolldicetext').style.display = "none";
    document.getElementById('rolldicebutton').disabled = false;
    document.getElementById('endturnbutton').disabled = true;
    document.getElementById('rollnumber').style.display = "none";
    document.getElementById('roll2dicecheckbox').checked = false;
    document.getElementById('buysomething').style.display = "none";
    document.getElementById('rolldoubles').style.display = "none";
    document.getElementById('roll2dicecheckbox').style.display = "inline";

    // * * Check Train Station
    document.getElementById('roll2dicecheckbox').disabled = !rollTwoDice;

    document.getElementById('rerollbutton').disabled = true;
    document.getElementById('rolldicetext').style.display = "block";
    document.getElementById('rolldice').style.display = "block";
    document.getElementById('endturn').style.display = "block";
    document.getElementById('rollnumber').style.display = "none";

    // * * Check Train Station
    document.getElementById('roll2dicecheckbox').disabled = !rollTwoDice;
}