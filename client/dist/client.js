import { init_server } from './server.js'
import { queue_event, flush_events } from './event_queue.js';
import { network_event_handlers } from './network_event_handlers.js'
import { render_chat_bubbles } from './render_chat_bubbles.js';
import { init_keyboard_input, update_keyboard_input, is_key_pressed } from './keyboard_input.js'
import { get_player, update_player } from './player.js';
import { render_entities } from './render_entities.js';
import { load_image, load_image_url, load_spritesheet } from './load_image.js'
import { init_graphics_crc2d } from './graphics_crc2d.js';
import { Draw } from "./Draw.js";
import { generate_room } from './generate_map.js';
import { init_2d_array } from './init_2d_array.js';
import { Rectangle } from './math/Rectangle.js';
import { Vec2 } from './math/Vec2.js';
import { render_room_features } from './render/render_room_features.js';
import { render_room_floor } from './render/render_room_floor.js';
import { render_background } from './render/render_background.js';

// set this to address and port of server before running client
const server_address = 'localhost'
const port = 10799
const background_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Iceberg%2C_Greenland_Sea_%28js%291.jpg/960px-Iceberg%2C_Greenland_Sea_%28js%291.jpg?_=20130127160351'

class Game {
    canvas;
    ui;
    chat_input;

    entities;

    graphics;
    server;

    background_image;
    tileset;
    player_sprite;

    room;

    player_id = undefined;

    static async init() {
        const game = new Game()
        game.canvas = document.getElementById('canvas-2d');
        game.ui = document.getElementById('ui')
        game.chat_input = document.getElementById('chat-input')

        game.graphics = await init_graphics_crc2d(game.canvas);
        game.server = await init_server(`ws://${server_address}:${port}`);

        game.entities = new Map();

        game.background_image = await load_image_url(background_image_url);
        game.tileset = await load_spritesheet('tileset_basic');
        game.player_sprite = await load_image('red_orb32');

        const room = generate_room(game.tileset, Math.floor(Math.random() * 16), Math.floor(Math.random() * 16));
        game.room = room;

        init_keyboard_input(game.canvas)

        return game;
    }
}

function viewport_follow_player(game) {
    const player = get_player(game);

    if (!player) return;

    const position = player.position;

    if (position === undefined) return;

    game.graphics.set_viewport_position(position.x, position.y);
}

function step(game) {
    if (is_key_pressed('Enter')) game.chat_input.focus()

    consume_server_packets(game)
    update_player(game)

    // send all buffered network events to server
    flush_events(game.server.ws)

    // rendering
    game.graphics.clear()
    viewport_follow_player(game)
    render_background(game)
    // draw_tilemap(game)
    render_room_floor(game);
    render_room_features(game);
    highlight_player(game)
    render_chat_bubbles(game)
    game.graphics.flush_render_buffer();

    update_keyboard_input()
}

const game = await Game.init();

game.chat_input.onkeydown = (event) => {
    if (event.code === 'Enter') {
        const message = game.chat_input.value

        if (message != '') {
            queue_event({ tag: 'CHAT_MESSAGE', message: message })
            game.chat_input.value = ''
        }

        game.canvas.focus()
    }
}

function consume_server_packets(game) {
    //Consume packets from server
    for (const packet of game.server.received) {
        for (const event of packet.events) {
            console.log(`received event with tag ${event.tag}`);

            const event_handler = network_event_handlers[event.tag]

            if (event_handler) {
                event_handler(game, event)
            }
            else {
                console.log(`packet with unknown event tag ${event.tag} received`)
            }
        }
    }

    game.server.received.length = 0
}

function highlight_player(game) {
    const player = get_player(game)

    if (!player) return

    const position = player.position

    if (position === undefined) return

    const draw = Draw.image(game.player_sprite, position.x, position.y)
        // .set_pivot(0.5, 0.5)
        .set_depth_bottom();
    game.graphics.render_buffered(draw)
}

const run = () => {
    step(game)
    requestAnimationFrame(run)
}

run()