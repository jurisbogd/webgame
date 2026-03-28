import { init_server } from './server.js'
import { queue_event, flush_events } from './event_queue.js';
import { network_event_handlers } from './network_event_handlers.js'
import { render_chat_bubbles } from './render_chat_bubbles.js';
import { init_keyboard_input, update_keyboard_input, is_key_pressed } from './keyboard_input.js'
import { get_player, update_player } from './player.js';
import { render_entities } from './render_entities.js';
import { load_image, load_image_url, load_tileset } from './load_image.js'
import { init_graphics_crc2d } from './graphics_crc2d.js';
import { Draw } from "./Draw.js";
import { Tilemap } from './Tilemap.js';
import { Tile } from './Tile.js'
import { generate_map } from './generate_map.js';
import { init_2d_array } from './init_2d_array.js';

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

    tilemap;

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
        game.tileset = await load_tileset('tileset_basic');
        game.player_sprite = await load_image('red_orb32');

        // game.tilemap = Tilemap.randomized(16, 16, game.tileset);
        const wallmap = generate_map(0, 0);
        const width = wallmap.length;
        const height = wallmap[0].length;
        const tilemap = new Tilemap(width, height);

        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                const tile = tilemap.get_tile(i, j);
                tile.id = wallmap[i][j];
                tile.tileset = game.tileset;
            }
        }

        game.tilemap = tilemap;

        init_keyboard_input(game.canvas)

        return game;
    }
}

function step(game) {
    if (is_key_pressed('Enter')) game.chat_input.focus()

    consume_server_packets(game)
    update_player(game)

    // send all buffered network events to server
    flush_events(game.server.ws)

    // rendering
    game.graphics.clear()
    draw_background(game)
    draw_tilemap(game)
    highlight_player(game)
    render_chat_bubbles(game)

    update_keyboard_input()
}

const game = await Game.init();

game.chat_input.onkeydown = (event) => {
    if (event.code === 'Enter') {
        const message = chat_input.value

        if (message != '') {
            queue_event({ tag: 'CHAT_MESSAGE', message: message })
            game.chat_input.value = ''
        }

        game.canvas.focus()
    }
}

function draw_tilemap(game) {
    const tilemap = game.tilemap;

    for (let i = 0; i < tilemap.width; i += 1) {
        for (let j = 0; j < tilemap.height; j += 1) {
            const tile = tilemap.get_tile(i, j)

            if (tile.tileset === undefined) {
                continue
            }

            if (!tile.tileset.has_tile(tile.id)) {
                continue
            }

            const draw = Draw.tile(tile.tileset, tile.id, i * 32, j * 32)
            game.graphics.render(draw)
        }
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

function draw_background(game) {
    const draw = Draw.sprite(game.background_image, 0, 0)
        .set_scale_absolute(game.canvas.width, game.canvas.height)
        .set_pivot(0, 0);
    game.graphics.render(draw)
}

function highlight_player(game) {
    const player = get_player(game)

    if (!player) return

    const position = player.position

    if (position === undefined) return

    const draw = Draw.sprite(game.player_sprite, position.x, position.y)
    game.graphics.render(draw)
}

const run = () => {
    step(game)
    requestAnimationFrame(run)
}

run()