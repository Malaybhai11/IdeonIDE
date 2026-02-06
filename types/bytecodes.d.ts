export const OpCode = {
    SET_FILE: 0,
    EXEC_SHELL: 1,
    WRITE_CONTENT: 2,
    REPLACE_CONTENT: 3
} as const;

export type OpCode = typeof OpCode[keyof typeof OpCode];

export interface Instruction {
    op: OpCode;
    args: string[];
}
