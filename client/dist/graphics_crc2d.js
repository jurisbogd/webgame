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

    /**
     * Immediately render a draw to the canvas.
     * @param {Draw} draw - draw to be rendered.
     */
    render(draw) {
        // skip rendering if outside of viewport
        if (!this.#in_viewport(draw)) {
            return;
        }

        this.#render(draw);
    }

    render_buffer = [];

    /**
     * Buffer a draw to be later rendered ordered by depth.
     * @param {Draw} draw - draw to be rendered.
     */
    render_buffered(draw) {
        // skip rendering if outside of viewport
        if (!this.#in_viewport(draw)) {
            return;
        }

        this.render_buffer.push(draw);
    }

    /**
     * Sort and draw all buffered draws.
     */
    flush_render_buffer() {
        // sort by depth
        this.render_buffer.sort((a, b) => a.depth - b.depth);

        // draw all
        for (const draw of this.render_buffer) {
            this.#render(draw);
        }

        // clear render buffer
        this.render_buffer.length = 0;
    }

    #render(draw) {
        const position_x = draw.transform.get_left() - draw.pivot.get_x() - this.viewport.get_left();
        const position_y = draw.transform.get_top() - draw.pivot.get_y() - this.viewport.get_top();
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

    #in_viewport(draw) {
        return this.viewport.contains(draw.transform);
    }

    set_viewport_position(x, y) {
        this.viewport.set_position(x, y);
    }
}
