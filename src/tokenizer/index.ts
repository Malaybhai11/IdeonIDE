import type { File } from '../../types/token.d.ts';
import type Token from '../../types/token.d.ts'
import { isWhiteSpace } from './utils.ts';

export default function tokenize(src: string) {
    let i: number = 0;
    let tokens: Array<Token> = [];

    while (src[i]) {
        if (isWhiteSpace(src[i] as string)) {
            i++;
            continue;
        } else if (src[i] === 'F') {
            let token_string: string = '';

            while (src[i] !== ' ') {
                token_string += src[i];
                i++;
            } if (token_string === 'File') {
                let j = i + 1;
                let path: string = '';

                while (src[j] !== '\n') {
                    path += src[j];
                    j++;
                }

                tokens.push({
                    type: 'File',
                    path: path.trim()
                } as File)

                i = j + 1;
                continue;
            }
        }
        continue;
    }

    return tokens;
}