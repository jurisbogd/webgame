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

// set this to address and port of server before running client
const server_address = 'localhost'
const port = 10799
const server = await init_server(`ws://${server_address}:${port}`)

const background_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Iceberg%2C_Greenland_Sea_%28js%291.jpg/960px-Iceberg%2C_Greenland_Sea_%28js%291.jpg?_=20130127160351'
const background_image = await load_image_url(background_image_url)

const canvas = document.getElementById('canvas-2d');
const graphics = await init_graphics_crc2d(canvas)

const ctx = canvas.getContext('2d');
const entities = new Map()
const ui = document.getElementById('ui')
const chat_input = document.getElementById('chat-input')

init_keyboard_input(canvas)

const tileset = await load_tileset('tileset_basic')
const player_sprite = await load_image('red_orb32')

const tilemap = Tilemap.randomized(16, 16, tileset)

class Game {
    server;

    canvas;
    graphics;

    entities;
    ui;
    chat_input;

    background_image;
    tileset;
    player_sprite;

    constructor() {
        //TODO
    }
}

const game = {
    player_id: undefined,
    entities: entities,
    server: server,
    graphics: graphics,
    ui: ui,
    ctx: ctx,
}

chat_input.onkeydown = (event) => {
    if (event.code === 'Enter') {
        const message = chat_input.value

        if (message != '') {
            queue_event({ tag: 'CHAT_MESSAGE', message: message })
            chat_input.value = ''
        }

        canvas.focus()
    }
}

function run() {
    step()
    requestAnimationFrame(run)
}

function draw_tilemap(game) {
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
            // game.graphics.draw_tile(tileset, tile_id, i * 16, j * 16)
        }
    }
}

function step() {
    if (is_key_pressed('Enter')) chat_input.focus()

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
    const draw = Draw.sprite(background_image, 0, 0)
        .set_scale_absolute(canvas.width, canvas.height)
        .set_pivot(0, 0);
    game.graphics.render(draw)
    // game.graphics.draw_image(background_image, 0, 0, canvas.width, canvas.height)
    // ctx.drawImage(background_image, 0, 0, canvas.width, canvas.height)
}

function highlight_player(game) {
    const player = get_player(game)

    if (!player) return

    const position = player.position

    if (position === undefined) return

    // game.graphics.draw_circle(position.x, position.y, 16, 'orangered', 4)

    const draw = Draw.sprite(player_sprite, position.x, position.y)
    game.graphics.render(draw)

    // game.ctx.strokeStyle = 'orangered'
    // game.ctx.lineWidth = 4
    // game.ctx.beginPath()
    // game.ctx.ellipse(position.x, position.y, 16, 16, 0, 0, Math.PI * 2)
    // game.ctx.stroke()
}

run()
