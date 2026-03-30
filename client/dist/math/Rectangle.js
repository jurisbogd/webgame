export class Rectangle {
    x
    y
    width
    height
    pivot_x;
    pivot_y;

    constructor(x, y, width, height, pivot_x = 0.5, pivot_y = 0.5) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.pivot_x = pivot_x * width;
        this.pivot_y = pivot_y * height;
    }

    /**
     * Copies a rectangle object
     * @param {Rectangle} rectangle 
     * @returns {Rectangle}
     */
    static copy(rect) {
        return new Rectangle(rect.x, rect.y, rect.width, rect.height);
    }

    contains(rectangle) {
        return !(
            this.get_bottom() < rectangle.get_top() ||
            this.get_top() > rectangle.get_bottom() ||
            this.get_right() < rectangle.get_left() ||
            this.get_left() > rectangle.get_right()
        )
    }

    get_x() {
        return this.x
    }

    get_y() {
        return this.y
    }

    get_width() {
        return this.width
    }

    get_height() {
        return this.height
    }

    get_right() {
        return this.x - this.pivot_x + this.width;
    }

    get_left() {
        return this.x - this.pivot_x;
    }

    get_bottom() {
        return this.y - this.pivot_y + this.height;
    }

    get_top() {
        return this.y - this.pivot_y;
    }

    set_x(x) {
        this.x = x
    }

    set_y(y) {
        this.y = y
    }

    set_position(x, y) {
        this.x = x
        this.y = y
    }

    set_width(width) {
        this.width = width
    }

    set_height(height) {
        this.height = height
    }

    set_size(width, height) {
        this.width = width
        this.height = height
    }

    set_pivot(x, y) {
        this.pivot_x = x;
        this.pivot_y = y;
    }
}