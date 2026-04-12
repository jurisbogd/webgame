import { Rect, Vec2 } from "@jbwg/shared/math";
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
        const pivot = Vec2.zero;

        const draw = new Draw(image, transform, sprite_rect, pivot);

        return draw;
    }

    static sprite(spritesheet: Spritesheet, id: string, x: number, y: number) {
        const sprite_rect = Rect.copy(spritesheet.get_sprite_rect(id));
        const transform = new Rect(x, y, sprite_rect.w, sprite_rect.h);
        const sprite_pivot = spritesheet.get_sprite_pivot(id);
        const pivot = new Vec2(sprite_pivot.x, sprite_pivot.y);

        const draw = new Draw(spritesheet.image, transform, sprite_rect, pivot);

        return draw;
    }

    set_position(x: number, y: number) {
        this.transform.x = x;
        this.transform.y = y;
        // this.transform.set_position(x, y);

        return this;
    }

    set_scale(x: number, y: number) {
        this.transform.w = this.sprite_rect.w * x;
        this.transform.h = this.sprite_rect.h * y;

        return this;
    }

    set_scale_absolute(x: number, y: number) {
        this.transform.w = x;
        this.transform.h = y;

        return this;
    }

    set_pivot(x: number, y: number) {
        this.pivot.x = x * this.transform.w;
        this.pivot.y = y * this.transform.h;

        return this;
    }

    set_pivot_absolute(x: number, y: number) {
        this.pivot.x = x;
        this.pivot.y = y;

        return this;
    }

    set_depth(depth: number) {
        this.depth = depth;

        return this;
    }

    get_top(): number {
        const y = this.transform.y;
        const top = y - this.pivot.y;

        return top;
    }

    get_bottom(): number {
        const y = this.transform.y;
        const height = this.transform.h;
        const pivot_y = this.pivot.y;
        const bottom = y + height - pivot_y;

        return bottom;
    }

    get_left(): number {
        const x = this.transform.x;
        const pivot_x = this.pivot.x;
        const left = x - pivot_x;

        return left;
    }

    get_right(): number {
        const x = this.transform.x;
        const width = this.transform.w;
        const pivot_x = this.pivot.x;
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
