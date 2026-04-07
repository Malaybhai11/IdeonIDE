import { src, cursor, increment, tokens, row, column } from "../data.ts"

export default function tokenizeString() {
    const delimiter: string = src[cursor]
    let lexeme: string = ''
    increment()
    while (src[cursor] !== delimiter) {
        lexeme += src[cursor]
        increment()
    }
    tokens.push({
        type: 'TOKEN_STRING', literal: lexeme,
        lexeme, row, column
    })
}