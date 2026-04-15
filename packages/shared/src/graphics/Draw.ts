import { IRect, Rect, Vec2 } from "@jbwg/shared/math";
import { ISpritesheet } from "./ISpritesheet";
import { isNotNullOrUndefined } from "../utils";
import { ITileset } from "./ITileset";

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

    static sprite(spritesheet: ISpritesheet, id: string, x: number, y: number) {
        const sprite = spritesheet.getSprite(id);

        if (!isNotNullOrUndefined(sprite)) {
            return undefined;
        };

        const spriteRect = Rect.copy(sprite.rect);
        const transform = new Rect(x, y, spriteRect.w, spriteRect.h);
        const pivot = Vec2.copy(sprite.pivot);

        const draw = new Draw(spritesheet.image, transform, spriteRect, pivot);

        return draw;
    };

    static tile(tileset: ITileset, id: number, position: Vec2) {
        const image = tileset.image;
        const spriteRect = tileset.getSpriteRect(id);

        if (!isNotNullOrUndefined(spriteRect)) {
            return undefined;
        };

        const transform = new Rect(position.x, position.y, spriteRect.w, spriteRect.h);
        const pivot = Vec2.zero;

        const draw = new Draw(image, transform, spriteRect, pivot);

        return draw;
    }

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
