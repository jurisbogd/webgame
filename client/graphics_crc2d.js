export async function init_graphics() {
    return new Promise((resolve) => {
        const graphics = new Graphics()
        resolve(graphics)
    })
}

class Graphics {
    canvas
    ctx

    constructor() {
        this.canvas = document.getElementById('canvas-2d');

        if (!this.canvas) {
            throw new Error('Unable to find canvas element.')
        }

        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Unable to get CanvasRenderingContext2D.')
        }
    }

    clear(color = 'cornflowerblue') {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    draw_image(image, x, y, width, height) {
        if (width === undefined || height == undefined) {
            this.ctx.drawImage(image, x, y)
        }
        else {
            this.ctx.drawImage(image, 0, 0, width, height)
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
}