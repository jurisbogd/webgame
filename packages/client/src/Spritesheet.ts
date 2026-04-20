import { Rect, Vec2 } from "@jbwg/shared/math";
import { Parser, parser } from "@jbwg/shared/parser";

export interface Spritesheet<ImageType> extends SpritesheetData {
    image: ImageType;
};

export interface SpritesheetData {
    sprites: Record<string, Sprite>;
    animations: Record<string, Animation>;
    directionals: Record<string, Directional>;
};

export type Directional = Record<number, string>;

export interface Animation {
    frames: string;
    duration: number;
};

export interface Sprite {
    rect: Rect;
    pivot: Vec2;
};

const spritesheetParser = parser.compose({
    sprites: parser.record(
        parser.compose({
            rect: parser.rect,
            pivot: parser.default(
                parser.vec2,
                () => Vec2.zero,
            ),
        }) as Parser<Sprite>,
    ),
    animations: parser.default(
        parser.record(
            parser.compose({
                frames: parser.array(parser.string),
                duration: parser.number,
            }) as Parser<Animation>,
        ),
        () => { return {} as Record<string, Animation> },
    ),
    directionals: parser.default(
        parser.record(
            parser.record(parser.string) as Parser<Directional>,
        ),
        () => { return {} as Record<string, Directional> },
    ),
}) as Parser<SpritesheetData>;

export function makeSpritesheet<ImageType>(image: ImageType, json: any) {
    const result = spritesheetParser(json);

    if (result.success) {
        return {
            image,
            ...result.value,
        } as Spritesheet<ImageType>;
    }
    else {
        return undefined;
    };
}