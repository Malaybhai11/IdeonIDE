import isNumber from './number.ts'
import isAlphabet from './alphabet.ts'
import isSpecialCharacter from './special.ts'

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