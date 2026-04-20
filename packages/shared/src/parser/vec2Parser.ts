import { Vec2 } from "../math.js";
import { composeParser } from "./composeParser.js";
import { numberParser } from "./numberParser.js";

export const vec2Parser = composeParser(
    {
        x: numberParser,
        y: numberParser,
    },
    ({ x, y }) => new Vec2(x, y),
)