import { Parser } from "./Parser";
import { parserSuccess } from "./parserSuccess";

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