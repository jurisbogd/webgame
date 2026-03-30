import { Draw } from '../Draw.js';
import { get_player } from '../player.js';

export function render_player(game) {
    const player = get_player(game);

    if (!player) return;

    const position = player.position;
    const previous_position = player.previous_position;

    if (position === undefined || previous_position === undefined) return;

    if (position.y > previous_position.y) player.look_direction = 'down';
    else if (position.y < previous_position.y) player.look_direction = 'up';
    else if (position.x > previous_position.x) player.look_direction = 'right';
    else if (position.x < previous_position.x) player.look_direction = 'left';

    const spritesheet = game.spritesheets.player_basic_demo;

    let frame;
    if (position.x !== previous_position.x || position.y !== previous_position.y) {
        let animation;

        if (player.look_direction === 'right') animation = 'walk_right';
        else if (player.look_direction === 'left') animation = 'walk_left';
        else if (player.look_direction === 'down') animation = 'walk_down';
        else if (player.look_direction === 'up') animation = 'walk_up';

        frame = spritesheet.get_animation_frame(animation, player.animation_time);
        player.animation_time = spritesheet.step_animation_time(animation, player.animation_time);
    }
    else {
        if (player.look_direction === 'right') frame = 'look_right';
        else if (player.look_direction === 'left') frame = 'look_left';
        else if (player.look_direction === 'down') frame = 'look_down';
        else if (player.look_direction === 'up') frame = 'look_up';
        player.animation_time = 0;
    }

    const draw = Draw.sprite(spritesheet, frame, position.x, position.y)
        .set_depth_bottom();

    game.graphics.render_buffered(draw);
}
