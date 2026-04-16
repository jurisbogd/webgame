import { get_room } from "../get/get_room.js";
import { Vec2 } from "@jbwg/shared/math";

let next_network_id = 0;

function get_next_network_id() {
    return next_network_id++;
}

export function on_connection(game, connection) {
    console.log('new connection');

    const id = get_next_network_id();

    // const room = get_room(game, { i: 0, j: 0 });
    const room = game.rooms.get("bigMap");
    const roomWidth = room.width * 16;
    const roomHeight = room.height * 16;

    const player = {
        connection: connection,
        room: 0,
        position: new Vec2(roomWidth / 2, roomHeight / 2),
        velocity: Vec2.zero,
    };

    send_initialization_packet(game, connection, id, room);

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

export function send_initialization_packet(game, connection, network_id, room) {
    console.log('sending initialization packet');

    const packet = { events: [] };

    packet.events.push({ tag: 'SET_PLAYER_ID', id: network_id });

    for (const [network_id, player] of game.players) {
        packet.events.push({ tag: 'NEW_ENTITY', id: network_id, position: player.position, velocity: player.velocity, room_id: player.room })
    };

    packet.events.push({ tag: 'SET_ROOM', room: room });

    // console.log(packet);
    // console.log(packet.events[1].room);

    const json = JSON.stringify(packet);
    connection.send(json);
    // console.log(json);
}