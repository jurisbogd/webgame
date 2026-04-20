import { parserFail } from "./parserFail.js";
import { ParserResult } from "./ParserResult.js";
import { parserSuccess } from "./parserSuccess.js";

export function stringParser(x: any): ParserResult<string> {
    if (typeof x === "string") {
        return parserSuccess(x);
    }
    else {
        return parserFail();
    };
};