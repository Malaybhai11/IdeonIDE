import { type Statement } from "../../../types/node.ts"
import { peek } from "../data.ts"
import parseCreateFile from "./create-file.ts"

export default function parseStatement(): Statement | undefined {
    switch (peek().type) {
        case 'TOKEN_CREATEFILE': {
            return parseCreateFile()
        }
    }
}