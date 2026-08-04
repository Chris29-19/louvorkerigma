const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// CSS files to inline (in order)
const CSS_FILES = [
    'css/variables.css',
    'css/layout.css',
    'css/components.css',
    'css/style.css',
];

// JS files to bundle (in dependency order)
const JS_FILES = [
    'js/db/firebase.js',
    'js/utils/helpers.js',
    'js/models/SongModel.js',
    'js/views/HomeView.js',
    'js/views/SongFormView.js',
    'js/controllers/MainController.js',
    'js/app.js',
];

function readFile(filePath) {
    return fs.readFileSync(path.join(ROOT, filePath), 'utf-8');
}

function bundleJS() {
    let js = '';
    for (const file of JS_FILES) {
        const content = readFile(file);
        const cleaned = content
            .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
            .replace(/^import\s+.*?['"].*?;\s*$/gm, '')
            .replace(/^export\s+(default\s+)?/gm, '')
            .replace(/^\s*\n/gm, '')
            .trim();
        js += cleaned + '\n\n';
    }
    return js.trim();
}

function bundleCSS() {
    let css = '';
    for (const file of CSS_FILES) {
        let content = readFile(file);
        // Remove CSS @import statements
        content = content.replace(/@import\s+url\(.*?\)\s*;/g, '');
        css += content + '\n';
    }
    return css.trim();
}

function build() {
    const html = readFile('index.html');
    const css = bundleCSS();
    const js = bundleJS();

    // Create the output HTML
    let output = html;

    // Replace external CSS links with inline <style>
    for (const file of CSS_FILES) {
        const href = file.replace('css/', 'css/');
        const linkTag = `<link rel="stylesheet" href="${href}">`;
        output = output.replace(linkTag, '');
    }

    // Replace module script with inline script (after the module reference)
    const moduleScriptTag = '<script type="module" src="./js/app.js"></script>';

    // Remove SW registration code (doesn't work on file://)
    const cleanJs = js.replace(/\/\/ Registrando Service Worker[\s\S]*?\r?\n    \}/, '');

    // Build final output
    let finalHtml = output
        .replace(moduleScriptTag, '')
        .replace('</body>', `<script>\n${cleanJs}\n</script>\n</body>`);

    // Insert CSS before </head>
    finalHtml = finalHtml.replace('</head>', `<style>\n${css}\n</style>\n</head>`);

    // Remove empty lines
    finalHtml = finalHtml.replace(/\n{3,}/g, '\n\n');

    const outputPath = path.join(ROOT, 'LouvorApp.html');
    fs.writeFileSync(outputPath, finalHtml);

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`Arquivo gerado: ${outputPath}`);
    console.log(`Tamanho: ${fileSize} KB`);
    console.log('Pronto! Compartilhe o arquivo "LouvorApp.html".');
}

build();
