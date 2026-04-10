import { peek } from "../data.ts"
import parseCreateFile from "./create-file.ts"

export default function parseStatement() {
    switch (peek().type) {
        case 'TOKEN_CREATEFILE': {
            return parseCreateFile()
        }
    }
}