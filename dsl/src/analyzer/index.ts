import type { Program, FileContext } from '../../types/nodes'

export default function analyze(program: Program): void {
    for (const node of program.body) {
        if (node.type === 'FileContext') {
            const ctx = node as FileContext;
            if (!ctx.filePath) {
                 throw new Error("File path is missing in File Context");
            }
            if (ctx.instructions.length === 0) {
                console.warn(`Warning: File context for ${ctx.filePath} has no instructions.`);
            }
        }
    }
}
