import { makeSpritesheet } from './Spritesheet'

export async function loadImageUrl(url: string) {
    const image = new Image();

    image.src = url;
    await image.decode();

    return image;
}

export async function loadImage(name: string) {
    const image = await loadImageUrl(`/assets/images/${name}.png`);
    return image;
}

export async function loadSpritesheet(name: string) {
    const image = await loadImageUrl(`/assets/spritesheets/${name}.png`);

    const response = await fetch(`/assets/spritesheets/${name}.json`);
    const atlas = await response.json();

    const spritesheet = makeSpritesheet(image, atlas);

    console.log(spritesheet);

    return spritesheet;
}