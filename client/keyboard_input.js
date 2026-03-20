const previous = {}
const current = {}

export function init_keyboard_input(canvas) {
    canvas.addEventListener('keydown', (event) => {
        event.preventDefault()
        current[event.code] = true
    })

    canvas.addEventListener('keyup', (event) => {
        current[event.code] = false
    })

    canvas.addEventListener('blur', () => {
        for (const key in current) {
            current[key] = false
        }
    })
}

export function update_keyboard_input() {


    Object.assign(previous, current)
}

export function is_key_down(key) {
    return !!current[key]
}

export function is_key_pressed(key) {
    return !!current[key] && !previous[key]
}

