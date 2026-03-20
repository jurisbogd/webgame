import { WebSocketServer } from 'ws'
import { push_event, flush_events } from './network_event_buffer.js'

const port = 10799
const server = new WebSocketServer({ port: port })
const players = new Map()
const newPlayers = []
const playersToBeDeleted = []
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
    bouncers: bouncers,
}

for (let i = 0; i < 10; i += 1) {
    const bouncer = {}

    const x = Math.random() * map.width
    const y = Math.random() * map.height
    const position = { x, y }

    bouncer.position = position

    const angle = Math.random() * Math.PI * 2
    const speed = 3
    const velocityX = Math.cos(angle) * speed
    const velocityY = Math.sin(angle) * speed
    const velocity = { x: velocityX, y: velocityY }

    bouncer.velocity = velocity

    game.bouncers.set(nextEntityId, bouncer)
    nextEntityId += 1
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

    players.set(id, player)

    sendInitializationPacket(connection, id)

    newPlayers.push({ tag: 'NEW_ENTITY', id: id, x: player.x, y: player.y, color: 'aqua' })

    // packetToBeSent.events.push({ tag: 'NEW_PLAYER', id: id, x: player.x, y: player.y })

    connection.onmessage = message => {
        const packet = JSON.parse(message.data)
        packet.sender = id
        packetsFromClients.push(packet)
    }
    connection.onerror = error => console.error(error)
    connection.onclose = () => playersToBeDeleted.push(id)
})

function run() {
    const timeStep = 1000 / 60 //60 FPS
    setInterval(step, timeStep)
}

function sendInitializationPacket(connection, id) {
    console.log('sending initialization packet')
    const packet = { events: [] }
    packet.events.push({ tag: 'SET_PLAYER_ID', id: id })
    for (const [entity_id, entity] of bouncers) {
        const position = entity.position

        if (position === undefined) continue

        packet.events.push({ tag: 'NEW_ENTITY', id: entity_id, x: position.x, y: position.y, color: 'blue' })
    }
    for (const [id, player] of players) {
        packet.events.push({ tag: 'NEW_ENTITY', id: id, x: player.x, y: player.y, color: 'aqua' })
    }
    const json = JSON.stringify(packet)
    connection.send(JSON.stringify(packet))
    console.log(json)
}

let packetToBeSent
function step() {
    packetToBeSent = { events: [] }
    consumeClientPackets()
    update_bouncers(game)
    flushplayersToBeDeleted()

    for (const event of newPlayers) {
        packetToBeSent.events.push(event)
    }

    newPlayers.length = 0

    transmitToAllClients()
}

const network_event_handlers = {
    SET_POSITION: (game, sender_id, event) => {
        //Update player position
        const player = game.entities.get(sender_id)

        if (!player) return

        player.x = event.x
        player.y = event.y

        //Retransmit to all players
        const set_position_event = { tag: 'SET_POSITION', id: sender_id, x: event.x, y: event.y }

        // push_event(set_position_event)
        packetToBeSent.events.push(set_position_event)
    },
    CHAT_MESSAGE: (game, sender_id, event) => {
        console.log(`got chat message: ${event.message}`)

        const chat_message_event = { tag: 'CHAT_MESSAGE', id: sender_id, message: event.message }

        // push_event(chat_message_event)
        packetToBeSent.events.push(chat_message_event)
    },
}

function consumeClientPackets() {
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

function flushplayersToBeDeleted() {
    while (playersToBeDeleted.length > 0) {
        //Delete player
        const id = playersToBeDeleted.pop()
        players.delete(id)
        //Transmit deletePlayer event to all clients
        const event = { tag: 'DELETE_PLAYER', id: id }
        packetToBeSent.events.push(event)
    }
}

function transmitToAllClients() {
    const json = JSON.stringify(packetToBeSent)
    for (const player of players.values()) {
        player.connection.send(json)
    }
}

function update_bouncers(game) {
    for (const [entity_id, entity] of game.bouncers) {
        const position = entity.position
        const velocity = entity.velocity

        if (position === undefined || velocity === undefined) continue

        position.x += velocity.x
        position.y += velocity.y

        if (position.x < 0 || position.x > map.width) {
            velocity.x = -velocity.x
        }
        if (position.y < 0 || position.y > map.height) {
            velocity.y = -velocity.y
        }

        packetToBeSent.events.push({ tag: 'SET_POSITION', id: entity_id, x: position.x, y: position.y })
    }
}

run()
