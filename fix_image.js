
const fs = require('fs');
const path = require('path');

const src = 'f:/abc/ASTRO/bblog/public/imges/unnamed(1).jpg';
const dest = 'f:/abc/ASTRO/bblog/src/assets/markdown-style-guide-hero.jpg';

console.log(`Attempting copy from ${src} to ${dest}`);

try {
    if (!fs.existsSync(src)) {
        console.error(`SOURCE NOT FOUND: ${src}`);
        process.exit(1);
    }
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        console.log(`Creating directory: ${destDir}`);
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log('COPY SUCCESS');
} catch (e) {
    console.error(`COPY FAILED: ${e.message}`);
    process.exit(1);
}
