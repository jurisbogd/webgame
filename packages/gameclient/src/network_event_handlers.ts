import { Vec2 } from "@jbwg/shared/math"
import { set_player_id, get_player_id, get_player } from "./Player"
import { Game } from "./index"
import { ChatMessageEvent, DeletePlayerEvent, NetworkEvent, NewEntityEvent, SetPlayerIdEvent, SetPlayerRoomEvent, SetPositionEvent, SetRoomEvent } from "./NetworkPacket.js"

// type HandlerMap<U> = {
//     [K in U["tag"]]: (game: Game, event: Extract<U, { tag: K }>) => void;
// };

export function handleNetworkEvent(game: Game, event: NetworkEvent) {
    switch (event.tag) {
        case "SET_PLAYER_ID": return set_player_id_handler(game, event);
        case "SET_POSITION": return set_position_handler(game, event);
        case "NEW_ENTITY": return new_entity_handler(game, event);
        case "DELETE_PLAYER": return delete_player_handler(game, event);
        case "CHAT_MESSAGE": return chat_message_handler(game, event);
        case "SET_ROOM": return set_room_handler(game, event);
        case "SET_PLAYER_ROOM": return set_player_room_handler(game, event);
        default: return;
    };
}

// export const network_event_handlers: HandlerMap<NetworkEvent> = {
//     SET_PLAYER_ID: set_player_id_handler,
//     SET_POSITION: set_position_handler,
//     NEW_ENTITY: new_entity_handler,
//     DELETE_PLAYER: delete_player_handler,
//     CHAT_MESSAGE: chat_message_handler,
//     SET_ROOM: set_room_handler,
//     SET_PLAYER_ROOM: set_player_room_handler,
// };

function set_player_id_handler(game: Game, event: SetPlayerIdEvent) {
    const player_id = event.id

    set_player_id(game, player_id)
}

function set_position_handler(game: Game, event: SetPositionEvent) {

    const packet = event;

    if (packet.id === get_player_id(game)) return

    const entity = game.entities.get(packet.id)

    if (!entity) return

    entity.position = event.position;
    entity.velocity = event.velocity;
}

function new_entity_handler(game: Game, event: NewEntityEvent) {
    const entity = {
        position: event.position,
        velocity: event.velocity,
        room: event.room_id,
        look_direction: "right",
        animation_time: 0,
    }

    game.entities.set(event.id, entity)
}

function delete_player_handler(game: Game, event: DeletePlayerEvent) {
    game.entities.delete(event.id)
}

function chat_message_handler(game: Game, event: ChatMessageEvent) {
    console.log(`got chat message: ${event.message}`)

    const entity = game.entities.get(event.id)

    if (!entity) return

    const timestamp = performance.now()
    const message = event.message
    entity.chat_message = { timestamp, message }
}

function set_room_handler(game: Game, event: SetRoomEvent) {
    console.log(event);

    console.log('setting room');

    const room = event.room;

    game.room = room;

    const last_door = game.last_entered_door;

    let position;
    if (last_door === undefined) return;
    if (game.player_id === undefined) return;

    const player = game.entities.get(game.player_id);

    if (player === undefined) return;

    if (last_door === 'right') {
        const door = find_object_by_id(room, 'left');
        player.position.x = door.x + 40;
        player.position.y = door.y;
    }
    else if (last_door === 'left') {
        const door = find_object_by_id(room, 'right');
        player.position.x = door.x - 40;
        player.position.y = door.y;
    }
    else if (last_door === 'top') {
        const door = find_object_by_id(room, 'bottom');
        player.position.x = door.x;
        player.position.y = door.y - 40;
    }
    else if (last_door === 'bottom') {
        const door = find_object_by_id(room, 'top');
        player.position.x = door.x;
        player.position.y = door.y + 40;
    }
}

function find_object_by_id(room: any, id: string) {
    for (const object of room.objects) {
        if (object.id === id) return object;
    }
}

function set_player_room_handler(game: Game, event: SetPlayerRoomEvent) {
    const player_id = event.player_id;
    const room_id = event.room_id;
    const player = game.entities.get(event.player_id);
    player.room = room_id;
}