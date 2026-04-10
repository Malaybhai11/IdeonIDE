import { DeleteFileStatement } from "../../../types/node.ts";
import { consume, peek } from "../data";

export default function parseDeleteFile(): DeleteFileStatement {
    consume("TOKEN_DELETEFILE")
    consume("TOKEN_STRING")
    return {
        type: 'DeleteFileStatement',
        path: peek(-1).lexeme
    }
}