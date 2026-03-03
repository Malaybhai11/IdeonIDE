import { describe, it, expect } from 'vitest'
import tokenize from '../src/tokenizer/index.js'
import Parser from '../src/parser/index.js'

describe('Parser', () => {
    it('should parse a simple program', () => {
        const src = `
            File test.txt
            Write \`hello\`
        `
        const tokens = tokenize(src)
        const ast = new Parser(tokens).parse()
        expect(ast).toEqual({
            type: 'Program',
            body: [
                {
                    type: 'FileContext',
                    filePath: 'test.txt',
                    instructions: [
                        { type: 'WriteNode', content: 'hello' }
                    ]
                }
            ]
        })
    })

    it('should parse multiple instructions in FileContext', () => {
        const src = `
            File test.txt
            Write \`hello\`
            Replace \`hello\` \`world\`
        `
        const tokens = tokenize(src)
        const ast = new Parser(tokens).parse()
        expect(ast).toEqual({
            type: 'Program',
            body: [
                {
                    type: 'FileContext',
                    filePath: 'test.txt',
                    instructions: [
                        { type: 'WriteNode', content: 'hello' },
                        { type: 'ReplaceNode', oldString: 'hello', newString: 'world' }
                    ]
                }
            ]
        })
    })

    it('should parse Shell instructions', () => {
        const src = `
            Shell \`npm test\`
        `
        const tokens = tokenize(src)
        const ast = new Parser(tokens).parse()
        expect(ast).toEqual({
            type: 'Program',
            body: [
                {
                    type: 'ShellNode',
                    command: 'npm test'
                }
            ]
        })
    })

    it('should parse mixed FileContext and Shell instructions', () => {
        const src = `
            File test.txt
            Write \`content\`
            Shell \`ls\`
            File test2.txt
            Write \`other\`
        `
        const tokens = tokenize(src)
        const ast = new Parser(tokens).parse()
        expect(ast).toEqual({
            type: 'Program',
            body: [
                {
                    type: 'FileContext',
                    filePath: 'test.txt',
                    instructions: [
                        { type: 'WriteNode', content: 'content' }
                    ]
                },
                {
                    type: 'ShellNode',
                    command: 'ls'
                },
                {
                    type: 'FileContext',
                    filePath: 'test2.txt',
                    instructions: [
                        { type: 'WriteNode', content: 'other' }
                    ]
                }
            ]
        })
    })
})
