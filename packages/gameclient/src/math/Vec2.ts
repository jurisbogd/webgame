export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static zero() {
        return new Vec2(0, 0);
    }

    get_x(): number {
        return this.x;
    }

    get_y(): number {
        return this.y;
    }

    set_x(x: number) {
        this.x = x;
    }

    set_y(y: number) {
        this.y = y;
    }
}