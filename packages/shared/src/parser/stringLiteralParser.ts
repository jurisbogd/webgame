import { Parser } from "./Parser";
import { parserFail } from "./parserFail";
import { parserSuccess } from "./parserSuccess";

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