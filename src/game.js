export class Box {
    constructor(options) {
        this.x = options.x || 0.0;
        this.y = options.y || 0.0;
        this.vx = options.vx || 0.0;
        this.vy = options.vy || 0.0;
        this.vxRand = 20.0 + Math.random()*40.0;
        this.hitPoints = 250;
        this.w = options.w || 0.0;
        this.h = options.h || 0.0;
        this.angle = options.angle || 0.0;
        this.time = options.time || new Date();
        this.lifetime = options.lifetime || 0;
        this.input = options.input || null;
        this.value = options.value || null;
        this.m = options.m || 1.0;
        this.dir = options.dir || 1.0;
        this.color = options.color || 'white';
        this.active = options.active || false;
        this.body = null;
    }
    update() {
        if (this.body) {
            let pos = this.body.GetPosition();
            let angle = Math.round(this.body.GetAngle()*100.0)/100.0;
            this.x = Math.round(pos.get_x()*100.0)/100.0;
            this.y = Math.round(pos.get_y()*100.0)/100.0;
            this.angle = angle*180.0/Math.PI;
        }
    }
}

export class Bullet {
    constructor(options) {
        this.x = options.x || 0.0;
        this.y = options.y || 0.0;
        this.r = options.r || 1.0;
        this.m = options.m || 1000.0;
        this.color = options.color || '#2a65db';
        this.time = options.time || new Date();
        this.lifetime = options.lifetime || 1000.0;
        this.body = null;
    }
    update() {
        if (this.body) {
            let pos = this.body.GetPosition();
            this.x = Math.round(pos.get_x()*100.0)/100.0;
            this.y = Math.round(pos.get_y()*100.0)/100.0;
        }
    }
}