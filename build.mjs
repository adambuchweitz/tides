// Embeds the font into src/index.html and writes the single-file index.html.
import {readFileSync, writeFileSync} from 'node:fs';
const font = readFileSync(new URL('./src/archivo.woff2', import.meta.url)).toString('base64');
const html = readFileSync(new URL('./src/index.html', import.meta.url), 'utf8').replace('{{FONT}}', `data:font/woff2;base64,${font}`);
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log(`index.html written, ${(html.length / 1024).toFixed(0)} KB`);
