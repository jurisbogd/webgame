import { ParserResult } from "./ParserResult";

export function numberParser(o: any): ParserResult<number> {
    if (typeof o === "number") {
        return { success: true, value: o as number };
    }
    else {
        return { success: false };
    };
};
