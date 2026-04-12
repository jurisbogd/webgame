export class Vec2 extends Float32Array {
    constructor(x: number, y: number) {
        super(2);
        this[0] = x;
        this[1] = y;
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