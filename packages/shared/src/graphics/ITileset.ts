import { Rect } from "../math";

export interface ITileset {
    image: HTMLImageElement;
    getSpriteRect(tileId: number): Rect | undefined;
};