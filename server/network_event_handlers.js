export const network_event_handlers = {
    SET_POSITION: (game, sender_id, event) => {
        //Update player position
        const player = game.entities.get(sender_id);

        if (!player) return;

        player.x = event.x;
        player.y = event.y;

        //Retransmit to all players
        const set_position_event = { tag: 'SET_POSITION', id: sender_id, x: event.x, y: event.y };

        game.packet_to_send.events.push(set_position_event);
    },
    CHAT_MESSAGE: (game, sender_id, event) => {
        console.log(`got chat message: ${event.message}`);

        const chat_message_event = { tag: 'CHAT_MESSAGE', id: sender_id, message: event.message };

        game.packet_to_send.events.push(chat_message_event);
    },
};
