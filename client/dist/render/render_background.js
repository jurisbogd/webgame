import { Draw } from '../Draw.js';

export function render_background(game) {
    const graphics = game.graphics;
    const viewport = graphics.viewport;
    const background_image = game.background_image;
    const draw = Draw.image(background_image, viewport.get_left(), viewport.get_top())
        .set_scale_absolute(viewport.get_width(), viewport.get_height());

    graphics.render(draw);
}
