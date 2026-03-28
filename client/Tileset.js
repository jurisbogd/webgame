import { Rectangle } from "./Rectangle.js"

export const TILE_SIZE = 16

export class Tileset {
    image
    rows
    columns

    constructor(image) {
        this.image = image

        if (image.width % TILE_SIZE !== 0 || image.height % TILE_SIZE !== 0) {
            throw new Error(`Tileset spritesheet width and height must be multiple of tile size (${TILE_SIZE}), spritesheet size is ${image.width} x ${image.height}.`)
        }

        this.rows = image.height / TILE_SIZE
        this.columns = image.width / TILE_SIZE
    }

    get_tile_sprite_rect(tile_id) {
        const x = (tile_id % this.columns) * TILE_SIZE
        const y = Math.floor(tile_id / this.columns) * TILE_SIZE
        const width = TILE_SIZE
        const height = TILE_SIZE

        return new Rectangle(x, y, width, height)
    }

    has_tile(tile_id) {
        if (tile_id < 0) return false
        if (tile_id >= this.rows * this.columns) return false
        return true
    }

    get_tile_count() {
        return this.rows * this.columns
    }
}