export default function isAlphabet(char: string): boolean {
    return (
        char >= 'A' &&
        char <= 'Z'
    ) || (
        char >= 'a' &&
        char <= 'z'
    )
}