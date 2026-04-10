import parse from "./parser/index.ts";
import tokenize from "./tokenizer/index.ts";

export default function interprete(src: string) {
    const tokens = tokenize(src)
    console.log("Tokens:\n")
    console.log(JSON.stringify(tokens, null, 2))
    const ast = parse(tokens)
    console.log("AST:\n")
    console.log(JSON.stringify(ast, null, 2))
}

interprete(`
    CreateFile "src/index.ts"
`)