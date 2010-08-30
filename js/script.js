/* Author: 
Skilldrick: skilldrick [at] gmail.com
*/

function hsl(hue, saturation, luminance) {
    return "hsl(" + hue + ", " + saturation + "%, " + luminance + "%)";
}

function rgb(r, g, b) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

$(document).ready(function () {
    JsCave.Game.start();
});

var JsCave = JsCave || {};

JsCave.Game = (function () {
    function gameOver() {
        //alert('Game Over!!!');
    }

    function drawBorder() {
        ctx.strokeRect(1, 1, width - 2, width -2);
    }

    function drawBackground() {
        var progression = JsCave.Walls.progression();
        var hue = Math.floor(100 - (progression * 100));
        that.ctx.save();
        that.ctx.fillStyle = hsl(hue, 70, 50);
        that.ctx.fillRect(0, 0, width, height);
        that.ctx.restore();
    }

    function checkCollision() {
        return JsCave.Collision.detect();
    }

    function drawCollision(count) {
        if(count === undefined) {
            count = 0;
        }
        count = +count;
        var snakeCentre = JsCave.Snake.centre();
        that.ctx.beginPath();
        that.ctx.strokeStyle = "Red";
        that.ctx.arc(snakeCentre[0], snakeCentre[1], count * 4 + 4, 0, Math.PI * 2, true);
        that.ctx.stroke();
        if(count < 5) {
            setTimeout(drawCollision, 100, [count + 1]);
        }
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
        if(checkCollision()) {
            drawCollision();
            gameOver();
        }
        else if(JsCave.gameOver) {
            gameOver();
        }
        else {
            setTimeout(that.gameLoop, 100);
        }
    }

    that.draw = function () {
        that.ctx.clearRect(0, 0, width, height);
        drawBackground();
        JsCave.Walls.draw();
        JsCave.Snake.draw();
        drawBorder();
    }

    return that;
}());


JsCave.Collision = (function () {
    var that = {};

    that.detect = function () {
        var snakePos = JsCave.Snake.position();
        var wallsPos = JsCave.Walls.offsetAt(snakePos.frontEdge);
        return snakePos.topEdge < wallsPos[0] ||
            snakePos.bottomEdge > wallsPos[1];
    }

    return that;
}());

JsCave.Snake = (function () {
    function calculateDirection() {
        if(pressed) {
            dy -= ddy;
        }
        else {
            dy += ddy;
        }
    }

    var that = {};
    var vpos; //set it init()
    var hpos = 20;
    var size = 5;
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
        JsCave.ctx.fillRect(hpos, vpos, size, size);
    }

    that.position = function () {
        return {
            frontEdge:  hpos + size,
            topEdge:    Math.floor(vpos),
            bottomEdge: Math.floor(vpos) + size
        }
    }

    that.centre = function () {
        var x = hpos + (size / 2);
        var y = vpos + (size / 2);
        return [x, y];
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
        startingHeight,
        tunnelHeight, //set in init()
        offset,
        offArray = [];
        counter = 0,
        blockSize = 5,
        lastGoUp = 0,
        narrowing = 0.2;

    that.init = function () {
        startingHeight = tunnelHeight = JsCave.height * 3 / 4;
        offset = (JsCave.height - tunnelHeight) / 2;
    }

    that.draw = function () {
        var width = JsCave.width;
        var height = JsCave.height;
        fillArray();
        tunnelHeight -= narrowing;
        JsCave.ctx.save();
        JsCave.ctx.fillStyle = rgb(70, 60, 40);
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
        JsCave.ctx.restore();
    }

    that.offsetAt = function (position) {
        var index = Math.floor(position / blockSize);
        return offArray[index - 1];
    }

    that.progression = function () {
        return (startingHeight - tunnelHeight) / startingHeight;
    }

    return that;

}());
