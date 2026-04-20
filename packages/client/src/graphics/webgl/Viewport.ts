import { BoundingBox } from "./BoundingBox";


export class Viewport implements BoundingBox {
    x = 0;
    y = 0;
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    get left() { return this.x; };
    get right() { return this.x + this.width; };
    get top() { return this.y; };
    get bottom() { return this.y + this.width; };
}
