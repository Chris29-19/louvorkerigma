const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf-8'); }

let html = read('test-mobile.html');
const cssFiles = ['css/variables.css','css/layout.css','css/components.css','css/style.css','css/mobile-test.css'];
let css = '';
for (const f of cssFiles) {
    let c = read(f);
    c = c.replace(/@import\s+url\(.*?\)\s*;/g, '');
    css += c + '\n';
}

const jsFiles = ['js/db/firebase.js','js/utils/helpers.js','js/models/SongModel.js','js/views/HomeView.js','js/views/SongFormView.js','js/controllers/MainController.js','js/app.js','js/mobile-test.js'];
let js = '';
for (const f of jsFiles) {
    let j = read(f);
    j = j.replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
         .replace(/^import\s+.*?['"].*?;\s*$/gm, '')
         .replace(/^export\s+(default\s+)?/gm, '')
         .replace(/^\s*\n/gm, '')
         .trim();
    js += j + '\n\n';
}

for (const f of cssFiles) {
    const href = f.replace('css/', 'css/');
    html = html.replace('<link rel="stylesheet" href="' + href + '">', '');
}
html = html.replace('<link rel="manifest" href="./manifest.json">', '');
html = html.replace('<script type="module" src="./js/app.js"></script>', '');
html = html.replace('<script src="./js/mobile-test.js"></script>', '');

html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>');
html = html.replace('</body>', '<script>\n' + js + '\n</script>\n</body>');
html = html.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(path.join(ROOT, 'test-mobile-standalone.html'), html);
console.log('OK - ' + (html.length/1024).toFixed(1) + ' KB');
