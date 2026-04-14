export function isDefined<T>(o: T | undefined): o is T {
    return o !== undefined;
};

export function isNotNullOrUndefined<T>(o: T | undefined | null): o is T {
    return o !== undefined && o !== null;
};

export function isString(o: unknown) {
    return typeof o === "string";
};

export function isNumber(o: unknown) {
    return typeof o === "number";
};

export { SpatialMap } from "./room/Room";