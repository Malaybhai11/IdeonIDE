import tokenize from './tokenizer/index.ts'
import parse from './parser/index.ts'
import analyze from './analyzer/index.ts'
import generate from './generator/index.ts'
import run from './vm/index.ts'

export function compile(src: string, debug: boolean) {
    try {
        // 1. Tokenize
        const tokens = tokenize(src)
        if (debug) {
            console.log('Tokens:', JSON.stringify(tokens, null, 2));
        }

        // 2. Parse
        const ast = parse(tokens)
        if (debug) {
            console.log('AST:', JSON.stringify(ast, null, 2));
        }

        // 3. Analyze
        analyze(ast)

        // 4. Generate Bytecode
        const bytecode = generate(ast)
        if (debug) {
            console.log('Bytecode:', JSON.stringify(bytecode, null, 2));
        }

        run(bytecode, process.cwd())
        
    } catch (e) {
        console.error('Compilation Error:', e);
        if ((e as any).code === 'ENOENT') {
             console.error("File not found error. Current directory:", process.cwd());
        }
    }
}

compile(`
    File test_output.txt
    Write \`Hello, World!\`
`, true)