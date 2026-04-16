import { Vec2 } from "@jbwg/shared/math";
import { getViewport, render } from "../CanvasRenderingContext2dGraphics";
import { Draw } from "../Draw";

export function renderTiled(image: HTMLImageElement, offset: Vec2) {
    const viewport = getViewport();
    const imageSize = new Vec2(image.width, image.height);
    const cells = viewport.size
        .divide(imageSize)
        .floor();

    for (let i = -1; i <= cells.x; ++i) {
        for (let j = -1; j <= cells.y; ++j) {
            const position = new Vec2(i, j)
                .multiply(imageSize)
                .add(offset)
                .add(new Vec2(viewport.left, viewport.top));

            const draw = Draw.image(image, position.x, position.y);
            render(draw);
        };
    };
};