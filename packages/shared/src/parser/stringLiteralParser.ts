import { Parser } from "./Parser.js";
import { parserFail } from "./parserFail.js";
import { parserSuccess } from "./parserSuccess.js";

export function stringLiteralParser(literal: string): Parser<string> {
    return (x: any) => {
        if (typeof x === "string" && x === literal) {
            return parserSuccess(x);
        }
        else {
            return parserFail();
        };
    };
};