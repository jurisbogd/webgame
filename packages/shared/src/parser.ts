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
import { parserSuccess } from "./parser/parserSuccess"
import { parserFail, parserRefail } from "./parser/parserFail"
import { mapParser } from "./parser/mapParser"
import { rectParser } from "./parser/rectParser"
import { recordParser } from "./parser/recordParser"
import { booleanParser } from "./parser/booleanParser"

export const parser = {
    number: numberParser,
    string: stringParser,
    boolean: booleanParser,

    stringLiteral: stringLiteralParser,
    vec2: vec2Parser,
    rect: rectParser,

    taggedUnion: taggedUnionParser,
    compose: composeParser,
    default: defaultParser,

    array: arrayParser,
    array2d: array2dParser,
    map: mapParser,
    record: recordParser,

    success: parserSuccess,
    fail: parserFail,
    refail: parserRefail,
}