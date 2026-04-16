import { Rect, Vec2 } from '@jbwg/shared/math'

export async function init_graphics_crc2d(canvas) {
    return new Promise((resolve) => {
        const graphics = new CRC2DGraphics(canvas)
        resolve(graphics)
    })
}

// const canvas = document.getElementById("canvas-2d");

// const graphics = await init_graphics_crc2d(canvas);

// export function render(draw, buffer = false) {
//     if (buffer) {
//         graphics.render_buffered(draw);
//     }
//     else {
//         graphics.render(draw);
//     }
// }

// export function clear(color = "cornflowerblue") {
//     graphics.clear(color);
// }

// export function 

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
        this.viewport = new Rect(0, 0, viewport_width, viewport_height);
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
        // const position_x = draw.get_left() - this.viewport.left;
        // const position_y = draw.get_top() - this.viewport.top;
        // const position_x_scaled = Math.floor(position_x) * this.render_scale;
        // const position_y_scaled = Math.floor(position_y) * this.render_scale;
        // const width_scaled = draw.transform.w * this.render_scale;
        // const height_scaled = draw.transform.h * this.render_scale;

        // this.ctx.drawImage(
        //     draw.sprite,
        //     draw.sprite_rect.x,
        //     draw.sprite_rect.y,
        //     draw.sprite_rect.w,
        //     draw.sprite_rect.h,
        //     position_x_scaled,
        //     position_y_scaled,
        //     width_scaled,
        //     height_scaled
        // )
        const xPosition = draw.left - viewport.left;
        const yPosition = draw.top - viewport.top;
        const scaledXPosition = Math.floor(xPosition) * renderScale;
        const scaledYPosition = Math.floor(yPosition) * renderScale;
        const scaledWidth = draw.transform.w * renderScale;
        const scaledHeight = draw.transform.h * renderScale;

        canvasRenderingContext2d.drawImage(
            draw.image,
            draw.spriteRect.x,
            draw.spriteRect.y,
            draw.spriteRect.w,
            draw.spriteRect.h,
            scaledXPosition,
            scaledYPosition,
            scaledWidth,
            scaledHeight
        );
    }

    #in_viewport(draw) {
        // return this.viewport.contains(draw.transform);
        const viewport = this.viewport;
        return !(
            viewport.bottom < draw.top ||
            viewport.top > draw.bottom ||
            viewport.right < draw.left ||
            viewport.left > draw.right
        );
    }

    set_viewport_position(x, y) {
        this.viewport.position = new Vec2(x, y);
    }
}
