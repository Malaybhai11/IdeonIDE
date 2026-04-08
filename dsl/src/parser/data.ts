import { UnexpectedTokenError } from '../shared/errors.ts'
import { Token, TokenType } from '../../types/token.ts'

export let tokens: Array<Token> = []
export let cursor: number = 0

export function setTokens(newTokens: typeof tokens) {
    tokens = newTokens
}

export function peek(extra: number = 0) {
    return tokens[cursor + extra]
}

export function advance() {
    return tokens[cursor++]
}

export function consume(expectedType: TokenType) {
    if (tokens[cursor].type !== expectedType) {
        throw new UnexpectedTokenError(`Unexpected token at line ${tokens[cursor].row}. Expected ${expectedType}`)
    } else {
        cursor++
    }
}

export function isAtEnd() {
    return cursor < tokens.length
}