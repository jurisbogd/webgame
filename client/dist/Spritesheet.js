import { Rectangle } from './math/Rectangle.js'
import { Vec2 } from './math/Vec2.js';

export class Spritesheet {
    image;
    sprites;

    constructor(image, atlas) {
        this.image = image;
        this.sprites = {};

        const sprites = atlas.sprites;

        if (sprites !== undefined) {
            for (const sprite_name in sprites) {
                const sprite = sprites[sprite_name];
                const x = sprite.x;
                const y = sprite.y;
                const w = sprite.w;
                const h = sprite.h;

                if (x === undefined || y === undefined || w === undefined || h === undefined) {
                    console.warn(`Sprite '${sprite_name}' has some undefined properties.`);
                    continue;
                }

                const rect = new Rectangle(x, y, w, h);

                const pivot_x = sprite.pivot_x;
                const pivot_y = sprite.pivot_y;
                const pivot = pivot_x === undefined || pivot_y === undefined
                    ? Vec2.zero()
                    : new Vec2(pivot_x, pivot_y);

                this.sprites[sprite_name] = {
                    rect,
                    pivot,
                }
            }
        }
    }

    get_sprite_rect(sprite_name) {
        const sprite = this.sprites[sprite_name];
        const rect = sprite.rect;
        return rect;
    }

    get_sprite_pivot(sprite_name) {
        const sprite = this.sprites[sprite_name];
        const pivot = sprite.pivot;
        return pivot;
    }

    has_sprite(sprite_name) {
        return this.sprites[sprite_name] === undefined;
    }
}