import { Rect } from "./math/Rect.js";
import { Vec2 } from "./math/Vec2.js";
import { Spritesheet } from "./Spritesheet.js";

export class Draw {
    sprite;
    transform;
    sprite_rect;
    pivot;
    depth = 0;

    constructor(sprite: any, transform: Rect, sprite_rect: Rect, pivot: Vec2) {
        this.sprite = sprite;
        this.transform = transform;
        this.sprite_rect = sprite_rect;
        this.pivot = pivot;
    }

    static image(image: any, x: number, y: number): Draw {
        const transform = new Rect(x, y, image.width, image.height);
        const sprite_rect = new Rect(0, 0, image.width, image.height);
        const pivot = Vec2.zero();

        const draw = new Draw(image, transform, sprite_rect, pivot);

        return draw;
    }

    static sprite(spritesheet: Spritesheet, id: string, x: number, y: number) {
        const sprite_rect = Rect.copy(spritesheet.get_sprite_rect(id));
        const transform = new Rect(x, y, sprite_rect.get_width(), sprite_rect.get_height());
        const sprite_pivot = spritesheet.get_sprite_pivot(id);
        const pivot = new Vec2(sprite_pivot.x, sprite_pivot.y);

        const draw = new Draw(spritesheet.image, transform, sprite_rect, pivot);

        return draw;
    }

    set_position(x: number, y: number) {
        this.transform.set_position(x, y);

        return this;
    }

    set_scale(x: number, y: number) {
        this.transform.set_size(
            this.sprite_rect.get_width() * x,
            this.sprite_rect.get_height() * y
        );

        return this;
    }

    set_scale_absolute(x: number, y: number) {
        this.transform.set_size(x, y);

        return this;
    }

    set_pivot(x: number, y: number) {
        this.pivot.set_x(x * this.transform.get_width());
        this.pivot.set_y(y * this.transform.get_height());

        return this;
    }

    set_pivot_absolute(x: number, y: number) {
        this.pivot.set_x(x);
        this.pivot.set_y(y);

        return this;
    }

    set_depth(depth: number) {
        this.depth = depth;

        return this;
    }

    get_top(): number {
        const y = this.transform.get_y();
        const pivot_y = this.pivot.get_y();
        const top = y - pivot_y;

        return top;
    }

    get_bottom(): number {
        const y = this.transform.get_y();
        const height = this.transform.get_height();
        const pivot_y = this.pivot.get_y();
        const bottom = y + height - pivot_y;

        return bottom;
    }

    get_left(): number {
        const x = this.transform.get_x();
        const pivot_x = this.pivot.get_x();
        const left = x - pivot_x;

        return left;
    }

    get_right(): number {
        const x = this.transform.get_x();
        const width = this.transform.get_width();
        const pivot_x = this.pivot.get_x();
        const right = x + width - pivot_x;

        return right;
    }

    // set depth to bottom of rendered sprite
    set_depth_bottom(depth_mod: number = 0) {
        const bottom = this.get_bottom();
        const depth = bottom + depth_mod;
        this.depth = depth;

        return this;
    }
}
