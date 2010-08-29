/* Author: 
Skilldrick: skilldrick [at] gmail.com
*/

$(document).ready(function () {
    JsCave.Game.start();
    //js_cave.start();
});

var JsCave = JsCave || {};

JsCave.Game = (function () {
    var that = {},
        canvas,
        ctx,
        width,
        height;

    that.start = function () {
        canvas = $('#game-board')[0];
        width = canvas.width;
        height = canvas.height;
        
        if(canvas.getContext) {
            ctx = canvas.getContext('2d');
            i = 1;
            JsCave.ctx = that.ctx = ctx;
            that.gameLoop();
        }
    }

    that.gameLoop = function () {
        that.draw();
        setTimeout(that.gameLoop, 200);
    }

    that.draw = function () {
        that.ctx.clearRect(0, 0, width, height);
        JsCave.Walls.draw();
        draw_border();
    }

    function draw_border() {
        ctx.strokeRect(1, 1, width - 2, width -2);
    }

    return that;
}());


JsCave.Walls = (function () {
    var that = {};
    var width = 100;
    var offset = 0;
    var offArray = [50, 51, 52, 53, 54, 55, 54, 53, 52, 51];
    var counter = 0;
    var blockSize = 5;
    

    that.draw = function () {
        for(var i = 0; i < offArray.length; i+=1) {
            JsCave.ctx.fillRect(i * blockSize, 0, blockSize, offArray[i]);
        }
    }

    return that;

}());
        

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(i, i, canvas.width - 2, canvas.height - 2); //game border
    i++;
}