export type { Parser } from "./parser/Parser"
export type { ParserResult } from "./parser/ParserResult"
import { composeParser } from "./parser/composeParser.js"
import { numberParser } from "./parser/numberParser.js"
import { stringParser } from "./parser/stringParser.js"
import { vec2Parser } from "./parser/vec2Parser.js"
import { stringLiteralParser } from "./parser/stringLiteralParser.js"
import { taggedUnionParser } from "./parser/taggedUnionParser.js"
import { arrayParser } from "./parser/arrayParser.js"
import { array2dParser } from "./parser/array2dParser.js"
import { defaultParser } from "./parser/defaultParser.js"
import { parserSuccess } from "./parser/parserSuccess.js"
import { parserFail, parserRefail } from "./parser/parserFail.js"
import { mapParser } from "./parser/mapParser.js"
import { rectParser } from "./parser/rectParser.js"
import { recordParser } from "./parser/recordParser.js"
import { booleanParser } from "./parser/booleanParser.js"

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