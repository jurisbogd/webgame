import { queue_event } from './event_queue.js'
import { is_key_down } from './keyboard_input.js'
import { Vec2 } from './math/Vec2.js'

export function update_player(game) {
    const player = get_player(game)

    if (!player) return

    const position = player.position

    if (!position) return

    const speed = 2
    let velocityX = 0
    let velocityY = 0

    if (is_key_down('KeyW')) velocityY -= speed
    if (is_key_down('KeyA')) velocityX -= speed
    if (is_key_down('KeyS')) velocityY += speed
    if (is_key_down('KeyD')) velocityX += speed

    const previous_position = new Vec2(position.x, position.y);
    player.previous_position = previous_position;

    if (velocityX !== 0 || velocityY !== 0) {
        position.x += velocityX
        position.y += velocityY

        const event = { tag: 'SET_POSITION', x: position.x, y: position.y, }

        queue_event(event)
    }
}

export function get_player(game) {
    return game.entities.get(game.player_id)
}

export function get_player_id(game) {
    return game.player_id
}

export function set_player_id(game, player_id) {
    game.player_id = player_id
}