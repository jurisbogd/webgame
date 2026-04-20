import { Parser } from "./Parser.js";
import { parserSuccess } from "./parserSuccess.js";

export function defaultParser<T>(parser: Parser<T>, defaultValue: () => T) {
    return (x: any) => {
        const result = parser(x);

        if (result.success) {
            return result;
        }
        else {
            return parserSuccess(defaultValue());
        };
    };
};