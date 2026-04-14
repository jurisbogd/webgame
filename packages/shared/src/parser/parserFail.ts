import { ParserResult } from "./ParserResult";

export function parserFail<T>(): ParserResult<T> {
    return {
        success: false,
    };
};