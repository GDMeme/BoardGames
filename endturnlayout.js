export function endTurnLayout() {
    document.getElementById('endturn').style.display = "none";
    document.getElementById('endturn').disabled = true;
    document.getElementById('rolldicetext').style.display = "none";
    document.getElementById('rolldicebutton').disabled = false;
    document.getElementById('endturnbutton').disabled = true;
    document.getElementById('rollnumber').style.display = "none";
    document.getElementById('roll2dicecheckbox').checked = false;
    document.getElementById('buysomething').style.display = "none";
    document.getElementById('rolldoubles').style.display = "none";
    document.getElementById('roll2dicecheckbox').style.display = "inline";
}