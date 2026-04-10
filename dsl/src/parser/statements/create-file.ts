import { type CreateFileStatement } from "../../../types/node.ts";
import { UnexpectedTokenError } from "../../shared/errors.ts";
import { advance, consume, peek } from "../data.ts";

export default function parseCreateFile(): CreateFileStatement {
    consume('TOKEN_CREATEFILE')
    if (peek().type !== 'TOKEN_STRING') {
        throw new UnexpectedTokenError(`Unexpected token "${peek().lexeme}" at line ${peek().row}`)
    }
    return {
        type: 'CreateFileStatement',
        path: advance().lexeme
    }
}