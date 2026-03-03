import tokenize from './tokenizer/index.ts'
import Parser from './parser/index.ts'
import analyze from './analyzer/index.ts'
import generate from './generator/index.ts'
import run from './executor/index.ts'
import type { Runtime } from '../types/runtime.d.ts'

export async function compile(src: string, runtime: Runtime, debug: boolean = false) {
    try {
        const tokens = tokenize(src)
        if (debug) {
            console.log('Tokens:', JSON.stringify(tokens, null, 2));
        }
        const ast = new Parser(tokens).parse()
        if (debug) {
            console.log('AST:', JSON.stringify(ast, null, 2));
        }
        analyze(ast)
        const bytecode = generate(ast)
        if (debug) {
            console.log('Bytecode:', JSON.stringify(bytecode, null, 2));
        }
        await run(bytecode, runtime)
    } catch (e) {
        console.error('Compilation Error:', e);
        throw e;
    }
}