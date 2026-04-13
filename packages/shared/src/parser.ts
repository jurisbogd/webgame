export type { Parser } from "./parser/Parser"
export type { ParserResult } from "./parser/ParserResult"
import { composeParser } from "./parser/composeParser"
import { numberParser } from "./parser/numberParser"
import { stringParser } from "./parser/stringParser"
import { vec2Parser } from "./parser/vec2Parser"
import { stringLiteralParser } from "./parser/stringLiteralParser"
import { taggedUnionParser } from "./parser/taggedUnionParser"
import { arrayParser } from "./parser/arrayParser"
import { array2dParser } from "./parser/array2dParser"
import { defaultParser } from "./parser/defaultParser"

export const parser = {
    compose: composeParser,
    number: numberParser,
    string: stringParser,
    vec2: vec2Parser,
    stringLiteral: stringLiteralParser,
    taggedUnion: taggedUnionParser,
    array: arrayParser,
    array2d: array2dParser,
    default: defaultParser,
}