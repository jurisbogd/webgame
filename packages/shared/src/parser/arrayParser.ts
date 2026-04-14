import { isNotNullOrUndefined } from "../utils";
import { Parser } from "./Parser";
import { parserFail } from "./parserFail";
import { parserSuccess } from "./parserSuccess";

export function arrayParser<T>(itemParser: Parser<T>): Parser<T[]> {
    return (xs: any) => {
        if (!isNotNullOrUndefined(xs) || !Array.isArray(xs)) {
            return parserFail();
        };

        const values = [];

        for (const x of xs) {
            const result = itemParser(x);

            if (!result.success) {
                return parserFail();
            }

            values.push(result.value);
        };

        return parserSuccess(values);
    }
}