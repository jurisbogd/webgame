import { ParserSuccess } from "./ParserResult.js";

export function parserSuccess<T>(value: T): ParserSuccess<T> {
    return {
        success: true,
        value,
    };
};