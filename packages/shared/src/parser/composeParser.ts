import { isNotNullOrUndefined } from "../utils.js";
import { Parser } from "./Parser.js";
import { parserFail } from "./parserFail.js";
import { ParserResult } from "./ParserResult.js";
import { parserSuccess } from "./parserSuccess.js";

export function composeParser<
    ParserShape extends Record<string, Parser<any>>,
    Result = { [K in keyof ParserShape]: ReturnType<ParserShape[K]> extends ParserResult<infer T> ? T : never }
>(
    shape: ParserShape,
    transform?: (parsed: Result) => Result
): Parser<Result> {
    return (input: any) => {
        if (!isNotNullOrUndefined(input)) {
            return parserFail();
        }

        const out: any = {};

        for (const key in shape) {
            const result = shape[key](input[key]);

            if (!result.success) {
                return parserFail();
            }

            out[key] = result.value;
        }

        const final = transform ? transform(out) : out;

        return parserSuccess(final);
    };
}