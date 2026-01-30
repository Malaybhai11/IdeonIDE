import tokenize from './tokenizer/index.ts'

function compile(src: string, debug: boolean) {
    const tokens = tokenize(src)
    if (debug) {
        console.log(`Tokens are:\n${JSON.stringify(tokens, null, 4)}`)
    }
}

compile(`
    File src/index.ts
    Replace \`console.log("Hello, World!")\` \`console.log("Bye World");\`
`, true)