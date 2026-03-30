import { WebSocketServer } from 'ws';

export function create_server({ port = 10799 } = {}) {
    const server = new WebSocketServer({ port: port });

    return server;
}