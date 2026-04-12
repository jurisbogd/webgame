import { Draw } from '../Draw.js';

export function render_background(game) {
    const graphics = game.graphics;
    const viewport = graphics.viewport;
    const background_image = game.background_image;
    const draw = Draw.image(background_image, viewport.left, viewport.top)
        .set_scale_absolute(game.canvas.width, game.canvas.height);

    graphics.render(draw);
}
