import { Rect, Vec2 } from '@jbwg/shared/math'
import { KeyboardInput } from './KeyboardInput'
import { Room, movePlayer } from "@jbwg/shared/game";
import { Player } from './Game';
import { Game } from './Game';

// function playerInputProcess(player: Player) {
//     const speed = 1.5;
//     const movementDirection = KeyboardInput.movementDirection();

//     player.velocity = movementDirection.multiply(speed);
// };

// function resolveCollisions(player: Player, room: Room) {
//     return axisSeparatedCollisionTrace(
//         new Rect(player.position.x, player.position.y, 14, 14),
//         player.velocity,
//         room,
//     );
// };

export function gameUpdatePlayer(game: Game) {
    game.inputBuffer = game.inputBuffer.filter(i => i.timestamp > game.latestSnapshotInputTimestamp);
    const player = getYourPlayer(game);

    const room = game.noclip
        ? undefined
        : game.room;

    if (!player) return;

    if (game.lastFastForward < game.latestSnapshotInputTimestamp) {
        player.position = player.latestPosition;
        player.velocity = player.latestVelocity;
        player.room = player.latestRoom;
        // fast forward inputs
        for (const input of game.inputBuffer) {
            const movementDirection = input.movementDirection;

            const { position, velocity } = movePlayer(player.position, movementDirection, room);
            player.position = position;
            player.velocity = velocity;
        }
        game.lastFastForward = game.latestSnapshotInputTimestamp;
    }

    const movementDirection = KeyboardInput.movementDirection();

    const { position, velocity } = movePlayer(player.position, movementDirection, room);
    player.position = position;
    player.velocity = velocity;
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