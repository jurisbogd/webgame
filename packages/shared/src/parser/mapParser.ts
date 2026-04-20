import { Parser } from "./Parser.js";
import { parserFail } from "./parserFail.js";
import { parserSuccess } from "./parserSuccess.js";

export function mapParser<T>(itemParser: Parser<T>): Parser<Map<string, T>> {
    return (o: any) => {
        const map = new Map<string, T>();

        for (const key of o) {
            const result = itemParser(o[key]);

            if (!result.success) {
                return parserFail();
            };

            map.set(key, result.value);
        };

        return parserSuccess(map);
    };
}