import { makeSpritesheet } from './Spritesheet'

export async function load_image_url(url: string) {
    const image = new Image();

    image.src = url;
    await image.decode();

    return image;
}

export async function load_image(name: string) {
    const image = await load_image_url(`/assets/images/${name}.png`);
    return image;
}

export async function load_spritesheet(name: string) {
    const image = await load_image_url(`/assets/spritesheets/${name}.png`);

    const response = await fetch(`/assets/spritesheets/${name}.json`);
    const atlas = await response.json();

    const spritesheet = makeSpritesheet(image, atlas);

    console.log(spritesheet);

    return spritesheet;
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