import type Token from '../../types/token'
import type { 
    FileToken, 
    ShellToken, 
    WriteToken, 
    ReplaceToken 
} from '../../types/token'
import type { 
    Program,
    FileContext, 
    ShellNode, 
    WriteNode, 
    ReplaceNode 
} from '../../types/nodes'

export default class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): Program {
        const body: (FileContext | ShellNode)[] = [];

        while (this.current < this.tokens.length) {
            const token = this.peek();
            if (!token) break;

            if (token.type === 'File') {
                 const fileToken = this.advance() as FileToken;
                 const context: FileContext = {
                     type: 'FileContext',
                     filePath: fileToken.path,
                     instructions: []
                 };

                 // Greedy parse children
                 while (true) {
                     const next = this.peek();
                     if (!next) break;
                     if (next.type === 'Write') {
                         context.instructions.push(this.parseWrite());
                     } else if (next.type === 'Replace') {
                         context.instructions.push(this.parseReplace());
                     } else {
                         // Next is File or Shell, stop context
                         break;
                     }
                 }
                 body.push(context);
            } else if (token.type === 'Shell') {
                 const shellToken = this.advance() as ShellToken;
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

    private peek(): Token | undefined {
        if (this.current >= this.tokens.length) return undefined;
        return this.tokens[this.current] as Token;
    }

    private advance(): Token {
        if (this.current >= this.tokens.length) throw new Error("Unexpected end of input");
        return this.tokens[this.current++] as Token;
    }

    private parseWrite(): WriteNode {
        const token = this.advance() as WriteToken;
        return {
            type: 'WriteNode',
            content: token.content
        };
    }

    private parseReplace(): ReplaceNode {
        const token = this.advance() as ReplaceToken;
        return {
            type: 'ReplaceNode',
            oldString: token.oldString,
            newString: token.newString
        };
    }
}
