import { type Statement } from "../../../types/node.ts";
import { consume, peek } from "../data.ts";

export default function parseReadFile(): Statement {
    consume("TOKEN_READFILE")
    consume("TOKEN_STRING")
    return {
        type: 'ReadFileStatement',
        path: peek(-1).lexeme
    }
}