import { cantor_pair } from "./cantor_pair.js";
import { init_2d_array } from "./init_2d_array.js";
import { mulberry32 } from "./mulberry32.js";

export function generate_map(i, j) {
    const seed = cantor_pair(i, j);
    const rng = mulberry32(seed);

    const size = 24 + Math.floor(rng() * 8);

    console.log(size)

    const wallmap = init_2d_array(size, size, () => undefined);

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

        // grass and rock
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

    return wallmap;
}