import { Parser } from "./Parser";

export function defaultParser<T>(parser: Parser<T>, defaultValue: () => T) {
    return (x: any) => {
        const result = parser(x);

        if (result.success) {
            return result;
        }
        else {
            return {
                success: true,
                value: defaultValue(),
            };
        };
    };
};