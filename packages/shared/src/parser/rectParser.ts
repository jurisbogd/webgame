import { Rect } from "../math.js";
import { composeParser } from "./composeParser.js";
import { numberParser } from "./numberParser.js";
import { Parser } from "./Parser.js";

export const rectParser: Parser<Rect> = composeParser({
    x: numberParser,
    y: numberParser,
    w: numberParser,
    h: numberParser,
});