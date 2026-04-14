import { Parser } from "./Parser";
import { parserFail } from "./parserFail";
import { parserSuccess } from "./parserSuccess";

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