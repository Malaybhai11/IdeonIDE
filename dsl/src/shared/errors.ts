export class UnknownKeywordError extends Error {
    constructor(msg: string = 'Unexpected keyword') {
        super(msg)
    }
}

export class UnknownCharacterError extends Error {
    constructor(msg: string = 'Unexpected character') {
        super(msg)
    }
}