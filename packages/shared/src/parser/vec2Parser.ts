import { Vec2 } from "../math";
import { composeParser } from "./composeParser";
import { numberParser } from "./numberParser";

export const vec2Parser = composeParser(
    {
        x: numberParser,
        y: numberParser,
    },
    ({ x, y }) => new Vec2(x, y),
)