import { isNotNullOrUndefined } from "../utils";
import { Parser } from "./Parser";
import { parserFail } from "./parserFail";
import { ParserResult } from "./ParserResult";
import { parserSuccess } from "./parserSuccess";

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