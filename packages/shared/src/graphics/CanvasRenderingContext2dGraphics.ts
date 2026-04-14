import { rectOverlap } from "../math";
import { isNotNullOrUndefined } from "../utils";
import { Draw } from "./Draw";
import { IGraphics } from "./IGraphics";

export class CanvasRenderingContext2dGraphics extends IGraphics {
    private ctx: CanvasRenderingContext2D;
    private drawBuffer: Draw[] = [];

    constructor(canvas: HTMLCanvasElement, renderScale = 2) {
        super(canvas, renderScale);

        const ctx = canvas.getContext("2d");

        if (!isNotNullOrUndefined(ctx)) {
            throw new Error("Unable to initialize CanvasRenderingContext2d");
        };

        this.ctx = ctx;
    };

    private renderInternal(draw: Draw) {
        const xPosition = draw.left - this.viewport.left;
        const yPosition = draw.top - this.viewport.top;
        const scaledXPosition = Math.floor(xPosition) * this.renderScale;
        const scaledYPosition = Math.floor(yPosition) * this.renderScale;
        const scaledWidth = draw.transform.w * this.renderScale;
        const scaledHeight = draw.transform.h * this.renderScale;

        this.ctx.drawImage(
            draw.image,
            draw.spriteRect.x,
            draw.spriteRect.y,
            draw.spriteRect.w,
            draw.spriteRect.h,
            scaledXPosition,
            scaledYPosition,
            scaledWidth,
            scaledHeight
        )
    }

    clear(color = "cornflowerblue") {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };

    render(draw: Draw, buffer: boolean = false): void {
        // skip rendering if outside of viewport
        if (rectOverlap(this.viewport, draw)) {
            if (buffer) {
                this.drawBuffer.push(draw);
            }
            else {
                this.renderInternal(draw);
            };
        };
    };

    renderBuffered(draw: Draw): void {
        if (rectOverlap(this.viewport, draw)) {
            this.drawBuffer.push(draw);
        };
    };

    flushDrawBuffer(depthSort: boolean = false): void {
        if (depthSort) {
            this.drawBuffer.sort((a, b) => a.depth - b.depth);

            for (const draw of this.drawBuffer) {
                this.renderInternal(draw);
            };

            this.drawBuffer.length = 0;
        };
    };
}