const network_event_buffer = []

export function push_event(event) {
    network_event_buffer.push(event)
}

export function flush_events(ws) {
    const packet = { events: network_event_buffer }
    const json = JSON.stringify(packet)
    ws.send(json)

    network_event_buffer.length = 0
}