import type { Program, Statement } from '../../types/node.ts'
import { type Token } from '../../types/token.ts'
import { isAtEnd, setTokens } from './data.ts'
import parseStatement from './statements/index.ts'

export default function parse(tokens: Array<Token>) {
    setTokens(tokens)
    const ast: Program = {
        type: 'Program',
        body: []
    }
    while (!isAtEnd()) {
        ast.body.push(parseStatement() as Statement)
    }
    return ast
}