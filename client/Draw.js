import { Rectangle } from "./Rectangle.js";
import { Vec2 } from "./Vec2.js";

export class Draw {
    sprite;
    transform;
    sprite_rect;
    pivot;
    depth = 0;

    constructor(sprite, transform, sprite_rect, pivot) {
        this.sprite = sprite;
        this.transform = transform;
        this.sprite_rect = sprite_rect;
        this.pivot = pivot;
    }

    static sprite(sprite, x, y) {
        const transform = new Rectangle(x, y, sprite.width, sprite.height);
        const sprite_rect = new Rectangle(0, 0, sprite.width, sprite.height);
        const pivot = new Vec2(0.5, 0.5);
        const draw = new Draw(sprite, transform, sprite_rect, pivot);

        return draw;
    }

    static tile(tileset, tile_id, x, y) {
        const sprite_rect = tileset.get_tile_sprite_rect(tile_id);
        const transform = new Rectangle(x, y, sprite_rect.get_width() * 2, sprite_rect.get_height() * 2);
        const pivot = new Vec2(0, 0);
        const draw = new Draw(tileset.image, transform, sprite_rect, pivot);

        return draw;
    }

    set_position(x, y) {
        this.transform.set_position(x, y);

        return this;
    }

    set_scale(x, y) {
        this.transform.set_size(
            this.sprite_rect.get_width() * x,
            this.sprite_rect.get_height() * y
        );

        return this;
    }

    set_scale_absolute(x, y) {
        this.transform.set_size(x, y);

        return this;
    }

    set_pivot(x, y) {
        this.pivot.set_x(x);
        this.pivot.set_y(y);

        return this;
    }

    set_depth(depth) {
        this.depth = depth;

        return this;
    }

    // set depth to bottom of rendered sprite
    set_depth_bottom() {
        this.depth = transform.get_bottom();

        return this;
    }
}
