import { describe, it, expect } from 'vitest'
import generate from '../src/generator/index'
import type { Program } from '../types/nodes'
// @ts-expect-error - TS-ignore-fix
import { OpCode } from '../types/bytecodes'

describe('Generator', () => {
    it('should generate bytecode for a simple program', () => {
        const program: Program = {
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
        }
        const bytecode = generate(program)
        expect(bytecode).toEqual([
            { op: OpCode.SET_FILE, args: ['test.txt'] },
            { op: OpCode.WRITE_CONTENT, args: ['hello'] }
        ])
    })

    it('should generate bytecode for Replace and Shell', () => {
        const program: Program = {
            type: 'Program',
            body: [
                {
                    type: 'FileContext',
                    filePath: 'test.txt',
                    instructions: [
                        { type: 'ReplaceNode', oldString: 'old', newString: 'new' }
                    ]
                },
                {
                    type: 'ShellNode',
                    command: 'ls'
                }
            ]
        }
        const bytecode = generate(program)
        expect(bytecode).toEqual([
            { op: OpCode.SET_FILE, args: ['test.txt'] },
            { op: OpCode.REPLACE_CONTENT, args: ['old', 'new'] },
            { op: OpCode.EXEC_SHELL, args: ['ls'] }
        ])
    })
})
