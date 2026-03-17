export class Server {
    connection
    receivedPackets = []

    constructor(address, port) {
        const url = `ws://${address}:${port}`
        const connection = new WebSocket(url)

        connection.onopen = () => console.log(`connected to server at ${connection.url}`)
        connection.onmessage = message => {
            const json = message.data
            const packet = JSON.parse(json)
            this.receivedPackets.push(packet)
        }
        connection.onerror = error => console.error(error)
        connection.onclose = () => console.log(`disconnected from server at ${connection.url}`)

        this.connection = connection
    }
}