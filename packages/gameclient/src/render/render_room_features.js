import { Vec2 } from '@jbwg/shared/math';
import { Draw, drawSprite } from '../Draw.js';
import { render } from '../CanvasRenderingContext2dGraphics.js';

export function render_room_features(game) {
    const room = game.room;

    if (room === undefined) return;

    const features = room.features;

    for (let j = 0; j < room.height; ++j) {
        for (let i = 0; i < room.width; ++i) {
            const tile = features[i][j];

            // ignore missing tiles
            if (tile.tileset === "" || tile.id === "") continue;

            const x = i * 16;
            const y = j * 16;
            const tileset = game.spritesheets[tile.tileset];

            const position = new Vec2(x, y);
            const draw = drawSprite(tileset, tile.id, position);
            // const draw = Draw.sprite(tileset, tile.id, x, y)
            draw.depth = draw.bottom + tile.depth_mod;

            // buffer draw call for depth sorting
            render(draw, true);
        }
    }
}
