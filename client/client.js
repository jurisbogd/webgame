import { Server } from './Server.js'

//Set this to address of server before running client
const serverAddress = 'localhost'
const port = 10799

const canvas = document.getElementById('canvas-2d');
const ctx = canvas.getContext('2d');
// const server = new WebSocket(`ws://${serverAddress}:10799`)
const players = new Map()
const input = {}
const ui = document.getElementById('ui')
const chatInput = document.getElementById('chat-input')

const server = new Server(serverAddress, port)

let myId
let packetToBeSent
let pendingChatMessage

canvas.onkeydown = (event) => input[event.code] = true
canvas.onkeyup = (event) => input[event.code] = false

chatInput.onkeydown = (event) => {
    if (event.code === 'Enter') {
        const message = chatInput.value
        pendingChatMessage = message
        chatInput.value = ''
    }
}

function run() {
    step()
    requestAnimationFrame(run)
}

function step() {
    packetToBeSent = { events: [] }

    if (pendingChatMessage) {
        const event = {
            tag: 'chatMessage',
            message: pendingChatMessage,
        }
        packetToBeSent.events.push(event)
        pendingChatMessage = undefined
    }

    consumeServerPackets()
    updatePlayer()

    if (packetToBeSent.events.length > 0) {
        server.connection.send(JSON.stringify(packetToBeSent))
    }

    clearCanvas('cornflowerblue')
    renderPlayers()
}

function consumeServerPackets() {
    //Consume packets from server
    for (const packet of server.receivedPackets) {
        for (const event of packet.events) {
            console.log(`received event with tag ${event.tag}`);
            switch (event.tag) {
                case 'setId': {
                    myId = event.id
                    break
                }
                case 'setPosition': {
                    const player = players.get(event.id)
                    if (!player) break
                    if (event.id === myId) break
                    player.x = event.x
                    player.y = event.y
                    break
                }
                case 'newPlayer': {
                    const chatBubble = document.createElement('div')
                    chatBubble.id = `chat_${event.id}`
                    chatBubble.className = 'chat-bubble'
                    chatBubble.style.display = 'none'
                    ui.appendChild(chatBubble)
                    const player = {
                        x: event.x,
                        y: event.y,
                        chatMessage: undefined,
                        chatBubble: chatBubble,
                    }
                    players.set(event.id, player)
                    break
                }
                case 'deletePlayer': {
                    players.delete(event.id)
                    break
                }
                case 'chatMessage': {
                    console.log(`got chat message: ${event.message}`)
                    const chatMessage = {
                        timestamp: performance.now(),
                    }
                    const player = players.get(event.id)
                    player.chatMessage = chatMessage
                    player.chatBubble.innerText = event.message
                    break
                }
                default: {
                    console.log(`packet with unknown event tag ${event.tag} received from server`)
                    break
                }
            }
        }
    }

    server.receivedPackets.length = 0
}

function updatePlayer() {
    const player = players.get(myId)
    if (!player) return

    let velocityX = 0
    let velocityY = 0
    if (isKeyDown('KeyW')) velocityY -= 2
    if (isKeyDown('KeyA')) velocityX -= 2
    if (isKeyDown('KeyS')) velocityY += 2
    if (isKeyDown('KeyD')) velocityX += 2

    if (velocityX !== 0 || velocityY !== 0) {
        player.x += velocityX
        player.y += velocityY
        const event = { tag: 'setPosition', x: player.x, y: player.y, }
        packetToBeSent.events.push(event)
    }
}

function isKeyDown(key) {
    return !!input[key]
}

function clearCanvas(clearColor) {
    ctx.fillStyle = clearColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function renderPlayers() {
    for (const [id, player] of players) {
        ctx.fillStyle = id === myId ? 'red' : 'blue'
        ctx.beginPath()
        ctx.ellipse(player.x, player.y, 16, 16, 0, 0, Math.PI * 2)
        ctx.fill()

        const chatMessage = player.chatMessage
        const now = performance.now()
        if (chatMessage && (now - chatMessage.timestamp) < 5000) {
            const myPlayer = players.get(myId)
            const dx = player.x - myPlayer.x
            const dy = player.y - myPlayer.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < 100) {
                const chatBubble = player.chatBubble
                chatBubble.style.display = 'block'
                chatBubble.style.left = `${player.x}px`
                chatBubble.style.top = `${player.y}px`
                continue
            }
        }

        player.chatBubble.style.display = 'none'
    }
}

run()
