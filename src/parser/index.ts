import type Token from '../../types/token.d.ts'
import type { 
    FileToken, 
    ShellToken, 
    WriteToken, 
    ReplaceToken 
} from '../../types/token.d.ts'
import type { 
    Program, 
    ASTNode, 
    FileContext, 
    ShellNode, 
    WriteNode, 
    ReplaceNode 
} from '../../types/ast.d.ts'

export default function parse(tokens: Token[]): Program {
    let current = 0;

    function peek(): Token | undefined {
        if (current >= tokens.length) return undefined;
        return tokens[current] as Token;
    }

    function advance(): Token {
        if (current >= tokens.length) throw new Error("Unexpected end of input");
        return tokens[current++] as Token;
    }

    function parseWrite(): WriteNode {
        const token = advance() as WriteToken;
        return {
            type: 'WriteNode',
            content: token.content
        };
    }

    function parseReplace(): ReplaceNode {
        const token = advance() as ReplaceToken;
        return {
            type: 'ReplaceNode',
            oldString: token.oldString,
            newString: token.newString
        };
    }

    const body: (FileContext | ShellNode)[] = [];

    while (current < tokens.length) {
        const token = peek();
        if (!token) break;

        if (token.type === 'File') {
             const fileToken = advance() as FileToken;
             const context: FileContext = {
                 type: 'FileContext',
                 filePath: fileToken.path,
                 instructions: []
             };

             // Greedy parse children
             while (true) {
                 const next = peek();
                 if (!next) break;
                 if (next.type === 'Write') {
                     context.instructions.push(parseWrite());
                 } else if (next.type === 'Replace') {
                     context.instructions.push(parseReplace());
                 } else {
                     // Next is File or Shell, stop context
                     break;
                 }
             }
             body.push(context);
        } else if (token.type === 'Shell') {
             const shellToken = advance() as ShellToken;
             body.push({
                 type: 'ShellNode',
                 command: shellToken.command
             } as ShellNode);
        } else {
            throw new Error(`Unexpected token at root level: ${token.type}. Expected 'File' or 'Shell'.`);
        }
    }

    return {
        type: 'Program',
        body
    };
}
