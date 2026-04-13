import { Parser } from "./Parser";

export function stringLiteralParser(literal: string): Parser<string> {
    return (x: any) => {
        if (typeof x === "string" && x === literal) {
            return { success: true, value: x };
        }
        else {
            return { success: false };
        };
    };
};