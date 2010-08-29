/* Author: 
Skilldrick: skilldrick [at] gmail.com
*/

$(document).ready(function () {
    JsCave.Game.start();
});

var JsCave = JsCave || {};

JsCave.Game = (function () {
    function gameOver() {
        alert('Game Over!!!');
    }

    var that = {},
        canvas,
        ctx,
        width,
        height;

    that.start = function () {
        canvas = $('#game-board')[0];
        width = JsCave.width = canvas.width;
        height = JsCave.height = canvas.height;
        
        if(canvas.getContext) {
            ctx = canvas.getContext('2d');
            i = 1;
            JsCave.ctx = that.ctx = ctx;
            that.gameLoop();
        }
    }

    that.gameLoop = function () {
        that.draw();
        if(JsCave.gameOver) {
            gameOver();
        }
        else {
            setTimeout(that.gameLoop, 100);
        }
    }


    that.draw = function () {
        that.ctx.clearRect(0, 0, width, height);
        JsCave.Walls.draw();
        JsCave.Snake.draw();
        draw_border();
    }

    function draw_border() {
        ctx.strokeRect(1, 1, width - 2, width -2);
    }

    return that;
}());


JsCave.Snake = (function () {
    var that = {};
    var height = 60;
    var dy = 1;
    var ddy = 1;
    var pressed = false;

    $(document).keydown(function (event) {
        if(event.keyCode == 32) {
            pressed = true;
        }
    });

    $(document).keyup(function (event) {
        if(event.keyCode == 32) {
            pressed = false;
        }
    });

    function calculateDirection() {
        if(pressed) {
            dy -= ddy;
        }
        else {
            dy += ddy;
        }
    } 
 
    that.draw = function () {
        calculateDirection();
        if(pressed) {
            height += dy;
        }
        else {
            height += dy;
        }
        JsCave.ctx.fillRect(10, height, 5, 5);
        if(that.collision()) {
           JsCave.gameOver = true;
        }
    }

    that.collision = function () {
        return height < 0 || height > JsCave.height
    }

    return that;
}());


JsCave.Walls = (function () {
    var that = {},
        tunnelHeight = 50,
        offset = 30,
        offArray = [];
        counter = 0,
        blockSize = 5,
        lastGoUp = 0;



    function fillArray() {
        offArray.shift();
        while(offArray.length * blockSize < JsCave.width) {
            offArray.push(nextOffset());
        }
    }

    function getZeroOrOne() {
        return Math.floor(Math.random() * 2);
    }
        

    function nextOffset() {
        var minOffset = 0;
        var maxOffset = JsCave.height - tunnelHeight;
        var goUp = getZeroOrOne();
        if(lastGoUp) {
            goUp = getZeroOrOne() || goUp;
        }
        else {
            goUp = goUp && getZeroOrOne();
        }
        lastGoUp = goUp;
        if(goUp) {
            offset -= 1;
            if(offset < minOffset) {
                offset += 1;
            }
        }
        else {
            offset += 1;
            if(offset > maxOffset) {
                offset -= 1;
            }
        }
        return offset;
    }

    that.draw = function () {
        var width = JsCave.width;
        var height = JsCave.height;
        fillArray();
        for(var i = 0; i < offArray.length; i+=1) {
            var topEdge = 0;
            var topHeight = offArray[i];
            var bottomEdge = topHeight + tunnelHeight;
            var bottomHeight = height - bottomEdge;
            JsCave.ctx.fillRect(i * blockSize, topEdge,
                                blockSize, topHeight);
            JsCave.ctx.fillRect(i * blockSize, bottomEdge,
                                blockSize, bottomHeight);
        }
    }

    return that;

}());
        

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(i, i, canvas.width - 2, canvas.height - 2); //game border
    i++;
}
