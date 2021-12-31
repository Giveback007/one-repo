import { readdir, readFile, writeFile } from "fs/promises";
import { join, parse } from "path";
const { log } = console;

const pth = (language: string) => ({
    texts: join(__dirname, `./texts/${language}`),
    ignore: join(__dirname, `./ignore/${language}`),
    results: join(__dirname, `./results/${language}.txt`),
});

export async function getIgnoreWords(language: string) {
    const { ignore } = pth(language);
    return (await readFile(ignore, 'utf8'))
        .toLocaleLowerCase()
        .replace(/\n/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g,' ').trim()
        .split(' ');
}

export async function getTextsList(language: string) {
    const { texts } = pth(language);
    return (await readdir(texts)).map(txt => join(texts, txt));
}

export async function readTextsToStr(texts: string[]) {
    let str = '';
    await Promise.all(texts.map(async x => {
        const text = await readFile(x, 'utf8');
        str += ' ' + sanitize(text);
    }));

    return str;
}

export function sanitize(str: string) {
    return str.toLocaleLowerCase()
        .replace(/\n/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\./g, ' ')
        .replace(/á/g, 'a')
        .replace(/ú/g, 'u')
        .replace(/ó/g, 'o')
        .replace(/í/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[^a-záúóíñ' ]/g, '') // A-Z ÁÚÓÍÑ
        .replace(/\s+/g, ' ').trim();
        // .split(' ');
}

export function logResultMetadata({
    texts, ignore, onePercent, nOfUnique, ratio
}: {
    texts: string[];
    ignore: string[];
    onePercent: number;
    nOfUnique: number;
    ratio: number;
}) {
    // .toLocaleString() adds commas to long numbers 1000.toLocaleString() -> 1,000
    log(texts.length.toLocaleString() + ' texts-analyzed:', texts.map((x) => parse(x).base.replace('.txt', '')));
    log('ignored-words:', ignore);
    log("total-words-analyzed:", (Math.floor(onePercent * 100).toLocaleString()));
    log("unique-words:", nOfUnique.toLocaleString());
    log(`ratio: ${ratio} | ${ratio > 25 ? '👍 is' : '👎 is not'}: ratio > 25`);
}

export async function writeToResults({ language, maxWords, sortedWords }: {
    maxWords: number;
    language: string;
    sortedWords: string[][];
}) {
    const { results } = pth(language);
    const table = JSON.stringify(sortedWords.slice(0, maxWords))
        .replace('[', `
    # |      % | total% | amount | word
    ---------------------------------------\n`)
        .replace(/\[/g, '')
        .replace(/\],/g, ' \n')
        .replace(/","/g, ' | ')
        .replace(/"/g, '')
        .replace(']]', '');
    
    
    await writeFile(results, table);
}
