/* Author: 
Skilldrick: skilldrick [at] gmail.com
*/

$(document).ready(function () {
    var canvas = $('#game-board')[0];
    if(canvas.getContext) {
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(10, 10, 50, 50);

        
    }
});