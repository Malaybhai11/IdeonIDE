import { tokens, src, cursor, increment, row, column } from "../data.ts"
import isAlphabet from "../utils/alphabet.ts"
import { UnknownKeywordError } from "../../shared/errors.ts"

export default function tokenizeKeyword() {
    let lexeme: string = ''
    while (src[cursor] && isAlphabet(src[cursor])) {
        lexeme += src[cursor]
        increment()
    }
    switch (lexeme.toLowerCase()) {
        case 'createfile': {
            tokens.push({
                type: 'TOKEN_CREATEFILE', literal: null,
                lexeme, row, column
            })
            break
        } case 'deletefile': {
            tokens.push({
                type: 'TOKEN_DELETEFILE', literal: null,
                lexeme, row, column
            })
            break
        } case 'readfile': {
            tokens.push({
                type: 'TOKEN_READFILE', literal: null,
                lexeme, row, column
            })
            break
        } case 'listfiles': {
            tokens.push({
                type: 'TOKEN_LISTFILES', literal: null,
                lexeme, row, column
            })
            break
        } case 'append': {
            tokens.push({
                type: 'TOKEN_APPEND', literal: null,
                lexeme, row, column
            })
            break
        } case 'deleteline': {
            tokens.push({
                type: 'TOKEN_DELETELINE', literal: null,
                lexeme, row, column
            })
            break
        } case 'search': {
            tokens.push({
                type: 'TOKEN_SEARCH', literal: null,
                lexeme, row, column
            })
            break
        }
        case 'shell': {
            tokens.push({
                type: 'TOKEN_SHELL', literal: null,
                lexeme, row, column
            })
            break
        } case 'replace': {
            tokens.push({
                type: 'TOKEN_REPLACE', literal: null,
                lexeme, row, column
            })
            break
        } default: {
            throw new UnknownKeywordError(`Unexpected keyword "${lexeme}" at line ${row}`)
        }
    }
}
