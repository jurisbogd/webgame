import { get_player_id } from "./player.js"

export function render_entities(game) {
    for (const [entity_id, entity] of game.entities) {
        const position = entity.position

        if (position === undefined) continue

        const color = entity.color === undefined
            ? 'black'
            : entity.color

        game.ctx.fillStyle = color
        game.ctx.beginPath()
        game.ctx.ellipse(position.x, position.y, 16, 16, 0, 0, Math.PI * 2)
        game.ctx.fill()
    }
}