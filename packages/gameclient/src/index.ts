import { renderChatBubbles } from './render_chat_bubbles';
import { gameUpdatePlayer, getYourPlayer } from './Player';
import { render_players } from './render/render_player';
import { clear, flushDrawBuffer, getViewport, initGraphics, render } from './CanvasRenderingContext2dGraphics';
import { KeyboardInput } from './KeyboardInput';
import { viewportFollowPlayer } from './viewportFollowPlayer';
import { renderTileLayer } from './render/renderTileLayer';
import { Draw } from "./Draw";
import { Vec2 } from '@jbwg/shared/math';
import { renderTiled } from './render/renderTiled';
import { Game } from './Game';
import { ClientInputPacket } from '@jbwg/shared/game';

function step(game: Game) {
    if (KeyboardInput.isPressed("enter")) {
        game.chatInput.focus();
    };

    // gameUpdatePlayer(game);

    // {
    //     const player = getYourPlayer(game);
    //     if (player !== undefined) {
    //         // queue_event({ tag: "SET_POSITION", position: player.position, velocity: player.velocity });
    //     };
    // };
    gameUpdatePlayer(game);

    const movementDirection = KeyboardInput.movementDirection();
    const inputPacket: ClientInputPacket = {
        tag: "INPUT",
        movementDirection: movementDirection,
        timestamp: performance.now(),
    }
    game.sendToServer(inputPacket);
    game.inputBuffer.push(inputPacket);

    clear();

    game.interpolateSnapshots();

    {
        const player = getYourPlayer(game)

        if (player) {
            viewportFollowPlayer(player);
        };
    };

    if (game.backgrounds.blue_sky && game.backgrounds.clouds) {
        const viewport = getViewport();
        const blueSkyDraw = Draw.image(game.backgrounds.blue_sky, viewport.left, viewport.top);
        render(blueSkyDraw);

        const clouds = game.backgrounds.clouds;
        game.cloudPosition = game.cloudPosition
            .add(new Vec2(0.2, 0.1))
            .remainder(clouds.width);

        renderTiled(clouds, game.cloudPosition);
    };

    if (game.room) {
        for (const layer of game.room.floors) {
            renderTileLayer(game.tilesets, game.room, layer);
        };
        renderTileLayer(
            game.tilesets,
            game.room,
            game.room.features,
            game.room.zs
        );
    };
    render_players(game)
    renderChatBubbles(game)

    flushDrawBuffer(true);

    KeyboardInput.update();
}

const game = await Game.init();

const run = () => {
    step(game)
    requestAnimationFrame(run)
}

run()