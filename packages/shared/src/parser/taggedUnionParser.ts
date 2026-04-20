import { isNotNullOrUndefined } from "../utils.js";
import { Parser } from "./Parser.js";
import { parserFail, parserRefail } from "./parserFail.js";
import { stringParser } from "./stringParser.js";
import { parserSuccess } from "./parserSuccess.js";

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
            return parserFail("Expected tagged union, got undefined");
        }

        const tag = stringParser(x[tagField]);

        if (!tag.success) {
            return parserRefail(tag, `Unable to find tag field ${tagField}`);
        };

        const parser = parsers[tag.value];

        if (!parser) {
            return parserFail(`Unexpected tagged union tag: ${tag.value}`);
        };

        const result = parser(x);

        if (!result.success) {
            return parserRefail(result, `Unable to parse tagged union member with tag ${tag.value}`);
        };

        return parserSuccess({
            ...result.value,
            [tagField]: tag.value,
        });
    };
}