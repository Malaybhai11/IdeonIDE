export type NodeType = 'Program' | 'FileContext' | 'ShellNode' | 'WriteNode' | 'ReplaceNode';

export interface ASTNode {
    type: NodeType;
}

export interface Program extends ASTNode {
    type: 'Program';
    body: (FileContext | ShellNode)[];
}

export interface FileContext extends ASTNode {
    type: 'FileContext';
    filePath: string;
    instructions: (WriteNode | ReplaceNode)[];
}

export interface ShellNode extends ASTNode {
    type: 'ShellNode';
    command: string;
}

export interface WriteNode extends ASTNode {
    type: 'WriteNode';
    content: string;
}

export interface ReplaceNode extends ASTNode {
    type: 'ReplaceNode';
    oldString: string;
    newString: string;
}
