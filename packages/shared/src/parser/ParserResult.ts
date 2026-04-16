export type ParserResult<T> =
    | ParserSuccess<T>
    | ParserFail;

export type ParserSuccess<T> =
    | { success: true, value: T };

export type ParserFail =
    | { success: false, reason: string[] };