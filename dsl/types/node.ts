export interface Node {
    type: string
}

export interface Program extends Node {
    type: 'Program',
    body: Array<Statement>
}

export type Statement = CreateFileStatement | ReadFileStatement | DeleteFileStatement | ListFilesStatement | ReplaceStatement | AppendStatement | DeleteLineStatement |  SearchStatement | ShellStatement

export interface CreateFileStatement extends Node {
    type: 'CreateFileStatement',
    path: string
}

export interface ReadFileStatement extends Node {
    type: 'ReadFileStatement',
    path: string
}

export interface DeleteFileStatement extends Node {
    type: 'DeleteFileStatement',
    path: string
}

export interface ListFilesStatement extends Node {
    type: 'ListFilesStatement',
    path: string
}

export interface ReplaceStatement extends Node {
    type: 'ReplaceStatement',
    path: string,
    oldString: string,
    newString: string
}

export interface AppendStatement extends Node {
    type: 'AppendStatement',
    path: string,
    content: string
}

export interface DeleteLineStatement extends Node {
    type: 'DeleteLineStatement',
    path: string,
    content: string
}

export interface SearchStatement extends Node {
    type: 'SearchStatement',
    path: string
    query: string
}

export interface ShellStatement extends Node {
    type: 'ShellStatement',
    command: string
}