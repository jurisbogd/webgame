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

    const player = {
        connection: connection,
        x: Math.random() * map.width,
        y: Math.random() * map.height,
    }

    const id = nextEntityId
    players.set(id, player)
    nextEntityId += 1

    newPlayers.push({ tag: 'newPlayer', id: id, x: player.x, y: player.y })

    sendInitializationPacket(connection, id)

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
    const packet = { events: [] }
    packet.events.push({ tag: 'setId', id: id })
    for (const [id, player] of players) {
        packet.events.push({ tag: 'newPlayer', id: id, x: player.x, y: player.y })
    }
    connection.send(JSON.stringify(packet))
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

function consumeClientPackets() {
    for (const packet of packetsFromClients) {
        for (const event of packet.events) {
            switch (event.tag) {
                case 'setPosition': {
                    //Update player position
                    const player = players.get(packet.sender)
                    if (!player) break
                    player.x = event.x
                    player.y = event.y
                    //Retransmit to all players
                    const setPositionEvent = { tag: 'setPosition', id: packet.sender, x: event.x, y: event.y }
                    packetToBeSent.events.push(setPositionEvent)
                    break
                }
                case 'chatMessage': {
                    console.log(`got chat message: ${event.message}`)
                    const chatMessageEvent = { tag: 'chatMessage', id: packet.sender, message: event.message }
                    packetToBeSent.events.push(chatMessageEvent)
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
        const event = { tag: 'deletePlayer', id: id }
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
