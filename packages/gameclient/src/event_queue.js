const event_queue = []

export function queue_event(event) {
    event_queue.push(event)
}

export function flush_events(ws) {
    const packet = { events: event_queue }
    const json = JSON.stringify(packet)
    ws.send(json)

    event_queue.length = 0
}