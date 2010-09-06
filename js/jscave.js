/* author: 
Skilldrick: skilldrick [at] gmail.com
*/

/*global $*/

"use strict";

function hsl(hue, saturation, luminance) {
    return "hsl(" + hue + ", " + saturation + "%, " + luminance + "%)";
}

function rgb(r, g, b) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function rgba(r, g, b, a) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

var JsCave = {};

$(document).ready(function () {
    JsCave.init();
});

JsCave.init = function () {
    JsCave.setCanvas();
    JsCave.gameOver = false;
    JsCave.restart = false;
    JsCave.Game = JsCave.GameMaker();
    JsCave.Collision = JsCave.CollisionMaker();
    JsCave.Barriers = JsCave.BarriersMaker();
    JsCave.Game.start();
};

JsCave.setCanvas = function () {
    var queryString = window.location.search.substring(1);
    var canvasSizes = {
        "tall": [128, 512],
        "wide": [512, 128],
        "big": [512, 512]
    }

    var canvasSize = [128, 128];

    if(queryString in canvasSizes) {
        canvasSize = canvasSizes[queryString];
    }

    $('#game-board')[0].width = canvasSize[0];
    $('#game-board')[0].height = canvasSize[1];
    $('#score')[0].width = canvasSize[0];
}


JsCave.GameMaker = function () {
    var that = {},
        canvas,
        ctx,
        width,
        height,
        speed = 100;
    
    function gameOver() {
        JsCave.gameOver = true;
        that.ctx.save();
        that.ctx.fillStyle = rgba(255, 255, 255, 0.5);
        that.ctx.fillRect(0, 0, width, height);
        that.ctx.restore();
        JsCave.Text.renderString('game over', 5, 2);
        JsCave.Text.renderString('press r', 5, 4);
        JsCave.Text.renderString('to retry', 5, 5);
    }

    function clearScreen() {
        that.ctx.clearRect(0, 0, width, height);
    }

    function fillWithWhite() {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    function setThrustListener() {
        $(document).keydown(function (event) {
            if (event.keyCode == 32) { //' '
                $(this).unbind(event);
                setRetryListener();
                gameLoop();
            }
        });
    }

    function setRetryListener() {
        $(document).keydown(function (event) {
            if (event.keyCode == 82) { //'r'
                $(this).unbind(event);
                if (!JsCave.gameOver) { //'r' pressed during game
                    JsCave.restart = true; //wait until next frame to init
                }
                else {
                    JsCave.init();
                }
            }
        });
    }

    function welcomeScreen() {
        that.canvas.width = that.canvas.width;
        clearScreen();
        fillWithWhite();
        JsCave.Text.renderString('jscave', 2, 1);
        JsCave.Text.renderString('press space', 2, 3);
        JsCave.Text.renderString('to begin', 2, 4);
        JsCave.Text.renderString('press space', 2, 6);
        JsCave.Text.renderString('to go up', 2, 7);
        
        setThrustListener();
    }

    function gameLoop() {
        JsCave.Score.inc();
        draw();
        if (checkCollision()) {
            drawCollision(0, gameOver);
        }
        else if (JsCave.gameOver) {
            gameOver();
        }
        else if (JsCave.restart) {
            JsCave.init();
        }
        else {
            setTimeout(gameLoop, speed);
        }
    }

    function drawBorder() {
        ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    }

    function drawBackground() {
        var progression = JsCave.Walls.progression(),
            hue = Math.floor(100 - (progression * 100));
        that.ctx.save();
        that.ctx.fillStyle = hsl(hue, 70, 50);
        that.ctx.fillRect(0, 0, width, height);
        that.ctx.restore();
    }

    function checkCollision() {
        return JsCave.Collision.detect();
    }

    function drawCollision(count, callback) {
        if (count === undefined) {
            count = 0;
        }
        count = +count;
        var snakeCentre = JsCave.Snake.centre();
        that.ctx.save();
        that.ctx.beginPath();
        that.ctx.strokeStyle = "Red";
        that.ctx.arc(snakeCentre[0], snakeCentre[1], count * 4 + 4, 0, Math.PI * 2, true);
        that.ctx.stroke();
        that.ctx.restore();
        if (count < 5) {
            setTimeout(drawCollision, 100, count + 1, callback);
        }
        else {
            if (callback !== undefined) {
                callback();
            }
        }
    }

    function draw() {
        clearScreen();
        drawBackground();
        JsCave.Walls.draw();
        JsCave.Snake.draw();
        JsCave.Score.draw();
        drawBorder();
    }

    that.start = function () {
        var canvas = $('#game-board')[0];
        that.canvas = canvas;
        width = JsCave.width = canvas.width;
        height = JsCave.height = canvas.height;
        JsCave.Snake = JsCave.SnakeMaker();
        JsCave.Walls = JsCave.WallsMaker();
        JsCave.Score = JsCave.ScoreMaker();

        
        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
            JsCave.ctx = that.ctx = ctx;
            JsCave.Text = JsCave.TextMaker(that.ctx);
            welcomeScreen();
        }
    };

    return that;
};


JsCave.ScoreMaker = function () {
    var that = {},
        score = 0,
        scoreInc = 3,
        canvas,
        ctx,
        scoreColour = "#ccc",
        width,
        height;

    that.inc = function () {
        score += scoreInc;
    };

    that.set = function (newScore) {
        score = newScore;
    };

    that.draw = function () {
        var scoreString = "" + score,
            padding = 5;
        width = JsCave.scoreWidth = canvas.width;
        height = JsCave.scoreHeight = canvas.height;
        ctx.clearRect(0, 0, width, height);
        while(scoreString.length < padding) {
            scoreString = "0" + scoreString;
        }
        JsCave.ScoreText.renderString(scoreString, 0, 1);
    };

    that.init = function () {
        canvas = $('#score')[0];
        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
            JsCave.ScoreText = JsCave.TextMaker(ctx, scoreColour, true);
        }
        that.set(0);
        that.draw();
    };

    that.init();

    return that;
};


JsCave.CollisionMaker = function () {
    var that = {};

    that.detect = function () {
        var snakePos = JsCave.Snake.position(),
            wallsPos = JsCave.Walls.offsetAt(snakePos.frontEdge),
            wallHit = snakePos.topEdge < wallsPos[0] ||
                      snakePos.bottomEdge > wallsPos[1],
            barrierHit = false;

        if (wallsPos[2] !== false) {
            barrierHit = snakePos.topEdge < (wallsPos[2] + JsCave.Barriers.height) &&
                snakePos.bottomEdge > wallsPos[2];
        }
        return wallHit || barrierHit;
    };

    return that;
};


JsCave.SnakeMaker = function () {
    function calculateDirection() {
        if (pressed) {
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

    var that = {},
        vpos = JsCave.height / 3,
        history = [],
        historyMax = 6,
        size = 5,
        hpos = size * historyMax,
        dy = 1,
        ddy = 1.3,
        pressed = false;

    $(document).keydown(function (event) {
        if (event.keyCode == 32) {
            pressed = true;
        }
    });

    $(document).keyup(function (event) {
        if (event.keyCode == 32) {
            pressed = false;
        }
    });

    that.draw = function () {
        calculateDirection();
        if (pressed) {
            vpos += dy;
        }
        else {
            vpos += dy;
        }
        fillHistory(vpos);
        for(var i = 0; i < history.length; i+=1) {
            JsCave.ctx.fillRect(i * size, history[i], size, size);
        }
    };

    that.position = function () {
        return {
            frontEdge:  hpos,
            topEdge:    Math.floor(vpos),
            bottomEdge: Math.floor(vpos) + size
        };
    };

    that.centre = function () {
        var x = hpos - (size / 2),
            y = vpos + (size / 2);
        return [x, y];
    };

    return that;
};


JsCave.BarriersMaker = function () {
    function calculate(topMax, bottomMax) {
        while(true) {
            if (goes > 60) {
                return false;
            }
            var number = Math.floor(Math.random() * JsCave.height);
            if ((number + height) > topMax && number < bottomMax) {
                goes = 0;
                return number;
            }
            goes += 1;
        }
    }
    
    var that = {},
        distance = 10,
        count = 0,
        width = 5,
        height = 20,
        goes = 0,
        gracePeriod = 2; //this many barriers are skipped at beginning
    that.height = height;

    that.getNew = function (topMax, bottomMax) {
        if (count >= distance) {
            count = 0;
            if (gracePeriod > 0) {
                gracePeriod -= 1;
                return false;
            }
            return calculate(topMax, bottomMax);
        }
        count += 1;
        return false;
    };

    that.draw = function (left, top) {
        JsCave.ctx.fillRect(left, top, width, height);
    };

    return that;
};


JsCave.WallsMaker = function () {
    function fillArray() {
        offArray.shift();
        while(offArray.length * hBlockSize < JsCave.width) {
            var topOffset = nextOffset(),
                bottomOffset = Math.floor(topOffset + tunnelHeight),
                barrierTop = JsCave.Barriers.getNew(topOffset,
                                                    bottomOffset);
            offArray.push([topOffset, bottomOffset, barrierTop]);
        }
    }

    function goUpOrDown() {
        var goUp;
        if (lastGoUp) { //increase chance of going up again
            goUp = Math.random() < directionBias;
        }
        else { //increase chance of going down again
            goUp = Math.random() > directionBias;
        }
        lastGoUp = goUp;
        return goUp;
    }

    function nextOffset() {
        var minOffset = 0,
            maxOffset = JsCave.height - tunnelHeight,
            goUp = goUpOrDown();

        if (goUp) {
            offset -= vBlockSize;
            if (offset < minOffset) { //reverse direction if limit reached
                offset += vBlockSize;
                lastGoUp = !goUp;
            }
        }
        else {
            offset += vBlockSize;
            if (offset > maxOffset) { //reverse direction if limit reached
                offset -= vBlockSize;
                lastGoUp = !goUp;
            }
        }
        return offset;
    }

    var that = {},
        tunnelHeight = JsCave.height * 3 / 4,
        startingHeight = tunnelHeight,
        offset = (JsCave.height - tunnelHeight) / 2,
        offArray = [],
        counter = 0,
        hBlockSize = 5,
        vBlockSize = 2,
        lastGoUp = 0,
        directionBias = 0.9, //likelihood of tunnel direction continuing
        narrowing = 0.1; //how much the tunnel narrows each frame


    that.draw = function () {
        var width = JsCave.width,
            height = JsCave.height;
        fillArray();
        tunnelHeight -= narrowing;
        JsCave.ctx.save();
        JsCave.ctx.fillStyle = rgb(70, 60, 40);
        for(var i = 0; i < offArray.length; i+=1) {
            var topEdge = 0,
                topHeight = offArray[i][0],
                bottomEdge = offArray[i][1],
                bottomHeight = height - bottomEdge,
                barrierTop = offArray[i][2];
            JsCave.ctx.fillRect(i * hBlockSize, topEdge,
                                hBlockSize, topHeight);
            JsCave.ctx.fillRect(i * hBlockSize, bottomEdge,
                                hBlockSize, bottomHeight);
            if (barrierTop !== false) {
                JsCave.Barriers.draw(i * hBlockSize, barrierTop);
            }
        }
        JsCave.ctx.restore();
    };

    that.offsetAt = function (position) {
        var index = Math.floor(position / hBlockSize);
        return offArray[index - 1];
    };

    that.progression = function () {
        return (startingHeight - tunnelHeight) / startingHeight;
    };

    return that;

};


JsCave.TextMaker = function (ctx, colour, isScore) {
    function loadFont() {
        if (font === undefined) {
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
        ctx.fillRect(xOffset * blockSize,
                     yOffset * blockSize,
                     blockSize, blockSize);
    }

    function drawLetter(letter, xOffset, yOffset) {
        for(var row = 0; row < letter.length; row+=1) {
            for(var col = 0; col < letter[row].length; col += 1) {
                if (letter[row][col]) {
                    drawSquare(col + xOffset, row + yOffset);
                }
            }
        }
    }

    var that = {},
        blockSize = 2,
        font,
        fontWidth = 3,
        fontHeight = 5;
    
    if (colour === undefined) {
        colour = "#222";
    }
    
    that.renderString = function (str, y, lineNumber) {
        var x;
        ctx.save();
        ctx.fillStyle = colour;
        loadFont();
        str = str.toUpperCase();
        if(!isScore) {
            var letterWidth = (fontWidth + 1);
            var textWidth = str.length * letterWidth;
            var canvasWidth = Math.round(JsCave.width / blockSize);
            var yOffset = JsCave.height / 2;
            y += (yOffset - (blockSize * 32)) / blockSize;
            x = (canvasWidth - textWidth) / 2;
        }
        else {
            var letterWidth = (fontWidth + 1);
            var canvasWidth = Math.round(JsCave.scoreWidth / blockSize);
            var textWidth = str.length * letterWidth;
            x = (canvasWidth - textWidth) / 2;
        }
        for(var i = 0; i < str.length; i+=1) {
            var letter = font[str[i]];
            drawLetter(letter, i * 4 + x, lineNumber * 7 + y);
        }
        ctx.restore();
    };
    
    return that;
};