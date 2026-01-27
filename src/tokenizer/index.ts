import { exit } from 'process'
import type {
    File,
    Shell,
    Write
} from '../../types/token.d.ts'
import type Token from '../../types/token.d.ts'
import { isWhiteSpace } from './utils.ts'

export default function tokenize(src: string) {
    let i: number = 0
    let tokens: Array<Token> = []

    while (src[i]) {
        if (isWhiteSpace(src[i] as string)) {
            i++
            continue
        }
        // File token
        else if (src[i] === 'F') {
            let token_string: string = ''

            while (src[i] !== ' ') {
                token_string += src[i]
                i++
            }
            if (token_string === 'File') {
                let j = i + 1
                let path: string = ''

                while (src[j] !== '\n') {
                    path += src[j]
                    j++
                }

                tokens.push({
                    type: 'File',
                    path
                } as File)

                i = j + 1
                continue
            } else {
                console.log(`Unexpected token '${token_string}'`)
                exit(1)
            }
        }
        // Shell token
        else if (src[i] === 'S') {
            let token_string: string = ''

            while (src[i] !== ' ') {
                token_string += src[i]
                i++
            }
            if (token_string === 'Shell') {
                let j = i + 1
                let command: string = ''

                while (src[j] !== '\n') {
                    command += src[j]
                    j++
                }

                tokens.push({
                    type: 'Shell',
                    command
                } as Shell)

                i = j + 1
            } else {
                console.log(`Unexpected token '${token_string}'`)
                exit(1)
            }
        }
        // Write token
        else if (src[i] === 'W') {
            let token_string: string = ''

            while (src[i] !== ' ') {
                // console.log(`Current token is '${src[i]}'`)
                token_string += src[i]
                i++
            }
            if (token_string === 'Write') {
                let j = i + 1
                let content: string = ''
                
                if (src[j] !== '`') {
                    console.log(`Expected '\`', got '${src[j]}'`)
                    exit(1)
                } else {
                    j++
                }
                
                while (src[j] !== '`') {
                    content += src[j]
                    j++
                }

                tokens.push({
                    type: 'Write',
                    content
                } as Write)

                i = j + 1
            } else {
                console.log(`Unexpected token '${token_string}'`)
                exit(1)
            }
        }
        continue
    }

    return tokens
}