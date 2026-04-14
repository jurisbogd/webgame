import { Rect, Vec2 } from "../math";
import { Draw } from "./Draw";

export abstract class IGraphics {
    canvas: HTMLCanvasElement;
    viewport: Rect;
    private _renderScale: number;

    constructor(canvas: HTMLCanvasElement, renderScale = 2) {
        this.canvas = canvas;
        this.viewport = new Rect(
            0,
            0,
            canvas.width / renderScale,
            canvas.height / renderScale
        );
        this._renderScale = renderScale;
    }

    abstract clear(color: string): void;
    abstract render(draw: Draw, buffer: boolean): void;
    abstract renderBuffered(draw: Draw): void;
    abstract flushDrawBuffer(depthSort: boolean): void;

    get renderScale() {
        return this._renderScale;
    };

    set renderScale(value: number) {
        this._renderScale = value;
    };
}