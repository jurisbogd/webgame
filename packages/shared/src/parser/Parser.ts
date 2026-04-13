import { ParserResult } from "./ParserResult";

export type Parser<T> = (x: any) => ParserResult<T>;