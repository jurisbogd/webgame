import { WebSocketServer } from 'ws'
import { push_event, flush_events } from './network_event_buffer.js'
import { select_random } from './select_random.js'
import { network_event_handlers } from './network_event_handlers.js'

const port = 10799
const server = new WebSocketServer({ port: port })
const players = new Map()
const newPlayers = []
const packetsFromClients = []
const map = {
    width: 640,
    height: 480,
}
const bouncers = new Map()

let nextEntityId = 0

const game = {
    map: map,
    entities: players,
    packet_to_send: undefined,
    players_to_delete: [],
    rooms: new Map(),
}

server.on('connection', (connection) => {
    console.log('new connection')

    const id = nextEntityId
    nextEntityId += 1

    const player = {
        connection: connection,
        x: Math.random() * map.width,
        y: Math.random() * map.height,
    }

    sendInitializationPacket(connection, id)

    players.set(id, player)
    newPlayers.push({ tag: 'NEW_ENTITY', id: id, x: player.x, y: player.y })

    // packetToBeSent.events.push({ tag: 'NEW_PLAYER', id: id, x: player.x, y: player.y })

    connection.onmessage = message => {
        const packet = JSON.parse(message.data)
        packet.sender = id
        packetsFromClients.push(packet)
    }
    connection.onerror = error => console.error(error)
    connection.onclose = () => game.players_to_delete.push(id)
})

function run() {
    const timeStep = 1000 / 60 //60 FPS
    setInterval(() => { step(game) }, timeStep)
}

function sendInitializationPacket(connection, id) {
    console.log('sending initialization packet')
    const packet = { events: [] }
    packet.events.push({ tag: 'SET_PLAYER_ID', id: id })
    for (const [id, player] of players) {
        packet.events.push({ tag: 'NEW_ENTITY', id: id, x: player.x, y: player.y })
    }
    const json = JSON.stringify(packet)
    connection.send(JSON.stringify(packet))
    console.log(json)
}

function step(game) {
    // packetToBeSent = { events: [] }
    game.packet_to_send = { events: [] }
    consumeClientPackets(game)
    flushplayersToBeDeleted(game)

    for (const event of newPlayers) {
        game.packet_to_send.events.push(event)
    }

    newPlayers.length = 0

    transmitToAllClients(game)
}

function consumeClientPackets(game) {
    for (const packet of packetsFromClients) {
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

    packetsFromClients.length = 0
}

function flushplayersToBeDeleted(game) {
    for (const player_id of game.players_to_delete) {
        game.entities.delete(player_id)
        // send DELETE_PLAYER event to all clients
        const event = { tag: 'DELETE_PLAYER', id: player_id }
        game.packet_to_send.events.push(event)
    }

    game.players_to_delete.length = 0
}

function transmitToAllClients(game) {
    const json = JSON.stringify(game.packet_to_send)
    for (const player of game.entities.values()) {
        player.connection.send(json)
    }
}

run()
