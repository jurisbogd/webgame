import { arrayParser } from "./arrayParser";
import { Parser } from "./Parser";

export function array2dParser<T>(itemParser: Parser<T>): Parser<T[][]> {
    return arrayParser(arrayParser(itemParser));
}