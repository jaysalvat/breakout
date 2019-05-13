(function () {

var levels = [

    [   '             ',
        '             ',
        '   **   **   ',
        '  *00* *00*  ',
        ' *0000*00*0* ',
        ' *1111111*1* ',
        ' *222222222* ',
        ' *3333333*3* ',
        '  *3344333*  ',
        '  *3444433*  ',
        '   *44443*   ',
        '   *44443*   ',
        '    *443*    ',
        '     *3*     ',
        '      *      ',
    ],

    [   '   0     0   ',
        '   0     0   ',
        '    0   0    ',
        '    0   0    ',
        '   1111111   ',
        '   2222222   ',
        '  333333333  ',
        '  444444444  ',
        ' 4* 44*44 *4 ',
        ' ** 4***4 ** ',
        ' **44***44** ',
        ' **444*444** ',
        ' 4 4444444 4 ',
        ' 3 3     3 3 ',
        '   2     2   ',
        '    11 11    ',
        '    00 00    ',
    ],

    [   '      5     ',
        '     555     ',
        '    4 5 4    ',
        '   3  5  3   ',
        '  2   5   2  ',
        ' 1    5    1 ',
        '01   5 5   10',
        '0 2 4   4 2 0',
        '0  3     3  0',
        '0 2 4   4 2 0',
        '01   5 5   10 ',
        ' 1    5    1 ',
        '  2   5   1  ',
        '   3  5  1   ',
        '    4 5 1    ',
        '     555     ',
        '      5      ',
    ],



    [   '     000    ',
        '   0000000   ',
        '  111111111  ',
        '  222222222  ',
        ' 333 333 333 ',
        ' 444 444 444 ',
        ' 555 555 555 ',
        ' 444 444 444 ',
        ' 33333333333 ',
        ' 2 2222222 2 ',
        ' 1  22222  1 ',
        ' 11  222  11 ',
        '  11     111  ',
        '  211   112  ',
        '   2111112   ',
        '    22222    ',
        '     333     ',
    ],

    [   '00000   00000',
        ' 11111 11111 ',
        '  222222222  ',
        '   3333333   ',
        '4   44444   4',
        '**   ***   **',
        '000   0   000',
        '1111     1111',
        '22222   22222',
        ' 33333 33333 ',
        '  444444444  ',
        '   *******   ',
        '0   00000   0',
        '11   111   11',
        '222   2   222',
    ],

    [   '      p      ',
        '      *      ',
        '      *      ',
        '      *      ',
        '   r *** r   ',
        '   r *** r   ',
        '   * *** *   ',
        '   *b*r*b*   ',
        '   b*rrr*b   ',
        '   b*rrr*b   ',
        '   **r*r**   ',
        ' p*********p ',
        ' *********** ',
        ' ** rr*rr ** ',
        ' ** rr*rr ** ',
        ' *    *    * ',
    ],
];

var colors = {
    '0': '#AEEA00',
    '1': '#C6FF00',
    '2': '#EEFF41',
    '3': '#F4FF81',
    '4': '#F5FFB4',

    'r': '#FF1744',
    'g': '#B2FF59',
    'b': '#80D8FF',
    'y': '#FFF59D',
    'o': '#FFE082',
},
defaultColor = '#F9FBD6';

var $ = function (selector) {
    console.log(selector);
    return document.querySelector(selector);
};

var canvas  = $('#game'),
    context = canvas.getContext('2d');

var paused = true,
    speed = 3,
    bricksMargin = 1,
    bricksWidth = 0,
    bricksHeight = 18,
    bricks,
    round, score, lives,
    highscore = localStorage.getItem('highscore') || 0;

var ball = {
    w: 6,
    h: 6,
    x: 0,
    y: 0,
    speedX: 0,
    speedY: 0,
};

var player = {
    w: 60,
    h: 4,
    x: (canvas.width / 2) - 30,
    y: canvas.height - 40,
};

var soundInstance = 0,
    sounds = [],
    sound, music1, music2;

for (var s = 0; s < 5; s ++) {
    sound = document.createElement('audio');
    sound.setAttribute('src', 'http://jaysalvat.github.io/codepen-assets/breakout/beep.mp3');
    sounds.push(sound);
}

music1 = document.createElement('audio');
music1.setAttribute('src', 'http://jaysalvat.github.io/codepen-assets/breakout/start.mp3');

music2 = document.createElement('audio');
music2.setAttribute('src', 'http://jaysalvat.github.io/codepen-assets/breakout/gameover.mp3');

window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;

function playSound () {
    if (soundInstance >= sounds.length) {
        soundInstance = 0;
    }
    sounds[soundInstance ++].play();
}

function buildLevel () {
    var index, level, row, column, color;

    index  = (round % levels.length || levels.length) - 1;
    level  = levels[index];
    bricks = [];

    for (row = 0; row < level.length; row ++) {
        for (column = 0; column < 13; column ++) {

            if (!level[row][column] || level[row][column] === ' ') {
                continue;
            }

            bricksWidth = (canvas.width - bricksMargin * 2) / 13;

            color = colors[level[row][column]];
            if (!color) {
                color = defaultColor;
            }

            bricks.push({
                x: bricksMargin * 2 + (bricksWidth * column),
                y: bricksHeight * row + 60,
                w: bricksWidth - bricksMargin * 2,
                h: bricksHeight - bricksMargin * 2,
                color: color,
            });
        }
    }
}

function resetBall () {
    ball.x = (canvas.width / 2) - (ball.w / 2);
    ball.y = (canvas.height / 1.8) - (ball.h / 2);
    ball.speedX = speed;
    ball.speedY = speed;

    if (Math.round(Math.random() * 1)) {
        ball.speedX = -speed;
    }
}

function detectCollision () {

    // Collision with player

    if (ball.y + ball.h >= player.y
     && ball.y + ball.h <= player.y + player.h
     && ball.x >= player.x
     && ball.x <= player.x + player.w
    ) {
        playSound();
        ball.speedY = -ball.speedY;
        ball.speedX = (ball.x - (player.x + player.w / 2)) * 0.25;
    }

    // Collision with bricks

    for (var i = 0; i < bricks.length; i ++) {
        var brick = bricks[i];

        if (ball.y + ball.h >= brick.y
         && ball.y <= brick.y + brick.h
         && ball.x + ball.w >= brick.x
         && ball.x <= brick.x + brick.w
        ) {
            playSound();
            ball.speedY = -ball.speedY;

            score ++;
            bricks.splice(i, 1);

            if (bricks.length <= 0) {
                round ++;
                speed += .5;
                startGame();
            }

            break;
        }
    }
}

function moveObjects () {
    if (paused) {
        return;
    }

    detectCollision();

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.x <= 0 || ball.x + ball.w >= canvas.width) {
        ball.speedX = -ball.speedX;
    }

    if (ball.y <= 0 || ball.y + ball.h >= canvas.height) {
        ball.speedY = -ball.speedY;
    }

    if (ball.y + ball.h >= canvas.height) {
        lives --;

        if (lives === 0) {
            gameover();
        } else {
            ready();
        }

        resetBall();
    }
}

function displayScore (score) {
    return Array(6 - String(score).length + 1).join('0') + score;
}

function updateObjects () {
    $('#score span').textContent = displayScore(score);
    $('#lives span').textContent = lives;

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawObject(ball.x, ball.y, ball.w, ball.h);
    drawObject(player.x, player.y, player.w, player.h, colors[0]);

    bricks.forEach(function (brick) {
        drawObject(brick.x, brick.y, brick.w, brick.h, brick.color);
    });
}

function drawObject (x, y, w, h, color) {
    context.fillStyle = 'rgba(0, 0, 0, .15)';
    context.fillRect(x + bricksWidth / 2, y + bricksHeight, w, h);

    context.fillStyle = color || 'white';
    context.fillRect(x, y, w, h);
}

function refreshGame () {
    requestAnimationFrame(refreshGame);
    moveObjects();
    updateObjects();
}

function hideMessage () {
    $('#message').className = 'message';
}

function ready () {
    music1.play();

    paused = true;

    $('#message h2').textContent = 'ROUND ' + round;
    $('#message p').textContent  = 'Click when ready!';
    $('#message').className = 'message message-shown';

    $('#highscore span').textContent = displayScore(highscore);
}

function gameover () {
    music2.play();

    paused = true;

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', score);
    }

    $('#message h2').textContent = 'GAME OVER';
    $('#message p').textContent  = 'Click to play again!';
    $('#message').className = 'gameover message message-shown';

    $('#highscore span').textContent = displayScore(highscore);
}

function resetGame () {
    round = 1;
    score = 0;
    lives = 5;
}

function startGame () {
    resetBall();
    buildLevel();
    ready();
}

document.body.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
        case 32: // Space
            paused = !paused;
            hideMessage();
        break;
        case 37: // Left
            player.x -= 20;
        break;
        case 39: // Right
            player.x += 20;
        break;
    }
});

document.body.addEventListener('click', function () {
    if (lives === 0) {
        resetGame();
        startGame();
        return;
    }

    hideMessage();
    paused = false;
});

document.body.addEventListener('mousemove', function (evt) {
    var rect   = canvas.getBoundingClientRect(),
        mouseX = evt.clientX - rect.left,
        half   = player.w / 2;

    if (mouseX <= half) {
        mouseX = half;
    }

    if (mouseX >= canvas.width - half) {
        mouseX = canvas.width - half;
    }

    player.x = mouseX - half;
});

 resetGame();
 startGame();
 refreshGame();

})();
