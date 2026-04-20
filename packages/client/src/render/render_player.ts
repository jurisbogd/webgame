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
    const yourPlayer = getYourPlayer(game);

    if (!yourPlayer) {
        console.log('no player');
        return;
    }

    if (player.latestRoom !== yourPlayer.latestRoom) {
        return;
    }

    const position = player.position;
    const velocity = player.velocity;

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

    render(draw, true);
}
