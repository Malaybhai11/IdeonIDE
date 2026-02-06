import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import type { Instruction } from '../../types/bytecodes.d.ts'
// @ts-ignore 
import { OpCode } from '../../types/bytecodes.d.ts'
import { exit } from 'process'

export default function run(instructions: Instruction[], cwd: string = process.cwd()) {
    let currentFile: string | null = null;

    for (const inst of instructions) {
        switch (inst.op) {
            case OpCode.SET_FILE:
                currentFile = path.resolve(cwd, inst.args[0] as string);
                break;
                
            case OpCode.EXEC_SHELL:
                console.log(`Executing: ${inst.args[0]}`);
                try {
                    execSync(inst.args[0] as string, { stdio: 'inherit', cwd });
                } catch (e) {
                    console.error(`Command failed: ${inst.args[0]}`);
                    exit(1);
                }
                break;
                
            case OpCode.WRITE_CONTENT:
                if (!currentFile) throw new Error("No file selected for write operation");
                ensureDirectoryExistence(currentFile);
                fs.writeFileSync(currentFile, (inst.args[0] as string).trim(), 'utf-8');
                console.log(`Wrote to: ${currentFile}`);
                break;
                
            case OpCode.REPLACE_CONTENT:
                if (!currentFile) throw new Error("No file selected for replace operation");
                if (!fs.existsSync(currentFile)) {
                   console.error(`File not found: ${currentFile}`);
                   break;
                }
                let content = fs.readFileSync(currentFile, 'utf-8');
                const oldString = inst.args[0] as string;
                const newString = inst.args[1] as string;
                
                if (oldString === '') {
                    // Append mode
                    fs.appendFileSync(currentFile, newString, 'utf-8');
                     console.log(`Appended content to: ${currentFile}`);
                } else if (content.includes(oldString)) {
                    // Update mode
                    content = content.replace(oldString, newString);
                    fs.writeFileSync(currentFile, content, 'utf-8');
                    console.log(`Replaced content in: ${currentFile}`);
                } else {
                    console.warn(`Original string not found in ${currentFile}`);
                }
                break;
        }
    }
}

function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
