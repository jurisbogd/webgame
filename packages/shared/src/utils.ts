import { Vec2 } from "./math.js";

export function isDefined<T>(o: T | undefined): o is T {
    return o !== undefined;
};

export function isString(o: unknown) {
    return typeof o === "string";
};

export function isNumber(o: unknown) {
    return typeof o === "number";
};

export function expectString(o: any): string | undefined {
    if (typeof o === "string") return o as string;
    else return undefined;
};

export function expectNumber(o: any): number | undefined {
    if (typeof o === "number") return o as number;
    else return undefined;
};

export function expectVec2(o: any): Vec2 | undefined {
    const x = expectNumber(o.x);
    const y = expectNumber(o.y);

    if (!isDefined(x) || !isDefined(y)) {
        return undefined;
    }

    return new Vec2(x, y);
};

export const parse = {
    string(o: any): string | undefined {
        return (typeof o === "string")
            ? o as string
            : undefined;
    },

    number(o: any): number | undefined {
        return typeof o === "number"
            ? o as number
            : undefined;
    },

    vec2(o: any): Vec2 | undefined {
        const x = expectNumber(o.x);
        const y = expectNumber(o.y);

        return isDefined(x) && isDefined(y)
            ? new Vec2(x, y)
            : undefined;
    }
}