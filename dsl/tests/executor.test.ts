import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import run from '../src/executor/index.js'
// @ts-ignore
import { OpCode } from '../types/bytecodes.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

describe('Executor', () => {
    let tempDir: string

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jetlang-test-'))
    })

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true })
    })

    it('should write content to a file', () => {
        const filePath = 'test.txt'
        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.WRITE_CONTENT, args: ['hello world'] }
        ]

        run(instructions as any, tempDir)

        const content = fs.readFileSync(path.join(tempDir, filePath), 'utf-8')
        expect(content).toBe('hello world')
    })

    it('should replace content in a file', () => {
        const filePath = 'test.txt'
        const fullPath = path.join(tempDir, filePath)
        fs.writeFileSync(fullPath, 'hello world', 'utf-8')

        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.REPLACE_CONTENT, args: ['world', 'vitest'] }
        ]

        run(instructions as any, tempDir)

        const content = fs.readFileSync(fullPath, 'utf-8')
        expect(content).toBe('hello vitest')
    })

    it('should append content if oldString is empty', () => {
        const filePath = 'test.txt'
        const fullPath = path.join(tempDir, filePath)
        fs.writeFileSync(fullPath, 'hello', 'utf-8')

        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.REPLACE_CONTENT, args: ['', ' world'] }
        ]

        run(instructions as any, tempDir)

        const content = fs.readFileSync(fullPath, 'utf-8')
        expect(content).toBe('hello world')
    })

    it('should create directories if they do not exist', () => {
        const filePath = 'subdir/test.txt'
        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.WRITE_CONTENT, args: ['nested'] }
        ]

        run(instructions as any, tempDir)

        const content = fs.readFileSync(path.join(tempDir, filePath), 'utf-8')
        expect(content).toBe('nested')
    })
})
