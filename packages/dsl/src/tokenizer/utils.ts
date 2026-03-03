export function isWhiteSpace(char: string) {
    return char === ' ' || char === '\n' || char === '\t';
}

export function isAlpha(char: string) {
    const code = char.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

export function isUpper(char: string) {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90;
}