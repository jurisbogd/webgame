import { parserFail } from "./parserFail";
import { ParserResult } from "./ParserResult";
import { parserSuccess } from "./parserSuccess";

export function numberParser(x: any): ParserResult<number> {
    if (typeof x === "number") {
        return parserSuccess(x);
    }
    else {
        return parserFail();
    };
};
