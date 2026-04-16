import { Draw } from "./Draw";
import { Rect, rectOverlap } from "@jbwg/shared/math";
import { isNotNullOrUndefined } from "@jbwg/shared/utils";

const drawBuffer: Draw[] = [];
let viewport = Rect.zero;
let renderScale = 2;
let canvasRenderingContext2d: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;

export function initGraphics(c: HTMLCanvasElement) {
    canvas = c;

    const ctx = canvas.getContext("2d");

    if (!isNotNullOrUndefined(ctx)) {
        throw new Error("Unable to initialize CanvasRenderingContext2d");
    };

    canvasRenderingContext2d = ctx;
    canvasRenderingContext2d.imageSmoothingEnabled = false;

    viewport = new Rect(
        0,
        0,
        Math.floor(canvas.width / renderScale),
        Math.floor(canvas.height / renderScale),
    );
};

export function clear(color = "cornflowerblue") {
    canvasRenderingContext2d.fillStyle = color;
    canvasRenderingContext2d.fillRect(0, 0, canvas.width, canvas.height);
};

export function render(draw: Draw, buffer: boolean = false): void {
    // skip rendering if outside of viewport
    if (rectOverlap(viewport, draw)) {
        if (buffer) {
            drawBuffer.push(draw);
        }
        else {
            renderInternal(draw);
        };
    };
};

export function renderBuffered(draw: Draw) {
    render(draw, true);
};

export function flushDrawBuffer(useDepthSorting: boolean = false) {
    const draws = useDepthSorting
        ? drawBuffer.sort((a, b) => a.depth - b.depth)
        : drawBuffer;

    for (const draw of draws) {
        renderInternal(draw);
    };

    drawBuffer.length = 0;
};

export function getViewport() {
    return viewport;
};

export function getRenderScale() {
    return renderScale;
};

function renderInternal(draw: Draw) {
    const xPosition = draw.left - viewport.left;
    const yPosition = draw.top - viewport.top;
    const scaledXPosition = Math.floor(xPosition * renderScale);
    const scaledYPosition = Math.floor(yPosition * renderScale);
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
};