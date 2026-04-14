import { IRect } from "./IRect";

export function rectOverlap(a: IRect, b: IRect) {
    return !(
        a.bottom < b.top ||
        a.top > b.bottom ||
        a.right < b.left ||
        a.left > b.right
    );
}