import { Draw } from '../Draw.js';

export function render_room_objects(game) {
    const room = game.room;

    if (room === undefined) return;

    const objects = room.objects;
    const graphics = game.graphics;

    for (const object of objects) {
        const x = object.x;
        const y = object.y;
        const tileset = game.spritesheets[object.tileset];
        const draw = Draw.sprite(tileset, object.id, x, y)
            .set_depth_bottom();

        // buffer draw call for depth sorting
        graphics.render_buffered(draw);
    }
}