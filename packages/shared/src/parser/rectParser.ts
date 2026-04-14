import { Rect } from "../math";
import { composeParser } from "./composeParser";
import { numberParser } from "./numberParser";
import { Parser } from "./Parser";

export const rectParser: Parser<Rect> = composeParser({
    x: numberParser,
    y: numberParser,
    w: numberParser,
    h: numberParser,
});