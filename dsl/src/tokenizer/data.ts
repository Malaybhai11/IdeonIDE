import type { Token } from '../../types/token.ts'

export let tokens: Array<Token> = []
export let cursor: number = 0
export let row: number = 1
export let column: number = 1
export let src: string = ''

export function increment() {
    if (src[cursor] === '\n') {
        row++
        column = 1
    } else {
        column++
    }
    cursor++
}

export function reset() {
    tokens = []
    cursor = 0
    row = 1
    column = 1
    src = ''
}

export function setSrc(newSrc: string) {
    src = newSrc
}