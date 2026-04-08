export type TokenType = 'TOKEN_SHELL' | 'TOKEN_REPLACE' | 'TOKEN_STRING' | 'TOKEN_NUMBER' | 'TOKEN_IDENTIFIER' | 'TOKEN_EOF' | 'TOKEN_CREATEFILE' | 'TOKEN_READFILE' | 'TOKEN_DELETEFILE' | 'TOKEN_LISTFILES' | 'TOKEN_APPEND' | 'TOKEN_DELETELINE' | 'TOKEN_SEARCH' | 'TOKEN_RESPOND'

export interface Token {
    type: TokenType,
    lexeme: string
    literal: string | number | null,
    row: number,
    column: number
}

export interface CreateFile extends Token {
    type: 'TOKEN_CREATEFILE',
    literal: null
}

export interface ReadFile extends Token {
    type: 'TOKEN_READFILE',
    literal: null
}

export interface DeleteFile extends Token {
    type: 'TOKEN_DELETEFILE',
    literal: null
}

export interface ListFiles extends Token {
    type: 'TOKEN_LISTFILES',
    literal: null
}

export interface Append extends Token {
    type: 'TOKEN_APPEND',
    literal: null
}

export interface DeleteLine extends Token {
    type: 'TOKEN_DELETELINE',
    literal: null
}

export interface Search extends Token {
    type: 'TOKEN_SEARCH',
    literal: null
}

export interface Shell extends Token {
    type: 'TOKEN_SHELL',
    literal: null
}

export interface Replace extends Token {
    type: 'TOKEN_REPLACE',
    literal: null
}

export interface String extends Token {
    type: 'TOKEN_STRING',
    literal: string
}

export interface Number extends Token {
    type: 'TOKEN_NUMBER',
    literal: number
}

export interface Identifier extends Token {
    type: 'TOKEN_IDENTIFIER',
    literal: number
}

export interface EndOfFile extends Token {
    type: 'TOKEN_EOF',
    lexeme: '',
    literal: null
}
