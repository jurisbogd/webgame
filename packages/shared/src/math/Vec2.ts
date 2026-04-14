export class Vec2 extends Float32Array {
    constructor(x: number, y: number) {
        super(2);
        this[0] = x;
        this[1] = y;
    };

    static copy(v: Vec2) {
        return new Vec2(v.x, v.y);
    };

    static get zero() {
        return new Vec2(0, 0);
    };

    static get one() {
        return new Vec2(1, 1);
    };

    get x() {
        return this[0];
    };

    get y() {
        return this[1];
    };

    set x(value: number) {
        this[0] = value;
    };

    set y(value: number) {
        this[1] = value;
    };
}