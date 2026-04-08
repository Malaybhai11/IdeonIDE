import isAlphabet from './alphabet.ts'
import isNumber from './number.ts'
import isWhiteSpace from './whitespace.ts'

export default function isSpecialCharacter(char: string) {
    return !isAlphabet(char) && !isNumber(char) && !isWhiteSpace(char)
}