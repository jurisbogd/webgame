export class Vector2 extends Float32Array {
    constructor(values: [number, number] | Vector2) {
        super(values);
    }

    static get zero() {
        return new Vector2([0, 0]);
    }

    get x() { return this[0]; }
    set x(value: number) { this[0] = value; }

    get y() { return this[1]; }
    set y(value: number) { this[1] = value; }

    add(v: Vector2): Vector2 {
        const out = Vector2.zero;
        add(this, v, out);
        return out;
    }

    addScalar(s: number): Vector2 {
        const out = Vector2.zero;
        addScalar(this, s, out);
        return out;
    }

    floor(): Vector2 {
        const out = new Vector2(this);
        floor(out);
        return out;
    }
}

export const vec2 = {
    clear,
    abs,
    add,
    addScalar,
    multiplyVector,
    divideVector,
    multiply,
}

function floor(out: Vector2) {
    out[0] = Math.floor(out[0]);
    out[1] = Math.floor(out[1]);
}

function clear(out: Vector2) {
    out[0] = 0;
    out[1] = 0;
}

function abs(v: Vector2, out: Vector2) {
    out[0] = Math.abs(v[0]);
    out[1] = Math.abs(v[1]);
}

function add(a: Vector2, b: Vector2, out: Vector2) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
}

function addScalar(v: Vector2, s: number, out: Vector2) {
    out[0] = v[0] + s;
    out[1] = v[1] + s;
}

function multiplyVector(a: Vector2, b: Vector2, out: Vector2) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
}

function divideVector(a: Vector2, b: Vector2, out: Vector2) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
}

function multiply(v: Vector2, s: number, out: Vector2) {
    out[0] = v[0] * s;
    out[1] = v[1] * s;
}