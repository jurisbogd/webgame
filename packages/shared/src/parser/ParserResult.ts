export type ParserResult<T> =
    | { success: true, value: T }
    | { success: false }