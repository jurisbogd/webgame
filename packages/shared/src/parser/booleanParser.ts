import { parserFail } from "./parserFail.js";
import { parserSuccess } from "./parserSuccess.js";

export function booleanParser(x: any) {
    if (typeof x === "boolean") {
        return parserSuccess(x);
    }
    else {
        return parserFail("Expected boolean value");
    };
};