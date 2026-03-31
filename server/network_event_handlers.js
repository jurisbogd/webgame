import { get_room } from "./get/get_room.js";

export const network_event_handlers = {
    SET_POSITION: (game, sender_id, event) => {
        //Update player position
        const player = game.players.get(sender_id);

        if (!player) return;

        player.x = event.x;
        player.y = event.y;
    },
    CHAT_MESSAGE: (game, sender_id, event) => {
        console.log(`got chat message: ${event.message}`);

        const chat_message_event = { tag: 'CHAT_MESSAGE', id: sender_id, message: event.message };

        game.packet_to_send.events.push(chat_message_event);
    },
    GOTO_ROOM: (game, sender_id, event) => {
        const room = get_room(game, event.dest_ord);

        const set_player_room_event = {
            tag: "SET_PLAYER_ROOM",
            player_id: sender_id,
            room_id: room.id,
        };

        const player = game.players.get(sender_id);
        player.room = room.id;

        game.packet_to_send.events.push(set_player_room_event);

        const sender = game.players.get(sender_id);

        const set_room_event = {
            tag: "SET_ROOM",
            room: room,
        }

        const json = JSON.stringify({ events: [set_room_event] });

        console.log(json)

        sender.connection.send(json);
    },
};
