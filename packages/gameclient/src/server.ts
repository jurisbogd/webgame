import { eventPacketParser, EventPacket } from "./NetworkPacket"

const received: EventPacket[] = []

export async function init_server(url: string) {
    const ws = await connect(url)

    if (ws) {
        ws.onerror = (error) => {
            console.error(error)
        }

        return { ws, received }
    }
}

async function connect(url: string) {
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
            console.log(result.reason);
        };
    }
    return new Promise<WebSocket | undefined>((resolve, reject) => {
        ws.onopen = () => resolve(ws);
        ws.onerror = (err) => resolve(undefined);
    })
}