import tokenize from './tokenizer/index.ts'
import parse from './parser/index.ts'
import analyze from './analyzer/index.ts'
import generate from './generator/index.ts'
import run from './executor/index.ts'

export function compile(src: string, debug: boolean) {
    try {
        const tokens = tokenize(src)
        if (debug) {
            console.log('Tokens:', JSON.stringify(tokens, null, 2));
        }
        const ast = parse(tokens)
        if (debug) {
            console.log('AST:', JSON.stringify(ast, null, 2));
        }
        analyze(ast)
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
    File server.js
    Write \`
        import express from 'express'
        const app = express()
        app.get('/', (req, res) => {
            res.send('Hello World!')
        })
        app.listen(3000, () => {
            console.log('Server started on port 3000')
        })
    \`
    Shell \`npm install express && node server.js\`
`, true)