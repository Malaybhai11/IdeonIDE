import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import run from '../src/executor/index'
// @ts-ignore
import { OpCode } from '../types/bytecodes'
import type { Runtime } from '../types/runtime'
import fs from 'fs'
import path from 'path'
import os from 'os'

describe('Executor', () => {
    let tempDir: string
    let testRuntime: Runtime

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jetlang-test-'))
        
        testRuntime = {
            writeFile: async (filePath, content) => {
                const fullPath = path.resolve(tempDir, filePath);
                const dirname = path.dirname(fullPath);
                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname, { recursive: true });
                }
                fs.writeFileSync(fullPath, content, 'utf-8');
            },
            readFile: async (filePath) => {
                const fullPath = path.resolve(tempDir, filePath);
                return fs.readFileSync(fullPath, 'utf-8');
            },
            appendFile: async (filePath, content) => {
                const fullPath = path.resolve(tempDir, filePath);
                fs.appendFileSync(fullPath, content, 'utf-8');
            },
            executeShell: async (command) => {
                // Mock shell for tests
                console.log(`Mock shell: ${command}`);
            },
            exists: async (filePath) => {
                const fullPath = path.resolve(tempDir, filePath);
                return fs.existsSync(fullPath);
            }
        };
    })

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true })
    })

    it('should write content to a file', async () => {
        const filePath = 'test.txt'
        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.WRITE_CONTENT, args: ['hello world'] }
        ]

        await run(instructions as any, testRuntime)

        const content = fs.readFileSync(path.join(tempDir, filePath), 'utf-8')
        expect(content).toBe('hello world')
    })

    it('should replace content in a file', async () => {
        const filePath = 'test.txt'
        const fullPath = path.join(tempDir, filePath)
        fs.writeFileSync(fullPath, 'hello world', 'utf-8')

        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.REPLACE_CONTENT, args: ['world', 'vitest'] }
        ]

        await run(instructions as any, testRuntime)

        const content = fs.readFileSync(fullPath, 'utf-8')
        expect(content).toBe('hello vitest')
    })

    it('should append content if oldString is empty', async () => {
        const filePath = 'test.txt'
        const fullPath = path.join(tempDir, filePath)
        fs.writeFileSync(fullPath, 'hello', 'utf-8')

        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.REPLACE_CONTENT, args: ['', ' world'] }
        ]

        await run(instructions as any, testRuntime)

        const content = fs.readFileSync(fullPath, 'utf-8')
        expect(content).toBe('hello world')
    })

    it('should create directories if they do not exist', async () => {
        const filePath = 'subdir/test.txt'
        const instructions = [
            { op: OpCode.SET_FILE, args: [filePath] },
            { op: OpCode.WRITE_CONTENT, args: ['nested'] }
        ]

        await run(instructions as any, testRuntime)

        const content = fs.readFileSync(path.join(tempDir, filePath), 'utf-8')
        expect(content).toBe('nested')
    })
})
