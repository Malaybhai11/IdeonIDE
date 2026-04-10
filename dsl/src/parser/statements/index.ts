import { type Statement } from "../../../types/node.ts"
import { peek } from "../data.ts"
import parseCreateFile from "./create-file.ts"
import parseReadFile from "./read-file.ts"

export default function parseStatement(): Statement | undefined {
    switch (peek().type) {
        case 'TOKEN_CREATEFILE': {
            return parseCreateFile()
        } case 'TOKEN_READFILE': {
            return parseReadFile()
        }
    }
}