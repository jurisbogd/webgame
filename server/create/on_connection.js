let next_network_id = 0;

function get_next_network_id() {
    return next_network_id++;
}

export function on_connection(game, connection) {
    console.log('new connection');

    const id = get_next_network_id();

    const room_width = game.room.width * 16;
    const room_height = game.room.height * 16;

    const player = {
        connection: connection,
        x: room_width / 2,
        y: room_height / 2,
    };

    send_initialization_packet(game, connection, id);

    game.players.set(id, player);
    game.new_players.push(id);

    connection.onmessage = message => {
        const packet = JSON.parse(message.data);
        packet.sender = id;
        game.packets_from_clients.push(packet);
    }
    connection.onerror = error => console.error(error);
    connection.onclose = () => game.players_to_delete.push(id);
}

export function send_initialization_packet(game, connection, network_id) {
    console.log('sending initialization packet');

    const packet = { events: [] };

    packet.events.push({ tag: 'SET_PLAYER_ID', id: network_id });

    for (const [network_id, player] of game.players) {
        packet.events.push({ tag: 'NEW_ENTITY', id: network_id, x: player.x, y: player.y })
    };

    packet.events.push({ tag: 'SET_ROOM', room: game.room });

    const json = JSON.stringify(packet);
    connection.send(json);
    console.log(json);
}