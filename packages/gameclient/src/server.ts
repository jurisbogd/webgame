import { networkPacketParser, EventPacket } from "./NetworkPacket"

const received: EventPacket[] = []

export interface Server {
    ws: WebSocket;
    received: EventPacket[];
}

export async function init_server(url: string): Promise<Server | undefined> {
    const ws = await connect(url)

    if (ws) {
        ws.onerror = (error) => {
            console.error(error)
        }

        return { ws, received }
    }

    return undefined;
}

async function connect(url: string) {
    const ws = new WebSocket(url)
    ws.onmessage = (message) => {
        const json = JSON.parse(message.data);
        const result = networkPacketParser(json);

        if (result.success) {
            const packet = result.value;

            if (packet.tag === "events") {
                received.push(result.value);
            }
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