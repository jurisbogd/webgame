import { create_room } from "../create/create_room.js";
import { cantor_pair } from "../math/cantor_pair.js";

export function get_room(game, room_id) {
    const id = cantor_pair(room_id.i, room_id.j);

    if (game.rooms.has(id)) {
        return game.rooms.get(id);
    }
    else {
        const room = create_room(room_id.i, room_id.j);
        game.rooms.set(id, room);
        return room;
    }
}