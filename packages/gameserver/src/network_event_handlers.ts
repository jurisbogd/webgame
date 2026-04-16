import { Vec2 } from "@jbwg/shared/math";
import { get_room } from "./get/get_room.js";

interface PacketToSend {
    events: any[];
};

interface Game {
    packet_to_send: PacketToSend;
    players: Map<number, Player>;
};

interface Player {
    position: Vec2;
    velocity: Vec2;
    connection: WebSocket;
};

export const network_event_handlers = {
    SET_POSITION: (game: Game, sender_id: number, event: any) => {
        //Update player position
        const player = game.players.get(sender_id);

        if (!player) return;

        player.position = event.position;
        player.velocity = event.velocity;
    },
    CHAT_MESSAGE: (game: Game, sender_id: number, event: any) => {
        console.log(`got chat message: ${event.message}`);

        const chat_message_event = { tag: 'CHAT_MESSAGE', id: sender_id, message: event.message };

        game.packet_to_send.events.push(chat_message_event);
    },
    GOTO_ROOM: (game: Game, sender_id: number, event: any) => {
        const room = get_room(game, event.dest_ord);

        const set_player_room_event = {
            tag: "SET_PLAYER_ROOM",
            player_id: sender_id,
            room_id: room.id,
        };

        game.packet_to_send.events.push(set_player_room_event);

        const sender = game.players.get(sender_id);

        if (!sender) {
            return;
        };

        const set_room_event = {
            tag: "SET_ROOM",
            room: room,
        }

        const json = JSON.stringify({ events: [set_room_event] });

        console.log(json)

        sender.connection.send(json);
    },
};
