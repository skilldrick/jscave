/* Author: 
Skilldrick: skilldrick [at] gmail.com
*/

$(document).ready(function () {
    JsCave.Game.start();
    //js_cave.start();
});

var JsCave = JsCave || {};

JsCave.Game = (function () {
    var that = {};

    that.start = function () {
        canvas = $('#game-board')[0];
        if(canvas.getContext) {
            ctx = canvas.getContext('2d');
            i = 1;
            JsCave.ctx = ctx;
            setInterval(draw, 250);
            setInterval(JsCave.Walls.draw, 250);
        }
    }

    return that;
}());


JsCave.Walls = (function () {
    var that = {};

    that.draw = function () {
        JsCave.ctx.strokeRect(10, 10, 20, 30);
    }

    return that;

}());
        

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(i, i, canvas.width - 2, canvas.height - 2); //game border
    i++;
}