import type { Instruction } from '../../types/bytecodes'
// @ts-ignore 
import { OpCode } from '../../types/bytecodes'
import type { Runtime } from '../../types/runtime'

export default async function run(instructions: Instruction[], runtime: Runtime) {
    let currentFile: string | null = null;

    for (const inst of instructions) {
        switch (inst.op) {
            case OpCode.SET_FILE:
                currentFile = inst.args[0] as string;
                break;
                
            case OpCode.EXEC_SHELL:
                console.log(`Executing: ${inst.args[0]}`);
                await runtime.executeShell(inst.args[0] as string);
                break;
                
            case OpCode.WRITE_CONTENT:
                if (!currentFile) throw new Error("No file selected for write operation");
                await runtime.writeFile(currentFile, (inst.args[0] as string).trim());
                console.log(`Wrote to: ${currentFile}`);
                break;
                
            case OpCode.REPLACE_CONTENT:
                if (!currentFile) throw new Error("No file selected for replace operation");
                
                if (!(await runtime.exists(currentFile))) {
                   console.error(`File not found: ${currentFile}`);
                   break;
                }

                let content = await runtime.readFile(currentFile);
                const oldString = inst.args[0] as string;
                const newString = inst.args[1] as string;
                
                if (oldString === '') {
                    // Append mode
                    await runtime.appendFile(currentFile, newString);
                    console.log(`Appended content to: ${currentFile}`);
                } else if (content.includes(oldString)) {
                    // Update mode
                    content = content.replace(oldString, newString);
                    await runtime.writeFile(currentFile, content);
                    console.log(`Replaced content in: ${currentFile}`);
                } else {
                    console.warn(`Original string not found in ${currentFile}`);
                }
                break;
        }
    }
}
