import { Vec2 } from '@jbwg/shared/math';
import { render } from '../CanvasRenderingContext2dGraphics';
import { Draw, drawSprite } from '../Draw';
import { Game, Player } from '../index';
import { get_player } from '../Player';

export function render_players(game: Game) {
    for (const entity of game.entities.values()) {
        render_player(game, entity);

        // console.log(`${entity.room}, ${game.room.id}`);
    }
}

function render_player(game: Game, player: Player) {
    // const player = get_player(game);

    if (!player) {
        console.log('no player');
        return;
    }

    // if (player.room !== game.room.id) {
    //     console.log('room id mismatch');
    //     return;
    // }

    const position = player.position;
    // const previous_position = player.previous_position;

    const velocity = player.velocity;

    // if (position === undefined || previous_position === undefined) return;

    if (velocity.y > 0) player.look_direction = 'down';
    else if (velocity.y < 0) player.look_direction = 'up';
    else if (velocity.x > 0) player.look_direction = 'right';
    else if (velocity.x < 0) player.look_direction = 'left';

    const spritesheet = game.spritesheets.player_base;

    let frame;
    if (velocity.x !== 0 || velocity.y) {
        let animation;

        if (player.look_direction === 'right') animation = 'walk_right';
        else if (player.look_direction === 'left') animation = 'walk_left';
        else if (player.look_direction === 'down') animation = 'walk_down';
        else animation = 'walk_up';

        const sheetAnimation = spritesheet.animations[animation];

        player.animation_time = (player.animation_time + 1 / 60) % sheetAnimation.duration;
        const frameIdx = Math.floor(player.animation_time / sheetAnimation.duration * sheetAnimation.frames.length);
        frame = sheetAnimation.frames[frameIdx];

        // frame = spritesheet.get_animation_frame(animation, player.animation_time);
        // player.animation_time = spritesheet.step_animation_time(animation, player.animation_time);
    }
    else {
        if (player.look_direction === 'right') frame = 'look_right';
        else if (player.look_direction === 'left') frame = 'look_left';
        else if (player.look_direction === 'down') frame = 'look_down';
        else frame = 'look_up';
        player.animation_time = 0;
    }

    const draw = drawSprite(spritesheet, frame, position);
    draw.depth = draw.bottom;

    // const draw = Draw.sprite(spritesheet, frame, position.x, position.y)
    // .set_depth_bottom();

    render(draw, true);

    // game.graphics.render_buffered(draw);
}
