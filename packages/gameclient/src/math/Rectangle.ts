export class Rectangle {
    x: number
    y: number
    width: number
    height: number

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    /**
     * Copies a rectangle object
     * @param {Rectangle} rectangle 
     * @returns {Rectangle}
     */
    static copy(rect: Rectangle): Rectangle {
        return new Rectangle(rect.x, rect.y, rect.width, rect.height);
    }

    contains(rectangle: Rectangle) {
        return !(
            this.get_bottom() < rectangle.get_top() ||
            this.get_top() > rectangle.get_bottom() ||
            this.get_right() < rectangle.get_left() ||
            this.get_left() > rectangle.get_right()
        )
    }

    get_x(): number {
        return this.x
    }

    get_y(): number {
        return this.y
    }

    get_width(): number {
        return this.width
    }

    get_height(): number {
        return this.height
    }

    get_right(): number {
        return this.x + this.width / 2;
    }

    get_left(): number {
        return this.x - this.width / 2;
    }

    get_bottom(): number {
        return this.y + this.height / 2;
    }

    get_top(): number {
        return this.y - this.height / 2;
    }

    set_x(x: number) {
        this.x = x
    }

    set_y(y: number) {
        this.y = y
    }

    set_position(x: number, y: number) {
        this.x = x
        this.y = y
    }

    set_width(width: number) {
        this.width = width
    }

    set_height(height: number) {
        this.height = height
    }

    set_size(width: number, height: number) {
        this.width = width
        this.height = height
    }
}