import { ParserSuccess } from "./ParserResult";

export function parserSuccess<T>(value: T): ParserSuccess<T> {
    return {
        success: true,
        value,
    };
};