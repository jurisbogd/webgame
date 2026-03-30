import { Rectangle } from './math/Rectangle.js'

export async function init_graphics_crc2d(canvas) {
    return new Promise((resolve) => {
        const graphics = new CRC2DGraphics(canvas)
        resolve(graphics)
    })
}

export class CRC2DGraphics {
    canvas
    ctx
    draw_buffer
    viewport;

    constructor(canvas) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Unable to get CanvasRenderingContext2D.')
        }

        this.ctx.imageSmoothingEnabled = false
        this.viewport = new Rectangle(0, 0, canvas.width, canvas.height);
    }

    clear(color = 'cornflowerblue') {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    draw_image(image, x, y, width, height, rx, ry, rwidth, rheight) {
        if (width === undefined || height == undefined) {
            this.ctx.drawImage(image, x, y)
        }
        else if (rx === undefined || ry === undefined || rwidth === undefined || rheight === undefined) {
            this.ctx.drawImage(image, x, y, width, height)
        }
        else {
            this.ctx.drawImage(image, rx, ry, rwidth, rheight, x, y, width, height)
        }
    }

    draw_circle(x, y, size, color, line_width) {
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = line_width
        this.ctx.beginPath()
        this.ctx.ellipse(x, y, size, size, 0, 0, Math.PI * 2)
        this.ctx.stroke()
    }

    draw_filled_circle(x, y, size, color) {
        this.ctx.fillStyle = color
        this.ctx.beginPath()
        this.ctx.ellipse(x, y, size, size, 0, 0, Math.PI * 2)
        this.ctx.fill()
    }

    draw_tile(tileset, tile_id, x, y) {
        if (!tileset.has_tile(tile_id)) {
            return
        }

        const sprite_rect = tileset.get_tile_sprite_rect(tile_id)

        const width = sprite_rect.get_width()
        const height = sprite_rect.get_height()
        const rect_x = sprite_rect.get_x()
        const rect_y = sprite_rect.get_y()

        this.draw_image(tileset.image, x, y, width, height, rect_x, rect_y, width, height)
    }

    render(draw) {
        this.ctx.drawImage(
            draw.sprite,
            draw.sprite_rect.get_x(),
            draw.sprite_rect.get_y(),
            draw.sprite_rect.get_width(),
            draw.sprite_rect.get_height(),
            Math.floor(draw.transform.get_x() - draw.pivot.get_x() * draw.transform.get_width() - this.viewport.get_left()),
            Math.floor(draw.transform.get_y() - draw.pivot.get_y() * draw.transform.get_height() - this.viewport.get_top()),
            draw.transform.get_width(),
            draw.transform.get_height()
        )
    }

    set_viewport_position(x, y) {
        this.viewport.set_position(x, y);
    }
}
