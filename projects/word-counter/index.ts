import type { Dict } from '@giveback007/util-lib';
import {
    getIgnoreWords, getTextsList, logResultMetadata, readTextsToStr, writeToResults
} from './general.util';

const [
    language = 'english', n = 1000,
] = process.argv.slice(2);

(async ({ language, maxWords }: {
    language: string;
    maxWords: number;
}) => {
    const texts = await getTextsList(language);
    const ignore = await getIgnoreWords(language);
    const str = await readTextsToStr(texts);
    const strArr = str.split(' ');
    
    // Create word count object
    const wordCount: Dict<number> = { };
    strArr.forEach((w) => wordCount[w] ? wordCount[w]++ : wordCount[w] = 1);
    ignore.forEach((word) => delete wordCount[word]);

    // Create word count array
    const wordsArr = Object.entries(wordCount);
    
    const onePercent = wordsArr.reduce((num, [,n]) => num + n, 0) / 100;
    let totalPercent = 0;

    const sortedWords = wordsArr
        .map(([w, n]) => [ n, n / onePercent, w ] as [number, number, string])
        .sort((a, b) => b[0] - a[0])
        .map(([n, p, w], i) => {
            let total: number | string[] = Math.round((totalPercent += p) * 1000) / 1000;
            total = (total + '').split('.');
            total[0] = (' ' + total[0]).slice(-2);
            total[1] = (total[1] + '00').slice(0, 3);
            
            return [
                ('    ' + (i + 1)).slice(-5),
                (' ' + (((Math.round((p) * 1000) / 1000) + '00').slice(0, 5))).slice(-6),
                total.join('.'),
                ('     ' + n).slice(-6),
                w
            ];
        });

    logResultMetadata({
        texts, ignore, onePercent,
        nOfUnique: sortedWords.length,
        ratio: Math.round(Math.floor(onePercent * 100) / sortedWords.length * 1000) / 1000
    });

    writeToResults({ sortedWords, maxWords, language });
})({ language, maxWords: Number(n), });
