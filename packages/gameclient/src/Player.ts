import { Rect, Vec2 } from '@jbwg/shared/math'
import { KeyboardInput } from './KeyboardInput'
import { Room, axisSeparatedCollisionTrace } from "@jbwg/shared/game";
import { Player } from './Game';
import { Game } from './Game';

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

export function gameUpdatePlayer(game: Game) {
    const player = getYourPlayer(game);

    if (player === undefined) return;

    playerInputProcess(player)

    player.position = game.room
        ? resolveCollisions(player, game.room)
        : player.position.add(player.velocity);
};

export function getYourPlayer(game: Game) {
    if (game.yourNetworkId !== undefined) {
        return game.entities.get(game.yourNetworkId)
    }

    return undefined;
}

export function getYourNetworkId(game: Game) {
    return game.yourNetworkId
}

export function setYourNetworkId(game: Game, networkId: number) {
    game.yourNetworkId = networkId
}