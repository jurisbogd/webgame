import { isNotNullOrUndefined } from "../utils";
import { Parser } from "./Parser";

export function arrayParser<T>(itemParser: Parser<T>): Parser<T[]> {
    return (xs: any) => {
        if (!isNotNullOrUndefined(xs) || !Array.isArray(xs)) {
            return { success: false };
        };

        const values = [];

        for (const x of xs) {
            const result = itemParser(x);

            if (!result.success) {
                return { success: false };
            }

            values.push(result.value);
        };

        return {
            success: true,
            value: values,
        };
    }
}