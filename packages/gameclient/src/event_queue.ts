const event_queue: any = [];

export function queue_event(event: any) {
    event_queue.push(event);
}

export function flush_events(ws: WebSocket) {
    const packet = { events: event_queue };
    const json = JSON.stringify(packet);
    ws.send(json);

    event_queue.length = 0;
}