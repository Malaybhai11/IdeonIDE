import tokenize from './tokenizer/index'
import Parser from './parser/index'
import analyze from './analyzer/index'
import generate from './generator/index'
import run from './executor/index'
import type { Runtime } from '../types/runtime'

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