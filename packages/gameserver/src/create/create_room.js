import { init_2d_array } from "../utils/init_2d_array.js";
import { cantor_pair } from "../math/cantor_pair.js";
import { mulberry32 } from "../math/mulberry32.js";

export function create_room(i, j) {
    // const seed = cantor_pair(i, j);
    const [floor, features, objects] = generate_tilemap(i, j);

    const room = {
        id: cantor_pair(i, j),
        width: floor.length,
        height: floor[0].length,
        floor,
        features,
        objects,
    }

    return room;
}

function generate_tilemap(i, j) {
    const seed = cantor_pair(i, j);
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

    const room_width = size * 16;
    const room_height = size * 16;

    const left_door = {
        type: 'door',
        tileset: 'doors',
        id: 'left',
        x: 40,
        y: room_height / 2,
        dest_ord: {
            i: get_destination_ord(i, -1),
            j: j,
        },
    };
    const top_door = {
        type: 'door',
        tileset: 'doors',
        id: 'top',
        x: room_width / 2,
        y: 72,
        dest_ord: {
            i: i,
            j: get_destination_ord(j, -1),
        },
    };
    const bottom_door = {
        type: 'door',
        tileset: 'doors',
        id: 'bottom',
        x: room_width / 2,
        y: room_height - 40,
        dest_ord: {
            i: i,
            j: get_destination_ord(j, 1),
        },
    };
    const right_door = {
        type: 'door',
        tileset: 'doors',
        id: 'right',
        x: room_width - 40,
        y: room_height / 2,
        dest_ord: {
            i: get_destination_ord(i, 1),
            j: j,
        },
    };

    const objects = [left_door, right_door, bottom_door, top_door];

    return [floor, features, objects];
}

function get_destination_ord(ord, mod) {
    const dest = ord + mod;
    if (dest < 0) return 3;
    if (dest > 3) return 0;
    return dest;
}