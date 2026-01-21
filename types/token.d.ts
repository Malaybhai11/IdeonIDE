export default interface Token {
    type: 'File' | 'Shell' | 'Write' | 'Replace',
    [key: string]: any
}

export interface File extends Token {
    type: 'File',
    path: string
}

export interface Shell extends Token {
    type: 'Shell',
    command: string
}

export interface Write extends Token {
    type: 'Write',
    content: string
}

export interface Replace extends Token {
    type: 'Replace',
    old_string: string,
    new_string: string
}