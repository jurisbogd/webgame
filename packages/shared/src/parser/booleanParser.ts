import { parserFail } from "./parserFail";
import { parserSuccess } from "./parserSuccess";

export function booleanParser(x: any) {
    if (typeof x === "boolean") {
        return parserSuccess(x);
    }
    else {
        return parserFail("Expected boolean value");
    };
};