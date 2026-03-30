export class Rectangle {
    x
    y
    width
    height

    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
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
        return this.x + this.width / 2
    }

    get_left() {
        return this.x - this.width / 2
    }

    get_bottom() {
        return this.y + this.height / 2
    }

    get_top() {
        return this.y - this.height / 2
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
}