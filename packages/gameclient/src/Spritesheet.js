import { Rect } from './math/Rectangle.js'
import { Vec2 } from './math/Vec2.js';

function get_sprites(atlas_sprites) {
    const sprites = {};

    for (const sprite_name in atlas_sprites) {
        const sprite = atlas_sprites[sprite_name];
        const rect_props = [sprite.x, sprite.y, sprite.w, sprite.h];

        if (rect_props.some(prop => prop === undefined)) {
            console.warn(`Sprite '${sprite_name}' has some undefined properties.`);
            continue;
        }

        if (rect_props.some(prop => typeof prop !== 'number')) {
            console.warn(`Sprite '${sprite_name}' has some undefined properties.`)
            continue;
        }

        const rect = new Rect(sprite.x, sprite.y, sprite.w, sprite.h);

        let pivot;
        if (sprite.pivot_x === undefined || sprite.pivot_y === undefined) {
            pivot = Vec2.zero();
        }
        else {
            if (typeof sprite.pivot_x === 'number' && typeof sprite.pivot_y === 'number') {
                pivot = new Vec2(sprite.pivot_x, sprite.pivot_y);
            }
            else {
                console.warn(`Optional pivot properties in sprite '${sprite_name}' are defined, but not numbers.`)
                pivot = Vec2.zero();
            }
        }

        sprites[sprite_name] = {
            rect,
            pivot,
        }
    }

    return sprites;
}

function get_animations(atlas_animations) {
    const animations = {};

    for (const animation_name in atlas_animations) {
        const atlas_animation = atlas_animations[animation_name];

        if (atlas_animation.frames === undefined || atlas_animation.duration === undefined) {
            console.warn(`Animation '${animation_name}' has some undefined properties.`);
            continue;
        }

        if (typeof atlas_animation.duration !== 'number') {
            console.warn(`Duration is not a number in animation '${animation_name}'.`);
            continue;
        }

        if (!Array.isArray(atlas_animation.frames)) {
            console.warn(`Frames is not an array in animation '${animation_name}'.`);
            continue;
        }

        if (atlas_animation.frames.some(frame => typeof frame !== 'string')) {
            console.warn(`Frame id is not a string in animation '${animation_name}'.`);
            continue;
        }

        const duration = atlas_animation.duration;
        const frames = [];

        for (const frame of atlas_animation.frames) {
            frames.push(frame);
        }

        const animation = {
            duration,
            frames,
        };

        animations[animation_name] = animation;
    }

    return animations;
}

export class Spritesheet {
    image;
    sprites;

    constructor(image, atlas) {
        this.image = image;
        this.sprites = atlas.sprites !== undefined
            ? get_sprites(atlas.sprites)
            : {};
        this.animations = atlas.animations !== undefined
            ? get_animations(atlas.animations)
            : {};
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

    get_animation_frame(animation_name, time) {
        const animation = this.animations[animation_name];
        const duration = animation.duration;
        const frames = animation.frames;
        const frame_count = frames.length;
        const frame_index = Math.floor((time / duration) * frame_count);
        const frame = frames[frame_index];

        return frame;
    }

    step_animation_time(animation_name, time) {
        const animation = this.animations[animation_name];
        const duration = animation.duration;
        const delta = 1.0 / 60.0;
        const next_time = (time + delta) % duration;

        return next_time;
    }

    has_sprite(sprite_name) {
        return this.sprites[sprite_name] === undefined;
    }
}