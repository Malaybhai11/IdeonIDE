import { describe, it, expect } from 'vitest'
import tokenize from '../src/tokenizer/index'

describe('Tokenizer', () => {
    it('should tokenize File keyword', () => {
        const src = 'File server.js'
        const tokens = tokenize(src)
        expect(tokens).toEqual([
            { type: 'File', path: 'server.js' }
        ])
    })

    it('should tokenize File with backtick string', () => {
        const src = 'File `server.js` '
        const tokens = tokenize(src)
        expect(tokens).toEqual([
            { type: 'File', path: 'server.js' }
        ])
    })

    it('should tokenize Write keyword', () => {
        const src = 'Write `hello` '
        const tokens = tokenize(src)
        expect(tokens).toEqual([
            { type: 'Write', content: 'hello' }
        ])
    })

    it('should tokenize Shell keyword', () => {
        const src = 'Shell `npm install` '
        const tokens = tokenize(src)
        expect(tokens).toEqual([
            { type: 'Shell', command: 'npm install' }
        ])
    })

    it('should handle escape sequences in backtick strings', () => {
        const src = 'Write `line1\\nline2` '
        const tokens = tokenize(src)
        expect(tokens).toEqual([
            { type: 'Write', content: 'line1\nline2' }
        ])
    })

    it('should tokenize multiple instructions', () => {
        const src = `
            File test.txt
            Write \`content\`
            Shell \`ls\`
        `
        const tokens = tokenize(src)
        expect(tokens).toEqual([
            { type: 'File', path: 'test.txt' },
            { type: 'Write', content: 'content' },
            { type: 'Shell', command: 'ls' }
        ])
    })

    it('should tokenize Replace keyword', () => {
        const src = 'Replace `old` `new` '
        const tokens = tokenize(src)
        expect(tokens).toEqual([
            { type: 'Replace', oldString: 'old', newString: 'new' }
        ])
    })
})
