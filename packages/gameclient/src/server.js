import { eventPacketParser } from "./NetworkPacket"

const received = []

export async function init_server(url) {
    const ws = await connect(url)

    ws.onerror = (error) => {
        console.error(error)
    }

    return { ws, received }
}

async function connect(url) {
    const ws = new WebSocket(url)
    ws.onmessage = (message) => {
        const json = message.data
        const packet = JSON.parse(json);
        const result = eventPacketParser(packet);

        if (result.success) {
            received.push(result.value);
        }
        else {
            console.log('Unknown packet');
            console.log(event);
        };
    }
    return new Promise((resolve, reject) => {
        ws.onopen = () => resolve(ws)
        ws.onerror = (err) => resolve(undefined)
    })
}