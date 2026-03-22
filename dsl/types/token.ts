// Discriminated Union for better type inference
export type Token = FileToken | ShellToken | WriteToken | ReplaceToken;

export interface FileToken {
    type: 'File';
    path: string;
}

export interface ShellToken {
    type: 'Shell';
    command: string;
}

export interface WriteToken {
    type: 'Write';
    content: string;
}

export interface ReplaceToken {
    type: 'Replace';
    oldString: string;
    newString: string;
}

export default Token;