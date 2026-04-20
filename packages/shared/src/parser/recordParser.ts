import { isNotNullOrUndefined } from "../utils.js";
import { Parser } from "./Parser.js";
import { parserFail } from "./parserFail.js";
import { ParserResult } from "./ParserResult.js";
import { parserSuccess } from "./parserSuccess.js";

export function recordParser<T>(
    itemParser: Parser<T>
): Parser<Record<string, T>> {
    return (x: any) => {
        if (!isNotNullOrUndefined(x)) {
            return parserFail();
        };

        const record: Record<string, T> = {}

        for (const key in x) {
            const result = itemParser(x[key]);

            if (result.success) {
                record[key] = result.value;
            }
            else {
                return parserFail();
            };
        };

        return parserSuccess(record);
    }
};