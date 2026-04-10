import isNumber from "../utils/number.ts" 
import { src, cursor, increment, tokens, row, column } from "../data.ts"
import { UnknownCharacterError } from "../../shared/errors.ts"

export default function tokenizeNumber() {
    const startRow = row
    const startColumn = column
    let lexeme: string = ''
    let hasDot: boolean = false
    while (isNumber(src[cursor]) || src[cursor] === '.') {
        if (hasDot && src[cursor] === '.') {
            throw new UnknownCharacterError(`Unexpected Character "${src[cursor]}" at line ${row}`)
        } if (!hasDot && src[cursor] === '.') {
            hasDot = true
        }
        lexeme += src[cursor]
        increment()
    }
    tokens.push({
        type: 'TOKEN_NUMBER', literal: null,
        lexeme, row: startRow, column: startColumn
    })
}
