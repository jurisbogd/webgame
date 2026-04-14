import { ParserResult } from "./ParserResult";

export function parserSuccess<T>(value: T): ParserResult<T> {
    return {
        success: true,
        value,
    };
};