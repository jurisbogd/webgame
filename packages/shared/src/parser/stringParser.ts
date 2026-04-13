import { ParserResult } from "./ParserResult";

export function stringParser(o: any): ParserResult<string> {
    if (typeof o === "string") {
        return { success: true, value: o as string };
    }
    else {
        return { success: false };
    };
};