/* author: 
Skilldrick: skilldrick [at] gmail.com
*/

function hsl(hue, saturation, luminance) {
    return "hsl(" + hue + ", " + saturation + "%, " + luminance + "%)";
}

function rgb(r, g, b) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function rgba(r, g, b, a) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

$(document).ready(function () {
    JsCave.Game.start();
});

var JsCave = JsCave || {};

JsCave.Game = (function () {
    function gameOver() {
        that.ctx.save();
        that.ctx.fillStyle = rgba(255, 255, 255, 0.5);
        that.ctx.fillRect(0, 0, width, height);
        that.ctx.restore();
        JsCave.Text.renderString('game over', 15, 5, 2);
        JsCave.Text.renderString('press r', 17, 5, 4);
        JsCave.Text.renderString('to retry', 16, 5, 5);
    }

    function clearScreen() {
        that.ctx.clearRect(0, 0, width, height);
    }

    function welcomeScreen() {
        JsCave.Text.renderString('jscave', 20, 5, 2);
        JsCave.Text.renderString('press space', 11, 5, 4);
        JsCave.Text.renderString('to begin', 16, 5, 5);
        $(document).keydown(function (event) {
            if(event.keyCode == 32) {
                $(document).unbind(event);
                gameLoop();
            }
        });
        $(document).keydown(function (event) {
            if(event.keyCode == 82) {
                location.reload();
            }
        });
    }

    function gameLoop() {
        score += scoreIncrement;
        that.draw();
        if(checkCollision()) {
            drawCollision(0, gameOver);
        }
        else if(JsCave.gameOver) {
            gameOver();
        }
        else {
            setTimeout(gameLoop, 100);
        }
    }

    function drawBorder() {
        ctx.strokeRect(0.5, 0.5, width - 1, width - 1);
    }

    function drawBackground() {
        var progression = JsCave.Walls.progression();
        var hue = Math.floor(100 - (progression * 100));
        that.ctx.save();
        that.ctx.fillStyle = hsl(hue, 70, 50);
        that.ctx.fillRect(0, 0, width, height);
        that.ctx.restore();
    }

    function drawScore() {
        $('#htmlscore p').html(score);
    }

    function checkCollision() {
        return JsCave.Collision.detect();
    }

    function drawCollision(count, callback) {
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
            setTimeout(drawCollision, 100, count + 1, callback);
        }
        else {
            if(callback !== undefined) {
                callback();
            }
        }
    }

    var that = {},
        ctx,
        scorectx,
        width,
        height,
        score = 0,
        scoreIncrement = 5;
    

    that.start = function () {
        var canvas = $('#game-board')[0];
        width = JsCave.width = canvas.width;
        height = JsCave.height = canvas.height;
        var scoreCanvas = $('#score')[0];
        JsCave.Snake.init();
        JsCave.Walls.init();
        
        if(canvas.getContext) {
            ctx = canvas.getContext('2d');
            scorectx = scoreCanvas.getContext('2d');
            i = 1;
            JsCave.ctx = that.ctx = ctx;
            JsCave.scorectx = that.scorectx = scorectx;
            welcomeScreen();
        }
    }

    that.draw = function () {
        clearScreen();
        drawBackground();
        JsCave.Walls.draw();
        JsCave.Snake.draw();
        drawBorder();
        drawScore();
    }

    return that;
}());


JsCave.Collision = (function () {
    var that = {};

    that.detect = function () {
        var snakePos = JsCave.Snake.position();
        var wallsPos = JsCave.Walls.offsetAt(snakePos.frontEdge);
        var wallHit = snakePos.topEdge < wallsPos[0] ||
            snakePos.bottomEdge > wallsPos[1];
        var barrierHit = false;
        if(wallsPos[2] !== false) {
            barrierHit = snakePos.topEdge < (wallsPos[2] + JsCave.Barriers.height) &&
                snakePos.bottomEdge > wallsPos[2];
        }
        return wallHit || barrierHit;
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

    function fillHistory(vpos) {
        while(history.length <= historyMax) {
            history.push(vpos);
        }
        history.shift();
    }

    var that = {};
    var vpos;
    var history = [];
    var historyMax = 4;
    var hpos;
    var size = 5;
    var dy = 1;
    var ddy = 1.3;
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
        hpos = size * historyMax;
    }
 
    that.draw = function () {
        calculateDirection();
        if(pressed) {
            vpos += dy;
        }
        else {
            vpos += dy;
        }
        fillHistory(vpos);
        for(var i = 0; i < history.length; i+=1) {
            JsCave.ctx.fillRect(i * size, history[i], size, size);
        }
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


JsCave.Barriers = (function () {
    function calculate(topMax, bottomMax) {
        while(true) {
            if(goes > 60) {
                return false;
            }
            var number = Math.floor(Math.random() * JsCave.height);
            if((number + height) > topMax && number < bottomMax) {
                goes = 0;
                return number;
            }
            goes += 1;
        }
    }
    
    var that = {};
    var distance = 10;
    var count = 0;
    var width = 5;
    var height = 20;
    var goes = 0;
    var gracePeriod = 2; //this many barriers are skipped at beginning
    that.height = height;

    that.getNew = function (topMax, bottomMax) {
        if(count >= distance) {
            count = 0;
            if(gracePeriod > 0) {
                gracePeriod -= 1;
                return false;
            }
            return calculate(topMax, bottomMax);
        }
        count += 1;
        return false;
    }

    that.draw = function (left, top) {
        JsCave.ctx.fillRect(left, top, width, height);
    }

    return that;
}());


JsCave.Walls = (function () {
    function fillArray() {
        offArray.shift();
        while(offArray.length * hBlockSize < JsCave.width) {
            var topOffset = nextOffset();
            var bottomOffset = Math.floor(topOffset + tunnelHeight);
            var barrierTop = JsCave.Barriers.getNew(topOffset, bottomOffset);
            offArray.push([topOffset, bottomOffset, barrierTop]);
        }
    }

    function goUpOrDown() {
        var goUp;
        if(lastGoUp) { //increase chance of going up again
            goUp = Math.random() < directionBias;
        }
        else { //increase chance of going down again
            goUp = Math.random() > directionBias;
        }
        lastGoUp = goUp;
        return goUp;
    }

    function nextOffset() {
        var minOffset = 0;
        var maxOffset = JsCave.height - tunnelHeight;
        var goUp = goUpOrDown();

        if(goUp) {
            offset -= vBlockSize;
            if(offset < minOffset) { //reverse direction if limit reached
                offset += vBlockSize;
                lastGoUp = !goUp;
            }
        }
        else {
            offset += vBlockSize;
            if(offset > maxOffset) { //reverse direction if limit reached
                offset -= vBlockSize;
                lastGoUp = !goUp;
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
        hBlockSize = 5,
        vBlockSize = 2,
        lastGoUp = 0,
        directionBias = 0.9, //likelihood of tunnel direction continuing
        narrowing = 0.1; //how much the tunnel narrows each time

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
            var barrierTop = offArray[i][2];
            JsCave.ctx.fillRect(i * hBlockSize, topEdge,
                                hBlockSize, topHeight);
            JsCave.ctx.fillRect(i * hBlockSize, bottomEdge,
                                hBlockSize, bottomHeight);
            if(barrierTop !== false) {
                JsCave.Barriers.draw(i * hBlockSize, barrierTop);
            }
        }
        JsCave.ctx.restore();
    }

    that.offsetAt = function (position) {
        var index = Math.floor(position / hBlockSize);
        return offArray[index - 1];
    }

    that.progression = function () {
        return (startingHeight - tunnelHeight) / startingHeight;
    }

    return that;

}());

JsCave.Text = (function () {
    function loadFont() {
        if(font === undefined) {
            $.ajax({async: false,
                    dataType: 'json',
                    url: 'js/font.json',
                    success: function(data) {
                        font = data;
                    }
                   });
        }
    }
            
    function drawSquare(xOffset, yOffset) {
        JsCave.ctx.fillRect(xOffset * blockSize, yOffset * blockSize, blockSize, blockSize);
    }

    function drawLetter(letter, xOffset, yOffset) {
        for(var row = 0; row < letter.length; row+=1) {
            for(var col = 0; col < letter[row].length; col += 1) {
                if(letter[row][col]) {
                    drawSquare(col + xOffset, row + yOffset);
                }
            }
        }
    }

    var that = {};
    var blockSize = 2;
    var font;
    
    that.renderString = function (str, x, y, lineNumber) {
        loadFont();
        str = str.toUpperCase();
        for(var i = 0; i < str.length; i+=1) {
            var letter = font[str[i]];
            drawLetter(letter, i * 4 + x, lineNumber * 7 + y);
        }
    }
    
    return that;
}());