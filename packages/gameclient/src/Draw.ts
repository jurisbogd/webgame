import { IRect, Rect, Vec2 } from "@jbwg/shared/math";
import { Spritesheet } from "./Spritesheet";

export function drawTile(
    image: HTMLImageElement,
    tileId: number,
    position: Vec2,
) {
    // const cs = Math.floor(image.width / 16);
    // const rs = Math.floor(image.height / 16);

    const columns = image.width / 16;
    const rows = image.height / 16;

    const column = tileId % columns;
    const row = Math.floor(tileId / columns);

    // const c = tileId % cs;
    // const r = Math.floor(tileId / rs);

    if (row > rows || column < 0 || row < 0) {
        throw new Error(`Tile #${tileId} out of range in tileset ${image.src}`);
        //     console.warn(`Tile #${tileId} out of range, rows: ${rs}, columns ${cs}, got row: ${r}, column ${c}`);
        //     return;
    };

    const tileSize = 16;
    const spriteRect = new Rect(column * tileSize, row * tileSize, tileSize, tileSize);
    const transform = new Rect(position.x, position.y, tileSize, tileSize);
    const pivot = Vec2.zero;

    return new Draw(image, transform, spriteRect, pivot);
}

export function drawSprite(
    spritesheet: Spritesheet,
    spriteName: string,
    position: Vec2,
) {
    if (spriteName === undefined) {
        console.log(`Sprite name is undefined`);
    };

    // console.log(spriteName);
    const sprite = spritesheet.sprites[spriteName];

    if (sprite === undefined) {
        console.log(`Sprite ${spriteName} is undefined`);
    };

    const image = spritesheet.image;
    const spriteRect = Rect.copy(sprite.rect);
    const transform = new Rect(
        position.x,
        position.y,
        spriteRect.w,
        spriteRect.h,
    );
    const pivot = Vec2.copy(sprite.pivot);

    return new Draw(image, transform, spriteRect, pivot);
};

export class Draw implements IRect {
    pivot;
    image;
    transform;
    spriteRect;
    depth = 0;

    constructor(image: any, transform: Rect, sprite_rect: Rect, pivot: Vec2) {
        this.image = image;
        this.transform = transform;
        this.spriteRect = sprite_rect;
        this.pivot = pivot;
    };

    static image(image: HTMLImageElement, x: number, y: number): Draw {
        const transform = new Rect(x, y, image.width, image.height);
        const spriteRect = new Rect(0, 0, image.width, image.height);
        const pivot = Vec2.zero;

        const draw = new Draw(image, transform, spriteRect, pivot);

        return draw;
    };

    // static tile(tileset: ITileset, id: number, position: Vec2) {
    //     const image = tileset.image;
    //     const spriteRect = tileset.getSpriteRect(id);

    //     if (!isNotNullOrUndefined(spriteRect)) {
    //         return undefined;
    //     };

    //     const transform = new Rect(position.x, position.y, spriteRect.w, spriteRect.h);
    //     const pivot = Vec2.zero;

    //     const draw = new Draw(image, transform, spriteRect, pivot);

    //     return draw;
    // };

    get position() {
        return this.transform.position;
    };

    set position(value: Vec2) {
        this.transform.position = value;
    };

    get scale() {
        const w = this.transform.w / this.spriteRect.w;
        const h = this.transform.h / this.spriteRect.h;

        return new Vec2(w, h);
    };

    set scale(value: Vec2) {
        this.transform.w = this.spriteRect.w * value.x;
        this.transform.h = this.spriteRect.h * value.y;
    };

    get absoluteScale() {
        return this.transform.size;
    };

    set absoluteScale(value: Vec2) {
        this.transform.size = value;
    };

    get relativePivot() {
        const x = this.pivot.x / this.transform.w;
        const y = this.pivot.y / this.transform.h;

        return new Vec2(x, y);
    };

    set relativePivot(value: Vec2) {
        this.pivot.x = value.x * this.transform.w;
        this.pivot.y = value.y * this.transform.h;
    };

    get top() {
        return this.transform.y - this.pivot.y;
    };

    get bottom() {
        return this.transform.y + this.transform.h - this.pivot.y;
    };

    get left() {
        return this.transform.x - this.pivot.x;
    };

    get right() {
        return this.transform.x + this.transform.w - this.pivot.x;
    };
};
