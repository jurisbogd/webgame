import { Draw } from '../Draw.js';

export function render_room_floor(game) {
    const room = game.room;

    if (room === undefined) return;

    const floor = room.floor;
    const graphics = game.graphics;

    for (let j = 0; j < room.height; ++j) {
        for (let i = 0; i < room.width; ++i) {
            const tile = floor[i][j];

            // ignore missing tiles
            if (tile === undefined || tile === null) continue;

            const x = i * 16;
            const y = j * 16;
            const tileset = game.spritesheets[tile.tileset];
            const draw = Draw.sprite(tileset, tile.id, x, y);

            graphics.render(draw);
        }
    }
}
