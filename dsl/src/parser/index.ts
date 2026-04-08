import { type Token } from '../../types/token.ts'
import { isAtEnd, setTokens } from './data.ts'

export default function parse(tokens: Array<Token>) {
    setTokens(tokens)
    while (!isAtEnd()) {
        // TODO
    }
}