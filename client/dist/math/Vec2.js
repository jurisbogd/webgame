export class Vec2 {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static zero() {
        return new Vec2(0, 0);
    }

    get_x() {
        return this.x;
    }

    get_y() {
        return this.y;
    }

    set_x(x) {
        this.x = x;
    }

    set_y(y) {
        this.y = y;
    }
}