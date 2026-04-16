import { Draw, drawSprite } from '../Draw.js';
import { Vec2 } from '@jbwg/shared/math';
import { render } from '../CanvasRenderingContext2dGraphics.js';

export function render_room_objects(game) {
    const room = game.room;

    if (room === undefined) return;

    const objects = room.objects;

    for (const object of objects) {
        const x = object.x;
        const y = object.y;
        const tileset = game.spritesheets[object.tileset];
        const position = new Vec2(x, y);
        const draw = drawSprite(tileset, object.id, position);
        // const draw = Draw.sprite(tileset, tile.id, x, y)
        draw.depth = draw.bottom;

        // buffer draw call for depth sorting
        render(draw, true);
    }
}