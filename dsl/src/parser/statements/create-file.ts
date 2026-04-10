import { type CreateFileStatement } from "../../../types/node.ts";
import { consume, peek } from "../data.ts";

export default function parseCreateFile(): CreateFileStatement {
    consume('TOKEN_CREATEFILE')
    consume('TOKEN_STRING')
    return {
        type: 'CreateFileStatement',
        path: peek(-1).lexeme
    }
}