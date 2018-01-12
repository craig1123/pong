class Vec {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    get len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set len(value) {
        const f = value / this.len;
        this.x *= f;
        this.y *= f;
    }
}

class Rect {
    constructor(x = 0, y = 0) {
        this.pos = new Vec(0, 0);
        this.size = new Vec(x, y);
    }
    get left() {
        return this.pos.x - this.size.x / 2;
    }
    get right() {
        return this.pos.x + this.size.x / 2;
    }
    get top() {
        return this.pos.y - this.size.y / 2;
    }
    get bottom() {
        return this.pos.y + this.size.y / 2;
    }
}

class Ball extends Rect {
    constructor() {
        super(10, 10);
        this.vel = new Vec;
    }
}

class Player extends Rect {
    constructor() {
        super(20, 100);
        this.vel = new Vec;
        this.score = 0;

        this._lastPos = new Vec;
    }
    update(dt) {
        this.vel.y = (this.pos.y - this._lastPos.y) / dt;
        this._lastPos.y = this.pos.y;
    }
}

class Pong {
    constructor(canvas) {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        this.initialSpeed = 250;

        this.ball = new Ball;

        this.players = [
            new Player,
            new Player,
        ];

        this.players[0].pos.x = 40;
        this.players[1].pos.x = this._canvas.width - 40;
        this.players.forEach(p => p.pos.y = this._canvas.height / 2);

        let lastTime = null;
        this._frameCallback = (millis) => {
            if (lastTime !== null) {
                const diff = millis - lastTime;
                this.update(diff / 1000);
            }
            lastTime = millis;
            requestAnimationFrame(this._frameCallback);
        };

        this.CHAR_PIXEL = 10;
        this.CHARS = [
            '111101101101111',
            '010010010010010',
            '111001111100111',
            '111001111001111',
            '101101111001001',
            '111100111001111',
            '111100111101111',
            '111001001001001',
            '111101111101111',
            '111101111001111',
        ].map(str => {
            const canvas = document.createElement('canvas');
            const s = this.CHAR_PIXEL;
            canvas.height = s * 5;
            canvas.width = s * 3;
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            str.split('').forEach((fill, i) => {
                if (fill === '1') {
                    context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
                }
            });
            return canvas;
        });

        this.reset();
    }
    clear() {
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    collide(player, ball) {
        if (player.left < ball.right && player.right > ball.left &&
            player.top < ball.bottom && player.bottom > ball.top) {
            ball.vel.x = -ball.vel.x * 1.05;
            const len = ball.vel.len;
            ball.vel.y += player.vel.y * .2;
            ball.vel.len = len;
        }
    }
    draw() {
        this.clear();

        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));

        this.drawScore();
    }
    drawRect(rect) {
        this._context.fillStyle = '#fff';
        this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
    }
    drawScore() {
        const align = this._canvas.width / 3;
        const cw = this.CHAR_PIXEL * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + this.CHAR_PIXEL / 2;
            chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char|0], offset + pos * cw, 20);
            });
        });
    }
    play(two) {
        const b = this.ball;
        if (two) {
            // let the keyboard move the second player
        }
        if (b.vel.x === 0 && b.vel.y === 0) {
            b.vel.x = 200 * (Math.random() > .5 ? 1 : -1);
            b.vel.y = 200 * (Math.random() * 2 - 1);
            b.vel.len = this.initialSpeed;
        }
    }
    reset() {
        const b = this.ball;
        b.vel.x = 0;
        b.vel.y = 0;
        b.pos.x = this._canvas.width / 2;
        b.pos.y = this._canvas.height / 2;
    }
    start() {
        requestAnimationFrame(this._frameCallback);
    }
    update(dt) {
        const cvs = this._canvas;
        const ball = this.ball;
        ball.pos.x += ball.vel.x * dt;
        ball.pos.y += ball.vel.y * dt;

        if (ball.right < 0 || ball.left > cvs.width) {
            ++this.players[ball.vel.x < 0 | 0].score;
            this.reset();
        }

        if (ball.vel.y < 0 && ball.top < 0 ||
            ball.vel.y > 0 && ball.bottom > cvs.height) {
            ball.vel.y = -ball.vel.y;
        }

        // Computer AI
        // var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
        // if(diff < 0 && diff < -4) { // max speed left
        //   diff = -5;
        // } else if(diff > 0 && diff > 4) { // max speed right
        //   diff = 5;
        // }
        // this.paddle.move(diff, 0);
        // if(this.paddle.x < 0) {
        //   this.paddle.x = 0;
        // } else if (this.paddle.x + this.paddle.width > 400) {
        //   this.paddle.x = 400 - this.paddle.width;
        // }
        this.players[1].pos.y = ball.pos.y;

        this.players.forEach(player => {
            player.update(dt);
            this.collide(player, ball);
        });

        this.draw();
    }
}

var twoPeople = false;
const canvas = document.querySelector('#pong');
const onePlayer = document.getElementById('onePlayer');
const twoPlayers = document.getElementById('twoPlayers');

const pong = new Pong(canvas);


onePlayer.addEventListener('click', () => {
    canvas.focus();
    pong.play();
});
twoPlayers.addEventListener('click', () => {
    canvas.focus();
    twoPeople = true;
    pong.play(twoPeople);
});

canvas.addEventListener('mousemove', event => {
    if (!twoPeople) {
        const scale = event.offsetY / event.target.getBoundingClientRect().height;
        pong.players[0].pos.y = canvas.height * scale;
    }
});

canvas.addEventListener('keydown', event => {
    if (twoPeople) {
        // const scale = event.offsetY / event.target.getBoundingClientRect().height;
        // console.log(pong.players[0].pos.y); // position of player
        // console.log(canvas.height); // abstract height set by canvas
        // console.log(event.target.getBoundingClientRect().height); // height of canvas on window
        // function updatePosition(direction, player) {
            // pong.players[player].pos.y = canvas.height * scale;
        // } 217, 198, 114
        if (event.keyCode == 38) {
            // pong.players[1].pos.y = canvas.height * scale;
        }
        if (event.keyCode == 40) {
            // pong.players[1].pos.y = canvas.height * scale;
        }
        if (event.keyCode == 87) {
            // pong.players[0].pos.y = canvas.height * scale;
        }
        if (event.keyCode == 83) {
            // pong.players[0].pos.y = canvas.height * scale;
        }
    }
});

pong.start();
