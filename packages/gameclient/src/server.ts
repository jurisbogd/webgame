import { networkPacketParser, EventPacket } from "./NetworkPacket"

const received: EventPacket[] = []

export interface Server {
    ws: WebSocket;
    received: EventPacket[];
}

export async function initServer(url: string, onMessage: (message: MessageEvent<any>) => void): Promise<Server | undefined> {
    const ws = await connect(url, onMessage)

    if (ws) {
        ws.onerror = (error) => {
            console.error(error)
        }

        return { ws, received }
    }

    return undefined;
}

async function connect(url: string, onMessage: (message: MessageEvent<any>) => void) {
    const ws = new WebSocket(url)
    ws.onmessage = onMessage;
    return new Promise<WebSocket | undefined>((resolve, reject) => {
        ws.onopen = () => resolve(ws);
        ws.onerror = (err) => resolve(undefined);
    })
}