import { Rectangle } from "./math/Rectangle.js";
import { Vec2 } from "./math/Vec2.js";

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

    static image(image, x, y) {
        const transform = new Rectangle(x, y, image.width, image.height);
        const sprite_rect = new Rectangle(0, 0, image.width, image.height);
        const pivot = Vec2.zero();

        const draw = new Draw(image, transform, sprite_rect, pivot);

        return draw;
    }

    static sprite(spritesheet, id, x, y) {
        const sprite_rect = spritesheet.get_sprite_rect(id);
        const transform = new Rectangle(x, y, sprite_rect.get_width(), sprite_rect.get_height());
        const pivot = Vec2.zero();

        const draw = new Draw(spritesheet.image, transform, sprite_rect, pivot);

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
        this.pivot.set_x(x * this.sprite_rect.get_width());
        this.pivot.set_y(y * this.sprite_rect.get_height());

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
