import { get_player_id } from "./player.js"

export function render_entities(game) {
    for (const [entity_id, entity] of game.entities) {
        const position = entity.position

        if (position === undefined) continue

        const color = entity.color === undefined
            ? 'black'
            : entity.color

        game.graphics.draw_filled_circle(position.x, position.y, 16, color)
    }
}