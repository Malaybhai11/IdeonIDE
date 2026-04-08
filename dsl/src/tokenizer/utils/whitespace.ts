export default function isWhiteSpace(char: string): boolean {
    return (
        char === ' '
    ) || (
        char === '\n'
    ) || (
        char === '\t'
    )
}