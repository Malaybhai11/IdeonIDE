import { type Token } from '../../types/token.ts'
import { advance, isAtEnd, peek, setTokens } from './data.ts'
import parseStatement from './statements/index.ts'

export default function parse(tokens: Array<Token>) {
    setTokens(tokens)
    let ast = {}
    while (!isAtEnd()) {
        console.log(peek())
        ast = {
            type: 'Program',
            body: [
                parseStatement()
            ]
        }
    }
    return ast
}