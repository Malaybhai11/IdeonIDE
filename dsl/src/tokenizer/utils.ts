export function isWhiteSpace(char: string): boolean {
    return (
        char === ' '
    ) || (
        char === '\n'
    ) || (
        char === '\t'
    )
}

export function isAlphabet(char: string): boolean {
    return (
        char >= 'A' &&
        char <= 'Z'
    ) || (
        char >= 'a' &&
        char <= 'z'
    )
}

export function isNumber(char: string): boolean {
    return (
        char >= '0'
    ) && (
        char <= '9'
    )
}

export function isSpecialCharacter(char: string): boolean {
    return !isAlphabet(char) && !isNumber(char) && !isWhiteSpace(char)
}

export function isIdentifier(char: string): boolean {
    let i: number = 1
    let isValidIdentifier: boolean = false
    if (isNumber(char[0])) {
        return false
    }
    while (char[i]) {
        if (isAlphabet(char[i]) || isSpecialCharacter(char[i]) || isNumber(char[i])) {
            isValidIdentifier  = true
        }
        i++
    }
    return isValidIdentifier
}