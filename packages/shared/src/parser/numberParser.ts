import { parserFail } from "./parserFail.js";
import { ParserResult } from "./ParserResult.js";
import { parserSuccess } from "./parserSuccess.js";

export function numberParser(x: any): ParserResult<number> {
    if (typeof x === "number") {
        return parserSuccess(x);
    }
    else {
        return parserFail("Unable to parse number");
    };
};
