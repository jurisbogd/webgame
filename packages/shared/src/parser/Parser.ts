import { ParserResult } from "./ParserResult.js";

export type Parser<T> = (x: any) => ParserResult<T>;