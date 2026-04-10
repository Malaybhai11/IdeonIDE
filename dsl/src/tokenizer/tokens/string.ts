import { src, cursor, increment, tokens, row, column } from "../data.ts"

export default function tokenizeString() {
    const startRow = row
    const startColumn = column
    const delimiter: string = src[cursor]
    let lexeme: string = ''
    increment()
    while (src[cursor] !== delimiter) {
        lexeme += src[cursor]
        increment()
    }
    increment()
    tokens.push({
        type: 'TOKEN_STRING', literal: lexeme,
        lexeme, row: startRow, column: startColumn
    })
}