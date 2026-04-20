import { ParserFail } from "./ParserResult.js";

export function parserFail<T>(reason?: string): ParserFail {
    return {
        success: false,
        reason: reason ? [reason] : [],
    };
};

export function parserRefail(result: ParserFail, reason?: string): ParserFail {
    if (reason) {
        result.reason.push(reason);
    };

    return result;
};