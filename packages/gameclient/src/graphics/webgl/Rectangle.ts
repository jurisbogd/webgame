export class Rectangle extends Float32Array {
    constructor(values: [number, number, number, number] | Rectangle) {
        super(values);
    }

    static get zero() {
        return new Rectangle([0, 0, 0, 0]);
    }

    get x() { return this[0]; }
    set x(value: number) { this[0] = value; }

    get y() { return this[1]; }
    set y(value: number) { this[1] = value; }

    get width() { return this[2]; }
    set width(value: number) { this[2] = value; }

    get height() { return this[3]; }
    set height(value: number) { this[3] = value; }
}
