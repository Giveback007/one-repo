import { runNodejs, browserPlay, nodejsPlay, devNodejs, devBrowser } from 'build-dev';
const { log } = console;

(function run([type]) {
    if (!type) throw new Error('No Command Given');
    log(`RUN: ${type}`);
    
    switch (type) {
        case 'word-counter':
            return runNodejs({ entryFile: 'projects/word-counter/index' });
        case 'play:browser':
            return browserPlay();
        case 'play:nodejs':
            return nodejsPlay();
        case 'run:nodejs':
            return runNodejs({ entryFile: './server/main' }); // ./server/main.ts
        case 'dev:browser':
            return devBrowser({
                fromDir: 'src', // ./src
                entryFile: 'index.tsx', // ./src/index.tsx
                toDir: '.cache/web', // ./.cache/web
                copyFiles: ['index.html', 'public'] // copy
                // ./src/index.html -> ./.cache/index.html (watch /index.html for changes and copy)
                // ./src/public/ -> ./.cache/public/ (watch all files in /public/ directory and copy)
            });
        case 'dev:nodejs':
            return devNodejs({
                fromDir: 'server', // ./server
                entryFile: 'main.ts', // ./server/main.ts
                toDir: '.cache/node' // ./.cache/node
            });
        default:
            throw new Error(`"${type}" not implemented`);
    }
})(process.argv.slice(2));

// being able to run any directory