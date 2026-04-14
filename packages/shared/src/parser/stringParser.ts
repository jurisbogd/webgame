import { parserFail } from "./parserFail";
import { ParserResult } from "./ParserResult";
import { parserSuccess } from "./parserSuccess";

export function stringParser(x: any): ParserResult<string> {
    if (typeof x === "string") {
        return parserSuccess(x);
    }
    else {
        return parserFail();
    };
};