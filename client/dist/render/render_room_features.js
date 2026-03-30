import { Draw } from '../Draw.js';

export function render_room_features(game) {
    const room = game.room;
    const features = room.features;
    const graphics = game.graphics;

    for (let j = 0; j < room.height; ++j) {
        for (let i = 0; i < room.width; ++i) {
            const tile = features[i][j];

            // ignore missing tiles
            if (tile === undefined) continue;

            const x = i * 16;
            const y = j * 16;
            const draw = Draw.sprite(tile.tileset, tile.id, x, y)
                .set_depth_bottom(tile.depth_mod);

            // buffer draw call for depth sorting
            graphics.render_buffered(draw);
        }
    }
}
