import { CRC2DGraphics } from './graphics_crc2d.js'
import { Tileset } from './Tileset.js'

export async function load_image_url(url) {
    const image = new Image()
    image.src = url
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image)
        image.onerror = (err) => reject(err)
    })
}

export async function load_image(name) {
    const image = await load_image_url(`/content/${name}.png`)
    return image
}

export async function load_tileset(name) {
    const image = await load_image(name)
    const tileset = new Tileset(image)
    return tileset
}

// export function init_content(graphics) {
//     if (graphics instanceof CRC2DGraphics) {
//         return new CRC2DContent()
//     }
//     else {
//         throw new Error('Cannot initialize content manager, unsupported graphics API')
//     }
// }

// class CRC2DContent {
//     async load_sprite_url(url) {
//         const image = await load_image_url(url)
//         const sprite = new CRC2DSprite(image)

//         return sprite
//     }

//     async load_sprite(name) {
//         const image = await load_image(name)
//         const sprite = new CRC2DSprite(image)

//         return sprite
//     }
// }

// class CRC2DSprite {
//     image

//     constructor(image) {
//         this.image = image
//     }

//     get_width() {
//         return image.width
//     }

//     get_height() {
//         return image.height
//     }
// }