export function init_2d_array(width, height, generator) {
    const array = [];

    for (let i = 0; i < width; ++i) {
        const column = [];

        for (let j = 0; j < height; ++j) {
            column.push(generator());
        }

        array.push(column);
    }

    return array;
}