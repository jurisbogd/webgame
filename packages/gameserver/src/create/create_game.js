import { create_room } from "./create_room.js";
import { create_server } from "./create_server.js";
import { on_connection } from "./on_connection.js";
import { loadRoom } from "./loadRoom.js";

export async function create_game() {
    const server = create_server();

    const game = {
        server,
        players: new Map(),
        new_players: [],
        packet_to_send: {},
        players_to_delete: [],
        packets_from_clients: [],
        rooms: new Map(),
    };

    await loadRoom("bigMap", game);

    server.on('connection', (connection) => {
        on_connection(game, connection);
    });

    return game;
}