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
    render_scale;

    constructor(canvas, render_scale = 2) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Unable to get CanvasRenderingContext2D.')
        }

        this.ctx.imageSmoothingEnabled = false

        this.render_scale = render_scale;

        const viewport_width = canvas.width / render_scale;
        const viewport_height = canvas.height / render_scale;
        this.viewport = new Rectangle(0, 0, viewport_width, viewport_height);
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

    render(draw) {
        // skip drawing if not visible
        if (!this.viewport.contains(draw.transform)) {
            return;
        }

        const position_x = draw.transform.get_x() - draw.pivot.get_x() - this.viewport.get_left();
        const position_y = draw.transform.get_y() - draw.pivot.get_y() - this.viewport.get_top();
        const position_x_scaled = Math.floor(position_x) * this.render_scale;
        const position_y_scaled = Math.floor(position_y) * this.render_scale;
        const width_scaled = draw.transform.get_width() * this.render_scale;
        const height_scaled = draw.transform.get_height() * this.render_scale;

        this.ctx.drawImage(
            draw.sprite,
            draw.sprite_rect.get_x(),
            draw.sprite_rect.get_y(),
            draw.sprite_rect.get_width(),
            draw.sprite_rect.get_height(),
            position_x_scaled,
            position_y_scaled,
            width_scaled,
            height_scaled
        )
    }

    set_viewport_position(x, y) {
        this.viewport.set_position(x, y);
    }
}
