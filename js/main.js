class Resources
{
    constructor() {
        this.resourceCache = {};
        this.loading = [];
        this.readyCallbacks = [];
    }
 
    load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach((url) => {
                this._load(url);
            });
        }
        else {
            this._load(urlOrArr);
        }
    }

    _load(url) {
        if(this.resourceCache[url]) {
            return this.resourceCache[url];
        }
        else {
            let img = new Image();
            img.onload = () => {
                this.resourceCache[url] = img;
                
                if(this.isReady()) {
                    this.readyCallbacks.forEach((game) => { new game(this, document.getElementById('canvas')); });
                }
            };
            this.resourceCache[url] = false;
            img.src = url;
        }
    }

    get(url) {
        return this.resourceCache[url];
    }

    isReady() {
        let ready = true;
        for(let k in this.resourceCache) {
            if(this.resourceCache.hasOwnProperty(k) &&
               !this.resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    onReady(obj) {
        this.readyCallbacks.push(obj);
    }
}

class Game
{
    constructor(resources, canvas) {
        this.canvas = canvas;
        this.resources = resources;
        this.ctx = canvas.getContext('2d');
        this.terrainPattern = this.ctx.createPattern(this.resources.get('img/starfield.png'), 'repeat');
        this.world = new Set();
        this._last = 0;
        this.count = 0;
        this.world.add(new Player(this.canvas.width/2-60, this.canvas.height-100, 102, 83, this.resources.get('img/ship.png'), 200));
        this.world.add(new Attack(50));
        this.lastObjShot = false;
        this._step = (now) => {
            this._loop = requestAnimationFrame(this._step);
            this.delta = Math.min(now - this._last, 100) / 1000;
            this._last = now;
            this.update();
            this.render();
        };
        this._step(0);
    }

    update() {
        for (let entity of this.world) if (entity.update) entity.update(this);
    }

    render() {
        this.ctx.fillStyle = this.terrainPattern;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let entity of this.world) if (entity.render) entity.render(this);
    }

    collide(entity1, type) {
        for (let entity2 of this.world) {
            if (entity1 != entity2  &&
                entity1.x <= entity2.x + entity2.w &&
                entity1.x + entity1.w >= entity2.x && 
                entity1.y <= entity2.y + entity2.h &&
                entity1.h + entity1.y >= entity2.y) 
                {
                    if(entity1.type == SHOT && entity2.type == SHIP)
                    {
                        this.world.delete(entity1);
                        this.world.delete(entity2);
                    }
                    if(entity1.type == PLAYER && entity2.type == SHIP)
                    {
                        this.stop();
                    }
                }   
        }
    }

    stop() {
        if (this._loop) this._loop = cancelAnimationFrame(this._loop);
    }
}

class Rect
{
    constructor() {
    }

    render(game) {
        game.ctx.drawImage(this.image, this.x, this.y, this.w, this.h)
    }
}

const PLAYER = 1, SHIP = 2, SHOT = 4;

class Player extends Rect
{
    constructor(px, py, pw, ph, img, v) {
        super();
        Object.assign(this, { type: PLAYER, image: img, rate: 0.2, delay: 0, x : px, y : py, w : pw, h : ph, vel : v });
    }

    update(game) {

        if(keyEvent.left) {
            this.x -= this.vel * game.delta;
        }
        if(keyEvent.right) {
            this.x += this.vel * game.delta;
        }
        this.delay -= game.delta;
        if (keyEvent.space && this.delay < 0) {
            this.delay = this.rate;
            game.world.add(new Shot(this.x+45, this.y-30, 10, 38, game.resources.get('img/bullet.png'), 300));
        }
        game.collide(this);
    }
}

class Ship extends Rect
{
    constructor(px, py, pw, ph, img, v) {
        super();
        Object.assign(this, { type: SHIP, image: img, x : px, y : py, w : pw, h : ph, vel : v });
    }

    update(game) {
        this.y += this.vel * game.delta;
        game.collide(this);
    }
}

class Shot extends Rect
{
    constructor(px, py, pw, ph, img, v) {
        super();
        Object.assign(this, { type: SHOT, image: img, x : px, y : py, w : pw, h : ph, vel : v });
    }

    update(game) {
        this.y -= this.vel * game.delta;
        game.collide(this);
        if(this.y < 0) game.world.delete(this);
    }
}

class Attack {
    constructor(s) {
        Object.assign(this, { size: s, rate: 0.5, delay: 0 });
    }
    update(game) {
        this.delay -= game.delta;
        if (this.delay < 0) {
            this.delay = this.rate;
            game.world.add(new Ship(Math.random() * 590, 5, 66, 74, game.resources.get('img/enemy.png'), 100));
            if (!--this.size) game.world.delete(this);
        }
    }
}

const keyEvent = {
    left : false,
    right : false,
    space : false
};

window.onkeydown = function(e) {
  switch(e.keyCode) {
    case 37 : keyEvent.left = true; break;
    case 39 : keyEvent.right = true; break;
    case 32 : keyEvent.space = true; break;
  }
};

window.onkeyup = function(e) {
  switch(e.keyCode) {
    case 37 : keyEvent.left = false; break;
    case 39 : keyEvent.right = false; break;
    case 32 : keyEvent.space = false; break;
  }
};

const resources = new Resources();

resources.load([
    "img/bullet.png",
    "img/enemy.png",
    "img/ship.png",
    "img/starfield.png"]);

resources.onReady(Game);

console.log('kkkkkkf');
