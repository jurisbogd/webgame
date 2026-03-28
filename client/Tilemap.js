import { Tile } from './Tile.js';

export class Tilemap {
    tiles = [];
    width;
    height;

    constructor(width, height) {
        this.width = width;
        this.height = height;

        for (let i = 0; i < width * height; i++) {
            this.tiles.push(new Tile(undefined, -1));
        }
    }

    static randomized(width, height, tileset) {
        const tilemap = new Tilemap(width, height);
        const tile_count = tileset.get_tile_count();

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const tile = tilemap.get_tile(i, j);

                tile.tileset = tileset;
                tile.id = (i + j * width) % tile_count;
            }
        }

        return tilemap;
    }

    get_tile(i, j) {
        return this.tiles[i + j * this.width];
    }
}
