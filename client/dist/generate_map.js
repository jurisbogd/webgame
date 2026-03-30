import { cantor_pair } from "./math/cantor_pair.js";
import { init_2d_array } from "./init_2d_array.js";
import { mulberry32 } from "./math/mulberry32.js";

export function generate_room(tileset, i, j) {
    const seed = cantor_pair(i, j);
    const [tilemap, floor, features] = generate_tilemap(tileset, seed);

    const room = {
        width: floor.length,
        height: floor[0].length,
        floor,
        features,
    }

    return [tilemap, room];
}

function generate_tilemap(tileset, seed) {
    const rng = mulberry32(seed);

    const size = 24 + Math.floor(rng() * 8);

    console.log(size)

    const wallmap = init_2d_array(size, size, () => undefined);
    const floor = init_2d_array(size, size, () => undefined);
    const features = init_2d_array(size, size, () => undefined);

    // corners
    wallmap[0][0] = 'wall_center';
    wallmap[0][size - 1] = 'wall_center';
    wallmap[size - 1][0] = 'wall_center';
    wallmap[size - 1][size - 1] = 'wall_center';

    const stone_period = 4 + Math.floor(rng() * 4);

    for (let i = 1; i < size - 1; i++) {
        // wall tops in top row
        wallmap[i][0] = 'wall_bottom';
        // wall midsection in top row
        wallmap[i][1] = 'brick_center';
        // wall base in top row
        wallmap[i][2] = 'brick_bottom_middle';
        // wall tops in bottom row
        wallmap[i][size - 1] = 'wall_top';
        // wall tops in left column
        wallmap[0][i] = 'wall_right';
        // wall tops in right column
        wallmap[size - 1][i] = 'wall_left';
    }

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
                    id: 'paved',
                };
            }
        }
    }

    // grass and rock
    for (let i = 1; i < size - 1; ++i) {
        for (let j = 3; j < size - 1; ++j) {
            const stones_vertical = (i - 1) % stone_period === 0;
            const stones_horizontal = (j - 3) % stone_period === 0;
            if (stones_vertical !== stones_horizontal) {
                wallmap[i][j] = 'paved';
            }
            else {
                wallmap[i][j] = 'grass';
            }
        }
    }

    return [wallmap, floor, features];
}