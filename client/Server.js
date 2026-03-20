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
        const packet = JSON.parse(json)
        received.push(packet)
    }
    return new Promise((resolve, reject) => {
        ws.onopen = () => resolve(ws)
        ws.onerror = (err) => reject(err)
    })
}