// Embeds the font and location helpers into the standalone app.
import {readFileSync, writeFileSync} from 'node:fs';
const font = readFileSync(new URL('./src/archivo.woff2', import.meta.url)).toString('base64');
const locations = readFileSync(new URL('./src/locations.js', import.meta.url), 'utf8');
const locationUI = readFileSync(new URL('./src/location-ui.js', import.meta.url), 'utf8');
const labelLayout = readFileSync(new URL('./src/label-layout.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('./src/index.html', import.meta.url), 'utf8')
  .replace('{{FONT}}', `data:font/woff2;base64,${font}`)
  .replace('{{LOCATIONS}}', () => locations).replace('{{LOCATION_UI}}', () => locationUI)
  .replace('{{LABEL_LAYOUT}}', () => labelLayout);
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log(`index.html written, ${(html.length / 1024).toFixed(0)} KB`);
