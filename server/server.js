import { WebSocketServer } from 'ws'

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

let nextEntityId = 0

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

    newPlayers.push({ tag: 'NEW_PLAYER', id: id, x: player.x, y: player.y })

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
    for (const [id, player] of players) {
        packet.events.push({ tag: 'NEW_PLAYER', id: id, x: player.x, y: player.y })
    }
    const json = JSON.stringify(packet)
    connection.send(JSON.stringify(packet))
    console.log(json)
}

let packetToBeSent
function step() {
    packetToBeSent = { events: [] }
    consumeClientPackets()
    flushplayersToBeDeleted()

    for (const event of newPlayers) {
        packetToBeSent.events.push(event)
    }

    newPlayers.length = 0

    transmitToAllClients()
}

const network_event_handlers = {
    SET_POSITION: (event) => {
        //Update player position
        const player = players.get(packet.sender)
        if (!player) return
        player.x = event.x
        player.y = event.y
        //Retransmit to all players
        const set_position_event = { tag: 'SET_POSITION', id: packet.sender, x: event.x, y: event.y }
        packetToBeSent.events.push(set_position_event)
    },
    CHAT_MESSAGE: (event) => {
        console.log(`got chat message: ${event.message}`)
        const chat_message_event = { tag: 'CHAT_MESSAGE', id: packet.sender, message: event.message }
        packetToBeSent.events.push(chat_message_event)
    },
}

function consumeClientPackets() {
    for (const packet of packetsFromClients) {
        for (const event of packet.events) {
            switch (event.tag) {
                case 'SET_POSITION': {
                    //Update player position
                    const player = players.get(packet.sender)
                    if (!player) break
                    player.x = event.x
                    player.y = event.y
                    //Retransmit to all players
                    const set_position_event = { tag: 'SET_POSITION', id: packet.sender, x: event.x, y: event.y }
                    packetToBeSent.events.push(set_position_event)
                    break
                }
                case 'CHAT_MESSAGE': {
                    console.log(`got chat message: ${event.message}`)
                    const chat_message_event = { tag: 'CHAT_MESSAGE', id: packet.sender, message: event.message }
                    packetToBeSent.events.push(chat_message_event)
                    break
                }
                default: {
                    console.log(`packet with unknown event tag ${event.tag} received from client`)
                    break
                }
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

run()
