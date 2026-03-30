import { Rectangle } from './Rectangle.js'

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
                    continue;
                }

                const rect = new Rectangle(x, y, w, h);
                this.sprites[sprite_name] = rect;
            }
        }
    }

    get_sprite_rect(sprite_name) {
        const sprite_rect = this.sprites[sprite_name];
        return sprite_rect;
    }

    has_sprite(sprite_name) {
        return this.sprites[sprite_name] === undefined;
    }
}