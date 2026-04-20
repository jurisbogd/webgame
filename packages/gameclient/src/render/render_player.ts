import { Vec2 } from '@jbwg/shared/math';
import { render } from '../CanvasRenderingContext2dGraphics';
import { Draw, drawSprite } from '../Draw';
import { Player } from '../Game';
import { Game } from '../Game';
import { getYourPlayer } from '../Player';

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

    if (velocity.y > 0) player.lookDirection = 'down';
    else if (velocity.y < 0) player.lookDirection = 'up';
    else if (velocity.x > 0) player.lookDirection = 'right';
    else if (velocity.x < 0) player.lookDirection = 'left';

    const spritesheet = game.spritesheets.player_base;

    let frame;
    if (velocity.x !== 0 || velocity.y) {
        let animation;

        if (player.lookDirection === 'right') animation = 'walk_right';
        else if (player.lookDirection === 'left') animation = 'walk_left';
        else if (player.lookDirection === 'down') animation = 'walk_down';
        else animation = 'walk_up';

        const sheetAnimation = spritesheet.animations[animation];

        player.animationTime = (player.animationTime + 1 / 60) % sheetAnimation.duration;
        const frameIdx = Math.floor(player.animationTime / sheetAnimation.duration * sheetAnimation.frames.length);
        frame = sheetAnimation.frames[frameIdx];

        // frame = spritesheet.get_animation_frame(animation, player.animation_time);
        // player.animation_time = spritesheet.step_animation_time(animation, player.animation_time);
    }
    else {
        if (player.lookDirection === 'right') frame = 'look_right';
        else if (player.lookDirection === 'left') frame = 'look_left';
        else if (player.lookDirection === 'down') frame = 'look_down';
        else frame = 'look_up';
        player.animationTime = 0;
    }

    const draw = drawSprite(spritesheet, frame, position);
    draw.depth = draw.bottom;

    // const draw = Draw.sprite(spritesheet, frame, position.x, position.y)
    // .set_depth_bottom();

    render(draw, true);

    // game.graphics.render_buffered(draw);
}
