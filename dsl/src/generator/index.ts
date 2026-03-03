import type { Program } from '../../types/nodes.d.ts'
import type { Instruction } from '../../types/bytecodes.d.ts'
// @ts-ignore 
import { OpCode } from '../../types/bytecodes.d.ts'
import type { FileContext, ShellNode, WriteNode, ReplaceNode } from '../../types/nodes.d.ts'

export default function generate(program: Program): Instruction[] {
    const instructions: Instruction[] = [];

    for (const node of program.body) {
        if (node.type === 'FileContext') {
            const fileCtx = node as FileContext;
             instructions.push({
                op: OpCode.SET_FILE,
                args: [fileCtx.filePath]
            });

            for (const child of fileCtx.instructions) {
                if (child.type === 'WriteNode') {
                    instructions.push({
                        op: OpCode.WRITE_CONTENT,
                        args: [(child as WriteNode).content]
                    });
                } else if (child.type === 'ReplaceNode') {
                    const replaceNode = child as ReplaceNode;
                    instructions.push({
                        op: OpCode.REPLACE_CONTENT,
                        args: [replaceNode.oldString, replaceNode.newString]
                    });
                }
            }
        } else if (node.type === 'ShellNode') {
            instructions.push({
                op: OpCode.EXEC_SHELL,
                args: [(node as ShellNode).command]
            });
        }
    }

    return instructions;
}
