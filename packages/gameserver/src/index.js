import { WebSocketServer } from 'ws'
import { push_event, flush_events } from './network_event_buffer.js'
import { select_random } from './select_random.js'
import { network_event_handlers } from './network_event_handlers.js'
import { create_game } from './create/create_game.js'

// const port = 10799
// const server = new WebSocketServer({ port: port })
// const players = new Map()
// const newPlayers = []
// const packetsFromClients = []
// const map = {
//     width: 640,
//     height: 480,
// }

// let nextEntityId = 0

// const game = {
//     map: map,
//     entities: players,
//     packet_to_send: undefined,
//     players_to_delete: [],
//     rooms: new Map(),
// }

const game = await create_game();

// server.on('connection', (connection) => {
//     console.log('new connection')

//     const id = nextEntityId
//     nextEntityId += 1

//     const player = {
//         connection: connection,
//         x: Math.random() * map.width,
//         y: Math.random() * map.height,
//     }

//     sendInitializationPacket(connection, id)

//     players.set(id, player)
//     newPlayers.push({ tag: 'NEW_ENTITY', id: id, x: player.x, y: player.y })

//     // packetToBeSent.events.push({ tag: 'NEW_PLAYER', id: id, x: player.x, y: player.y })

//     connection.onmessage = message => {
//         const packet = JSON.parse(message.data)
//         packet.sender = id
//         packetsFromClients.push(packet)
//     }
//     connection.onerror = error => console.error(error)
//     connection.onclose = () => game.players_to_delete.push(id)
// })

function run() {
    const time_step = 1000 / 60; //60 FPS
    setInterval(() => { step(game) }, time_step);
}

// function sendInitializationPacket(connection, id) {
//     console.log('sending initialization packet')
//     const packet = { events: [] }
//     packet.events.push({ tag: 'SET_PLAYER_ID', id: id })
//     for (const [id, player] of players) {
//         packet.events.push({ tag: 'NEW_ENTITY', id: id, x: player.x, y: player.y })
//     }
//     const json = JSON.stringify(packet)
//     connection.send(JSON.stringify(packet))
//     console.log(json)
// }

function consume_new_players(game) {
    for (const player_id of game.new_players) {
        const player = game.players.get(player_id);

        const event = {
            tag: 'NEW_ENTITY',
            id: player_id,
            room_id: player.room,
            position: player.position,
            velocity: player.velocity,
        };

        game.packet_to_send.events.push(event);
    }

    game.new_players.length = 0;
}

function transmit_player_positions(game) {
    for (const [playerId, player] of game.players) {
        // const set_position_event = { tag: 'SET_POSITION', id: player_id, x: player.x, y: player.y };
        const setPositionEvent = {
            tag: "SET_POSITION",
            id: playerId,
            position: player.position,
            velocity: player.velocity,
        };
        game.packet_to_send.events.push(setPositionEvent);
    }
}

function step(game) {
    // packetToBeSent = { events: [] }
    game.packet_to_send = { events: [] }
    consumeClientPackets(game)
    flushplayersToBeDeleted(game)

    consume_new_players(game);
    transmit_player_positions(game);

    transmitToAllClients(game)
}

function consumeClientPackets(game) {
    for (const packet of game.packets_from_clients) {
        for (const event of packet.events) {
            const handler = network_event_handlers[event.tag]

            if (handler) {
                handler(game, packet.sender, event)
            }
            else {
                console.log(`packet with unknown event tag ${event.tag} received from client`)
            }
        }
    }

    game.packets_from_clients.length = 0
}

function flushplayersToBeDeleted(game) {
    for (const player_id of game.players_to_delete) {
        game.players.delete(player_id)
        // send DELETE_PLAYER event to all clients
        const event = { tag: 'DELETE_PLAYER', id: player_id }
        game.packet_to_send.events.push(event)
    }

    game.players_to_delete.length = 0
}

function transmitToAllClients(game) {
    const json = JSON.stringify(game.packet_to_send)
    for (const player of game.players.values()) {
        player.connection.send(json)
    }
}

run()
