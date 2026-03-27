import { init_server } from './server.js'
import { queue_event, flush_events } from './event_queue.js';
import { network_event_handlers } from './network_event_handlers.js'
import { render_chat_bubbles } from './render_chat_bubbles.js';
import { init_keyboard_input, update_keyboard_input, is_key_pressed } from './keyboard_input.js'
import { get_player, update_player } from './player.js';
import { render_entities } from './render_entities.js';
import { load_image } from './load_image.js'
import { init_graphics_crc2d } from './graphics_crc2d.js';

// set this to address and port of server before running client
const server_address = 'localhost'
const port = 10799
const server = await init_server(`ws://${server_address}:${port}`)

const background_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Iceberg%2C_Greenland_Sea_%28js%291.jpg/960px-Iceberg%2C_Greenland_Sea_%28js%291.jpg?_=20130127160351'
const background_image = await load_image(background_image_url)

const graphics = await init_graphics_crc2d()

const canvas = document.getElementById('canvas-2d');
const ctx = canvas.getContext('2d');
const entities = new Map()
const ui = document.getElementById('ui')
const chat_input = document.getElementById('chat-input')

init_keyboard_input(canvas)

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

function step() {
    if (is_key_pressed('Enter')) chat_input.focus()

    consume_server_packets(game)
    update_player(game)

    // send all buffered network events to server
    flush_events(game.server.ws)

    // rendering
    game.graphics.clear()
    draw_background(game)
    render_entities(game)
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
    game.graphics.draw_image(background_image, 0, 0, canvas.width, canvas.height)
    // ctx.drawImage(background_image, 0, 0, canvas.width, canvas.height)
}

function highlight_player(game) {
    const player = get_player(game)

    if (!player) return

    const position = player.position

    if (position === undefined) return

    game.graphics.draw_circle(position.x, position.y, 16, 'orangered', 4)

    // game.ctx.strokeStyle = 'orangered'
    // game.ctx.lineWidth = 4
    // game.ctx.beginPath()
    // game.ctx.ellipse(position.x, position.y, 16, 16, 0, 0, Math.PI * 2)
    // game.ctx.stroke()
}

run()
