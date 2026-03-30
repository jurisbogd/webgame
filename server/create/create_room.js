import { init_2d_array } from "../utils/init_2d_array.js";
import { cantor_pair } from "../math/cantor_pair.js";
import { mulberry32 } from "../math/mulberry32.js";

export function create_room(i, j) {
    const seed = cantor_pair(i, j);
    const [floor, features] = generate_tilemap(seed);

    const room = {
        width: floor.length,
        height: floor[0].length,
        floor,
        features,
    }

    return room;
}

function generate_tilemap(seed) {
    const rng = mulberry32(seed);
    const size = 24 + Math.floor(rng() * 8);
    const floor = init_2d_array(size, size, () => undefined);
    const features = init_2d_array(size, size, () => undefined);
    const stone_period = 4 + Math.floor(rng() * 4);
    const tileset = 'tileset_basic';
    const wall_center = {
        tileset,
        id: 'wall_center',
        depth_mod: 32,
    }

    features[0][0] = wall_center;
    features[0][size - 1] = wall_center;
    features[size - 1][0] = wall_center;
    features[size - 1][size - 1] = wall_center;

    for (let i = 1; i < size - 1; i++) {
        features[i][0] = {
            tileset,
            id: 'wall_bottom',
            depth_mod: 32,
        };

        features[i][size - 1] = {
            tileset,
            id: 'wall_top',
            depth_mod: 32,
        };

        features[0][i] = {
            tileset,
            id: 'wall_right',
            depth_mod: 32,
        };

        features[size - 1][i] = {
            tileset,
            id: 'wall_left',
            depth_mod: 32,
        };

        features[i][1] = {
            tileset,
            id: 'brick_center',
            depth_mod: 16,
        };

        features[i][2] = {
            tileset,
            id: 'brick_bottom_middle',
            depth_mod: 0,
        };
    }

    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            const stones_vertical = i % stone_period === 0;
            const stones_horizontal = j % stone_period === 0;

            if (stones_vertical !== stones_horizontal) {
                floor[i][j] = {
                    tileset,
                    id: 'paved',
                };
            }
            else {
                floor[i][j] = {
                    tileset,
                    id: 'grass',
                };
            }
        }
    }

    return [floor, features];
}