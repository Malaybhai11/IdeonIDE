import { type Token } from '../../types/token.ts'
import { isAlphabet, isNumber, isWhiteSpace } from './utils.ts'
import { setSrc, src, increment, cursor, tokens } from './data.ts'
import tokenizeKeyword from './tokens/keywords.ts'
import tokenizeString from './tokens/string.ts'
import tokenizeNumber from './tokens/number.ts'

export default function tokenize(newSrc: string): Array<Token> {
    setSrc(newSrc)
    while (src[cursor]) {
        if (isWhiteSpace(src[cursor])) {
            increment()
        } else if (isAlphabet(src[cursor])) {
            tokenizeKeyword()
        } else if (src[cursor] === '"' || src[cursor] === "'") {
            tokenizeString()
        } else if (isNumber(src[cursor])) {
            tokenizeNumber()
        }
        increment()
    }
    return tokens
}
