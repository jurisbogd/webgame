import { arrayParser } from "./arrayParser.js";
import type { Parser } from "./Parser";

export function array2dParser<T>(itemParser: Parser<T>): Parser<T[][]> {
    return arrayParser(arrayParser(itemParser));
}