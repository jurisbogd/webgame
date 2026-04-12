import { get_player } from './player.js'

const chat_bubbles = new Map()

function create_chat_bubble(ui, entity_id, timestamp) {
    const chat_bubble_element = document.createElement('div')
    chat_bubble_element.id = `chat-bubble${entity_id}`
    chat_bubble_element.className = 'chat-bubble'

    ui.appendChild(chat_bubble_element)

    const chat_bubble = { timestamp, element: chat_bubble_element }

    chat_bubbles.set(entity_id, chat_bubble)

    return chat_bubble
}

export function render_chat_bubbles(game) {
    const player = get_player(game)

    if (!player) return

    const player_position = player.position

    if (!player_position) return

    // TODO fix bug where if entity is deleted while chat bubble is being
    // displayed then chat bubble becomes orphaned and keeps being displayed
    // indefinitely
    for (const [entity_id, entity] of game.entities) {
        const chat_message = entity.chat_message
        const position = entity.position

        if (position === undefined || chat_message === undefined) continue

        const chat_bubble = chat_bubbles.has(entity_id)
            ? chat_bubbles.get(entity_id)
            : create_chat_bubble(game.ui, entity_id)

        const dx = player_position.x - position.x;
        const dy = player_position.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy)
        const distance_threshold = 100 // pixels

        const current_time = performance.now()
        const dt = current_time - chat_message.timestamp
        const chat_message_display_time = 5000 // ms

        if (chat_bubble.timestamp != chat_message.timestamp) {
            chat_bubble.timestamp = chat_message.timestamp
            chat_bubble.element.innerText = chat_message.message
        }

        // render chat bubble
        if (entity.room !== game.room.id || distance > distance_threshold || dt > chat_message_display_time) {
            chat_bubble.element.style.display = 'none'
        }
        else {
            chat_bubble.element.style.display = 'block'
            const position_x = (position.x - game.graphics.viewport.left) * game.graphics.render_scale;
            const position_y = (position.y - game.graphics.viewport.top) * game.graphics.render_scale - 40;
            chat_bubble.element.style.left = `${position_x}px`
            chat_bubble.element.style.top = `${position_y}px`
        }
    }
}