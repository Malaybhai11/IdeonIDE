import parse from "./parser/index.ts";
import tokenize from "./tokenizer/index.ts";

export default function interprete(src: string) {
    const tokens = tokenize(src)
    // console.log(tokens)
    const ast = parse(tokens)
    console.log(JSON.stringify(ast, null, 2))
}

interprete(`
    CreateFile "src/index.ts"
`)