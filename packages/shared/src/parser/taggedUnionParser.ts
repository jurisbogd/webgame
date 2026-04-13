import { isNotNullOrUndefined } from "../utils";
import { Parser } from "./Parser";
import { stringParser } from "./stringParser";

type TaggedUnionParserResult<
    TagField extends string,
    Parsers extends Record<string, Parser<any>>,
> = {
    [K in keyof Parsers]: Parsers[K] extends Parser<infer T> ? T : never & Record<TagField, K>
}[keyof Parsers]

export function taggedUnionParser<
    TagField extends string,
    Parsers extends Record<string, Parser<any>>,
>(
    tagField: string,
    parsers: Parsers
): Parser<TaggedUnionParserResult<TagField, Parsers>> {
    return (x: any) => {
        if (!isNotNullOrUndefined(x)) {
            return { success: false }
        }

        const tag = stringParser(x[tagField]);

        if (!tag.success) {
            return { success: false };
        };

        const parser = parsers[tag.value];

        if (!parser) {
            return { success: false };
        };

        const result = parser(x);

        if (!result.success) {
            return { success: false };
        };

        return {
            success: true,
            value: {
                ...result.value,
                [tagField]: tag.value,
            },
        };
    }
}