import type {
    FileToken,
    ReplaceToken,
    ShellToken,
    WriteToken
} from '../../types/token'
import type Token from '../../types/token'
import { isWhiteSpace, isAlpha, isUpper } from './utils'

export default function tokenize(src: string): Token[] {
    let i = 0
    const tokens: Token[] = []

    while (i < src.length) {
        const char = src[i] as string

        if (isWhiteSpace(char)) {
            i++
            continue
        }

        // Parse keywords
        if (isUpper(char)) {
            let keyword = ''
            while (i < src.length && isAlpha(src[i] as string)) {
                keyword += src[i]
                i++
            }

            if (keyword === 'File') {
                // Consume whitespace
                while (i < src.length && src[i] !== '\n' && isWhiteSpace(src[i] as string)) {
                    i++
                }
                
                let path = ''
                if (src[i] === '`') {
                    path = readBacktickString();
                } else {
                    while (i < src.length && src[i] !== '\n') {
                        path += src[i]
                        i++
                    }
                    path = path.trim();
                }
                tokens.push({ type: 'File', path } as FileToken)
            } 
            else if (keyword === 'Shell') {
                // Consume whitespace
                while (i < src.length && src[i] !== '\n' && isWhiteSpace(src[i] as string)) {
                    i++
                }

                let command = ''
                if (src[i] === '`') {
                    command = readBacktickString();
                } else {
                    while (i < src.length && src[i] !== '\n') {
                        command += src[i]
                        i++
                    }
                    command = command.trim();
                }
                tokens.push({ type: 'Shell', command } as ShellToken)
            }
            else if (keyword === 'Write') {
                const content = readBacktickString()
                tokens.push({ type: 'Write', content } as WriteToken)
            }
            else if (keyword === 'Replace') {
                const oldString = readBacktickString()
                const newString = readBacktickString()
                tokens.push({ type: 'Replace', oldString, newString } as ReplaceToken)
            }
            else {
                throw new Error(`Unknown keyword: ${keyword}`)
            }
        } else {
             // Unexpected character
             console.error(`Unexpected character: ${char}`)
             i++
        }
    }

    function readBacktickString(): string {
        // Build robust string reader with escape support
        // Skip leading whitespace until backtick
        while (i < src.length && isWhiteSpace(src[i] as string)) {
            i++
        }

        if (src[i] !== '`') {
             throw new Error(`Expected backtick, got ${src[i]} at index ${i}`)
        }
        i++ // Skip opening backtick

        let content = ''
        while (i < src.length) {
            if (src[i] === '\\') {
                i++
                if (i >= src.length) break
                // Handle escape sequences
                const escaped = src[i]
                if (escaped === 'n') content += '\n'
                else if (escaped === 't') content += '\t'
                else if (escaped === '`') content += '`'
                else if (escaped === '\\') content += '\\'
                else content += escaped // Fallback
                i++
            } else if (src[i] === '`') {
                i++ // Skip closing backtick
                return content
            } else {
                content += src[i]
                i++
            }
        }
        throw new Error('Unterminated string')
    }

    return tokens
}