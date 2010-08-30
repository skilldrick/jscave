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

    function draw_border() {
        ctx.strokeRect(1, 1, width - 2, width -2);
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
        JsCave.Snake.init();
        JsCave.Walls.init();
        
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

    return that;
}());


JsCave.Snake = (function () {
    var that = {};
    var vpos; //set it init()
    var xpos = 20;
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

    that.init = function () {
        vpos = JsCave.height / 3;
    }
 
    that.draw = function () {
        calculateDirection();
        if(pressed) {
            vpos += dy;
        }
        else {
            vpos += dy;
        }
        JsCave.ctx.fillRect(xpos, vpos, 5, 5);
        if(that.collision()) {
           JsCave.gameOver = true;
        }
    }

    that.collision = function () {
        return vpos < 0 || vpos > JsCave.height;
    }

    return that;
}());


JsCave.Walls = (function () {
    function fillArray() {
        offArray.shift();
        while(offArray.length * blockSize < JsCave.width) {
            var topOffset = nextOffset();
            var bottomOffset = Math.floor(topOffset + tunnelHeight);
            offArray.push([topOffset, bottomOffset]);
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

    var that = {},
        tunnelHeight, //set in init()
        offset,
        offArray = [];
        counter = 0,
        blockSize = 5,
        lastGoUp = 0;

    that.init = function () {
        tunnelHeight = JsCave.height * 3 / 4;
        offset = (JsCave.height - tunnelHeight) / 2;
    }

    that.draw = function () {
        var width = JsCave.width;
        var height = JsCave.height;
        fillArray();
        tunnelHeight -= 0.5;
        for(var i = 0; i < offArray.length; i+=1) {
            var topEdge = 0;
            var topHeight = offArray[i][0];
            var bottomEdge = offArray[i][1];
            var bottomHeight = height - bottomEdge;
            JsCave.ctx.fillRect(i * blockSize, topEdge,
                                blockSize, topHeight);
            JsCave.ctx.fillRect(i * blockSize, bottomEdge,
                                blockSize, bottomHeight);
        }
    }

    return that;

}());
