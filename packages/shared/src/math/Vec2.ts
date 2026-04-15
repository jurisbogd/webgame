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

    apply(transform: (x: number) => number) {
        return new Vec2(
            transform(this.x),
            transform(this.y),
        );
    };

    add(vector: Vec2): Vec2;
    add(scalar: number): Vec2;
    add(vectorOrScalar: Vec2 | number): Vec2 {
        if (typeof vectorOrScalar === "number") {
            return new Vec2(
                this.x + vectorOrScalar,
                this.y + vectorOrScalar,
            );
        }
        else {
            return new Vec2(
                this.x + vectorOrScalar.x,
                this.y + vectorOrScalar.y,
            );
        };
    };

    subtract(vector: Vec2): Vec2;
    subtract(scalar: number): Vec2;
    subtract(vectorOrScalar: Vec2 | number): Vec2 {
        if (typeof vectorOrScalar === "number") {
            return new Vec2(
                this.x - vectorOrScalar,
                this.y - vectorOrScalar,
            );
        }
        else {
            return new Vec2(
                this.x - vectorOrScalar.x,
                this.y - vectorOrScalar.y,
            );
        };
    };

    remainder(vector: Vec2): Vec2;
    remainder(scalar: number): Vec2;
    remainder(vectorOrScalar: Vec2 | number): Vec2 {
        if (typeof vectorOrScalar === "number") {
            return new Vec2(
                this.x % vectorOrScalar,
                this.y % vectorOrScalar,
            );
        }
        else {
            return new Vec2(
                this.x % vectorOrScalar.x,
                this.y % vectorOrScalar.y,
            );
        };
    };

    multiply(vector: Vec2): Vec2;
    multiply(scalar: number): Vec2;
    multiply(vectorOrScalar: Vec2 | number): Vec2 {
        if (typeof vectorOrScalar === "number") {
            return new Vec2(
                this.x * vectorOrScalar,
                this.y * vectorOrScalar,
            );
        }
        else {
            return new Vec2(
                this.x * vectorOrScalar.x,
                this.y * vectorOrScalar.y,
            );
        };
    };

    divide(vector: Vec2): Vec2;
    divide(scalar: number): Vec2;
    divide(vectorOrScalar: Vec2 | number): Vec2 {
        if (typeof vectorOrScalar === "number") {
            return new Vec2(
                this.x / vectorOrScalar,
                this.y / vectorOrScalar,
            );
        }
        else {
            return new Vec2(
                this.x / vectorOrScalar.x,
                this.y / vectorOrScalar.y,
            );
        };
    };

    floor() {
        return new Vec2(
            Math.floor(this.x),
            Math.floor(this.y),
        );
    };
}