import { describe, it, expect } from 'vitest'
import analyze from '../src/analyzer/index.ts'
import type { Program } from '../types/nodes.d.ts'

describe('Analyzer', () => {
    it('should throw error if filePath is missing', () => {
        const program: Program = {
            type: 'Program',
            body: [
                {
                    type: 'FileContext',
                    filePath: '',
                    instructions: []
                }
            ]
        }
        expect(() => analyze(program)).toThrow('File path is missing in File Context')
    })

    it('should not throw for valid program', () => {
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
        expect(() => analyze(program)).not.toThrow()
    })
})
