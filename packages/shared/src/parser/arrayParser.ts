import { isNotNullOrUndefined } from "../utils";
import { Parser } from "./Parser";
import { parserFail, parserRefail } from "./parserFail";
import { parserSuccess } from "./parserSuccess";

export function arrayParser<T>(itemParser: Parser<T>, skipFailed?: boolean): Parser<T[]> {
    return (xs: any) => {
        if (!isNotNullOrUndefined(xs) || !Array.isArray(xs)) {
            return parserFail("Expected array, got undefined");
        };

        const values = [];

        for (const x of xs) {
            const result = itemParser(x);

            if (result.success) {
                values.push(result.value);
            }
            else if (!skipFailed && !result.success) {
                return parserRefail(result, "Unable to parse array member");
            }
        }

        return parserSuccess(values);
    };
};