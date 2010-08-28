/* Author: 
Skilldrick: skilldrick [at] gmail.com
*/

$(document).ready(function () {
    canvas = $('#game-board')[0];
    if(canvas.getContext) {
        ctx = canvas.getContext('2d');
        i = 0;
        setInterval(draw, 250);

        
    }
});


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(i, i, canvas.width, canvas.height); //game border
    i++;
}