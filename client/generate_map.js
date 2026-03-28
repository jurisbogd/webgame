import { cantor_pair } from "./cantor_pair.js";
import { init_2d_array } from "./init_2d_array.js";
import { mulberry32 } from "./mulberry32.js";

export function generate_map(i, j) {
    const seed = cantor_pair(i, j);
    const rng = mulberry32(seed);

    const size = 24 + rng() % 8;

    const wallmap = init_2d_array(size, size, () => -1);

    // surrounding wall
    // corners
    wallmap[0][0] = 17;
    wallmap[0][size - 1] = 17;
    wallmap[size - 1][0] = 17;
    wallmap[size - 1][size - 1] = 17;

    // top
    for (let i = 1; i < size - 1; i++) {
        // wall tops in top row
        wallmap[i][0] = 21;
        // wall midsection in top row
        wallmap[i][1] = 5;
        // wall base in top row
        wallmap[i][2] = 9;
        // wall tops in bottom row
        wallmap[i][size - 1] = 13;
        // wall tops in left column
        wallmap[0][i] = 18;
        // wall tops in right column
        wallmap[size - 1][i] = 16;
    }

    // grass and stone
    const stone_period = 4 + rng() % 4;

    for (let i = 1; i < size - 2; ++i) {
        for (let j = 3; j < size - 2; ++j) {
            const stones_vertical = (i - 1) % stone_period === 0
            const stones_horizontal = (j - 3) % stone_period === 0
            if (stones_vertical !== stones_horizontal) {
                wallmap[i][j] = 1;
            }
            else {
                wallmap[i][j] = 2;
            }
        }
    }

    return wallmap;
}