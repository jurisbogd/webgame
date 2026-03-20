import { set_player_id, get_player_id } from "./player.js"

export const network_event_handlers = {
    SET_PLAYER_ID: set_player_id_handler,
    SET_POSITION: set_position_handler,
    NEW_PLAYER: new_player_handler,
    DELETE_PLAYER: delete_player_handler,
    CHAT_MESSAGE: chat_message_handler,
}

function set_player_id_handler(game, event) {
    const player_id = event.id

    set_player_id(game, player_id)
}

function set_position_handler(game, event) {
    if (event.id === get_player_id(game)) return

    const entity = game.entities.get(event.id)

    if (!entity) return

    entity.position = { x: event.x, y: event.y }
}

function new_player_handler(game, event) {
    const player = {
        position: { x: event.x, y: event.y },
    }

    game.entities.set(event.id, player)
}

function delete_player_handler(game, event) {
    game.entities.delete(event.id)
}

function chat_message_handler(game, event) {
    console.log(`got chat message: ${event.message}`)

    const entity = game.entities.get(event.id)

    if (!entity) return

    const timestamp = performance.now()
    const message = event.message
    entity.chat_message = { timestamp, message }
}