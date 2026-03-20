import { init_server } from './server.js'
import { queue_event, flush_events } from './event_queue.js';
import { network_event_handlers } from './network_event_handlers.js'
import { render_chat_bubbles } from './render_chat_bubbles.js';
import { init_keyboard_input, update_keyboard_input, is_key_pressed } from './keyboard_input.js'
import { update_player } from './player.js';
import { render_entities } from './render_entities.js';

// set this to address and port of server before running client
const server_address = 'localhost'
const port = 10799
const server = await init_server(`ws://${server_address}:${port}`)

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
    clear_canvas()
    render_entities(game)
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

function clear_canvas(color = 'cornflowerblue') {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

run()
