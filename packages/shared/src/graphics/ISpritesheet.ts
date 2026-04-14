import { Rect, Vec2 } from "../math";

export interface ISpritesheet {
    getSprite(spriteId: string): ISprite | undefined;
    image: HTMLImageElement;
};

export interface ISprite {
    rect: Rect;
    pivot: Vec2;
};