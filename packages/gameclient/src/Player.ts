import { Rect, Vec2 } from '@jbwg/shared/math'
import { KeyboardInput } from './KeyboardInput.js'
import { axisSeparatedCollisionTrace } from './axisSeparatedCollision.js';
import { Room } from './Room.js';

interface Player {
    position: Vec2;
    velocity: Vec2;
};

function playerInputProcess(player: Player) {
    const speed = 1.5;
    const movementDirection = KeyboardInput.movementDirection();

    player.velocity = movementDirection.multiply(speed);
};

function resolveCollisions(player: Player, room: Room) {
    return axisSeparatedCollisionTrace(
        new Rect(player.position.x, player.position.y, 14, 14),
        player.velocity,
        room,
    );
};

interface Game {
    entities: Map<number, Player>;
    player_id?: number;
    room?: Room,
};

export function gameUpdatePlayer(game: Game) {
    const player = get_player(game);

    if (player === undefined) return;

    playerInputProcess(player)

    player.position = game.room
        ? resolveCollisions(player, game.room)
        : player.position.add(player.velocity);
};

export function get_player(game: Game) {
    if (game.player_id !== undefined) {
        return game.entities.get(game.player_id)
    }

    return undefined;
}

export function get_player_id(game: Game) {
    return game.player_id
}

export function set_player_id(game: Game, player_id: number) {
    game.player_id = player_id
}