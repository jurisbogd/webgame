import { Vec2 } from "@jbwg/shared/math";
import { IRect } from "./IRect";

export class Rect extends Float32Array implements IRect {
    constructor(x: number, y: number, w: number, h: number) {
        super(4)
        this[0] = x;
        this[1] = y;
        this[2] = w;
        this[3] = h;
    }

    /**
     * Copies a rectangle object
     * @param {Rect} rect 
     * @returns {Rect}
     */
    static copy(rect: Rect): Rect {
        return new Rect(rect.x, rect.y, rect.w, rect.h);
    }

    contains(rectangle: Rect) {
        return !(
            this.bottom < rectangle.top ||
            this.top > rectangle.bottom ||
            this.right < rectangle.left ||
            this.left > rectangle.right
        )
    }

    get x() {
        return this[0];
    };

    set x(value: number) {
        this[0] = value;
    };

    get y() {
        return this[1];
    };

    set y(value: number) {
        this[1] = value;
    };

    get position() {
        return new Vec2(this.x, this.y);
    };

    set position(value: Vec2) {
        this.x = value.x;
        this.y = value.y;
    };

    get w() {
        return this[2];
    };

    set w(value: number) {
        this[2] = value;
    };

    get h() {
        return this[3];
    };

    set h(value: number) {
        this[3] = value;
    };

    get size() {
        return new Vec2(this.w, this.h);
    };

    set size(value: Vec2) {
        this.w = value.x;
        this.h = value.y;
    };

    get right() {
        return this.x + this.w / 2;
    };

    get left() {
        return this.x - this.w / 2;
    };

    get bottom() {
        return this.y + this.h / 2;
    };

    get top() {
        return this.y - this.h / 2;
    };
}