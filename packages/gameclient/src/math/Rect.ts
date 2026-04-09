export class Rect extends Float32Array {
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
        return new Rect(rect[0], rect[1], rect[2], rect[3]);
    }

    contains(rectangle: Rect) {
        return !(
            this.get_bottom() < rectangle.get_top() ||
            this.get_top() > rectangle.get_bottom() ||
            this.get_right() < rectangle.get_left() ||
            this.get_left() > rectangle.get_right()
        )
    }

    get_x(): number {
        return this[0]
    }

    get_y(): number {
        return this[1]
    }

    get_width(): number {
        return this[2]
    }

    get_height(): number {
        return this[3]
    }

    get_right(): number {
        return this[0] + this[2] / 2;
    }

    get_left(): number {
        return this[0] - this[2] / 2;
    }

    get_bottom(): number {
        return this[1] + this[3] / 2;
    }

    get_top(): number {
        return this[1] - this[3] / 2;
    }

    set_x(x: number) {
        this[0] = x
    }

    set_y(y: number) {
        this[1] = y
    }

    set_position(x: number, y: number) {
        this[0] = x
        this[1] = y
    }

    set_width(width: number) {
        this[2] = width
    }

    set_height(height: number) {
        this[3] = height
    }

    set_size(width: number, height: number) {
        this[2] = width
        this[3] = height
    }
}