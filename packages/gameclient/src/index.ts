import { init_server } from './server.js'
import { queue_event, flush_events } from './event_queue.js';
import { handleNetworkEvent } from './network_event_handlers'
import { render_chat_bubbles } from './render_chat_bubbles.js';
import { gameUpdatePlayer, get_player } from './Player';
import { load_image, load_image_url, load_spritesheet } from './load_image.js'
// import { render_background } from './render/render_background.js';
import { render_players } from './render/render_player.js';
import { clear, flushDrawBuffer, getViewport, initGraphics, render } from './CanvasRenderingContext2dGraphics.js';
import { KeyboardInput } from './KeyboardInput.js';
import { viewportFollowPlayer } from './viewportFollowPlayer.js';
import { Spritesheet } from './Spritesheet.js';
import { NetworkEvent, NetworkPacket } from './NetworkPacket.js';
import { renderTileLayer } from './render/renderTileLayer.js';
import { Room } from './Room.js';
import { Draw } from "./Draw";
import { Vec2 } from '@jbwg/shared/math';
import { renderTiled } from './render/renderTiled.js';

// const networkEventHandlers: Record<string, (game: Game, event: NetworkEvent) => void> = network_event_handlers;

// set this to address and port of server before running client
const server_address = 'localhost'
const port = 10799
const background_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Iceberg%2C_Greenland_Sea_%28js%291.jpg/960px-Iceberg%2C_Greenland_Sea_%28js%291.jpg?_=20130127160351'

export interface Game {
    canvas: HTMLCanvasElement;
    ui: HTMLDivElement;
    chat_input: HTMLInputElement;

    entities: any;

    server: any;

    background_image: any;
    player_sprite: any;
    spritesheets: Record<string, Spritesheet>;
    tilesets: Record<string, HTMLImageElement>;
    backgrounds: Record<string, HTMLImageElement>;
    last_entered_door?: string;

    room?: Room;

    player_id?: number;
    cloudPosition: Vec2;
}

async function initGame(): Promise<Game> {
    const canvas = document.getElementById('canvas-2d') as HTMLCanvasElement;

    if (canvas === undefined) throw new Error("Unable to find 'canvas-2d'");

    initGraphics(canvas);
    KeyboardInput.init(canvas);
    const ui = document.getElementById('ui') as HTMLDivElement;
    const chat_input = document.getElementById('chat-input') as HTMLInputElement;

    if (chat_input === undefined) throw new Error("Unable to find 'chat-input'");
    if (ui === undefined) throw new Error("Unable to find 'ui'");

    const server = await init_server(`ws://${server_address}:${port}`);

    const entities = new Map();

    const background_image = await load_image_url(background_image_url);
    const player_sprite = await load_image('red_orb32');

    const spritesheets: Record<string, Spritesheet> = {};

    for (const spritesheetName of ["tileset_basic", "player_base", "player_basic_demo", "doors"]) {
        const spritesheet = await load_spritesheet(spritesheetName);

        if (spritesheet !== undefined) {
            spritesheets[spritesheetName] = spritesheet;
        };
    };

    const tilesets: Record<string, HTMLImageElement> = {};
    for (const tilesetName of ["greek_features", "greek_floors"]) {
        const tileset = await load_image(tilesetName);
        if (tileset) {
            tilesets[tilesetName] = tileset;
        };
    };

    const backgrounds: Record<string, HTMLImageElement> = {};
    for (const backgroundName of ["blue_sky", "clouds"]) {
        const background = await load_image(backgroundName);
        if (background) {
            backgrounds[backgroundName] = background;
        };
    };

    return {
        canvas,
        ui,
        chat_input,
        entities,
        server,
        background_image,
        player_sprite,
        spritesheets,
        tilesets,
        backgrounds,
        cloudPosition: Vec2.zero,
    };
}

function step(game: Game) {
    KeyboardInput.update();

    if (KeyboardInput.isPressed("enter")) {
        game.chat_input.focus();
    };

    consume_server_packets(game)

    gameUpdatePlayer(game);

    {
        const player = get_player(game);
        if (player !== undefined) {
            queue_event({ tag: "SET_POSITION", position: player.position, velocity: player.velocity });
        };
    };

    // if (game.room) {
    //     check_doors_for_collision(game);
    // };

    // send all buffered network events to server
    flush_events(game.server.ws)

    // rendering
    // game.graphics.clear()

    clear();

    {
        const player = get_player(game)

        if (player) {
            viewportFollowPlayer(player);
        };
    };
    // viewport_follow_player(game)

    if (game.backgrounds.blue_sky && game.backgrounds.clouds) {
        const viewport = getViewport();
        const blueSkyDraw = Draw.image(game.backgrounds.blue_sky, viewport.left, viewport.top);
        render(blueSkyDraw);

        const clouds = game.backgrounds.clouds;
        game.cloudPosition = game.cloudPosition
            .add(new Vec2(0.2, 0.1))
            .remainder(clouds.width);

        renderTiled(clouds, game.cloudPosition);

        // for (let i = 0; i < 4; i++) {
        //     const row = i % 2;
        //     const column = Math.floor(i / 2);

        //     const cloudsDraw = Draw.image(
        //         game.backgrounds.clouds,
        //         viewport.left + game.cloudPosition.x - (column * clouds.width),
        //         viewport.top + game.cloudPosition.y - (row * clouds.width),
        //     );
        //     render(cloudsDraw);
        // };
    };

    // render_background(game)
    // draw_tilemap(game)
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
    }
    // render_room_floor(game);
    // render_room_features(game);
    // render_room_objects(game);
    render_players(game)
    render_chat_bubbles(game)

    flushDrawBuffer(true);

    // game.graphics.flush_render_buffer();
}

// function check_doors_for_collision(game: Game) {
//     for (const [player_id, player] of game.entities) {
//         if (player_id !== game.player_id) continue;

//         if (player.room !== game.room.id) continue;

//         for (const object of game.room.objects) {
//             if (object.type !== 'door') continue;

//             const dx = object.x - player.position.x;
//             const dy = object.y - player.position.y;
//             const distance = Math.sqrt(dx * dx + dy * dy);

//             if (distance > 12) continue;

//             const goto_room_event = {
//                 tag: 'GOTO_ROOM',
//                 dest_ord: object.dest_ord,
//             };

//             queue_event(goto_room_event);

//             player.room = cantor_pair(object.dest_ord.x, object.dest_ord.y);
//             game.last_entered_door = object.id;
//             console.log(`going to room with ord ${object.dest_ord.i}, ${object.dest_ord.j}`);
//         }
//     }
// }

const game = await initGame();

game.chat_input.addEventListener("keydown", (event) => {
    if (event.code === 'Enter') {
        const message = game.chat_input.value

        if (message != '') {
            queue_event({ tag: 'CHAT_MESSAGE', message: message })
            game.chat_input.value = ''
        }

        game.canvas.focus()
    }
});

function consume_server_packets(game: Game) {
    //Consume packets from server
    for (const packet of game.server.received) {
        for (const event of packet.events) {
            const e = event as NetworkEvent;
            // console.log(`received event with tag ${event.tag}`);

            handleNetworkEvent(game, event);

            // const event_handler = networkEventHandlers[e.tag]

            // if (event_handler) {
            //     event_handler(game, event)
            // }
            // else {
            //     // console.log(`packet with unknown event tag ${event.tag} received`)
            //     console.log(event);
            // }
        }
    }

    game.server.received.length = 0
}

const run = () => {
    step(game)
    requestAnimationFrame(run)
}

run()