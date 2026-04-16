import { render } from '../CanvasRenderingContext2dGraphics.js';
import { Vec2 } from '@jbwg/shared/math';
import { Draw, drawSprite } from '../Draw.js';

export function render_room_floor(game) {
    const room = game.room;

    if (room === undefined) return;

    const floor = room.floor;

    for (let j = 0; j < room.height; ++j) {
        for (let i = 0; i < room.width; ++i) {
            const tile = floor[i][j];

            if (tile.id === "" || tile.tileset === "") continue;

            // ignore missing tiles
            if (tile === undefined || tile === null) continue;

            const x = i * 16;
            const y = j * 16;
            const tileset = game.spritesheets[tile.tileset];

            const position = new Vec2(x, y);
            const draw = drawSprite(tileset, tile.id, position);
            // const draw = Draw.sprite(tileset, tile.id, x, y)
            // draw.depth = draw.bottom + tile.depth_mod;

            render(draw)
        }
    }
}
